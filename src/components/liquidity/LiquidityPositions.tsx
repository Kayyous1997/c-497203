
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';

const LiquidityPositions = () => {
  const { isConnected } = useAccount();

  // Mock data - in real implementation, fetch from contracts
  const mockPositions = [
    {
      id: '1',
      tokenA: { symbol: 'ETH', logoURI: '🔷' },
      tokenB: { symbol: 'USDC', logoURI: '💵' },
      lpBalance: '0.5',
      tokenAAmount: '0.25',
      tokenBAmount: '500.0',
      poolShare: '0.05',
      feesEarned24h: '0.12',
      totalFeesEarned: '2.45'
    },
    {
      id: '2',
      tokenA: { symbol: 'WBTC', logoURI: '🟠' },
      tokenB: { symbol: 'ETH', logoURI: '🔷' },
      lpBalance: '0.1',
      tokenAAmount: '0.01',
      tokenBAmount: '0.15',
      poolShare: '0.02',
      feesEarned24h: '0.05',
      totalFeesEarned: '0.89'
    }
  ];

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

  if (mockPositions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-semibold mb-2">No Liquidity Positions</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any liquidity positions yet
          </p>
          <Button>Add Liquidity</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Liquidity Positions</h3>
        <Badge variant="secondary">{mockPositions.length} positions</Badge>
      </div>

      <div className="grid gap-4">
        {mockPositions.map((position) => (
          <Card key={position.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg">
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
                    <p className="text-sm text-muted-foreground">
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
                  <p className="font-semibold">{position.tokenAAmount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pooled {position.tokenB.symbol}</p>
                  <p className="font-semibold">{position.tokenBAmount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fees Earned (24h)</p>
                  <p className="font-semibold text-green-600">${position.feesEarned24h}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Fees Earned</p>
                  <p className="font-semibold text-green-600">${position.totalFeesEarned}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    LP Tokens: {position.lpBalance}
                  </span>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
