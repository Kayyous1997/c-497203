
import { ethers } from 'ethers';
import { ChainConfig, DexContractAddresses, TokenInfo, PoolInfo } from './types';

// You'll replace these with your actual contract ABIs
import { FACTORY_ABI } from './abis/FactoryABI';
import { ROUTER_ABI } from './abis/RouterABI';
import { PAIR_ABI } from './abis/PairABI';
import { ERC20_ABI } from './abis/ERC20ABI';

export class ContractManager {
  private provider: ethers.providers.Provider;
  private signer?: ethers.Signer;
  private contracts: DexContractAddresses;
  private chainId: number;

  constructor(
    provider: ethers.providers.Provider,
    contracts: DexContractAddresses,
    chainId: number,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.contracts = contracts;
    this.chainId = chainId;
    this.signer = signer;
  }

  // Factory Contract Methods
  getFactoryContract(withSigner = false) {
    return new ethers.Contract(
      this.contracts.factory,
      FACTORY_ABI,
      withSigner && this.signer ? this.signer : this.provider
    );
  }

  async createPool(tokenA: string, tokenB: string, fee: number): Promise<string> {
    if (!this.signer) throw new Error('Signer required for transactions');
    
    const factory = this.getFactoryContract(true);
    const tx = await factory.createPool(tokenA, tokenB, fee);
    const receipt = await tx.wait();
    
    // Extract pool address from events
    const poolCreatedEvent = receipt.events?.find((e: any) => e.event === 'PoolCreated');
    return poolCreatedEvent?.args?.pool;
  }

  async getPool(tokenA: string, tokenB: string, fee: number): Promise<string> {
    const factory = this.getFactoryContract();
    return await factory.getPool(tokenA, tokenB, fee);
  }

  // Router Contract Methods
  getRouterContract(withSigner = false) {
    return new ethers.Contract(
      this.contracts.router,
      ROUTER_ABI,
      withSigner && this.signer ? this.signer : this.provider
    );
  }

  async exactInputSingle(params: {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    deadline: number;
    amountIn: ethers.BigNumber;
    amountOutMinimum: ethers.BigNumber;
    sqrtPriceLimitX96: ethers.BigNumber;
  }): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Signer required for transactions');
    
    const router = this.getRouterContract(true);
    return await router.exactInputSingle(params);
  }

  // Pool Contract Methods
  getPoolContract(poolAddress: string, withSigner = false) {
    return new ethers.Contract(
      poolAddress,
      PAIR_ABI, // You'll replace this with your pool ABI
      withSigner && this.signer ? this.signer : this.provider
    );
  }

  async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
    const pool = this.getPoolContract(poolAddress);
    
    const [token0Address, token1Address, fee, liquidity, slot0] = await Promise.all([
      pool.token0(),
      pool.token1(),
      pool.fee(),
      pool.liquidity(),
      pool.slot0()
    ]);

    const [token0Info, token1Info] = await Promise.all([
      this.getTokenInfo(token0Address),
      this.getTokenInfo(token1Address)
    ]);

    return {
      address: poolAddress,
      token0: token0Info,
      token1: token1Info,
      fee,
      liquidity,
      sqrtPriceX96: slot0.sqrtPriceX96
    };
  }

  // Token Contract Methods
  getTokenContract(tokenAddress: string, withSigner = false) {
    return new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      withSigner && this.signer ? this.signer : this.provider
    );
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const token = this.getTokenContract(tokenAddress);
    
    const [symbol, name, decimals] = await Promise.all([
      token.symbol(),
      token.name(),
      token.decimals()
    ]);

    return {
      address: tokenAddress,
      symbol,
      name,
      decimals
    };
  }

  async getTokenBalance(tokenAddress: string, owner: string): Promise<ethers.BigNumber> {
    const token = this.getTokenContract(tokenAddress);
    return await token.balanceOf(owner);
  }

  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: ethers.BigNumber
  ): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Signer required for transactions');
    
    const token = this.getTokenContract(tokenAddress, true);
    return await token.approve(spender, amount);
  }

  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<ethers.BigNumber> {
    const token = this.getTokenContract(tokenAddress);
    return await token.allowance(owner, spender);
  }

  // Utility Methods
  updateContracts(contracts: DexContractAddresses) {
    this.contracts = contracts;
  }

  updateSigner(signer: ethers.Signer) {
    this.signer = signer;
  }

  getContractAddresses(): DexContractAddresses {
    return this.contracts;
  }
}
