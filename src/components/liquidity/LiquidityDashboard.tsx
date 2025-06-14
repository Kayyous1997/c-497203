
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, BarChart3 } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useLiquidity } from '@/hooks/useLiquidity';

interface MarketStats {
  totalValueLocked: string;
  volume24h: string;
  totalPairs: number;
  activeLPs: number;
  trending: {
    pair: string;
    apy: string;
    change: number;
  }[];
}

const LiquidityDashboard = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { positions, contractsDeployed } = useLiquidity();

  // Mock market stats - in real implementation, fetch from your DEX
  const marketStats: MarketStats = {
    totalValueLocked: '2.4M',
    volume24h: '156K',
    totalPairs: 45,
    activeLPs: 127,
    trending: [
      { pair: 'ETH/USDC', apy: '12.5%', change: 2.3 },
      { pair: 'WETH/DAI', apy: '8.9%', change: -0.8 },
      { pair: 'USDC/USDT', apy: '15.2%', change: 4.1 }
    ]
  };

  const topPairs = [
    { pair: 'ETH/USDC', tvl: '$450K', volume: '$45K', apy: '12.5%', fees: '$2.1K' },
    { pair: 'WETH/DAI', tvl: '$320K', volume: '$32K', apy: '8.9%', fees: '$1.5K' },
    { pair: 'USDC/USDT', tvl: '$280K', volume: '$28K', apy: '15.2%', fees: '$1.8K' },
    { pair: 'LINK/ETH', tvl: '$180K', volume: '$18K', apy: '18.7%', fees: '$890' },
  ];

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view liquidity feeds and market data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value Locked</p>
                <p className="text-2xl font-bold">${marketStats.totalValueLocked}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">${marketStats.volume24h}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pairs</p>
                <p className="text-2xl font-bold">{marketStats.totalPairs}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active LPs</p>
                <p className="text-2xl font-bold">{marketStats.activeLPs}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Pairs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Pairs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketStats.trending.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{item.pair}</Badge>
                  <span className="font-medium">APY: {item.apy}</span>
                </div>
                <div className={`flex items-center gap-1 ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{Math.abs(item.change)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Liquidity Pairs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Liquidity Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold z-10">
                      {pair.pair.split('/')[0].charAt(0)}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                      {pair.pair.split('/')[1].charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{pair.pair}</h4>
                    <p className="text-sm text-muted-foreground">TVL: {pair.tvl}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Volume 24h</p>
                    <p className="font-semibold">{pair.volume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">APY</p>
                    <p className="font-semibold text-green-600">{pair.apy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fees 24h</p>
                    <p className="font-semibold">{pair.fees}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Position Summary */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Position Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold">{positions.length}</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">$1,247</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Fees Earned</p>
                <p className="text-2xl font-bold text-green-600">$12.45</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${contractsDeployed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">
                {contractsDeployed ? 'DEX Contracts Active' : 'Using Mock Data'}
              </span>
            </div>
            <Badge variant={contractsDeployed ? 'default' : 'secondary'}>
              Chain ID: {chainId}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiquidityDashboard;
