
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Settings, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useDex } from '@/hooks/useUniswap';
import { useToast } from '@/hooks/use-toast';
import TokenSelectorModal from '@/components/TokenSelectorModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: string;
  price: number;
  volume24h?: number;
  logoUrl?: string;
  logoSource?: string;
}

const SwapInterface = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { getQuote, executeSwap, isLoading } = useDex();
  const { toast } = useToast();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isFromModalOpen, setIsFromModalOpen] = useState(false);
  const [isToModalOpen, setIsToModalOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [priceImpact, setPriceImpact] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');

  // Mock exchange rate calculation
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      // Simulate price calculation based on mock token prices
      const rate = toToken.price / fromToken.price;
      const outputAmount = parseFloat(fromAmount) * rate * 0.997; // 0.3% fee
      setToAmount(outputAmount.toFixed(6));
      setExchangeRate(`1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`);
      setPriceImpact('0.12'); // Mock price impact
    } else {
      setToAmount('');
      setExchangeRate('');
      setPriceImpact('');
    }
  }, [fromToken, toToken, fromAmount]);

  const handleFromTokenSelect = (token: Token) => {
    setFromToken(token);
    setIsFromModalOpen(false);
  };

  const handleToTokenSelect = (token: Token) => {
    setToToken(token);
    setIsToModalOpen(false);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to swap tokens",
        variant: "destructive"
      });
      return;
    }

    if (!fromToken || !toToken || !fromAmount) {
      toast({
        title: "Missing Information",
        description: "Please select tokens and enter an amount",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Completed",
        description: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });

      // Clear form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "Swap Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isSwapReady = fromToken && toToken && fromAmount && toAmount && 
                     parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Swap Tokens</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a demo mode showing mock swap functionality. In production, this would interact with deployed DEX contracts.
          </AlertDescription>
        </Alert>

        {showSettings && (
          <div className="p-4 border rounded-lg bg-muted/20">
            <label className="text-sm font-medium">Slippage Tolerance (%)</label>
            <Input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
              max="50"
              className="mt-1"
            />
          </div>
        )}

        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">From</label>
            {fromToken && (
              <span className="text-sm text-muted-foreground">
                Balance: 100.00 {fromToken.symbol}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsFromModalOpen(true)}
              className="min-w-[120px]"
            >
              {fromToken ? (
                <div className="flex items-center space-x-2">
                  {fromToken.logoUrl ? (
                    <img src={fromToken.logoUrl} alt={fromToken.symbol} className="w-5 h-5 rounded-full" />
                  ) : (
                    <span>{fromToken.icon}</span>
                  )}
                  <span>{fromToken.symbol}</span>
                </div>
              ) : (
                'Select Token'
              )}
            </Button>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapTokens}
            className="rounded-full border"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">To</label>
            {toToken && (
              <span className="text-sm text-muted-foreground">
                Balance: 50.00 {toToken.symbol}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsToModalOpen(true)}
              className="min-w-[120px]"
            >
              {toToken ? (
                <div className="flex items-center space-x-2">
                  {toToken.logoUrl ? (
                    <img src={toToken.logoUrl} alt={toToken.symbol} className="w-5 h-5 rounded-full" />
                  ) : (
                    <span>{toToken.icon}</span>
                  )}
                  <span>{toToken.symbol}</span>
                </div>
              ) : (
                'Select Token'
              )}
            </Button>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="flex-1 bg-muted/50"
            />
          </div>
        </div>

        {/* Swap Details */}
        {exchangeRate && (
          <div className="p-4 border rounded-lg bg-muted/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exchange Rate</span>
              <span className="font-mono">{exchangeRate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Price Impact</span>
              <span className="font-mono text-green-600">{priceImpact}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Slippage Tolerance</span>
              <span className="font-mono">{slippage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Network Fee</span>
              <span className="font-mono">~$2.50</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSwap}
          disabled={!isConnected || !isSwapReady || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : !isConnected ? (
            'Connect Wallet'
          ) : !isSwapReady ? (
            'Enter an amount'
          ) : (
            `Swap ${fromToken?.symbol} for ${toToken?.symbol}`
          )}
        </Button>

        {/* Token Selector Modals */}
        <TokenSelectorModal
          open={isFromModalOpen}
          onOpenChange={setIsFromModalOpen}
          onSelectToken={handleFromTokenSelect}
          selectedToken={toToken?.address}
        />
        
        <TokenSelectorModal
          open={isToModalOpen}
          onOpenChange={setIsToModalOpen}
          onSelectToken={handleToTokenSelect}
          selectedToken={fromToken?.address}
        />
      </CardContent>
    </Card>
  );
};

export default SwapInterface;
