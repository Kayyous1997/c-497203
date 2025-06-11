
export { ROUTER_ABI } from './abis/RouterABI';
export { FACTORY_ABI } from './abis/FactoryABI';
export { PAIR_ABI } from './abis/PairABI';
export { ERC20_ABI } from './abis/ERC20ABI';

export * from './types';
export { ContractHelpers } from './utils/contractHelpers';

// Contract deployment configurations
export const CONTRACT_CONFIGS = {
  // Gas limits for different operations
  GAS_LIMITS: {
    SWAP: 200000,
    APPROVE: 50000,
    CREATE_PAIR: 300000,
    ADD_LIQUIDITY: 250000,
    REMOVE_LIQUIDITY: 200000
  },
  
  // Default slippage tolerance (0.5%)
  DEFAULT_SLIPPAGE: 0.5,
  
  // Default deadline (20 minutes)
  DEFAULT_DEADLINE_MINUTES: 20,
  
  // Minimum liquidity for pairs
  MINIMUM_LIQUIDITY: 1000
};
