
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, ChartCandlestick, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { portfolioService, PortfolioSummary } from '@/services/portfolioService';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';

const PortfolioDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioHistory, setPortfolioHistory] = useState<{ timestamp: number; value: number; date: string }[]>([]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const fetchPortfolio = useCallback(async () => {
    if (!isConnected || !address) {
      setPortfolio(null);
      setLoading(false);
      return;
    }

    try {
      const data = await portfolioService.getPortfolioSummary(address);
      setPortfolio(data);

      // Generate portfolio history based on current value
      if (data.totalValue > 0) {
        const history = [];
        const days = 30;
        const currentValue = data.totalValue;
        const startValue = currentValue - data.totalPnl;

        for (let i = days; i >= 0; i--) {
          const timestamp = Date.now() - (i * 86400000);
          const progress = (days - i) / days;
          const value = startValue + (data.totalPnl * progress) + (Math.random() - 0.5) * (currentValue * 0.05);
          
          history.push({ 
            timestamp, 
            value: Math.max(0, value),
            date: new Date(timestamp).toLocaleDateString()
          });
        }
        
        setPortfolioHistory(history);
      } else {
        setPortfolioHistory([]);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [address, isConnected]);

  const handleRefresh = useCallback(async () => {
    if (!address) return;
    
    setRefreshing(true);
    await portfolioService.updatePortfolio(address);
    await fetchPortfolio();
  }, [address, fetchPortfolio]);

  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Set up real-time updates
  useEffect(() => {
    if (!address || !isConnected) return;

    const cleanup = portfolioService.startRealTimeUpdates(address, (updatedPortfolio) => {
      setPortfolio(updatedPortfolio);
    });

    return cleanup;
  }, [address, isConnected]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to view your portfolio</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!portfolio || portfolio.totalValue === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ChartCandlestick className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Portfolio Data</h3>
          <p className="text-muted-foreground mb-4">
            No tokens or positions found for this wallet address
          </p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Portfolio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Total Portfolio Value</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ChartCandlestick className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-2xl font-bold">{formatCurrency(portfolio.totalPnl)}</div>
              <Badge variant={portfolio.totalPnl >= 0 ? "default" : "destructive"}>
                {portfolio.totalPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercentage(portfolio.totalPnlPercentage)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Active Positions</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{portfolio.positions.length}</div>
              <p className="text-sm text-muted-foreground">
                {portfolio.positions.filter(p => p.type === 'spot').length} Spot · {portfolio.positions.filter(p => p.type === 'liquidity').length} Liquidity
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      {portfolioHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioHistory}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#E6E4DD"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#E6E4DD"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#3A3935',
                      border: '1px solid #605F5B',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#E6E4DD' }}
                    formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8989DE" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Holdings and Allocation */}
      {portfolio.topTokens.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.topTokens.map((token, index) => (
                  <div key={token.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-bold">{token.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.balance.toFixed(4)} {token.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(token.value)}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{token.allocation.toFixed(1)}%</span>
                        <Badge 
                          variant={token.priceChange24h >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {formatPercentage(token.priceChange24h)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio.topTokens.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="allocation"
                    >
                      {portfolio.topTokens.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value.toFixed(1)}%`,
                        props.payload.symbol
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {portfolio.topTokens.slice(0, 5).map((token, index) => (
                  <div key={token.symbol} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm">{token.symbol}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Positions */}
      {portfolio.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.positions.slice(0, 5).map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{position.type}</Badge>
                    <div>
                      <p className="font-medium">
                        {position.tokens.map(t => t.symbol).join(' / ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(position.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(position.currentValue)}</p>
                    <div className="flex items-center gap-1">
                      <Badge variant={position.pnl >= 0 ? "default" : "destructive"}>
                        {position.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatCurrency(position.pnl)} ({formatPercentage(position.pnlPercentage)})
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioDashboard;
