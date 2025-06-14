
interface CoinGeckoSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

interface CoinGeckoSearchResponse {
  coins: CoinGeckoSearchResult[];
}

interface CryptoSearchResult {
  id: string;
  name: string;
  symbol: string;
  image: string;
  market_cap_rank: number | null;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  total_volume?: number;
}

class CryptoSearchService {
  private searchCache: Map<string, CryptoSearchResult[]> = new Map();
  private detailsCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes for search results

  async searchCryptocurrencies(query: string): Promise<CryptoSearchResult[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const cacheKey = query.toLowerCase().trim();
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CoinGeckoSearchResponse = await response.json();
      
      const searchResults: CryptoSearchResult[] = data.coins.slice(0, 20).map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.large,
        market_cap_rank: coin.market_cap_rank
      }));

      this.searchCache.set(cacheKey, searchResults);
      
      // Auto-clear cache after TTL
      setTimeout(() => {
        this.searchCache.delete(cacheKey);
      }, this.CACHE_TTL);

      return searchResults;
    } catch (error) {
      console.error('Error searching cryptocurrencies:', error);
      return [];
    }
  }

  async getDetailedCryptoData(coinIds: string[]): Promise<any[]> {
    if (coinIds.length === 0) return [];

    const uncachedIds = coinIds.filter(id => !this.detailsCache.has(id));
    
    if (uncachedIds.length > 0) {
      try {
        const idsParam = uncachedIds.join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=1h%2C24h%2C7d`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the detailed data
        data.forEach((coin: any) => {
          this.detailsCache.set(coin.id, coin);
        });
        
        // Auto-clear cache after TTL
        setTimeout(() => {
          uncachedIds.forEach(id => this.detailsCache.delete(id));
        }, this.CACHE_TTL);
      } catch (error) {
        console.error('Error fetching detailed crypto data:', error);
      }
    }

    return coinIds.map(id => this.detailsCache.get(id)).filter(Boolean);
  }

  clearCache(): void {
    this.searchCache.clear();
    this.detailsCache.clear();
  }
}

export const cryptoSearchService = new CryptoSearchService();
export type { CryptoSearchResult };
