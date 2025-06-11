
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ChevronDown } from "lucide-react";
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

  const handleSwap = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    // Placeholder for actual swap logic
    console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    alert(`Swap initiated: ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`);
  };

  return (
    <>
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">Swap Tokens</h2>

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
            </div>
          )}

          {/* Swap Button */}
          <Button 
            className="w-full" 
            onClick={handleSwap}
            disabled={!isConnected || !fromAmount || !toAmount}
          >
            {!isConnected ? "Connect Wallet" : !fromAmount ? "Enter Amount" : "Swap"}
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
