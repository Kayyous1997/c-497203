
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Plus, Minus, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PoolDetailsModalProps {
  pool: {
    id: string;
    tokenA: {
      symbol: string;
      address: string;
      logoUrl: string;
    };
    tokenB: {
      symbol: string;
      address: string;
      logoUrl: string;
    };
    tvl: string;
    volume24h: string;
    volume24hChange: number;
    fees24h: string;
    apr: string;
    liquidity: string;
    priceChange24h: number;
    pairAddress: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PoolDetailsModal = ({ pool, open, onOpenChange }: PoolDetailsModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  // Mock historical data
  const mockChartData = [
    { time: '00:00', tvl: 2200000, volume: 95000 },
    { time: '04:00', tvl: 2350000, volume: 110000 },
    { time: '08:00', tvl: 2400000, volume: 125000 },
    { time: '12:00', tvl: 2450000, volume: 140000 },
    { time: '16:00', tvl: 2380000, volume: 120000 },
    { time: '20:00', tvl: 2450000, volume: 125000 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg z-10">
                {pool.tokenA.logoUrl}
              </div>
              <div className="w-8 h-8 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg">
                {pool.tokenB.logoUrl}
              </div>
            </div>
            <span>{pool.tokenA.symbol} / {pool.tokenB.symbol}</span>
            <Badge variant="secondary">0.3% Fee</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{pool.tvl}</div>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{pool.volume24h}</div>
                    {pool.volume24hChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{pool.fees24h}</div>
                  <p className="text-sm text-muted-foreground">24h Fees</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{pool.apr}</div>
                  <p className="text-sm text-muted-foreground">APR</p>
                </CardContent>
              </Card>
            </div>

            {/* Pool Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pool Composition</p>
                    <p className="font-mono text-sm">{pool.liquidity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm">{pool.pairAddress}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(pool.pairAddress, 'Contract address')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Liquidity
              </Button>
              <Button variant="outline" size="lg">
                <Minus className="h-4 w-4 mr-2" />
                Remove Liquidity
              </Button>
              <Button variant="outline" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock LP data */}
                  {[
                    { address: '0x1234...5678', share: '15.2%', value: '$372,000' },
                    { address: '0x2345...6789', share: '8.7%', value: '$213,000' },
                    { address: '0x3456...789a', share: '6.3%', value: '$154,000' },
                    { address: '0x4567...89ab', share: '5.1%', value: '$125,000' },
                  ].map((lp, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        <span className="font-mono text-sm">{lp.address}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{lp.value}</p>
                        <p className="text-sm text-muted-foreground">{lp.share}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock transaction data */}
                  {[
                    { type: 'Swap', amount: '1.5 ETH → 3,000 USDC', time: '2 mins ago', hash: '0xabc...123' },
                    { type: 'Add', amount: '+ 0.8 ETH, 1,600 USDC', time: '15 mins ago', hash: '0xdef...456' },
                    { type: 'Swap', amount: '500 USDC → 0.25 ETH', time: '32 mins ago', hash: '0x789...def' },
                    { type: 'Remove', amount: '- 2.1 ETH, 4,200 USDC', time: '1 hour ago', hash: '0x456...789' },
                  ].map((tx, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          tx.type === 'Swap' ? 'default' : 
                          tx.type === 'Add' ? 'secondary' : 'destructive'
                        }>
                          {tx.type}
                        </Badge>
                        <span className="font-mono text-sm">{tx.amount}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{tx.time}</p>
                        <div className="flex items-center space-x-1">
                          <span className="font-mono text-xs">{tx.hash}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(tx.hash, 'Transaction hash')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PoolDetailsModal;
