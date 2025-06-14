
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from 'wagmi';
import AddLiquidity from '@/components/liquidity/AddLiquidity';
import RemoveLiquidity from '@/components/liquidity/RemoveLiquidity';
import LiquidityPositions from '@/components/liquidity/LiquidityPositions';
import LiquidityDashboard from '@/components/liquidity/LiquidityDashboard';
import LiquidityFeeds from '@/components/liquidity/LiquidityFeeds';

const Liquidity = () => {
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Liquidity</h1>
          <p className="text-muted-foreground">
            Add liquidity to receive LP tokens and earn trading fees
          </p>
        </div>

        {isConnected ? (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="feeds">Live Feeds</TabsTrigger>
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
              <TabsTrigger value="positions">Your Positions</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <LiquidityDashboard />
            </TabsContent>

            <TabsContent value="feeds">
              <LiquidityFeeds />
            </TabsContent>

            <TabsContent value="add">
              <AddLiquidity />
            </TabsContent>

            <TabsContent value="remove">
              <RemoveLiquidity />
            </TabsContent>

            <TabsContent value="positions">
              <LiquidityPositions />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="text-center p-12">
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access liquidity features and view market data
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Market Dashboard</h4>
                    <p className="text-sm text-muted-foreground">View TVL, volume, and trending pairs</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📈 Live Price Feeds</h4>
                    <p className="text-sm text-muted-foreground">Real-time token prices and activity</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">💰 Provide Liquidity</h4>
                    <p className="text-sm text-muted-foreground">Add liquidity and earn fees</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📋 Track Positions</h4>
                    <p className="text-sm text-muted-foreground">Monitor your LP positions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Liquidity;
