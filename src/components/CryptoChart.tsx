import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  ExternalLink,
  DollarSign,
  Activity,
  Users,
  Globe
} from 'lucide-react';
import { useDexScreener } from '@/hooks/useDexScreener';
import { DexScreenerPair } from '@/services/dexScreenerService';

const CryptoChart = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPairsList, setShowPairsList] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
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

  // Chain options for the selector
  const chainOptions = [
    { value: 'ethereum', label: 'Ethereum', emoji: '🔷' },
    { value: 'bsc', label: 'BSC', emoji: '🟡' },
    { value: 'polygon', label: 'Polygon', emoji: '🟣' },
    { value: 'arbitrum', label: 'Arbitrum', emoji: '🔵' },
    { value: 'base', label: 'Base', emoji: '🔵' },
    { value: 'solana', label: 'Solana', emoji: '🟢' },
  ];

  // Initialize with Bitcoin search
  useEffect(() => {
    searchToken('bitcoin');
  }, [searchToken]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    
    if (!query) {
      setShowPairsList(false);
      setShowSuggestions(false);
      return;
    }

    console.log('Searching for:', query, 'on chain:', selectedChain);
    
    try {
      await searchToken(query);
      setShowPairsList(true);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Auto-search and show suggestions as user types
    if (value.length >= 2) {
      setShowSuggestions(true);
      const newTimeout = setTimeout(async () => {
        try {
          await searchToken(value.trim());
          setShowPairsList(true);
        } catch (error) {
          console.error('Auto-search error:', error);
        }
      }, 300); // 300ms debounce
      
      setSearchTimeout(newTimeout);
    } else if (value.length === 0) {
      setShowPairsList(false);
      setShowSuggestions(false);
    }
  };

  const handlePairSelect = (pair: DexScreenerPair) => {
    selectPair(pair);
    setShowPairsList(false);
    setShowSuggestions(false);
    setSearchQuery(pair.baseToken.symbol);
  };

  const handleChainChange = (chainValue: string) => {
    setSelectedChain(chainValue);
    console.log('Chain changed to:', chainValue);
    // Re-search with new chain if there's a current search
    if (searchQuery.trim()) {
      searchToken(searchQuery.trim());
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const isContractAddress = (query: string) => {
    return query.startsWith('0x') && query.length === 42;
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Token Chart</h2>
        
        <div className="flex items-center gap-3">
          {/* Chain Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedChain} onValueChange={handleChainChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chainOptions.map((chain) => (
                  <SelectItem key={chain.value} value={chain.value}>
                    <div className="flex items-center gap-2">
                      <span>{chain.emoji}</span>
                      <span>{chain.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search by symbol${isContractAddress(searchQuery) ? ' or contract address' : ''}`}
                value={searchQuery}
                onChange={handleInputChange}
                className="pl-10 w-80"
                disabled={isLoading}
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge variant="outline" className="text-xs">
                    {isContractAddress(searchQuery) ? 'Address' : 'Symbol'}
                  </Badge>
                </div>
              )}
            </div>
            <Button type="submit" size="sm" disabled={isLoading || !searchQuery.trim()}>
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

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Auto-suggestions or Search Results */}
      {(showPairsList || showSuggestions) && pairs.length > 0 && (
        <Card className="mb-6 border-muted/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {showSuggestions ? 'Suggestions' : 'Search Results'}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {chainOptions.find(c => c.value === selectedChain)?.emoji} {chainOptions.find(c => c.value === selectedChain)?.label}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowPairsList(false);
                    setShowSuggestions(false);
                  }}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {pairs.slice(0, 8).map((pair, index) => (
                <Button
                  key={`${pair.pairAddress}-${index}`}
                  variant="ghost"
                  className="justify-start h-auto p-3 hover:bg-muted/10"
                  onClick={() => handlePairSelect(pair)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pair.dexId} • {pair.baseToken.name}
                        </div>
                        {isContractAddress(searchQuery) && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {pair.baseToken.address.slice(0, 8)}...{pair.baseToken.address.slice(-6)}
                          </div>
                        )}
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
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {(showPairsList || showSuggestions) && pairs.length === 0 && !isLoading && searchQuery && (
        <Card className="mb-6 border-muted/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tokens found for "{searchQuery}"</p>
              <p className="text-sm mt-1">
                Try searching for a different token symbol or contract address on {chainOptions.find(c => c.value === selectedChain)?.label}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Pair Details */}
      {selectedPair && (
        <>
          {/* Pair Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">
                  {selectedPair.baseToken.symbol}/{selectedPair.quoteToken.symbol}
                </h3>
                <Badge variant="secondary">{selectedPair.dexId}</Badge>
                <Badge variant="outline">{selectedPair.chainId}</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedPair.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on DEX Screener
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Price USD</span>
                  </div>
                  <div className="text-2xl font-bold">
                    ${dexScreenerService.formatPrice(selectedPair.priceUsd)}
                  </div>
                  <div className={`flex items-center gap-1 ${getPriceChangeColor(selectedPair.priceChange.h24)}`}>
                    {(() => {
                      const Icon = getPriceChangeIcon(selectedPair.priceChange.h24);
                      return <Icon className="h-4 w-4" />;
                    })()}
                    <span className="text-sm font-medium">
                      {dexScreenerService.formatPercentage(selectedPair.priceChange.h24)} (24h)
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Volume 24h</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {dexScreenerService.formatVolume(selectedPair.volume.h24)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPair.txns.h24.buys + selectedPair.txns.h24.sells} txns
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Liquidity</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedPair.liquidity?.usd 
                      ? dexScreenerService.formatVolume(selectedPair.liquidity.usd)
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPair.marketCap 
                      ? `MC: ${dexScreenerService.formatVolume(selectedPair.marketCap)}`
                      : 'Market Cap: N/A'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Price Changes Grid */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Price Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">5m</div>
                  <div className={`font-medium ${getPriceChangeColor(selectedPair.priceChange.m5)}`}>
                    {dexScreenerService.formatPercentage(selectedPair.priceChange.m5)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">1h</div>
                  <div className={`font-medium ${getPriceChangeColor(selectedPair.priceChange.h1)}`}>
                    {dexScreenerService.formatPercentage(selectedPair.priceChange.h1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">6h</div>
                  <div className={`font-medium ${getPriceChangeColor(selectedPair.priceChange.h6)}`}>
                    {dexScreenerService.formatPercentage(selectedPair.priceChange.h6)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">24h</div>
                  <div className={`font-medium ${getPriceChangeColor(selectedPair.priceChange.h24)}`}>
                    {dexScreenerService.formatPercentage(selectedPair.priceChange.h24)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DEX Screener Embedded Chart */}
          <div className="h-[500px] w-full">
            <iframe
              src={`https://dexscreener.com/${selectedPair.chainId}/${selectedPair.pairAddress}?embed=1&theme=dark`}
              className="w-full h-full rounded-lg border border-muted/20"
              frameBorder="0"
              title={`${selectedPair.baseToken.symbol}/${selectedPair.quoteToken.symbol} Chart`}
            />
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && !selectedPair && (
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading token data...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedPair && !isLoading && pairs.length === 0 && !error && !showPairsList && !showSuggestions && (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Search for a Token</h3>
            <p className="text-muted-foreground">
              Enter a token symbol, name, or contract address to view its chart and data
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoChart;
