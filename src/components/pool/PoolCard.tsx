
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, ExternalLink } from 'lucide-react';

interface PoolCardProps {
  pool: {
    id: string;
    tokenA: {
      symbol: string;
      logoUrl: string;
    };
    tokenB: {
      symbol: string;
      logoUrl: string;
    };
    tvl: string;
    volume24h: string;
    volume24hChange: number;
    fees24h: string;
    apr: string;
    priceChange24h: number;
  };
  onViewDetails: () => void;
}

const PoolCard = ({ pool, onViewDetails }: PoolCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetails}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Token Pair */}
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg z-10">
                {pool.tokenA.logoUrl}
              </div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-background flex items-center justify-center text-lg">
                {pool.tokenB.logoUrl}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {pool.tokenA.symbol} / {pool.tokenB.symbol}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  0.3% Fee
                </Badge>
                {pool.priceChange24h !== 0 && (
                  <div className={`flex items-center space-x-1 text-xs ${
                    pool.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {pool.priceChange24h > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(pool.priceChange24h)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pool Stats */}
          <div className="grid grid-cols-4 gap-8 flex-1 max-w-md">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">TVL</p>
              <p className="font-semibold">{pool.tvl}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Volume 24H</p>
              <div className="space-y-1">
                <p className="font-semibold">{pool.volume24h}</p>
                <div className={`flex items-center justify-center space-x-1 text-xs ${
                  pool.volume24hChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {pool.volume24hChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(pool.volume24hChange)}%</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Fees 24H</p>
              <p className="font-semibold">{pool.fees24h}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">APR</p>
              <p className="font-semibold text-green-600">{pool.apr}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to add liquidity
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolCard;
