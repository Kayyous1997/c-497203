
import { ethers } from 'ethers';
import { ChainId, Token, Fetcher, Route, Trade, TradeType, Percent } from '@uniswap/sdk-core';
import { AlphaRouter } from '@uniswap/smart-order-router';

interface UniswapTokenPrice {
  symbol: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
  logoUrl?: string;
}

class UniswapPriceService {
  private priceCache: Map<string, UniswapTokenPrice> = new Map();
  private logoCache: Map<string, string> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds for better performance
  private alphaRouter: AlphaRouter | null = null;

  async initialize(provider: ethers.providers.Provider, chainId: number) {
    try {
      this.alphaRouter = new AlphaRouter({
        chainId,
        provider
      });
    } catch (error) {
      console.warn('Failed to initialize AlphaRouter:', error);
    }
  }

  async getTokenPrice(symbol: string, address?: string, chainId: number = 1): Promise<UniswapTokenPrice | null> {
    const cacheKey = address || symbol;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < this.CACHE_TTL) {
      return cached;
    }

    try {
      // Try Uniswap first
      const uniswapPrice = await this.fetchFromUniswap(symbol, address, chainId);
      if (uniswapPrice) {
        this.priceCache.set(cacheKey, uniswapPrice);
        return uniswapPrice;
      }

      // Fallback to CoinGecko for price data
      const coinGeckoPrice = await this.fetchFromCoinGecko(symbol);
      if (coinGeckoPrice) {
        // Enhance with Uniswap logo if available
        const logoUrl = await this.getUniswapLogo(address, chainId);
        if (logoUrl) {
          coinGeckoPrice.logoUrl = logoUrl;
        }
        
        this.priceCache.set(cacheKey, coinGeckoPrice);
        return coinGeckoPrice;
      }

      return null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return cached || null;
    }
  }

  async getTokenLogo(address: string, chainId: number, symbol?: string): Promise<string> {
    const cacheKey = `${chainId}-${address}`;
    
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    // Try Uniswap token list first
    let logoUrl = await this.getUniswapLogo(address, chainId);
    
    if (!logoUrl) {
      // Try Trust Wallet as fallback
      logoUrl = await this.getTrustWalletLogo(address, chainId);
    }

    if (!logoUrl && symbol) {
      // Ultimate fallback to emoji
      logoUrl = this.getEmojiForSymbol(symbol);
    }

    const finalUrl = logoUrl || '❓';
    this.logoCache.set(cacheKey, finalUrl);
    return finalUrl;
  }

  private async fetchFromUniswap(symbol: string, address?: string, chainId: number = 1): Promise<UniswapTokenPrice | null> {
    try {
      if (!this.alphaRouter || !address) return null;

      // Get token info from Uniswap token lists
      const tokenListUrl = this.getUniswapTokenListUrl(chainId);
      if (!tokenListUrl) return null;

      const response = await fetch(tokenListUrl);
      if (!response.ok) return null;

      const tokenList = await response.json();
      const token = tokenList.tokens?.find((t: any) => 
        t.address.toLowerCase() === address.toLowerCase() ||
        t.symbol.toLowerCase() === symbol.toLowerCase()
      );

      if (!token) return null;

      // For now, we'll use a simple price estimation
      // In a real implementation, you'd use the AlphaRouter to get accurate pricing
      const mockPrice = this.getMockPriceForToken(symbol);

      return {
        symbol: token.symbol,
        address: token.address,
        price: mockPrice.price,
        priceChange24h: mockPrice.change,
        volume24h: mockPrice.volume,
        marketCap: mockPrice.marketCap,
        lastUpdated: Date.now(),
        logoUrl: token.logoURI
      };
    } catch (error) {
      return null;
    }
  }

  private async fetchFromCoinGecko(symbol: string): Promise<UniswapTokenPrice | null> {
    try {
      const coinId = this.getCoinGeckoId(symbol);
      if (!coinId) return null;

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol: symbol.toUpperCase(),
        address: '',
        price: data.market_data.current_price.usd,
        priceChange24h: data.market_data.price_change_percentage_24h || 0,
        volume24h: data.market_data.total_volume.usd || 0,
        marketCap: data.market_data.market_cap.usd || 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      return null;
    }
  }

  private async getUniswapLogo(address?: string, chainId: number = 1): Promise<string | null> {
    try {
      if (!address) return null;

      const logoUrl = `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
      
      if (await this.isImageValid(logoUrl)) {
        return logoUrl;
      }

      // Try Uniswap token list
      const tokenListUrl = this.getUniswapTokenListUrl(chainId);
      if (tokenListUrl) {
        const response = await fetch(tokenListUrl);
        if (response.ok) {
          const tokenList = await response.json();
          const token = tokenList.tokens?.find((t: any) => 
            t.address.toLowerCase() === address.toLowerCase()
          );
          if (token?.logoURI) {
            return token.logoURI;
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async getTrustWalletLogo(address: string, chainId: number): Promise<string | null> {
    try {
      const chainMap: Record<number, string> = {
        1: 'ethereum',
        56: 'smartchain',
        137: 'polygon',
        8453: 'base'
      };

      const chain = chainMap[chainId];
      if (!chain) return null;

      const logoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain}/assets/${address}/logo.png`;
      
      if (await this.isImageValid(logoUrl)) {
        return logoUrl;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private getUniswapTokenListUrl(chainId: number): string | null {
    const tokenListUrls: Record<number, string> = {
      1: 'https://tokens.uniswap.org',
      5: 'https://tokens.uniswap.org', // Goerli
      10: 'https://static.optimism.io/optimism.tokenlist.json',
      42161: 'https://bridge.arbitrum.io/token-list-42161.json',
      137: 'https://wallet-asset.matic.network/tokenlist/allTokens.json',
      8453: 'https://tokens.uniswap.org' // Base
    };

    return tokenListUrls[chainId] || null;
  }

  private getMockPriceForToken(symbol: string): { price: number; change: number; volume: number; marketCap: number } {
    // Mock prices for development - replace with real Uniswap pricing
    const mockPrices: Record<string, any> = {
      'ETH': { price: 2000, change: 2.5, volume: 1000000, marketCap: 240000000000 },
      'USDC': { price: 1.0, change: 0.1, volume: 2000000, marketCap: 25000000000 },
      'USDT': { price: 1.0, change: -0.05, volume: 3000000, marketCap: 83000000000 },
      'UNI': { price: 6.5, change: 1.8, volume: 150000, marketCap: 4900000000 },
      'LINK': { price: 14.2, change: -1.2, volume: 300000, marketCap: 8100000000 }
    };

    return mockPrices[symbol.toUpperCase()] || { price: 1, change: 0, volume: 0, marketCap: 0 };
  }

  private getCoinGeckoId(symbol: string): string | null {
    const coinMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'DAI': 'dai',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'COMP': 'compound-governance-token',
      'MKR': 'maker',
      'SNX': 'havven',
      'CRV': 'curve-dao-token',
      'YFI': 'yearn-finance',
      'SUSHI': 'sushi',
      'MATIC': 'matic-network'
    };
    
    return coinMap[symbol.toUpperCase()] || null;
  }

  private getEmojiForSymbol(symbol: string): string {
    const emojiMap: Record<string, string> = {
      'ETH': '🔷',
      'WETH': '🔹',
      'BTC': '🟠',
      'WBTC': '🟠',
      'USDC': '💵',
      'USDT': '💰',
      'DAI': '💲',
      'LINK': '🔗',
      'UNI': '🦄',
      'AAVE': '👻',
      'COMP': '🏛️',
      'SUSHI': '🍣',
      'MATIC': '🟣'
    };

    return emojiMap[symbol.toUpperCase()] || '❓';
  }

  private async isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }

  clearCache(): void {
    this.priceCache.clear();
    this.logoCache.clear();
  }

  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 1) {
      return numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    } else {
      return numPrice.toFixed(8);
    }
  }

  formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  }
}

export const uniswapPriceService = new UniswapPriceService();
export type { UniswapTokenPrice };
