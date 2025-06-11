
import { ethers } from 'ethers';

export interface ContractAddresses {
  router: string;
  factory: string;
  weth: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface PairReserves {
  reserve0: ethers.BigNumber;
  reserve1: ethers.BigNumber;
  blockTimestampLast: number;
}

export interface SwapRoute {
  path: string[];
  amounts: ethers.BigNumber[];
  gasEstimate: ethers.BigNumber;
}

export interface LiquidityInfo {
  token0: string;
  token1: string;
  reserve0: ethers.BigNumber;
  reserve1: ethers.BigNumber;
  totalSupply: ethers.BigNumber;
  lpTokenBalance: ethers.BigNumber;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: ethers.BigNumber;
}
