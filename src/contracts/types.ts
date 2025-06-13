
import { ethers } from 'ethers';

export interface DexContractAddresses {
  factory: string;
  router: string;
  pool?: string; // Pool contract template address
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
  contracts?: DexContractAddresses;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface PoolInfo {
  address: string;
  token0: TokenInfo;
  token1: TokenInfo;
  fee: number;
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
}

export interface SwapRoute {
  path: string[];
  amounts: ethers.BigNumber[];
  gasEstimate: ethers.BigNumber;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: ethers.BigNumber;
}

// Contract ABI interfaces - you'll replace these with your actual ABIs
export interface FactoryABI extends ethers.utils.Interface {}
export interface RouterABI extends ethers.utils.Interface {}
export interface PoolABI extends ethers.utils.Interface {}
