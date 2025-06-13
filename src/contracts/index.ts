
// Export ABIs - you'll replace these with your actual contract ABIs
export { ROUTER_ABI } from './abis/RouterABI';
export { FACTORY_ABI } from './abis/FactoryABI';
export { PAIR_ABI } from './abis/PairABI';
export { ERC20_ABI } from './abis/ERC20ABI';

// Export types and utilities
export * from './types';
export { ContractManager } from './ContractManager';
export { ContractHelpers } from './utils/contractHelpers';
export * from './chainConfigs';

// Contract deployment configurations
export const CONTRACT_CONFIGS = {
  // Gas limits for different operations
  GAS_LIMITS: {
    SWAP: 300000,
    APPROVE: 50000,
    CREATE_POOL: 500000,
    ADD_LIQUIDITY: 400000,
    REMOVE_LIQUIDITY: 300000
  },
  
  // Default slippage tolerance (0.5%)
  DEFAULT_SLIPPAGE: 0.5,
  
  // Default deadline (20 minutes)
  DEFAULT_DEADLINE_MINUTES: 20,
  
  // V3 fee tiers
  FEE_TIERS: {
    LOW: 500,     // 0.05%
    MEDIUM: 3000, // 0.3%
    HIGH: 10000   // 1%
  }
};
