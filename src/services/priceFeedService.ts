
interface TokenPrice {
  symbol: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

interface PriceHistory {
  timestamp: number;
  price: number;
  volume?: number;
}

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class PriceFeedService {
  private priceCache: Map<string, TokenPrice> = new Map();
  private historyCache: Map<string, PriceHistory[]> = new Map();
  private candlestickCache: Map<string, CandlestickData[]> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  async getTokenPrice(symbol: string, address?: string): Promise<TokenPrice | null> {
    const cacheKey = address || symbol;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < this.CACHE_TTL) {
      return cached;
    }

    try {
      // Try CoinGecko first
      const coinGeckoPrice = await this.fetchFromCoinGecko(symbol);
      if (coinGeckoPrice) {
        this.priceCache.set(cacheKey, coinGeckoPrice);
        return coinGeckoPrice;
      }

      // Fallback to DEX Screener if address is provided
      if (address) {
        const dexScreenerPrice = await this.fetchFromDexScreener(address);
        if (dexScreenerPrice) {
          this.priceCache.set(cacheKey, dexScreenerPrice);
          return dexScreenerPrice;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return cached || null;
    }
  }

  async getPriceHistory(symbol: string, days: number = 7): Promise<PriceHistory[]> {
    const cacheKey = `${symbol}-${days}`;
    const cached = this.historyCache.get(cacheKey);
    
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const coinId = this.getCoinGeckoId(symbol);
      if (!coinId) return [];

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days > 30 ? 'daily' : 'hourly'}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      const history: PriceHistory[] = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        volume: data.total_volumes?.find(([t]: [number, number]) => t === timestamp)?.[1]
      }));

      this.historyCache.set(cacheKey, history);
      return history;
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }

  async getCandlestickData(symbol: string, days: number = 30): Promise<CandlestickData[]> {
    const cacheKey = `candles-${symbol}-${days}`;
    const cached = this.candlestickCache.get(cacheKey);
    
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      // For now, we'll simulate candlestick data from price history
      // In a real implementation, you'd fetch OHLCV data from a proper source
      const history = await this.getPriceHistory(symbol, days);
      if (history.length === 0) return [];

      const candles: CandlestickData[] = [];
      const chunkSize = Math.max(1, Math.floor(history.length / 100)); // Max 100 candles

      for (let i = 0; i < history.length; i += chunkSize) {
        const chunk = history.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;

        const open = chunk[0].price;
        const close = chunk[chunk.length - 1].price;
        const high = Math.max(...chunk.map(h => h.price));
        const low = Math.min(...chunk.map(h => h.price));
        const volume = chunk.reduce((sum, h) => sum + (h.volume || 0), 0);

        candles.push({
          timestamp: chunk[0].timestamp,
          open,
          high,
          low,
          close,
          volume
        });
      }

      this.candlestickCache.set(cacheKey, candles);
      return candles;
    } catch (error) {
      console.error('Error generating candlestick data:', error);
      return [];
    }
  }

  private async fetchFromCoinGecko(symbol: string): Promise<TokenPrice | null> {
    try {
      const coinId = this.getCoinGeckoId(symbol);
      if (!coinId) return null;

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol: symbol.toUpperCase(),
        address: '', // CoinGecko doesn't provide address in this endpoint
        price: data.market_data.current_price.usd,
        priceChange24h: data.market_data.price_change_percentage_24h,
        volume24h: data.market_data.total_volume.usd,
        marketCap: data.market_data.market_cap.usd,
        lastUpdated: Date.now()
      };
    } catch (error) {
      return null;
    }
  }

  private async fetchFromDexScreener(address: string): Promise<TokenPrice | null> {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const pair = data.pairs?.[0];
      
      if (!pair) return null;

      return {
        symbol: pair.baseToken.symbol,
        address,
        price: parseFloat(pair.priceUsd),
        priceChange24h: pair.priceChange.h24,
        volume24h: pair.volume.h24,
        marketCap: pair.marketCap || 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      return null;
    }
  }

  private getCoinGeckoId(symbol: string): string | null {
    const coinMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'DAI': 'dai',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'COMP': 'compound-governance-token',
      'MKR': 'maker',
      'SNX': 'havven',
      'CRV': 'curve-dao-token',
      'YFI': 'yearn-finance',
      'SUSHI': 'sushi',
      'MATIC': 'matic-network'
    };
    
    return coinMap[symbol.toUpperCase()] || null;
  }

  clearCache(): void {
    this.priceCache.clear();
    this.historyCache.clear();
    this.candlestickCache.clear();
  }
}

export const priceFeedService = new PriceFeedService();
export type { TokenPrice, PriceHistory, CandlestickData };
