
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, ExternalLink, Plus } from 'lucide-react';
import { useAccount } from 'wagmi';
import PoolCard from './PoolCard';
import PoolDetailsModal from './PoolDetailsModal';

interface PoolData {
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
}

const PoolBrowser = () => {
  const { isConnected } = useAccount();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apr'>('tvl');
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);

  // Mock pool data - in real implementation, fetch from DEX contracts/subgraph
  useEffect(() => {
    const fetchPools = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPools: PoolData[] = [
        {
          id: '1',
          tokenA: { symbol: 'ETH', address: '0x...', logoUrl: '🔷' },
          tokenB: { symbol: 'USDC', address: '0x...', logoUrl: '💵' },
          tvl: '$2,450,000',
          volume24h: '$125,000',
          volume24hChange: 5.2,
          fees24h: '$375',
          apr: '12.5%',
          liquidity: '1,250 ETH / 2,500,000 USDC',
          priceChange24h: 2.1,
          pairAddress: '0x...'
        },
        {
          id: '2',
          tokenA: { symbol: 'WBTC', address: '0x...', logoUrl: '🟠' },
          tokenB: { symbol: 'ETH', address: '0x...', logoUrl: '🔷' },
          tvl: '$1,800,000',
          volume24h: '$89,000',
          volume24hChange: -2.3,
          fees24h: '$267',
          apr: '8.9%',
          liquidity: '45 WBTC / 850 ETH',
          priceChange24h: -1.4,
          pairAddress: '0x...'
        },
        {
          id: '3',
          tokenA: { symbol: 'USDC', address: '0x...', logoUrl: '💵' },
          tokenB: { symbol: 'USDT', address: '0x...', logoUrl: '💰' },
          tvl: '$5,200,000',
          volume24h: '$320,000',
          volume24hChange: 8.7,
          fees24h: '$960',
          apr: '6.8%',
          liquidity: '2,600,000 USDC / 2,600,000 USDT',
          priceChange24h: 0.1,
          pairAddress: '0x...'
        },
        {
          id: '4',
          tokenA: { symbol: 'LINK', address: '0x...', logoUrl: '🔗' },
          tokenB: { symbol: 'ETH', address: '0x...', logoUrl: '🔷' },
          tvl: '$680,000',
          volume24h: '$42,000',
          volume24hChange: 12.1,
          fees24h: '$126',
          apr: '15.2%',
          liquidity: '48,000 LINK / 340 ETH',
          priceChange24h: 4.8,
          pairAddress: '0x...'
        }
      ];
      
      setPools(mockPools);
      setLoading(false);
    };

    fetchPools();
  }, []);

  const filteredPools = pools.filter(pool =>
    pool.tokenA.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.tokenB.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortBy) {
      case 'tvl':
        return parseFloat(b.tvl.replace(/[$,]/g, '')) - parseFloat(a.tvl.replace(/[$,]/g, ''));
      case 'volume':
        return parseFloat(b.volume24h.replace(/[$,]/g, '')) - parseFloat(a.volume24h.replace(/[$,]/g, ''));
      case 'apr':
        return parseFloat(b.apr.replace('%', '')) - parseFloat(a.apr.replace('%', ''));
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search pools by token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'tvl' ? 'default' : 'outline'}
                onClick={() => setSortBy('tvl')}
                size="sm"
              >
                TVL
              </Button>
              <Button
                variant={sortBy === 'volume' ? 'default' : 'outline'}
                onClick={() => setSortBy('volume')}
                size="sm"
              >
                Volume
              </Button>
              <Button
                variant={sortBy === 'apr' ? 'default' : 'outline'}
                onClick={() => setSortBy('apr')}
                size="sm"
              >
                APR
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                ${pools.reduce((sum, pool) => sum + parseFloat(pool.tvl.replace(/[$,]/g, '')), 0).toLocaleString()}
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Total Value Locked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                ${pools.reduce((sum, pool) => sum + parseFloat(pool.volume24h.replace(/[$,]/g, '')), 0).toLocaleString()}
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">24h Volume</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{pools.length}</div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Pools</p>
          </CardContent>
        </Card>
      </div>

      {/* Pools List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-8 flex-1 max-w-md">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-12"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                onViewDetails={() => setSelectedPool(pool)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pool Details Modal */}
      {selectedPool && (
        <PoolDetailsModal
          pool={selectedPool}
          open={!!selectedPool}
          onOpenChange={() => setSelectedPool(null)}
        />
      )}
    </div>
  );
};

export default PoolBrowser;
