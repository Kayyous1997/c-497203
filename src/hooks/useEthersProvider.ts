
import { useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { ethers } from 'ethers';

export function useEthersProvider() {
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!publicClient) return null;

    // Convert wagmi's public client to ethers provider
    return new ethers.providers.JsonRpcProvider(
      publicClient.transport.url || 'https://eth-mainnet.g.alchemy.com/v2/demo'
    );
  }, [publicClient]);
}
