
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { useDexScreener } from '@/hooks/useDexScreener';

interface TradingChartProps {
  symbol: string;
  address?: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, address }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPairsList, setShowPairsList] = useState(false);
  
  const {
    pairs,
    selectedPair,
    isLoading,
    error,
    searchToken,
    selectPair,
    refreshPairData,
    dexScreenerService
  } = useDexScreener();

  // Initialize with the provided symbol
  useEffect(() => {
    if (symbol) {
      searchToken(symbol);
    }
  }, [symbol, searchToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchToken(searchQuery.trim());
      setShowPairsList(true);
    }
  };

  const handlePairSelect = (pair: any) => {
    selectPair(pair);
    setShowPairsList(false);
    setSearchQuery('');
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedPair ? (
                <>
                  {selectedPair.baseToken.symbol}/{selectedPair.quoteToken.symbol} Chart
                  <Badge variant={selectedPair.priceChange.h24 >= 0 ? "default" : "destructive"}>
                    {selectedPair.priceChange.h24 >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(selectedPair.priceChange.h24).toFixed(2)}%
                  </Badge>
                </>
              ) : (
                `${symbol.toUpperCase()} Trading Chart`
              )}
            </CardTitle>
            {selectedPair && (
              <p className="text-2xl font-bold">
                ${dexScreenerService.formatPrice(selectedPair.priceUsd)}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            
            {selectedPair && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPairData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Pairs Selection */}
        {showPairsList && pairs.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Select Trading Pair</h4>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {pairs.slice(0, 5).map((pair) => (
                <Button
                  key={pair.pairAddress}
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  onClick={() => handlePairSelect(pair)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">
                        {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pair.dexId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${dexScreenerService.formatPrice(pair.priceUsd)}
                      </div>
                      <div className={`text-sm ${getPriceChangeColor(pair.priceChange.h24)}`}>
                        {dexScreenerService.formatPercentage(pair.priceChange.h24)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* DEX Screener Embedded Chart */}
        {selectedPair ? (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="font-medium">
                  {dexScreenerService.formatVolume(selectedPair.volume.h24)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Liquidity</div>
                <div className="font-medium">
                  {selectedPair.liquidity?.usd 
                    ? dexScreenerService.formatVolume(selectedPair.liquidity.usd)
                    : 'N/A'
                  }
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">24h Txns</div>
                <div className="font-medium">
                  {selectedPair.txns.h24.buys + selectedPair.txns.h24.sells}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-medium">
                  {selectedPair.marketCap 
                    ? dexScreenerService.formatVolume(selectedPair.marketCap)
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Embedded Chart */}
            <div className="h-96 w-full">
              <iframe
                src={`https://dexscreener.com/${selectedPair.chainId}/${selectedPair.pairAddress}?embed=1&theme=dark`}
                className="w-full h-full rounded-lg border border-muted/20"
                frameBorder="0"
                title={`${selectedPair.baseToken.symbol}/${selectedPair.quoteToken.symbol} Chart`}
              />
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => window.open(selectedPair.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Chart on DEX Screener
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Search for a Trading Pair</h3>
              <p className="text-muted-foreground">
                Enter a token symbol or address to view real-time DEX data and charts
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingChart;
