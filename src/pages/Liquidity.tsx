
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddLiquidity from '@/components/liquidity/AddLiquidity';
import RemoveLiquidity from '@/components/liquidity/RemoveLiquidity';
import LiquidityPositions from '@/components/liquidity/LiquidityPositions';

const Liquidity = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Liquidity</h1>
          <p className="text-muted-foreground">
            Add liquidity to receive LP tokens and earn trading fees
          </p>
        </div>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Add Liquidity</TabsTrigger>
            <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            <TabsTrigger value="positions">Your Positions</TabsTrigger>
          </TabsList>

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
      </div>
    </div>
  );
};

export default Liquidity;
