
import { ethers } from 'ethers';
import { ContractManager } from '../ContractManager';
import { DexContractAddresses, TokenInfo } from '../types';

// Legacy wrapper for backwards compatibility
export class ContractHelpers {
  private contractManager: ContractManager;

  constructor(provider: ethers.providers.Provider, contracts: DexContractAddresses) {
    this.contractManager = new ContractManager(provider, contracts, 1); // Default to mainnet
  }

  // Wrapper methods for backwards compatibility
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    return this.contractManager.getTokenInfo(tokenAddress);
  }

  async getTokenBalance(tokenAddress: string, owner: string): Promise<ethers.BigNumber> {
    return this.contractManager.getTokenBalance(tokenAddress, owner);
  }

  async getTokenAllowance(
    tokenAddress: string, 
    owner: string, 
    spender: string
  ): Promise<ethers.BigNumber> {
    return this.contractManager.getAllowance(tokenAddress, owner, spender);
  }

  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: ethers.BigNumber,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    this.contractManager.updateSigner(signer);
    return this.contractManager.approveToken(tokenAddress, spender, amount);
  }

  // Add other legacy methods as needed for backwards compatibility
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

  async getCurrentBlockTimestamp(): Promise<number> {
    const provider = this.contractManager['provider'];
    const block = await provider.getBlock('latest');
    return block.timestamp;
  }

  async getDeadline(minutesFromNow: number = 20): Promise<number> {
    const currentTime = await this.getCurrentBlockTimestamp();
    return currentTime + (minutesFromNow * 60);
  }
}
