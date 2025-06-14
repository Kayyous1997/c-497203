
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Minus, 
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { transactionHistoryService, Transaction } from '@/services/transactionHistoryService';
import { useAccount } from 'wagmi';

const TransactionHistory: React.FC = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'swap' | 'liquidity' | 'approve'>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const txs = await transactionHistoryService.getTransactionHistory(address);
        setTransactions(txs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'add_liquidity':
        return <Plus className="w-4 h-4" />;
      case 'remove_liquidity':
        return <Minus className="w-4 h-4" />;
      case 'approve':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'Swap';
      case 'add_liquidity':
        return 'Add Liquidity';
      case 'remove_liquidity':
        return 'Remove Liquidity';
      case 'approve':
        return 'Approve';
    }
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getExplorerUrl = (hash: string, network: string) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io/tx/',
      base: 'https://basescan.org/tx/',
      linea: 'https://lineascan.build/tx/'
    };
    
    return `${explorers[network] || explorers.ethereum}${hash}`;
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.tokenIn?.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.tokenOut?.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || 
      tx.type === filterType ||
      (filterType === 'liquidity' && (tx.type === 'add_liquidity' || tx.type === 'remove_liquidity'));
    
    return matchesSearch && matchesFilter;
  });

  if (!address) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by hash or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'swap', 'liquidity', 'approve'].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Stats */}
      {address && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            const stats = transactionHistoryService.getTransactionStats(address);
            return (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats.successfulSwaps}</div>
                    <p className="text-sm text-muted-foreground">Successful Swaps</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats.totalFees.toFixed(4)} ETH</div>
                    <p className="text-sm text-muted-foreground">Gas Fees Paid</p>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tx.status)}
                      {getTypeIcon(tx.type)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getTypeLabel(tx.type)}</span>
                        <Badge variant="outline">{tx.network}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(getExplorerUrl(tx.hash, tx.network), '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {tx.tokenIn && tx.tokenOut ? (
                          <span>
                            {tx.tokenIn.amount} {tx.tokenIn.symbol} → {tx.tokenOut.amount} {tx.tokenOut.symbol}
                          </span>
                        ) : tx.tokenIn ? (
                          <span>{tx.tokenIn.amount} {tx.tokenIn.symbol}</span>
                        ) : (
                          <span>{formatHash(tx.hash)}</span>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {tx.tokenIn?.value && (
                      <div className="font-medium">{formatCurrency(tx.tokenIn.value)}</div>
                    )}
                    {tx.gasFee && (
                      <div className="text-sm text-muted-foreground">
                        Gas: {tx.gasFee.toFixed(4)} ETH
                      </div>
                    )}
                    <Badge 
                      variant={tx.status === 'confirmed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
