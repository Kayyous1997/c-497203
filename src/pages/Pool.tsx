
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PoolBrowser from '@/components/pool/PoolBrowser';
import PoolCreator from '@/components/pool/PoolCreator';
import MyPositions from '@/components/pool/MyPositions';

const Pool = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pools</h1>
          <p className="text-muted-foreground">
            Browse existing pools, create new ones, or manage your liquidity positions
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Pools</TabsTrigger>
            <TabsTrigger value="create">Create Pool</TabsTrigger>
            <TabsTrigger value="positions">My Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <PoolBrowser />
          </TabsContent>

          <TabsContent value="create">
            <PoolCreator />
          </TabsContent>

          <TabsContent value="positions">
            <MyPositions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Pool;
