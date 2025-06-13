
import { ChainConfig } from './types';

export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    },
    // You'll add your contract addresses here after deployment
    contracts: {
      factory: '', // Your factory contract address
      router: '', // Your router contract address
      pool: '' // Your pool contract template address (optional)
    }
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      factory: '', // Your factory contract address
      router: '', // Your router contract address
      pool: '' // Your pool contract template address (optional)
    }
  },
  59144: {
    chainId: 59144,
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      factory: '', // Your factory contract address
      router: '', // Your router contract address
      pool: '' // Your pool contract template address (optional)
    }
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      factory: '', // Your factory contract address
      router: '', // Your router contract address
      pool: '' // Your pool contract template address (optional)
    }
  }
};

// Token addresses for each chain - you can add your own tokens here
export const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: { // Ethereum
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86a33E6417b0de0aB4fC22c6f6b4A81C7be50',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  8453: { // Base
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  59144: { // Linea
    WETH: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    USDC: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  },
  11155111: { // Sepolia
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    // Add your test tokens here
  }
};

export function getChainConfig(chainId: number): ChainConfig | null {
  return CHAIN_CONFIGS[chainId] || null;
}

export function getSupportedChains(): number[] {
  return Object.keys(CHAIN_CONFIGS).map(Number);
}

export function getTokenAddress(chainId: number, symbol: string): string | null {
  return TOKEN_ADDRESSES[chainId]?.[symbol] || null;
}

export function updateChainContracts(chainId: number, contracts: Partial<ChainConfig['contracts']>) {
  if (CHAIN_CONFIGS[chainId]) {
    CHAIN_CONFIGS[chainId].contracts = {
      ...CHAIN_CONFIGS[chainId].contracts,
      ...contracts
    };
  }
}
