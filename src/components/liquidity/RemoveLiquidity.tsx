
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ArrowDown, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useLiquidity } from '@/hooks/useLiquidity';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RemoveLiquidity = () => {
  const { isConnected } = useAccount();
  const { positions, removeLiquidity, isLoading, fetchPositions } = useLiquidity();
  const { toast } = useToast();
  
  const [removePercentage, setRemovePercentage] = useState([25]);
  const [selectedPair, setSelectedPair] = useState<any>(null);

  // Refresh positions when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchPositions();
    }
  }, [isConnected, fetchPositions]);

  // Auto-select first position if available
  useEffect(() => {
    if (positions.length > 0 && !selectedPair) {
      setSelectedPair(positions[0]);
    }
  }, [positions, selectedPair]);

  const calculateDeadline = () => {
    return Math.floor(Date.now() / 1000) + (20 * 60); // 20 minutes from now
  };

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
      const percentage = removePercentage[0] / 100;
      const liquidityToRemove = (parseFloat(selectedPair.lpBalance) * percentage).toString();
      
      // Calculate minimum amounts with 0.5% slippage
      const slippageTolerance = 0.005;
      const outputAmounts = calculateOutputAmounts();
      const amountAMin = (parseFloat(outputAmounts.tokenA) * (1 - slippageTolerance)).toString();
      const amountBMin = (parseFloat(outputAmounts.tokenB) * (1 - slippageTolerance)).toString();

      const result = await removeLiquidity({
        tokenA: selectedPair.tokenA.address,
        tokenB: selectedPair.tokenB.address,
        liquidity: liquidityToRemove,
        amountAMin,
        amountBMin,
        deadline: calculateDeadline()
      });

      if (result) {
        // Reset form
        setRemovePercentage([25]);
        setSelectedPair(null);
      }
    } catch (error) {
      console.error('Error removing liquidity:', error);
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
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a demo mode. In production, you would interact with deployed DEX contracts.
          </AlertDescription>
        </Alert>

        {/* Pair Selection */}
        <div className="space-y-2">
          <Label>Select Pair</Label>
          {positions.length > 0 ? (
            <div className="space-y-2">
              {positions.map((pair) => (
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
                  <div className="text-right text-sm">
                    <div className="font-mono">{pair.lpBalance} LP</div>
                    <div className="text-muted-foreground">{pair.poolShare}% share</div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <p>No liquidity positions found</p>
              <p className="text-sm">Add liquidity first to see your positions here</p>
              <Button
                variant="outline"
                onClick={fetchPositions}
                className="mt-2"
                size="sm"
              >
                Refresh Positions
              </Button>
            </div>
          )}
        </div>

        {selectedPair && (
          <>
            {/* Removal Percentage with Real-time Updates */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Amount to Remove</Label>
                <span className="text-lg font-bold">{removePercentage[0]}%</span>
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
                    variant={removePercentage[0] === percentage ? "default" : "outline"}
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

            {/* Real-time Output Preview */}
            <div className="space-y-3">
              <Label>You will receive</Label>
              
              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>{selectedPair.tokenA.logoURI}</span>
                    <span className="font-medium">{selectedPair.tokenA.symbol}</span>
                  </div>
                  <span className="font-mono font-semibold">{outputAmounts.tokenA}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>{selectedPair.tokenB.logoURI}</span>
                    <span className="font-medium">{selectedPair.tokenB.symbol}</span>
                  </div>
                  <span className="font-mono font-semibold">{outputAmounts.tokenB}</span>
                </div>

                <div className="pt-2 border-t text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>LP Tokens to burn</span>
                    <span className="font-mono">
                      {(parseFloat(selectedPair.lpBalance) * removePercentage[0] / 100).toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRemoveLiquidity}
              disabled={!isConnected || isLoading}
              className="w-full"
              size="lg"
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing Liquidity...
                </>
              ) : !isConnected ? (
                'Connect Wallet'
              ) : (
                'Remove Liquidity'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RemoveLiquidity;
