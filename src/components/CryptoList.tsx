
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Star, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const fetchCryptoData = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CryptoList = () => {
  const [sortBy, setSortBy] = useState<'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'total_volume'>('market_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: cryptos, isLoading } = useQuery({
    queryKey: ['cryptos'],
    queryFn: fetchCryptoData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedCryptos = cryptos?.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank <= 3) return 'default';
    if (rank <= 10) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Top Cryptocurrencies</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <TrendingUpIcon className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://coingecko.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            CoinGecko
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('current_price')}
              >
                <div className="flex items-center gap-1">
                  Price
                  {sortBy === 'current_price' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead>1h</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('price_change_percentage_24h')}
              >
                <div className="flex items-center gap-1">
                  24h
                  {sortBy === 'price_change_percentage_24h' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead>7d</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('total_volume')}
              >
                <div className="flex items-center gap-1">
                  Volume (24h)
                  {sortBy === 'total_volume' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('market_cap')}
              >
                <div className="flex items-center gap-1">
                  Market Cap
                  {sortBy === 'market_cap' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCryptos?.map((crypto) => (
              <TableRow 
                key={crypto.id} 
                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => window.open(`https://coingecko.com/en/coins/${crypto.id}`, '_blank')}
              >
                <TableCell>
                  <Badge variant={getRankBadgeVariant(crypto.market_cap_rank)}>
                    {crypto.market_cap_rank}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className="w-8 h-8 rounded-full"
                        loading="lazy"
                      />
                      <Star className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {crypto.name}
                      </p>
                      <p className="text-sm text-muted-foreground uppercase">
                        {crypto.symbol}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {formatPrice(crypto.current_price)}
                </TableCell>
                <TableCell>
                  <span className={`flex items-center gap-1 text-sm ${getPriceChangeColor(crypto.price_change_percentage_1h_in_currency || 0)}`}>
                    {(crypto.price_change_percentage_1h_in_currency || 0) >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_1h_in_currency || 0).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`flex items-center gap-1 font-medium ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`flex items-center gap-1 text-sm ${getPriceChangeColor(crypto.price_change_percentage_7d_in_currency || 0)}`}>
                    {(crypto.price_change_percentage_7d_in_currency || 0) >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="font-mono">
                  {formatVolume(crypto.total_volume)}
                </TableCell>
                <TableCell className="font-mono">
                  {formatMarketCap(crypto.market_cap)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        Data updates every 30 seconds • Powered by CoinGecko API
      </div>
    </div>
  );
};

export default CryptoList;
