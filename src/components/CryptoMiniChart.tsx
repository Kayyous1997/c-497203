
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoMiniChartProps {
  priceChange24h: number;
  sparklineData?: number[];
}

const CryptoMiniChart = ({ priceChange24h, sparklineData }: CryptoMiniChartProps) => {
  const isPositive = priceChange24h >= 0;
  
  // Generate simple sparkline data if not provided
  const data = sparklineData || Array.from({ length: 7 }, (_, i) => {
    const trend = isPositive ? 1 : -1;
    return 50 + (Math.random() - 0.5) * 20 + trend * i * 2;
  });

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 20 - ((value - minValue) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center gap-2">
      <svg width="60" height="20" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="1.5"
          className="opacity-80"
        />
      </svg>
      {isPositive ? (
        <TrendingUp className="w-3 h-3 text-green-500" />
      ) : (
        <TrendingDown className="w-3 h-3 text-red-500" />
      )}
    </div>
  );
};

export default CryptoMiniChart;
