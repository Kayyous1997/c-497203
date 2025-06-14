
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
  private mockPositions: PortfolioPosition[] = [
    {
      id: '1',
      type: 'spot',
      tokens: [
        {
          symbol: 'ETH',
          address: '0x...',
          balance: 2.5,
          value: 6500,
          price: 2600,
          priceChange24h: 3.2,
          allocation: 65
        }
      ],
      currentValue: 6500,
      pnl: 350,
      pnlPercentage: 5.7,
      createdAt: Date.now() - 86400000 * 30 // 30 days ago
    },
    {
      id: '2',
      type: 'spot',
      tokens: [
        {
          symbol: 'USDC',
          address: '0x...',
          balance: 2000,
          value: 2000,
          price: 1,
          priceChange24h: 0.1,
          allocation: 20
        }
      ],
      currentValue: 2000,
      pnl: 0,
      pnlPercentage: 0,
      createdAt: Date.now() - 86400000 * 15 // 15 days ago
    },
    {
      id: '3',
      type: 'liquidity',
      tokens: [
        {
          symbol: 'ETH',
          address: '0x...',
          balance: 0.5,
          value: 650,
          price: 2600,
          priceChange24h: 3.2,
          allocation: 8.125
        },
        {
          symbol: 'USDC',
          address: '0x...',
          balance: 650,
          value: 650,
          price: 1,
          priceChange24h: 0.1,
          allocation: 6.875
        }
      ],
      currentValue: 1300,
      pnl: 45,
      pnlPercentage: 3.6,
      createdAt: Date.now() - 86400000 * 7 // 7 days ago
    }
  ];

  async getPortfolioSummary(userAddress?: string): Promise<PortfolioSummary> {
    // In a real implementation, this would fetch from blockchain
    // For now, return mock data
    
    const totalValue = this.mockPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalPnl = this.mockPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPnlPercentage = (totalPnl / (totalValue - totalPnl)) * 100;

    // Aggregate tokens for top holdings
    const tokenMap = new Map<string, PortfolioToken>();
    
    this.mockPositions.forEach(position => {
      position.tokens.forEach(token => {
        const existing = tokenMap.get(token.symbol);
        if (existing) {
          existing.balance += token.balance;
          existing.value += token.value;
          existing.allocation = (existing.value / totalValue) * 100;
        } else {
          tokenMap.set(token.symbol, { ...token });
        }
      });
    });

    const topTokens = Array.from(tokenMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalValue,
      totalPnl,
      totalPnlPercentage,
      positions: this.mockPositions,
      topTokens
    };
  }

  async getPositionHistory(positionId: string): Promise<{ timestamp: number; value: number }[]> {
    // Mock historical data for a position
    const position = this.mockPositions.find(p => p.id === positionId);
    if (!position) return [];

    const history = [];
    const daysBack = 30;
    const currentValue = position.currentValue;
    const startValue = currentValue - position.pnl;

    for (let i = daysBack; i >= 0; i--) {
      const timestamp = Date.now() - (i * 86400000);
      const progress = (daysBack - i) / daysBack;
      const value = startValue + (position.pnl * progress) + (Math.random() - 0.5) * 100;
      
      history.push({ timestamp, value });
    }

    return history;
  }

  async updatePortfolio(userAddress: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Fetch all token balances for the user
    // 2. Get current prices for all tokens
    // 3. Calculate PnL based on transaction history
    // 4. Update the portfolio data
    
    console.log('Portfolio updated for:', userAddress);
  }
}

export const portfolioService = new PortfolioService();
export type { PortfolioToken, PortfolioPosition, PortfolioSummary };
