
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ChevronDown, Settings, Info, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import TokenSelectorModal from "./TokenSelectorModal";

interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: string;
  price: number;
}

const SwapInterface = () => {
  const { isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [fromToken, setFromToken] = useState<Token>({
    symbol: "BTC",
    name: "Bitcoin",
    address: "0x...",
    icon: "🟠",
    price: 65000
  });
  const [toToken, setToToken] = useState<Token>({
    symbol: "ETH",
    name: "Ethereum",
    address: "0x...",
    icon: "🔷",
    price: 3200
  });
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);

  const calculateSwap = (amount: string, from: Token, to: Token) => {
    if (!amount || isNaN(Number(amount))) return "";
    const result = (Number(amount) * from.price) / to.price;
    return result.toFixed(6);
  };

  const calculatePriceImpact = (fromAmount: string, fromToken: Token, toToken: Token) => {
    if (!fromAmount || isNaN(Number(fromAmount))) return 0;
    // Simulated price impact calculation (would be based on liquidity in real implementation)
    const tradeSize = Number(fromAmount) * fromToken.price;
    if (tradeSize < 1000) return 0.1;
    if (tradeSize < 10000) return 0.5;
    if (tradeSize < 100000) return 1.2;
    return 2.5;
  };

  const getMinimumReceived = (toAmount: string, slippage: string) => {
    if (!toAmount || !slippage) return "0";
    const minReceived = Number(toAmount) * (1 - Number(slippage) / 100);
    return minReceived.toFixed(6);
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return "text-green-500";
    if (impact < 3) return "text-yellow-500";
    return "text-red-500";
  };

  const priceImpact = calculatePriceImpact(fromAmount, fromToken, toToken);
  const currentSlippage = isCustomSlippage ? customSlippage : slippageTolerance;
  const minimumReceived = getMinimumReceived(toAmount, currentSlippage);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateSwap(value, fromToken, toToken));
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromTokenSelect = (token: Token) => {
    setFromToken(token);
    setToAmount(calculateSwap(fromAmount, token, toToken));
  };

  const handleToTokenSelect = (token: Token) => {
    setToToken(token);
    setToAmount(calculateSwap(fromAmount, fromToken, token));
  };

  const handleSlippageChange = (value: string) => {
    setSlippageTolerance(value);
    setIsCustomSlippage(false);
    setCustomSlippage("");
  };

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    setIsCustomSlippage(true);
  };

  const handleSwap = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    console.log(`Slippage tolerance: ${currentSlippage}%`);
    console.log(`Price impact: ${priceImpact.toFixed(2)}%`);
    console.log(`Minimum received: ${minimumReceived} ${toToken.symbol}`);
    alert(`Swap initiated: ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`);
  };

  return (
    <>
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Swap Tokens</h2>
          
          {/* Settings Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Slippage Tolerance</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {["0.1", "0.5", "1.0"].map((value) => (
                      <Button
                        key={value}
                        variant={slippageTolerance === value && !isCustomSlippage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSlippageChange(value)}
                        className="text-xs"
                      >
                        {value}%
                      </Button>
                    ))}
                    <div className="flex items-center">
                      <Input
                        type="number"
                        placeholder="Custom"
                        value={customSlippage}
                        onChange={(e) => handleCustomSlippageChange(e.target.value)}
                        className="w-20 h-8 text-xs"
                        step="0.1"
                        min="0"
                        max="50"
                      />
                      <span className="text-xs text-muted-foreground ml-1">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher slippage tolerance = higher chance of swap success
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-4">
          {/* From Token */}
          <Card className="bg-secondary/20 border-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="text-sm text-muted-foreground">
                  Balance: {isConnected ? "2.45" : "0.00"} {fromToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
                  disabled={!isConnected}
                />
                <Button
                  variant="ghost"
                  onClick={() => setIsFromTokenModalOpen(true)}
                  className="flex items-center space-x-2 bg-muted/20 hover:bg-muted/30 px-3 py-2 rounded-lg"
                >
                  <span className="text-lg">{fromToken.icon}</span>
                  <span className="font-medium">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              {fromAmount && (
                <div className="text-sm text-muted-foreground mt-1">
                  ≈ ${(Number(fromAmount) * fromToken.price).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full bg-muted/20 hover:bg-muted/30"
              disabled={!isConnected}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <Card className="bg-secondary/20 border-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-sm text-muted-foreground">
                  Balance: {isConnected ? "5.12" : "0.00"} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
                />
                <Button
                  variant="ghost"
                  onClick={() => setIsToTokenModalOpen(true)}
                  className="flex items-center space-x-2 bg-muted/20 hover:bg-muted/30 px-3 py-2 rounded-lg"
                >
                  <span className="text-lg">{toToken.icon}</span>
                  <span className="font-medium">{toToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              {toAmount && (
                <div className="text-sm text-muted-foreground mt-1">
                  ≈ ${(Number(toAmount) * toToken.price).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Swap Details */}
          {fromAmount && toAmount && isConnected && (
            <div className="bg-muted/10 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>1 {fromToken.symbol} = {calculateSwap("1", fromToken, toToken)} {toToken.symbol}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>~$2.50</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Price Impact</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className={getPriceImpactColor(priceImpact)}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Min. Received</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span>
                  {minimumReceived} {toToken.symbol}
                </span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Slippage Tolerance</span>
                </div>
                <span>
                  {currentSlippage}%
                </span>
              </div>
              
              {priceImpact > 3 && (
                <div className="mt-2 p-2 bg-red-500/10 rounded-md flex items-start gap-2 text-xs text-red-500">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Price impact is very high. You may receive significantly less tokens than expected.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Swap Button */}
          <Button 
            className="w-full" 
            onClick={handleSwap}
            disabled={!isConnected || !fromAmount || !toAmount}
            variant={priceImpact > 3 ? "destructive" : "default"}
          >
            {!isConnected ? "Connect Wallet" : !fromAmount ? "Enter Amount" : priceImpact > 3 ? "Swap Anyway" : "Swap"}
          </Button>
        </div>
      </div>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        open={isFromTokenModalOpen}
        onOpenChange={setIsFromTokenModalOpen}
        onSelectToken={handleFromTokenSelect}
        selectedToken={fromToken.symbol}
      />
      
      <TokenSelectorModal
        open={isToTokenModalOpen}
        onOpenChange={setIsToTokenModalOpen}
        onSelectToken={handleToTokenSelect}
        selectedToken={toToken.symbol}
      />
    </>
  );
};

export default SwapInterface;
