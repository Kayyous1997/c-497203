
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ArrowDown, Minus } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

const RemoveLiquidity = () => {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const [removePercentage, setRemovePercentage] = useState([25]);
  const [selectedPair, setSelectedPair] = useState<any>(null);

  // Mock data - in real implementation, fetch user's LP positions
  const mockPairs = [
    {
      id: '1',
      tokenA: { symbol: 'ETH', address: '0x...', logoURI: '🔷' },
      tokenB: { symbol: 'USDC', address: '0x...', logoURI: '💵' },
      lpBalance: '0.5',
      tokenAAmount: '0.25',
      tokenBAmount: '500.0',
      poolShare: '0.05'
    }
  ];

  const handleRemoveLiquidity = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to remove liquidity",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPair) {
      toast({
        title: "No Pair Selected",
        description: "Please select a liquidity pair to remove",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Removing Liquidity",
        description: "Transaction submitted. Please confirm in your wallet.",
      });
      
      console.log('Removing liquidity:', {
        pair: selectedPair,
        percentage: removePercentage[0]
      });
      
    } catch (error) {
      console.error('Error removing liquidity:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to remove liquidity. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateOutputAmounts = () => {
    if (!selectedPair) return { tokenA: '0', tokenB: '0' };
    
    const percentage = removePercentage[0] / 100;
    return {
      tokenA: (parseFloat(selectedPair.tokenAAmount) * percentage).toFixed(6),
      tokenB: (parseFloat(selectedPair.tokenBAmount) * percentage).toFixed(2)
    };
  };

  const outputAmounts = calculateOutputAmounts();

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Remove Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pair Selection */}
        <div className="space-y-2">
          <Label>Select Pair</Label>
          {mockPairs.length > 0 ? (
            <div className="space-y-2">
              {mockPairs.map((pair) => (
                <Button
                  key={pair.id}
                  variant={selectedPair?.id === pair.id ? "default" : "outline"}
                  onClick={() => setSelectedPair(pair)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span>{pair.tokenA.logoURI}</span>
                    <span>{pair.tokenA.symbol}</span>
                    <span>/</span>
                    <span>{pair.tokenB.logoURI}</span>
                    <span>{pair.tokenB.symbol}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pair.lpBalance} LP
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <p>No liquidity positions found</p>
              <p className="text-sm">Add liquidity first to see your positions here</p>
            </div>
          )}
        </div>

        {selectedPair && (
          <>
            {/* Removal Percentage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Amount to Remove</Label>
                <span className="text-lg font-semibold">{removePercentage[0]}%</span>
              </div>
              
              <Slider
                value={removePercentage}
                onValueChange={setRemovePercentage}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between">
                {[25, 50, 75, 100].map((percentage) => (
                  <Button
                    key={percentage}
                    variant="outline"
                    size="sm"
                    onClick={() => setRemovePercentage([percentage])}
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Output Preview */}
            <div className="space-y-3">
              <Label>You will receive</Label>
              
              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>{selectedPair.tokenA.logoURI}</span>
                    <span className="font-medium">{selectedPair.tokenA.symbol}</span>
                  </div>
                  <span className="font-semibold">{outputAmounts.tokenA}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>{selectedPair.tokenB.logoURI}</span>
                    <span className="font-medium">{selectedPair.tokenB.symbol}</span>
                  </div>
                  <span className="font-semibold">{outputAmounts.tokenB}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRemoveLiquidity}
              disabled={!isConnected}
              className="w-full"
              size="lg"
              variant="destructive"
            >
              {!isConnected ? 'Connect Wallet' : 'Remove Liquidity'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RemoveLiquidity;
