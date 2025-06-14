
import { dexScreenerService } from './dexScreenerService';

interface PortfolioToken {
  symbol: string;
  address: string;
  balance: number;
  value: number;
  price: number;
  priceChange24h: number;
  allocation: number;
}

interface PortfolioPosition {
  id: string;
  type: 'spot' | 'liquidity';
  tokens: PortfolioToken[];
  entryPrice?: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  createdAt: number;
}

interface PortfolioSummary {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  positions: PortfolioPosition[];
  topTokens: PortfolioToken[];
}

class PortfolioService {
  private cache = new Map<string, { data: PortfolioSummary; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getPortfolioSummary(userAddress?: string): Promise<PortfolioSummary> {
    if (!userAddress) {
      return {
        totalValue: 0,
        totalPnl: 0,
        totalPnlPercentage: 0,
        positions: [],
        topTokens: []
      };
    }

    // Check cache first
    const cached = this.cache.get(userAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Fetch token balances from blockchain (simplified - in real implementation would use ethers/web3)
      const positions = await this.fetchUserPositions(userAddress);
      const tokens = await this.fetchTokenPrices(positions);
      
      const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
      
      // Calculate PnL (simplified - would need transaction history for accurate calculation)
      const totalPnl = totalValue * 0.05; // Mock 5% gain for demo
      const totalPnlPercentage = (totalPnl / (totalValue - totalPnl)) * 100;

      const portfolio: PortfolioSummary = {
        totalValue,
        totalPnl,
        totalPnlPercentage,
        positions,
        topTokens: tokens.slice(0, 10)
      };

      // Cache the result
      this.cache.set(userAddress, { data: portfolio, timestamp: Date.now() });
      
      return portfolio;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return {
        totalValue: 0,
        totalPnl: 0,
        totalPnlPercentage: 0,
        positions: [],
        topTokens: []
      };
    }
  }

  private async fetchUserPositions(userAddress: string): Promise<PortfolioPosition[]> {
    // In a real implementation, this would:
    // 1. Query the blockchain for all token balances
    // 2. Query DEX contracts for liquidity positions
    // 3. Parse transaction history for entry prices
    
    // For now, return empty array - will be populated when real blockchain integration is added
    return [];
  }

  private async fetchTokenPrices(positions: PortfolioPosition[]): Promise<PortfolioToken[]> {
    const tokens: PortfolioToken[] = [];
    
    try {
      // Get popular tokens to show as examples when user has no positions
      const popularTokens = await dexScreenerService.getPopularTokens();
      
      // Convert to portfolio tokens format
      for (const token of popularTokens.slice(0, 5)) {
        if (token.baseToken && token.priceUsd) {
          tokens.push({
            symbol: token.baseToken.symbol,
            address: token.baseToken.address,
            balance: 0, // Would be fetched from blockchain
            value: 0,
            price: parseFloat(token.priceUsd),
            priceChange24h: token.priceChange?.h24 || 0,
            allocation: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }

    return tokens;
  }

  async getPositionHistory(positionId: string): Promise<{ timestamp: number; value: number }[]> {
    // In a real implementation, this would fetch historical data from:
    // 1. Blockchain events
    // 2. DEX Screener historical API
    // 3. Transaction history
    
    return [];
  }

  async updatePortfolio(userAddress: string): Promise<void> {
    // Clear cache to force refresh
    this.cache.delete(userAddress);
    
    // Fetch fresh data
    await this.getPortfolioSummary(userAddress);
    
    console.log('Portfolio updated for:', userAddress);
  }

  // Real-time updates
  startRealTimeUpdates(userAddress: string, callback: (portfolio: PortfolioSummary) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const portfolio = await this.getPortfolioSummary(userAddress);
        callback(portfolio);
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }
}

export const portfolioService = new PortfolioService();
export type { PortfolioToken, PortfolioPosition, PortfolioSummary };
