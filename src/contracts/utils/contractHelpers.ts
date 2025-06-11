
import { ethers } from 'ethers';
import { ROUTER_ABI } from '../abis/RouterABI';
import { FACTORY_ABI } from '../abis/FactoryABI';
import { PAIR_ABI } from '../abis/PairABI';
import { ERC20_ABI } from '../abis/ERC20ABI';
import { ContractAddresses, TokenInfo, PairReserves } from '../types';

export class ContractHelpers {
  private provider: ethers.providers.Provider;
  private contracts: ContractAddresses;

  constructor(provider: ethers.providers.Provider, contracts: ContractAddresses) {
    this.provider = provider;
    this.contracts = contracts;
  }

  // Router contract instance
  getRouterContract(signer?: ethers.Signer) {
    return new ethers.Contract(
      this.contracts.router,
      ROUTER_ABI,
      signer || this.provider
    );
  }

  // Factory contract instance
  getFactoryContract(signer?: ethers.Signer) {
    return new ethers.Contract(
      this.contracts.factory,
      FACTORY_ABI,
      signer || this.provider
    );
  }

  // Pair contract instance
  getPairContract(pairAddress: string, signer?: ethers.Signer) {
    return new ethers.Contract(
      pairAddress,
      PAIR_ABI,
      signer || this.provider
    );
  }

  // ERC20 token contract instance
  getTokenContract(tokenAddress: string, signer?: ethers.Signer) {
    return new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      signer || this.provider
    );
  }

  // Get token information
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const tokenContract = this.getTokenContract(tokenAddress);
    
    const [symbol, name, decimals] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.name(),
      tokenContract.decimals()
    ]);

    return {
      address: tokenAddress,
      symbol,
      name,
      decimals
    };
  }

  // Get pair address for two tokens
  async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    const factory = this.getFactoryContract();
    return await factory.getPair(tokenA, tokenB);
  }

  // Get pair reserves
  async getPairReserves(pairAddress: string): Promise<PairReserves> {
    const pairContract = this.getPairContract(pairAddress);
    const reserves = await pairContract.getReserves();
    
    return {
      reserve0: reserves._reserve0,
      reserve1: reserves._reserve1,
      blockTimestampLast: reserves._blockTimestampLast
    };
  }

  // Check token allowance
  async getTokenAllowance(
    tokenAddress: string, 
    owner: string, 
    spender: string
  ): Promise<ethers.BigNumber> {
    const tokenContract = this.getTokenContract(tokenAddress);
    return await tokenContract.allowance(owner, spender);
  }

  // Get token balance
  async getTokenBalance(tokenAddress: string, owner: string): Promise<ethers.BigNumber> {
    const tokenContract = this.getTokenContract(tokenAddress);
    return await tokenContract.balanceOf(owner);
  }

  // Approve token spending
  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: ethers.BigNumber,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const tokenContract = this.getTokenContract(tokenAddress, signer);
    return await tokenContract.approve(spender, amount);
  }

  // Get amounts out for a swap
  async getAmountsOut(
    amountIn: ethers.BigNumber,
    path: string[]
  ): Promise<ethers.BigNumber[]> {
    const router = this.getRouterContract();
    return await router.getAmountsOut(amountIn, path);
  }

  // Get amounts in for a swap
  async getAmountsIn(
    amountOut: ethers.BigNumber,
    path: string[]
  ): Promise<ethers.BigNumber[]> {
    const router = this.getRouterContract();
    return await router.getAmountsIn(amountOut, path);
  }

  // Execute token to token swap
  async swapExactTokensForTokens(
    amountIn: ethers.BigNumber,
    amountOutMin: ethers.BigNumber,
    path: string[],
    to: string,
    deadline: number,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const router = this.getRouterContract(signer);
    return await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    );
  }

  // Execute ETH to token swap
  async swapExactETHForTokens(
    amountOutMin: ethers.BigNumber,
    path: string[],
    to: string,
    deadline: number,
    signer: ethers.Signer,
    value: ethers.BigNumber
  ): Promise<ethers.ContractTransaction> {
    const router = this.getRouterContract(signer);
    return await router.swapExactETHForTokens(
      amountOutMin,
      path,
      to,
      deadline,
      { value }
    );
  }

  // Execute token to ETH swap
  async swapExactTokensForETH(
    amountIn: ethers.BigNumber,
    amountOutMin: ethers.BigNumber,
    path: string[],
    to: string,
    deadline: number,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const router = this.getRouterContract(signer);
    return await router.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline
    );
  }

  // Calculate price impact
  calculatePriceImpact(
    amountIn: ethers.BigNumber,
    amountOut: ethers.BigNumber,
    reserveIn: ethers.BigNumber,
    reserveOut: ethers.BigNumber
  ): number {
    const amountInWithFee = amountIn.mul(997);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(1000).add(amountInWithFee);
    const amountOutExpected = numerator.div(denominator);
    
    const priceImpact = amountOutExpected.sub(amountOut)
      .mul(10000)
      .div(amountOutExpected);
    
    return priceImpact.toNumber() / 100;
  }

  // Get current block timestamp
  async getCurrentBlockTimestamp(): Promise<number> {
    const block = await this.provider.getBlock('latest');
    return block.timestamp;
  }

  // Calculate deadline (current time + minutes)
  async getDeadline(minutesFromNow: number = 20): Promise<number> {
    const currentTime = await this.getCurrentBlockTimestamp();
    return currentTime + (minutesFromNow * 60);
  }
}
