
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useLiquidity } from '@/hooks/useLiquidity';

const LiquidityPositions = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { positions, refreshing, fetchPositions, contractsDeployed } = useLiquidity();

  // Auto-refresh positions
  useEffect(() => {
    if (isConnected && contractsDeployed) {
      fetchPositions();
    }
  }, [isConnected, contractsDeployed, fetchPositions]);

  const getExplorerUrl = (address: string) => {
    const explorers = {
      1: 'https://etherscan.io/address/',
      8453: 'https://basescan.org/address/',
      59144: 'https://lineascan.build/address/',
      11124: 'https://explorer.testnet.abs.xyz/address/',
      10143: 'https://testnet.monadexplorer.com/address/'
    };
    
    const baseUrl = explorers[chainId as keyof typeof explorers];
    return baseUrl ? `${baseUrl}${address}` : null;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your liquidity positions
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!contractsDeployed) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-semibold mb-2">Contracts Not Deployed</h3>
          <p className="text-muted-foreground mb-4">
            Deploy your DEX contracts to start providing liquidity
          </p>
          <Button variant="outline" disabled>
            Deploy Contracts First
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0 && !refreshing) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-semibold mb-2">No Liquidity Positions</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any liquidity positions yet
          </p>
          <div className="flex gap-2 justify-center">
            <Button>Add Liquidity</Button>
            <Button variant="outline" onClick={fetchPositions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Your Liquidity Positions</h3>
          {positions.length > 0 && (
            <Badge variant="secondary">{positions.length} positions</Badge>
          )}
        </div>
        <Button
          variant="outline"
          onClick={fetchPositions}
          disabled={refreshing}
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {refreshing && positions.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your positions...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {positions.map((position) => (
            <Card key={position.id} className="relative">
              {refreshing && (
                <div className="absolute top-2 right-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg z-10">
                        {position.tokenA.logoURI}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg">
                        {position.tokenB.logoURI}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {position.tokenA.symbol} / {position.tokenB.symbol}
                      </h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        Pool Share: {position.poolShare}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button size="sm" variant="outline">
                      <Minus className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pooled {position.tokenA.symbol}</p>
                    <p className="font-semibold font-mono">{position.tokenAAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pooled {position.tokenB.symbol}</p>
                    <p className="font-semibold font-mono">{position.tokenBAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fees Earned (24h)</p>
                    <p className="font-semibold text-green-600 font-mono">${position.feesEarned24h}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Fees Earned</p>
                    <p className="font-semibold text-green-600 font-mono">${position.totalFeesEarned}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      LP Tokens: <span className="font-mono">{position.lpBalance}</span>
                    </span>
                    {position.pairAddress && getExplorerUrl(position.pairAddress) && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={getExplorerUrl(position.pairAddress)!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="text-center p-8">
          <div className="text-muted-foreground mb-3">
            <Plus className="h-8 w-8 mx-auto mb-2" />
          </div>
          <h4 className="font-semibold mb-2">Add More Liquidity</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Provide liquidity to earn trading fees
          </p>
          <Button>Add Liquidity</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiquidityPositions;
