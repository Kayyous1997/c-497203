
import axios from 'axios';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  price?: number;
  chainId: number;
}

export interface TokenList {
  [chainId: number]: Token[];
}

// Popular tokens for each chain
export const CHAIN_TOKENS: TokenList = {
  1: [ // Ethereum
    {
      address: '0xA0b86a33E6441b54c85F2B4f8bD346e79ddc2e6C',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 1
    },
    {
      address: '0xA0b86a33E6441b54c85F2B4f8bD346e79ddc2e6C',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1
    },
    {
      address: '0xA0b86a33E6441b54c85F2B4f8bD346e79ddc2e6C',
      symbol: 'USDT',
      name: 'Tether',
      decimals: 6,
      chainId: 1
    }
  ],
  8453: [ // Base
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 8453
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 8453
    }
  ],
  59144: [ // Linea Testnet
    {
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 59144
    }
  ],
  11124: [ // Abstract Testnet
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 11124
    }
  ],
  41454: [ // Monad Testnet
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WMON',
      name: 'Wrapped Monad',
      decimals: 18,
      chainId: 41454
    }
  ]
};

export class TokenService {
  private static instance: TokenService;
  private priceCache = new Map<string, { price: number; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async getTokenPrice(tokenAddress: string, chainId: number): Promise<number> {
    const cacheKey = `${chainId}-${tokenAddress}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }

    try {
      // Using CoinGecko API for price data
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum`,
        {
          params: {
            contract_addresses: tokenAddress,
            vs_currencies: 'usd'
          }
        }
      );
      
      const price = response.data[tokenAddress.toLowerCase()]?.usd || 0;
      this.priceCache.set(cacheKey, { price, timestamp: Date.now() });
      return price;
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return 0;
    }
  }

  getTokensForChain(chainId: number): Token[] {
    return CHAIN_TOKENS[chainId] || [];
  }

  async getTokensWithPrices(chainId: number): Promise<Token[]> {
    const tokens = this.getTokensForChain(chainId);
    const tokensWithPrices = await Promise.all(
      tokens.map(async (token) => {
        const price = await this.getTokenPrice(token.address, chainId);
        return { ...token, price };
      })
    );
    return tokensWithPrices;
  }
}

export const tokenService = TokenService.getInstance();
