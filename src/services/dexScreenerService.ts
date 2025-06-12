
export interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

class DexScreenerService {
  private baseUrl = 'https://api.dexscreener.com/latest';

  async getTokenPairs(tokenAddress: string): Promise<DexScreenerPair[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dex/tokens/${tokenAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DexScreenerResponse = await response.json();
      return data.pairs || [];
    } catch (error) {
      console.error('Error fetching token pairs from DEX Screener:', error);
      return [];
    }
  }

  async getPairByAddress(pairAddress: string): Promise<DexScreenerPair | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dex/pairs/${pairAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DexScreenerResponse = await response.json();
      return data.pairs?.[0] || null;
    } catch (error) {
      console.error('Error fetching pair from DEX Screener:', error);
      return null;
    }
  }

  async searchPairs(query: string): Promise<DexScreenerPair[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dex/search/?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DexScreenerResponse = await response.json();
      return data.pairs || [];
    } catch (error) {
      console.error('Error searching pairs on DEX Screener:', error);
      return [];
    }
  }

  formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 1) {
      return numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    } else {
      return numPrice.toFixed(8);
    }
  }

  formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  }

  formatPercentage(percentage: number): string {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }
}

export const dexScreenerService = new DexScreenerService();
