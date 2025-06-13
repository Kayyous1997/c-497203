
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import TokenSelectorModal from '@/components/TokenSelectorModal';

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

const PoolCreator = () => {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [feePercent, setFeePercent] = useState('0.3');
  const [isTokenAModalOpen, setIsTokenAModalOpen] = useState(false);
  const [isTokenBModalOpen, setIsTokenBModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleTokenASelect = (token: Token) => {
    setTokenA(token);
    setIsTokenAModalOpen(false);
  };

  const handleTokenBSelect = (token: Token) => {
    setTokenB(token);
    setIsTokenBModalOpen(false);
  };

  const handleCreatePool = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a pool",
        variant: "destructive"
      });
      return;
    }

    if (!tokenA || !tokenB) {
      toast({
        title: "Missing Tokens",
        description: "Please select both tokens for the pool",
        variant: "destructive"
      });
      return;
    }

    if (tokenA.address === tokenB.address) {
      toast({
        title: "Invalid Pair",
        description: "Cannot create a pool with the same token",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Simulate pool creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Pool Created",
        description: `Successfully created ${tokenA.symbol}/${tokenB.symbol} pool`,
      });

      // Reset form
      setTokenA(null);
      setTokenB(null);
      setFeePercent('0.3');
    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Error",
        description: "Failed to create pool",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const poolExists = Boolean(tokenA && tokenB); // Convert to boolean properly

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Pool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Token A</Label>
              <Button
                variant="outline"
                onClick={() => setIsTokenAModalOpen(true)}
                className="w-full h-16 justify-start"
              >
                {tokenA ? (
                  <div className="flex items-center space-x-3">
                    {tokenA.logoUrl ? (
                      <img src={tokenA.logoUrl} alt={tokenA.symbol} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-2xl">{tokenA.icon}</span>
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{tokenA.symbol}</div>
                      <div className="text-sm text-muted-foreground">{tokenA.name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Select Token</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Token B</Label>
              <Button
                variant="outline"
                onClick={() => setIsTokenBModalOpen(true)}
                className="w-full h-16 justify-start"
              >
                {tokenB ? (
                  <div className="flex items-center space-x-3">
                    {tokenB.logoUrl ? (
                      <img src={tokenB.logoUrl} alt={tokenB.symbol} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-2xl">{tokenB.icon}</span>
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{tokenB.symbol}</div>
                      <div className="text-sm text-muted-foreground">{tokenB.name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Select Token</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Fee Percentage */}
          <div className="space-y-2">
            <Label htmlFor="fee">Fee Percentage</Label>
            <div className="flex space-x-2">
              {['0.05', '0.3', '1.0'].map((fee) => (
                <Button
                  key={fee}
                  variant={feePercent === fee ? 'default' : 'outline'}
                  onClick={() => setFeePercent(fee)}
                  className="flex-1"
                >
                  {fee}%
                </Button>
              ))}
            </div>
            <Input
              id="fee"
              type="number"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              step="0.01"
              min="0"
              max="100"
              placeholder="Custom fee percentage"
            />
          </div>

          {/* Pool Preview */}
          {tokenA && tokenB && (
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Pool Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pair:</span>
                    <span className="font-mono">{tokenA.symbol} / {tokenB.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="font-mono">{feePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={poolExists ? "text-yellow-600" : "text-green-600"}>
                      {poolExists ? "Pool Exists" : "New Pool"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {poolExists && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A pool with these tokens already exists. You can add liquidity to the existing pool instead.
              </AlertDescription>
            </Alert>
          )}

          {/* Create Button */}
          <Button
            onClick={handleCreatePool}
            disabled={!tokenA || !tokenB || !isConnected || isCreating || poolExists}
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Pool...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : poolExists ? (
              'Pool Already Exists'
            ) : (
              'Create Pool'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        open={isTokenAModalOpen}
        onOpenChange={setIsTokenAModalOpen}
        onSelectToken={handleTokenASelect}
        selectedToken={tokenB?.address}
      />
      
      <TokenSelectorModal
        open={isTokenBModalOpen}
        onOpenChange={setIsTokenBModalOpen}
        onSelectToken={handleTokenBSelect}
        selectedToken={tokenA?.address}
      />
    </div>
  );
};

export default PoolCreator;
