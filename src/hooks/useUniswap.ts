
import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { dexService } from '@/services/dexService';
import { SwapParams, SwapQuote } from '@/services/dexService';
import { useToast } from '@/hooks/use-toast';
import { getTokenAddress } from '@/contracts/chainConfigs';

export const useDex = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [contractsDeployed, setContractsDeployed] = useState(false);

  // Initialize DEX service when chain changes
  useEffect(() => {
    const initializeService = async () => {
      if (chainId) {
        try {
          await dexService.initialize(chainId, walletClient);
          setIsInitialized(true);
          setContractsDeployed(dexService.isContractsDeployed());
          console.log('DEX service initialized for chain:', chainId);
        } catch (error) {
          console.error('Failed to initialize DEX service:', error);
          toast({
            title: "Network Not Supported",
            description: `DEX is not available on this network`,
            variant: "destructive"
          });
          setIsInitialized(false);
        }
      }
    };

    initializeService();
  }, [chainId, walletClient, toast]);

  const getQuote = useCallback(async (params: Omit<SwapParams, 'recipient' | 'chainId'>) => {
    if (!isInitialized || !address || !chainId) {
      toast({
        title: "Not Ready",
        description: "Please connect your wallet and ensure the network is supported",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const fullParams: SwapParams = {
        ...params,
        recipient: address,
        chainId: chainId
      };

      const result = await dexService.getSwapQuote(fullParams);
      setQuote(result);
      
      if (!contractsDeployed && result) {
        toast({
          title: "Mock Quote",
          description: "This is a test quote. Deploy your contracts for real trading.",
          variant: "default"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting quote:', error);
      toast({
        title: "Quote Error",
        description: "Failed to get swap quote. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, address, chainId, contractsDeployed, toast]);

  const executeSwap = useCallback(async (params: Omit<SwapParams, 'recipient' | 'chainId'>) => {
    if (!isInitialized || !address || !chainId || !walletClient) {
      toast({
        title: "Not Ready",
        description: "Please connect your wallet and ensure the network is supported",
        variant: "destructive"
      });
      return null;
    }

    if (!contractsDeployed) {
      toast({
        title: "Contracts Not Deployed",
        description: "Please deploy your DEX contracts first before executing swaps.",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const fullParams: SwapParams = {
        ...params,
        recipient: address,
        chainId: chainId
      };

      const txHash = await dexService.executeSwap(fullParams, walletClient);
      
      if (txHash) {
        toast({
          title: "Swap Initiated",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
      } else {
        toast({
          title: "Swap Failed",
          description: "The swap transaction failed. Please try again.",
          variant: "destructive"
        });
      }

      return txHash;
    } catch (error) {
      console.error('Error executing swap:', error);
      toast({
        title: "Swap Error",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, address, chainId, walletClient, contractsDeployed, toast]);

  const updateContractAddresses = useCallback(async (factory: string, router: string, pool?: string) => {
    try {
      await dexService.updateContractAddresses(factory, router, pool);
      setContractsDeployed(true);
      toast({
        title: "Contracts Updated",
        description: "DEX contract addresses have been updated successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error updating contracts:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update contract addresses.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const createPool = useCallback(async (tokenA: string, tokenB: string, fee: number) => {
    if (!contractsDeployed) {
      toast({
        title: "Contracts Not Deployed",
        description: "Please deploy your contracts first.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const poolAddress = await dexService.createPool(tokenA, tokenB, fee);
      if (poolAddress) {
        toast({
          title: "Pool Created",
          description: `Pool created at ${poolAddress.slice(0, 10)}...`,
        });
      }
      return poolAddress;
    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Pool Creation Failed",
        description: "Failed to create pool. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [contractsDeployed, toast]);

  const getTokenAddressForChain = useCallback((symbol: string) => {
    if (!chainId) return null;
    return getTokenAddress(chainId, symbol);
  }, [chainId]);

  return {
    isInitialized,
    isLoading,
    quote,
    contractsDeployed,
    getQuote,
    executeSwap,
    updateContractAddresses,
    createPool,
    getTokenAddress: getTokenAddressForChain,
    supportedChains: dexService.getSupportedChains(),
    currentChainId: chainId,
    dexConfig: dexService.getContractAddresses()
  };
};

// Keep the old export for backwards compatibility
export const useUniswap = useDex;
