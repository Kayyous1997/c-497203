
import { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, RefreshCw, Search, Flame, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { priceFeedService } from "@/services/priceFeedService";

interface TrendingToken {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const MarketStats = () => {
  const [marketData, setMarketData] = useState({
    totalMarketCap: 2.1,
    marketCapChange: 2.4,
    totalVolume: 84.2,
    volumeChange: 5.1,
    btcDominance: 42.1,
    dominanceChange: -0.8
  });
  
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchTrendingTokens = async () => {
    setIsLoading(true);
    try {
      const symbols = ['BTC', 'ETH', 'USDC', 'LINK', 'UNI'];
      const tokenData = await Promise.all(
        symbols.map(async (symbol) => {
          const price = await priceFeedService.getTokenPrice(symbol);
          return price ? {
            symbol: price.symbol,
            price: price.price,
            change24h: price.priceChange24h,
            volume24h: price.volume24h,
            marketCap: price.marketCap
          } : null;
        })
      );
      
      setTrendingTokens(tokenData.filter(Boolean) as TrendingToken[]);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMarketData = () => {
    // Simulate market data updates with small random changes
    setMarketData(prev => ({
      totalMarketCap: prev.totalMarketCap + (Math.random() - 0.5) * 0.1,
      marketCapChange: prev.marketCapChange + (Math.random() - 0.5) * 0.5,
      totalVolume: prev.totalVolume + (Math.random() - 0.5) * 2,
      volumeChange: prev.volumeChange + (Math.random() - 0.5) * 1,
      btcDominance: prev.btcDominance + (Math.random() - 0.5) * 0.2,
      dominanceChange: prev.dominanceChange + (Math.random() - 0.5) * 0.3
    }));
    fetchTrendingTokens();
  };

  useEffect(() => {
    fetchTrendingTokens();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTopGainers = () => {
    return trendingTokens
      .filter(token => token.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 3);
  };

  const getTopLosers = () => {
    return trendingTokens
      .filter(token => token.change24h < 0)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-success animate-pulse" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold mt-2 relative z-10">
            ${marketData.totalMarketCap.toFixed(1)}T
          </p>
          <span className={`text-sm flex items-center gap-1 relative z-10 ${getChangeColor(marketData.marketCapChange)}`}>
            {marketData.marketCapChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(marketData.marketCapChange).toFixed(1)}%
          </span>
        </div>
        
        <div className="glass-card p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold mt-2 relative z-10">
            ${marketData.totalVolume.toFixed(1)}B
          </p>
          <span className={`text-sm flex items-center gap-1 relative z-10 ${getChangeColor(marketData.volumeChange)}`}>
            {marketData.volumeChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(marketData.volumeChange).toFixed(1)}%
          </span>
        </div>
        
        <div className="glass-card p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
            <TrendingUpIcon className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-semibold mt-2 relative z-10">
            {marketData.btcDominance.toFixed(1)}%
          </p>
          <span className={`text-sm flex items-center gap-1 relative z-10 ${getChangeColor(marketData.dominanceChange)}`}>
            {marketData.dominanceChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(marketData.dominanceChange).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Quick Search and Actions */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tokens by symbol or contract..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">BTC</Button>
                <Button variant="outline" size="sm">ETH</Button>
                <Button variant="outline" size="sm">USDC</Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Updated {Math.floor((Date.now() - lastUpdated) / 1000)}s ago
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMarketData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-green-500" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopGainers().map((token, index) => (
                <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        Vol: {formatVolume(token.volume24h)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(token.price)}</div>
                    <div className={`text-sm flex items-center gap-1 justify-end ${getChangeColor(token.change24h)}`}>
                      <ArrowUpIcon className="w-3 h-3" />
                      +{token.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUpIcon className="h-5 w-5 text-red-500 rotate-180" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopLosers().map((token, index) => (
                <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        Vol: {formatVolume(token.volume24h)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(token.price)}</div>
                    <div className={`text-sm flex items-center gap-1 justify-end ${getChangeColor(token.change24h)}`}>
                      <ArrowDownIcon className="w-3 h-3" />
                      {token.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketStats;
