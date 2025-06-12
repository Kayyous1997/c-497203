
import { useState, useEffect, useCallback } from 'react';
import { dexScreenerService, DexScreenerPair } from '@/services/dexScreenerService';
import { useToast } from '@/hooks/use-toast';

export const useDexScreener = () => {
  const [pairs, setPairs] = useState<DexScreenerPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<DexScreenerPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchToken = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPairs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: DexScreenerPair[] = [];
      
      // Check if it's an address (starts with 0x and has correct length)
      if (query.startsWith('0x') && query.length === 42) {
        result = await dexScreenerService.getTokenPairs(query);
      } else {
        // Search by symbol/name
        result = await dexScreenerService.searchPairs(query);
      }

      setPairs(result);
      
      // Auto-select the first pair if available
      if (result.length > 0 && !selectedPair) {
        setSelectedPair(result[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPair, toast]);

  const selectPair = useCallback((pair: DexScreenerPair) => {
    setSelectedPair(pair);
  }, []);

  const refreshPairData = useCallback(async () => {
    if (!selectedPair) return;

    setIsLoading(true);
    try {
      const updatedPair = await dexScreenerService.getPairByAddress(selectedPair.pairAddress);
      if (updatedPair) {
        setSelectedPair(updatedPair);
        // Update the pair in the pairs list as well
        setPairs(prevPairs => 
          prevPairs.map(pair => 
            pair.pairAddress === updatedPair.pairAddress ? updatedPair : pair
          )
        );
      }
    } catch (err) {
      console.error('Error refreshing pair data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPair]);

  // Auto-refresh selected pair data every 30 seconds
  useEffect(() => {
    if (!selectedPair) return;

    const interval = setInterval(refreshPairData, 30000);
    return () => clearInterval(interval);
  }, [selectedPair, refreshPairData]);

  return {
    pairs,
    selectedPair,
    isLoading,
    error,
    searchToken,
    selectPair,
    refreshPairData,
    dexScreenerService
  };
};
