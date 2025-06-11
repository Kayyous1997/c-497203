
import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { uniswapService, SwapParams, SwapQuote } from '@/services/uniswapService';
import { useToast } from '@/hooks/use-toast';

export const useUniswap = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  // Initialize Uniswap service when chain changes
  useEffect(() => {
    const initializeService = async () => {
      if (chainId) {
        try {
          await uniswapService.initialize(chainId);
          setIsInitialized(true);
          console.log('Uniswap service initialized for chain:', chainId);
        } catch (error) {
          console.error('Failed to initialize Uniswap service:', error);
          toast({
            title: "Network Not Supported",
            description: `Uniswap is not available on this network`,
            variant: "destructive"
          });
          setIsInitialized(false);
        }
      }
    };

    initializeService();
  }, [chainId, toast]);

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

      const result = await uniswapService.getSwapQuote(fullParams);
      setQuote(result);
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
  }, [isInitialized, address, chainId, toast]);

  const executeSwap = useCallback(async (params: Omit<SwapParams, 'recipient' | 'chainId'>) => {
    if (!isInitialized || !address || !chainId || !walletClient) {
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

      const txHash = await uniswapService.executeSwap(fullParams, walletClient);
      
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
  }, [isInitialized, address, chainId, walletClient, toast]);

  const getTokenAddress = useCallback((symbol: string) => {
    if (!chainId) return null;
    return uniswapService.getTokenAddress(symbol, chainId);
  }, [chainId]);

  return {
    isInitialized,
    isLoading,
    quote,
    getQuote,
    executeSwap,
    getTokenAddress,
    supportedChains: uniswapService.getSupportedChains(),
    currentChainId: chainId
  };
};
