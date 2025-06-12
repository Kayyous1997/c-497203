
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowDown, Settings } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useDex } from '@/hooks/useUniswap';
import { useToast } from '@/hooks/use-toast';
import TokenSelectorModal from '@/components/TokenSelectorModal';

interface Token {
  symbol: string;
  address: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const AddLiquidity = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { getTokenAddress, isInitialized, contractsDeployed } = useDex();
  const { toast } = useToast();

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isTokenAModalOpen, setIsTokenAModalOpen] = useState(false);
  const [isTokenBModalOpen, setIsTokenBModalOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [priceRatio, setPriceRatio] = useState<string>('');
  const [shareOfPool, setShareOfPool] = useState<string>('');

  // Calculate price ratio when amounts change
  useEffect(() => {
    if (amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0) {
      const ratio = parseFloat(amountB) / parseFloat(amountA);
      setPriceRatio(ratio.toFixed(6));
      setShareOfPool('100'); // Simplified - would calculate actual pool share
    } else {
      setPriceRatio('');
      setShareOfPool('');
    }
  }, [amountA, amountB]);

  const handleTokenASelect = (token: Token) => {
    setTokenA(token);
    setIsTokenAModalOpen(false);
  };

  const handleTokenBSelect = (token: Token) => {
    setTokenB(token);
    setIsTokenBModalOpen(false);
  };

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    // In a real implementation, you'd calculate the corresponding amount B
    // based on current pool ratio or market price
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    // Calculate corresponding amount A
  };

  const handleAddLiquidity = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add liquidity",
        variant: "destructive"
      });
      return;
    }

    if (!contractsDeployed) {
      toast({
        title: "Contracts Not Deployed",
        description: "Please deploy your DEX contracts first",
        variant: "destructive"
      });
      return;
    }

    if (!tokenA || !tokenB || !amountA || !amountB) {
      toast({
        title: "Missing Information",
        description: "Please select tokens and enter amounts",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Adding Liquidity",
        description: "Transaction submitted. Please confirm in your wallet.",
      });
      
      // In a real implementation, you'd call your liquidity contract here
      console.log('Adding liquidity:', {
        tokenA: tokenA.address,
        tokenB: tokenB.address,
        amountA,
        amountB,
        slippage
      });
      
    } catch (error) {
      console.error('Error adding liquidity:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to add liquidity. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = tokenA && tokenB && amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Liquidity</CardTitle>
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
        {showSettings && (
          <div className="p-4 border rounded-lg bg-muted/20">
            <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
            <Input
              id="slippage"
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

        {/* Token A Input */}
        <div className="space-y-2">
          <Label>Token A</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsTokenAModalOpen(true)}
              className="min-w-[120px]"
            >
              {tokenA ? (
                <div className="flex items-center space-x-2">
                  {tokenA.logoURI && (
                    <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />
                  )}
                  <span>{tokenA.symbol}</span>
                </div>
              ) : (
                'Select Token'
              )}
            </Button>
            <Input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => handleAmountAChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Token B Input */}
        <div className="space-y-2">
          <Label>Token B</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsTokenBModalOpen(true)}
              className="min-w-[120px]"
            >
              {tokenB ? (
                <div className="flex items-center space-x-2">
                  {tokenB.logoURI && (
                    <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />
                  )}
                  <span>{tokenB.symbol}</span>
                </div>
              ) : (
                'Select Token'
              )}
            </Button>
            <Input
              type="number"
              placeholder="0.0"
              value={amountB}
              onChange={(e) => handleAmountBChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Price and Pool Info */}
        {priceRatio && (
          <div className="p-4 border rounded-lg bg-muted/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price Ratio</span>
              <span>{priceRatio} {tokenB?.symbol} per {tokenA?.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Share of Pool</span>
              <span>{shareOfPool}%</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleAddLiquidity}
          disabled={!isFormValid || !isConnected}
          className="w-full"
          size="lg"
        >
          {!isConnected ? 'Connect Wallet' : 'Add Liquidity'}
        </Button>

        {/* Token Selector Modals */}
        <TokenSelectorModal
          isOpen={isTokenAModalOpen}
          onClose={() => setIsTokenAModalOpen(false)}
          onSelectToken={handleTokenASelect}
          excludeToken={tokenB?.address}
        />
        
        <TokenSelectorModal
          isOpen={isTokenBModalOpen}
          onClose={() => setIsTokenBModalOpen(false)}
          onSelectToken={handleTokenBSelect}
          excludeToken={tokenA?.address}
        />
      </CardContent>
    </Card>
  );
};

export default AddLiquidity;
