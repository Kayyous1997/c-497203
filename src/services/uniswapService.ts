import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { ChainId } from '@uniswap/sdk-core';
import { ContractHelpers, ContractAddresses, CONTRACT_CONFIGS } from '@/contracts';

// Chain configurations - you can update these with your own contract addresses
export const CHAIN_CONFIGS = {
  1: {
    chainId: ChainId.MAINNET,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    routerAddress: '', // You'll add your router contract address here
    factoryAddress: '', // You'll add your factory contract address here
  },
  8453: {
    chainId: ChainId.BASE,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    routerAddress: '', // You'll add your router contract address here
    factoryAddress: '', // You'll add your factory contract address here
  },
  59144: {
    chainId: 59144,
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    routerAddress: '', // You'll add your router contract address here
    factoryAddress: '', // You'll add your factory contract address here
  }
};

// Token addresses for different chains
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
  route: string[];
  methodParameters?: any;
  minAmountOut: string;
}

export interface DexConfig {
  routerAddress: string;
  factoryAddress: string;
  swapFeePercent: number; // Your DEX fee percentage
}

export class DexService {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private chainId: number = 1;
  private dexConfig: DexConfig | null = null;
  private contractHelpers: ContractHelpers | null = null;

  async initialize(chainId: number, dexConfig?: DexConfig) {
    this.chainId = chainId;
    const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
    
    if (!config) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    this.dexConfig = dexConfig || {
      routerAddress: config.routerAddress,
      factoryAddress: config.factoryAddress,
      swapFeePercent: 0.3
    };

    // Initialize contract helpers if contracts are deployed
    if (this.dexConfig.routerAddress && this.dexConfig.factoryAddress) {
      const wethAddress = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES]?.WETH || '';
      
      const contractAddresses: ContractAddresses = {
        router: this.dexConfig.routerAddress,
        factory: this.dexConfig.factoryAddress,
        weth: wethAddress
      };

      this.contractHelpers = new ContractHelpers(this.provider, contractAddresses);
    }

    console.log(`DEX service initialized for ${config.name}`);
    console.log('Router address:', this.dexConfig.routerAddress || 'Not set - add after deployment');
    console.log('Factory address:', this.dexConfig.factoryAddress || 'Not set - add after deployment');
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
    if (!this.provider) {
      throw new Error('DEX service not initialized');
    }

    if (!this.contractHelpers || !this.dexConfig?.routerAddress) {
      console.warn('Contracts not deployed yet - returning mock quote');
      return this.getMockQuote(params);
    }

    try {
      return await this.getActualQuote(params);
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  }

  private getMockQuote(params: SwapParams): SwapQuote {
    const mockRate = 0.000625;
    const amountOut = (parseFloat(params.amountIn) * mockRate).toFixed(6);
    const minAmountOut = (parseFloat(amountOut) * (1 - params.slippageTolerance / 100)).toFixed(6);
    
    return {
      amountOut,
      minAmountOut,
      priceImpact: 0.1,
      gasEstimate: CONTRACT_CONFIGS.GAS_LIMITS.SWAP.toString(),
      route: [params.tokenIn, params.tokenOut],
      methodParameters: null
    };
  }

  private async getActualQuote(params: SwapParams): Promise<SwapQuote | null> {
    if (!this.contractHelpers) return null;

    try {
      // Get token information
      const [tokenInInfo, tokenOutInfo] = await Promise.all([
        this.contractHelpers.getTokenInfo(params.tokenIn),
        this.contractHelpers.getTokenInfo(params.tokenOut)
      ]);

      // Convert amount to BigNumber with proper decimals
      const amountIn = ethers.utils.parseUnits(params.amountIn, tokenInInfo.decimals);
      
      // Create trading path
      const path = [params.tokenIn, params.tokenOut];
      
      // Get amounts out from router
      const amountsOut = await this.contractHelpers.getAmountsOut(amountIn, path);
      const amountOut = amountsOut[amountsOut.length - 1];
      
      // Format amount out
      const formattedAmountOut = ethers.utils.formatUnits(amountOut, tokenOutInfo.decimals);
      
      // Calculate minimum amount out with slippage
      const minAmountOut = amountOut
        .mul(ethers.BigNumber.from(Math.floor((100 - params.slippageTolerance) * 100)))
        .div(ethers.BigNumber.from(10000));
      const formattedMinAmountOut = ethers.utils.formatUnits(minAmountOut, tokenOutInfo.decimals);

      // Get pair address and reserves for price impact calculation
      const pairAddress = await this.contractHelpers.getPairAddress(params.tokenIn, params.tokenOut);
      let priceImpact = 0;

      if (pairAddress !== ethers.constants.AddressZero) {
        const reserves = await this.contractHelpers.getPairReserves(pairAddress);
        
        // Determine token order in pair
        const token0 = await this.contractHelpers.getPairContract(pairAddress).token0();
        const isToken0 = params.tokenIn.toLowerCase() === token0.toLowerCase();
        
        const reserveIn = isToken0 ? reserves.reserve0 : reserves.reserve1;
        const reserveOut = isToken0 ? reserves.reserve1 : reserves.reserve0;
        
        priceImpact = this.contractHelpers.calculatePriceImpact(
          amountIn,
          amountOut,
          reserveIn,
          reserveOut
        );
      }

      return {
        amountOut: formattedAmountOut,
        minAmountOut: formattedMinAmountOut,
        priceImpact,
        gasEstimate: CONTRACT_CONFIGS.GAS_LIMITS.SWAP.toString(),
        route: path,
        methodParameters: {
          amountIn: amountIn.toString(),
          amountOutMin: minAmountOut.toString(),
          path,
          deadline: await this.contractHelpers.getDeadline()
        }
      };

    } catch (error) {
      console.error('Error in actual quote calculation:', error);
      return null;
    }
  }

  async executeSwap(params: SwapParams, walletClient: any): Promise<string | null> {
    if (!this.contractHelpers || !this.dexConfig?.routerAddress) {
      throw new Error('Contracts not deployed yet');
    }

    try {
      // Convert wallet client to ethers signer
      const provider = new ethers.providers.Web3Provider(walletClient);
      const signer = provider.getSigner();

      // Get quote for the swap
      const quote = await this.getSwapQuote(params);
      if (!quote || !quote.methodParameters) {
        throw new Error('Unable to get swap quote');
      }

      // Check if token approval is needed
      const allowance = await this.contractHelpers.getTokenAllowance(
        params.tokenIn,
        params.recipient,
        this.dexConfig.routerAddress
      );

      const amountIn = ethers.BigNumber.from(quote.methodParameters.amountIn);

      // Approve token if necessary
      if (allowance.lt(amountIn)) {
        console.log('Approving token for swap...');
        const approveTx = await this.contractHelpers.approveToken(
          params.tokenIn,
          this.dexConfig.routerAddress,
          ethers.constants.MaxUint256,
          signer
        );
        await approveTx.wait();
        console.log('Token approved for swap');
      }

      // Execute the swap
      const swapTx = await this.contractHelpers.swapExactTokensForTokens(
        amountIn,
        ethers.BigNumber.from(quote.methodParameters.amountOutMin),
        quote.methodParameters.path,
        params.recipient,
        quote.methodParameters.deadline,
        signer
      );

      console.log('Swap transaction submitted:', swapTx.hash);
      return swapTx.hash;
      
    } catch (error) {
      console.error('Error executing swap:', error);
      return null;
    }
  }

  updateContractAddresses(routerAddress: string, factoryAddress: string) {
    if (this.dexConfig && this.provider) {
      this.dexConfig.routerAddress = routerAddress;
      this.dexConfig.factoryAddress = factoryAddress;
      
      // Reinitialize contract helpers with new addresses
      const wethAddress = TOKEN_ADDRESSES[this.chainId as keyof typeof TOKEN_ADDRESSES]?.WETH || '';
      
      const contractAddresses: ContractAddresses = {
        router: routerAddress,
        factory: factoryAddress,
        weth: wethAddress
      };

      this.contractHelpers = new ContractHelpers(this.provider, contractAddresses);
      
      console.log('Contract addresses updated:', {
        router: routerAddress,
        factory: factoryAddress
      });
    }
  }

  updateFeePercent(feePercent: number) {
    if (this.dexConfig) {
      this.dexConfig.swapFeePercent = feePercent;
      console.log('Fee percent updated to:', feePercent);
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

  isContractsDeployed(): boolean {
    return !!(this.dexConfig?.routerAddress && this.dexConfig?.factoryAddress);
  }

  getDexConfig(): DexConfig | null {
    return this.dexConfig;
  }

  getContractHelpers(): ContractHelpers | null {
    return this.contractHelpers;
  }
}

export const dexService = new DexService();

export default dexService;
