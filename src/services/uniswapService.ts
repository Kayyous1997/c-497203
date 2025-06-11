
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { AlphaRouter, SwapType } from '@uniswap/smart-order-router';
import { ethers } from 'ethers';
import { ChainId } from '@uniswap/sdk-core';

// Chain configurations
export const CHAIN_CONFIGS = {
  1: {
    chainId: ChainId.MAINNET,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564'
  },
  8453: {
    chainId: ChainId.BASE,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481'
  },
  59144: {
    chainId: ChainId.LINEA,
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481'
  }
};

// Common token addresses for different chains
export const TOKEN_ADDRESSES = {
  1: { // Ethereum
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86a33E6417b0de0aB4fC22c6f6b4A81C7be50',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  },
  8453: { // Base
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfDE4C96c8593536E31F229EA8f37b2ADa2699bb2'
  },
  59144: { // Linea
    WETH: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    USDC: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    USDT: '0xA219439258ca9da29E9Cc4cE5596924745e12B93'
  }
};

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number;
  recipient: string;
  chainId: number;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  gasEstimate: string;
  route: any;
  methodParameters?: any;
}

export class UniswapService {
  private router: AlphaRouter | null = null;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private chainId: number = 1;

  async initialize(chainId: number) {
    this.chainId = chainId;
    const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
    
    if (!config) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.router = new AlphaRouter({
      chainId: config.chainId,
      provider: this.provider
    });

    console.log(`Uniswap service initialized for ${config.name}`);
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
    if (!this.router || !this.provider) {
      throw new Error('Uniswap service not initialized');
    }

    try {
      // Create token instances
      const tokenIn = new Token(
        this.chainId,
        params.tokenIn,
        18, // We'll need to fetch actual decimals in production
        'TokenIn'
      );

      const tokenOut = new Token(
        this.chainId,
        params.tokenOut,
        18, // We'll need to fetch actual decimals in production
        'TokenOut'
      );

      // Create currency amount
      const amountIn = CurrencyAmount.fromRawAmount(
        tokenIn,
        ethers.utils.parseUnits(params.amountIn, 18).toString()
      );

      // Get route
      const route = await this.router.route(
        amountIn,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
          recipient: params.recipient,
          slippageTolerance: new Percent(Math.floor(params.slippageTolerance * 100), 10000),
          deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
          type: SwapType.UNIVERSAL_ROUTER
        }
      );

      if (!route) {
        console.log('No route found');
        return null;
      }

      const amountOut = route.quote.toExact();
      const priceImpact = route.estimatedGasUsed ? parseFloat(route.estimatedGasUsed.toString()) / 1000000 : 0;

      return {
        amountOut,
        priceImpact,
        gasEstimate: route.estimatedGasUsed?.toString() || '0',
        route: route.route,
        methodParameters: route.methodParameters
      };

    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  }

  async executeSwap(params: SwapParams, signer: ethers.Signer): Promise<string | null> {
    const quote = await this.getSwapQuote(params);
    
    if (!quote || !quote.methodParameters) {
      throw new Error('Unable to get swap quote');
    }

    try {
      const transaction = {
        to: quote.methodParameters.to,
        data: quote.methodParameters.calldata,
        value: quote.methodParameters.value,
        gasLimit: ethers.BigNumber.from(quote.gasEstimate).mul(120).div(100) // 20% buffer
      };

      const txResponse = await signer.sendTransaction(transaction);
      console.log('Swap transaction sent:', txResponse.hash);
      
      return txResponse.hash;
    } catch (error) {
      console.error('Error executing swap:', error);
      return null;
    }
  }

  getTokenAddress(symbol: string, chainId: number): string | null {
    const chainTokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
    if (!chainTokens) return null;
    
    return chainTokens[symbol as keyof typeof chainTokens] || null;
  }

  getSupportedChains(): number[] {
    return Object.keys(CHAIN_CONFIGS).map(Number);
  }
}

export const uniswapService = new UniswapService();
