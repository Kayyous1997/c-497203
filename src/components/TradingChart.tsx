
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { priceFeedService, CandlestickData, PriceHistory } from '@/services/priceFeedService';

interface TradingChartProps {
  symbol: string;
  address?: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, address }) => {
  const [chartData, setChartData] = useState<PriceHistory[]>([]);
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [timeframe, setTimeframe] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current price
        const price = await priceFeedService.getTokenPrice(symbol, address);
        if (price) {
          setCurrentPrice(price.price);
          setPriceChange(price.priceChange24h);
        }

        // Get chart data
        if (chartType === 'line') {
          const history = await priceFeedService.getPriceHistory(symbol, timeframe);
          setChartData(history.map(h => ({
            ...h,
            date: new Date(h.timestamp).toLocaleDateString(),
            time: new Date(h.timestamp).toLocaleTimeString()
          })));
        } else {
          const candles = await priceFeedService.getCandlestickData(symbol, timeframe);
          setCandleData(candles.map(c => ({
            ...c,
            date: new Date(c.timestamp).toLocaleDateString()
          })));
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, address, chartType, timeframe]);

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
    }
    return `$${price.toFixed(8)}`;
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
              {symbol.toUpperCase()} Price Chart
              <Badge variant={priceChange >= 0 ? "default" : "destructive"}>
                {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(priceChange).toFixed(2)}%
              </Badge>
            </CardTitle>
            <p className="text-2xl font-bold">{formatPrice(currentPrice)}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'candle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('candle')}
            >
              Candle
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          {[1, 7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={timeframe === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(days)}
            >
              {days}D
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#E6E4DD"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#E6E4DD"
                  fontSize={12}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#3A3935',
                    border: '1px solid #605F5B',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E6E4DD' }}
                  formatter={(value: number) => [formatPrice(value), 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8989DE" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={candleData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#E6E4DD"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#E6E4DD"
                  fontSize={12}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#3A3935',
                    border: '1px solid #605F5B',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E6E4DD' }}
                  formatter={(value: number, name: string) => [formatPrice(value), name]}
                />
                <Bar dataKey="open" fill="#8884d8" name="Open" />
                <Bar dataKey="close" fill="#82ca9d" name="Close" />
                <Bar dataKey="high" fill="#ffc658" name="High" />
                <Bar dataKey="low" fill="#ff7300" name="Low" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
