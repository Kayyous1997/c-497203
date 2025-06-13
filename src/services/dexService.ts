
import { ethers } from 'ethers';
import { ContractManager } from '@/contracts/ContractManager';
import { getChainConfig, updateChainContracts } from '@/contracts/chainConfigs';
import { DexContractAddresses } from '@/contracts/types';

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number;
  recipient: string;
  chainId: number;
  fee?: number; // V3 fee tier (500, 3000, 10000)
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  gasEstimate: string;
  route: string[];
  minAmountOut: string;
  fee: number;
}

export class DexService {
  private contractManager: ContractManager | null = null;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private chainId: number = 1;

  async initialize(chainId: number, walletProvider?: any) {
    this.chainId = chainId;
    const config = getChainConfig(chainId);
    
    if (!config) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    // Initialize contract manager if contracts are deployed
    if (config.contracts && this.hasRequiredContracts(config.contracts)) {
      let signer;
      if (walletProvider) {
        const web3Provider = new ethers.providers.Web3Provider(walletProvider);
        signer = web3Provider.getSigner();
      }

      this.contractManager = new ContractManager(
        this.provider,
        config.contracts,
        chainId,
        signer
      );
    }

    console.log(`DEX service initialized for ${config.name}`);
    console.log('Contracts deployed:', this.isContractsDeployed());
  }

  private hasRequiredContracts(contracts: DexContractAddresses): boolean {
    return !!(contracts.factory && contracts.router);
  }

  async updateContractAddresses(factory: string, router: string, pool?: string) {
    const contracts: DexContractAddresses = { factory, router, pool };
    
    // Update chain config
    updateChainContracts(this.chainId, contracts);
    
    // Reinitialize contract manager
    if (this.provider) {
      this.contractManager = new ContractManager(
        this.provider,
        contracts,
        this.chainId
      );
    }
    
    console.log('Contract addresses updated:', contracts);
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
    if (!this.contractManager) {
      return this.getMockQuote(params);
    }

    try {
      // In real implementation, you'd get actual quotes from your contracts
      // For now, return mock data until contracts are deployed
      return this.getMockQuote(params);
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
      gasEstimate: '200000',
      route: [params.tokenIn, params.tokenOut],
      fee: params.fee || 3000
    };
  }

  async executeSwap(params: SwapParams, walletProvider: any): Promise<string | null> {
    if (!this.contractManager) {
      throw new Error('Contracts not deployed yet');
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = web3Provider.getSigner();
      this.contractManager.updateSigner(signer);

      // Get token info
      const [tokenInInfo, tokenOutInfo] = await Promise.all([
        this.contractManager.getTokenInfo(params.tokenIn),
        this.contractManager.getTokenInfo(params.tokenOut)
      ]);

      const amountIn = ethers.utils.parseUnits(params.amountIn, tokenInInfo.decimals);
      
      // Check allowance and approve if necessary
      const allowance = await this.contractManager.getAllowance(
        params.tokenIn,
        params.recipient,
        this.contractManager.getContractAddresses().router
      );

      if (allowance.lt(amountIn)) {
        const approveTx = await this.contractManager.approveToken(
          params.tokenIn,
          this.contractManager.getContractAddresses().router,
          ethers.constants.MaxUint256
        );
        await approveTx.wait();
      }

      // Execute swap
      const quote = await this.getSwapQuote(params);
      if (!quote) throw new Error('Unable to get quote');

      const minAmountOut = ethers.utils.parseUnits(quote.minAmountOut, tokenOutInfo.decimals);
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

      const swapParams = {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: params.fee || 3000,
        recipient: params.recipient,
        deadline,
        amountIn,
        amountOutMinimum: minAmountOut,
        sqrtPriceLimitX96: ethers.BigNumber.from(0)
      };

      const swapTx = await this.contractManager.exactInputSingle(swapParams);
      return swapTx.hash;

    } catch (error) {
      console.error('Error executing swap:', error);
      return null;
    }
  }

  async createPool(tokenA: string, tokenB: string, fee: number): Promise<string | null> {
    if (!this.contractManager) {
      throw new Error('Contracts not deployed yet');
    }

    try {
      return await this.contractManager.createPool(tokenA, tokenB, fee);
    } catch (error) {
      console.error('Error creating pool:', error);
      return null;
    }
  }

  async getPoolAddress(tokenA: string, tokenB: string, fee: number): Promise<string | null> {
    if (!this.contractManager) return null;

    try {
      return await this.contractManager.getPool(tokenA, tokenB, fee);
    } catch (error) {
      console.error('Error getting pool address:', error);
      return null;
    }
  }

  isContractsDeployed(): boolean {
    return !!this.contractManager;
  }

  getContractAddresses(): DexContractAddresses | null {
    return this.contractManager?.getContractAddresses() || null;
  }

  getSupportedChains(): number[] {
    return [1, 8453, 59144, 11155111];
  }
}

export const dexService = new DexService();
export default dexService;
