
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";

const SwapInterface = () => {
  const { isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("BTC");
  const [toToken, setToToken] = useState("ETH");

  const tokens = [
    { symbol: "BTC", name: "Bitcoin", price: 65000 },
    { symbol: "ETH", name: "Ethereum", price: 3200 },
    { symbol: "USDT", name: "Tether", price: 1 },
    { symbol: "BNB", name: "Binance Coin", price: 580 },
  ];

  const getTokenPrice = (symbol: string) => {
    return tokens.find(token => token.symbol === symbol)?.price || 0;
  };

  const calculateSwap = (amount: string, from: string, to: string) => {
    if (!amount || isNaN(Number(amount))) return "";
    const fromPrice = getTokenPrice(from);
    const toPrice = getTokenPrice(to);
    const result = (Number(amount) * fromPrice) / toPrice;
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

  const handleSwap = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    // Placeholder for actual swap logic
    console.log(`Swapping ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`);
    alert(`Swap initiated: ${fromAmount} ${fromToken} → ${toAmount} ${toToken}`);
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Swap Tokens</h2>

      <div className="space-y-4">
        {/* From Token */}
        <Card className="bg-secondary/20 border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm text-muted-foreground">
                Balance: {isConnected ? "2.45" : "0.00"} {fromToken}
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
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-24 bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Balance: {isConnected ? "5.12" : "0.00"} {toToken}
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
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-24 bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Swap Details */}
        {fromAmount && toAmount && isConnected && (
          <div className="bg-muted/10 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span>1 {fromToken} = {calculateSwap("1", fromToken, toToken)} {toToken}</span>
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
  );
};

export default SwapInterface;
