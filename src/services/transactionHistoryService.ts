
interface Transaction {
  id: string;
  hash: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'approve';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  from: string;
  to?: string;
  tokenIn?: {
    symbol: string;
    address: string;
    amount: string;
    value: number;
  };
  tokenOut?: {
    symbol: string;
    address: string;
    amount: string;
    value: number;
  };
  gasUsed?: string;
  gasFee?: number;
  blockNumber?: number;
  network: string;
}

class TransactionHistoryService {
  private mockTransactions: Transaction[] = [
    {
      id: '1',
      hash: '0x1234567890abcdef1234567890abcdef12345678',
      type: 'swap',
      status: 'confirmed',
      timestamp: Date.now() - 3600000, // 1 hour ago
      from: '0x742d35Cc6Ab4b15C3A8c7C50b30b7a0e9EDddB2d',
      tokenIn: {
        symbol: 'ETH',
        address: '0x...',
        amount: '1.0',
        value: 2600
      },
      tokenOut: {
        symbol: 'USDC',
        address: '0x...',
        amount: '2580.45',
        value: 2580.45
      },
      gasUsed: '150000',
      gasFee: 0.0045,
      blockNumber: 18500000,
      network: 'ethereum'
    },
    {
      id: '2',
      hash: '0xabcdef1234567890abcdef1234567890abcdef12',
      type: 'add_liquidity',
      status: 'confirmed',
      timestamp: Date.now() - 86400000, // 1 day ago
      from: '0x742d35Cc6Ab4b15C3A8c7C50b30b7a0e9EDddB2d',
      tokenIn: {
        symbol: 'ETH',
        address: '0x...',
        amount: '0.5',
        value: 1300
      },
      tokenOut: {
        symbol: 'USDC',
        address: '0x...',
        amount: '1300',
        value: 1300
      },
      gasUsed: '200000',
      gasFee: 0.006,
      blockNumber: 18495000,
      network: 'ethereum'
    },
    {
      id: '3',
      hash: '0x567890abcdef1234567890abcdef1234567890ab',
      type: 'approve',
      status: 'confirmed',
      timestamp: Date.now() - 172800000, // 2 days ago
      from: '0x742d35Cc6Ab4b15C3A8c7C50b30b7a0e9EDddB2d',
      to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap Router
      tokenIn: {
        symbol: 'USDC',
        address: '0x...',
        amount: 'unlimited',
        value: 0
      },
      gasUsed: '50000',
      gasFee: 0.0015,
      blockNumber: 18490000,
      network: 'ethereum'
    },
    {
      id: '4',
      hash: '0x890abcdef1234567890abcdef1234567890abcdef',
      type: 'swap',
      status: 'failed',
      timestamp: Date.now() - 259200000, // 3 days ago
      from: '0x742d35Cc6Ab4b15C3A8c7C50b30b7a0e9EDddB2d',
      tokenIn: {
        symbol: 'DAI',
        address: '0x...',
        amount: '1000',
        value: 1000
      },
      tokenOut: {
        symbol: 'ETH',
        address: '0x...',
        amount: '0',
        value: 0
      },
      gasUsed: '100000',
      gasFee: 0.003,
      blockNumber: 18485000,
      network: 'ethereum'
    },
    {
      id: '5',
      hash: '0xdef1234567890abcdef1234567890abcdef123456',
      type: 'remove_liquidity',
      status: 'pending',
      timestamp: Date.now() - 600000, // 10 minutes ago
      from: '0x742d35Cc6Ab4b15C3A8c7C50b30b7a0e9EDddB2d',
      tokenIn: {
        symbol: 'ETH-USDC LP',
        address: '0x...',
        amount: '0.25',
        value: 650
      },
      network: 'ethereum'
    }
  ];

  async getTransactionHistory(
    userAddress: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaction[]> {
    // In a real implementation, this would query blockchain or indexer
    // For now, return mock data
    
    return this.mockTransactions
      .filter(tx => tx.from.toLowerCase() === userAddress.toLowerCase())
      .slice(offset, offset + limit);
  }

  async getTransactionById(txId: string): Promise<Transaction | null> {
    return this.mockTransactions.find(tx => tx.id === txId) || null;
  }

  async getTransactionByHash(hash: string): Promise<Transaction | null> {
    return this.mockTransactions.find(tx => tx.hash === hash) || null;
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const id = (this.mockTransactions.length + 1).toString();
    const newTransaction: Transaction = {
      ...transaction,
      id
    };
    
    this.mockTransactions.unshift(newTransaction);
    return id;
  }

  async updateTransactionStatus(txId: string, status: Transaction['status']): Promise<void> {
    const transaction = this.mockTransactions.find(tx => tx.id === txId);
    if (transaction) {
      transaction.status = status;
    }
  }

  getTransactionStats(userAddress: string): {
    totalTransactions: number;
    successfulSwaps: number;
    totalVolume: number;
    totalFees: number;
  } {
    const userTxs = this.mockTransactions.filter(
      tx => tx.from.toLowerCase() === userAddress.toLowerCase()
    );

    const successfulSwaps = userTxs.filter(
      tx => tx.type === 'swap' && tx.status === 'confirmed'
    ).length;

    const totalVolume = userTxs
      .filter(tx => tx.status === 'confirmed' && tx.tokenIn)
      .reduce((sum, tx) => sum + (tx.tokenIn?.value || 0), 0);

    const totalFees = userTxs
      .filter(tx => tx.status === 'confirmed' && tx.gasFee)
      .reduce((sum, tx) => sum + (tx.gasFee || 0), 0);

    return {
      totalTransactions: userTxs.length,
      successfulSwaps,
      totalVolume,
      totalFees
    };
  }
}

export const transactionHistoryService = new TransactionHistoryService();
export type { Transaction };
