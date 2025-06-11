
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { dexService } from '@/services/uniswapService';

export const useContractManager = () => {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);

  const updateContractAddresses = useCallback(async (
    routerAddress: string,
    factoryAddress: string
  ) => {
    try {
      setIsDeploying(true);
      
      // Validate addresses
      if (!routerAddress || !factoryAddress) {
        throw new Error('Both router and factory addresses are required');
      }

      if (!routerAddress.startsWith('0x') || !factoryAddress.startsWith('0x')) {
        throw new Error('Invalid address format');
      }

      // Update the service
      dexService.updateContractAddresses(routerAddress, factoryAddress);
      
      toast({
        title: "Contracts Updated",
        description: "Your DEX contract addresses have been successfully updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating contract addresses:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update contract addresses",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeploying(false);
    }
  }, [toast]);

  const validateContractDeployment = useCallback(async (
    routerAddress: string,
    factoryAddress: string
  ) => {
    try {
      const contractHelpers = dexService.getContractHelpers();
      if (!contractHelpers) {
        throw new Error('Contract helpers not initialized');
      }

      // Test basic contract calls
      const routerContract = contractHelpers.getRouterContract();
      const factoryContract = contractHelpers.getFactoryContract();

      const [routerFactory, factoryFeeTo] = await Promise.all([
        routerContract.factory(),
        factoryContract.feeTo().catch(() => null) // Some factories might not have feeTo
      ]);

      // Verify router points to correct factory
      if (routerFactory.toLowerCase() !== factoryAddress.toLowerCase()) {
        throw new Error('Router is not connected to the specified factory');
      }

      toast({
        title: "Validation Successful",
        description: "Your contracts are properly deployed and connected",
      });

      return true;
    } catch (error) {
      console.error('Contract validation failed:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate contracts",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    isDeploying,
    updateContractAddresses,
    validateContractDeployment
  };
};
