
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Activity, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { priceFeedService } from '@/services/priceFeedService';

interface PriceFeed {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

interface PoolActivity {
  id: string;
  type: 'add' | 'remove' | 'swap';
  pair: string;
  amount: string;
  timestamp: number;
  user: string;
}

const LiquidityFeeds = () => {
  const { isConnected } = useAccount();
  const [priceFeeds, setPriceFeeds] = useState<PriceFeed[]>([]);
  const [poolActivity, setPoolActivity] = useState<PoolActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPriceFeeds = async () => {
    setLoading(true);
    try {
      const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK', 'UNI'];
      const feeds = await Promise.all(
        tokens.map(async (symbol) => {
          const price = await priceFeedService.getTokenPrice(symbol);
          return price ? {
            symbol: price.symbol,
            price: price.price,
            change24h: price.priceChange24h,
            volume24h: price.volume24h,
            marketCap: price.marketCap,
            lastUpdated: price.lastUpdated
          } : null;
        })
      );
      
      setPriceFeeds(feeds.filter(Boolean) as PriceFeed[]);
    } catch (error) {
      console.error('Error fetching price feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolActivity = () => {
    // Mock pool activity data
    const mockActivity: PoolActivity[] = [
      {
        id: '1',
        type: 'add',
        pair: 'ETH/USDC',
        amount: '1.5 ETH + 3000 USDC',
        timestamp: Date.now() - 300000,
        user: '0x1234...5678'
      },
      {
        id: '2',
        type: 'swap',
        pair: 'USDC → ETH',
        amount: '500 USDC → 0.25 ETH',
        timestamp: Date.now() - 600000,
        user: '0xabcd...efgh'
      },
      {
        id: '3',
        type: 'remove',
        pair: 'DAI/USDC',
        amount: '1000 DAI + 1000 USDC',
        timestamp: Date.now() - 900000,
        user: '0x9876...5432'
      }
    ];
    
    setPoolActivity(mockActivity);
  };

  useEffect(() => {
    if (isConnected) {
      fetchPriceFeeds();
      fetchPoolActivity();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchPriceFeeds();
        fetchPoolActivity();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
    }
    return `$${price.toFixed(8)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view live price feeds and pool activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Live Market Feeds</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPriceFeeds}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prices">Price Feeds</TabsTrigger>
          <TabsTrigger value="activity">Pool Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Token Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && priceFeeds.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading price feeds...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {priceFeeds.map((feed) => (
                    <div
                      key={feed.symbol}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {feed.symbol.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{feed.symbol}</h4>
                          <p className="text-sm text-muted-foreground">
                            Vol: {formatVolume(feed.volume24h)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(feed.price)}</p>
                        <div className={`flex items-center gap-1 justify-end ${
                          feed.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${feed.change24h < 0 ? 'rotate-180' : ''}`} />
                          <span className="text-sm">
                            {feed.change24h >= 0 ? '+' : ''}{feed.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Pool Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {poolActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        activity.type === 'add' ? 'default' : 
                        activity.type === 'remove' ? 'destructive' : 'secondary'
                      }>
                        {activity.type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.pair}</p>
                        <p className="text-sm text-muted-foreground">{activity.amount}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-mono">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiquidityFeeds;
