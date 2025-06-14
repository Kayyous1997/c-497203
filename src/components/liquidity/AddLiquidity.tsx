
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Settings, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useDex } from '@/hooks/useUniswap';
import { useLiquidity } from '@/hooks/useLiquidity';
import { useToast } from '@/hooks/use-toast';
import TokenSelectorModal from '@/components/TokenSelectorModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Use the same Token interface as TokenSelectorModal expects
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

const AddLiquidity = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { getTokenAddress, isInitialized } = useDex();
  const { addLiquidity, isLoading, contractsDeployed } = useLiquidity();
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
  const [step, setStep] = useState<'input' | 'approve' | 'confirm' | 'pending' | 'success'>('input');
  const [approvalA, setApprovalA] = useState(false);
  const [approvalB, setApprovalB] = useState(false);

  // Calculate price ratio and pool share in real-time
  useEffect(() => {
    if (amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0) {
      const ratio = parseFloat(amountB) / parseFloat(amountA);
      setPriceRatio(ratio.toFixed(6));
      
      // For new pools, share would be 100%, for existing pools calculate based on reserves
      setShareOfPool('100');
    } else {
      setPriceRatio('');
      setShareOfPool('');
    }
  }, [amountA, amountB]);

  const handleTokenASelect = (token: Token) => {
    setTokenA(token);
    setIsTokenAModalOpen(false);
    setStep('input'); // Reset step when changing tokens
  };

  const handleTokenBSelect = (token: Token) => {
    setTokenB(token);
    setIsTokenBModalOpen(false);
    setStep('input'); // Reset step when changing tokens
  };

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setStep('input'); // Reset step when changing amounts
    // In a real implementation, calculate corresponding amount B based on pool ratio
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    setStep('input'); // Reset step when changing amounts
    // In a real implementation, calculate corresponding amount A based on pool ratio
  };

  const calculateDeadline = () => {
    return Math.floor(Date.now() / 1000) + (20 * 60); // 20 minutes from now
  };

  const handleApproveTokenA = async () => {
    if (!contractsDeployed) {
      // Mock approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setApprovalA(true);
      toast({
        title: "Token A Approved",
        description: `${tokenA?.symbol} spending approved for liquidity pool`,
      });
    }
    // Real implementation would approve token spending
  };

  const handleApproveTokenB = async () => {
    if (!contractsDeployed) {
      // Mock approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setApprovalB(true);
      toast({
        title: "Token B Approved", 
        description: `${tokenB?.symbol} spending approved for liquidity pool`,
      });
    }
    // Real implementation would approve token spending
  };

  const handleProceedToApproval = () => {
    if (!isFormValid) return;
    setStep('approve');
  };

  const handleProceedToConfirm = () => {
    if (!approvalA || !approvalB) return;
    setStep('confirm');
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

    if (!tokenA || !tokenB || !amountA || !amountB) {
      toast({
        title: "Missing Information",
        description: "Please select tokens and enter amounts",
        variant: "destructive"
      });
      return;
    }

    setStep('pending');

    try {
      // Calculate minimum amounts with slippage tolerance
      const amountAMin = (parseFloat(amountA) * (1 - slippage / 100)).toString();
      const amountBMin = (parseFloat(amountB) * (1 - slippage / 100)).toString();

      const result = await addLiquidity({
        tokenA: tokenA.address,
        tokenB: tokenB.address,
        amountADesired: amountA,
        amountBDesired: amountB,
        amountAMin,
        amountBMin,
        deadline: calculateDeadline()
      });

      if (result) {
        setStep('success');
        // Clear form on success after a delay
        setTimeout(() => {
          setAmountA('');
          setAmountB('');
          setTokenA(null);
          setTokenB(null);
          setStep('input');
          setApprovalA(false);
          setApprovalB(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error in handleAddLiquidity:', error);
      setStep('confirm');
    }
  };

  const handleReset = () => {
    setStep('input');
    setApprovalA(false);
    setApprovalB(false);
  };

  const isFormValid = tokenA && tokenB && amountA && amountB && 
                     parseFloat(amountA) > 0 && parseFloat(amountB) > 0;

  const getStepContent = () => {
    switch (step) {
      case 'input':
        return (
          <>
            {!contractsDeployed && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is a demo mode. In production, you would interact with deployed DEX contracts.
                </AlertDescription>
              </Alert>
            )}

            {showSettings && (
              <div className="p-4 border rounded-lg bg-muted/20 mb-4">
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
                      {tokenA.logoUrl ? (
                        <img src={tokenA.logoUrl} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />
                      ) : (
                        <span>{tokenA.icon}</span>
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
                      {tokenB.logoUrl ? (
                        <img src={tokenB.logoUrl} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />
                      ) : (
                        <span>{tokenB.icon}</span>
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

            {/* Real-time Price and Pool Info */}
            {priceRatio && (
              <div className="p-4 border rounded-lg bg-muted/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price Ratio</span>
                  <span className="font-mono">{priceRatio} {tokenB?.symbol} per {tokenA?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Share of Pool</span>
                  <span className="font-mono">{shareOfPool}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Slippage Tolerance</span>
                  <span className="font-mono">{slippage}%</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleProceedToApproval}
              disabled={!isFormValid || !isConnected}
              className="w-full"
              size="lg"
            >
              {!isConnected ? 'Connect Wallet' : 'Proceed to Approvals'}
            </Button>
          </>
        );

      case 'approve':
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Approve Token Spending</h3>
              <p className="text-sm text-muted-foreground">
                You need to approve the router contract to spend your tokens before adding liquidity.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {tokenA?.logoUrl ? (
                      <img src={tokenA.logoUrl} alt={tokenA.symbol} className="w-6 h-6 rounded-full" />
                    ) : (
                      <span className="text-lg">{tokenA?.icon}</span>
                    )}
                    <span className="font-medium">{tokenA?.symbol}</span>
                  </div>
                  {approvalA ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleApproveTokenA}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {tokenB?.logoUrl ? (
                      <img src={tokenB.logoUrl} alt={tokenB.symbol} className="w-6 h-6 rounded-full" />
                    ) : (
                      <span className="text-lg">{tokenB?.icon}</span>
                    )}
                    <span className="font-medium">{tokenB?.symbol}</span>
                  </div>
                  {approvalB ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleApproveTokenB}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleProceedToConfirm}
                  disabled={!approvalA || !approvalB}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        );

      case 'confirm':
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Confirm Liquidity Addition</h3>
              
              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between">
                  <span>You will provide:</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {tokenA?.logoUrl ? (
                      <img src={tokenA.logoUrl} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <span>{tokenA?.icon}</span>
                    )}
                    <span>{tokenA?.symbol}</span>
                  </div>
                  <span className="font-mono">{amountA}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {tokenB?.logoUrl ? (
                      <img src={tokenB.logoUrl} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <span>{tokenB?.icon}</span>
                    )}
                    <span>{tokenB?.symbol}</span>
                  </div>
                  <span className="font-mono">{amountB}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Pool Share</span>
                    <span>{shareOfPool}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('approve')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleAddLiquidity} className="flex-1">
                  Add Liquidity
                </Button>
              </div>
            </div>
          </>
        );

      case 'pending':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <h3 className="text-lg font-semibold">Adding Liquidity...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while your transaction is being processed.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Liquidity Added Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              Your liquidity has been added to the {tokenA?.symbol}/{tokenB?.symbol} pool.
            </p>
            <Button onClick={handleReset} className="w-full">
              Add More Liquidity
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Liquidity</CardTitle>
          {step === 'input' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {getStepContent()}

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
      </CardContent>
    </Card>
  );
};

export default AddLiquidity;
