
import { useState, useEffect } from "react";
import { useAccount, useSigner } from "wagmi";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TokenSelector from "./TokenSelector";
import { Token, tokenService } from "@/services/tokenService";
import { UniswapService } from "@/services/uniswapService";

const SwapInterface = () => {
  const { isConnected, chain } = useAccount();
  const { data: signer } = useSigner();
  const { toast } = useToast();
  
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [uniswapService, setUniswapService] = useState<UniswapService | null>(null);

  useEffect(() => {
    if (chain?.id && isConnected) {
      // Initialize provider and Uniswap service
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const service = new UniswapService(provider, chain.id);
      setUniswapService(service);
      
      // Load default tokens for the chain
      loadDefaultTokens();
    }
  }, [chain?.id, isConnected]);

  useEffect(() => {
    if (fromAmount && fromToken && toToken && uniswapService) {
      getQuote();
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken, uniswapService]);

  const loadDefaultTokens = async () => {
    if (!chain?.id) return;
    
    const tokens = tokenService.getTokensForChain(chain.id);
    if (tokens.length >= 2) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  };

  const getQuote = async () => {
    if (!fromAmount || !fromToken || !toToken || !uniswapService) return;
    
    setQuoting(true);
    try {
      const quote = await uniswapService.getQuote(fromToken, toToken, fromAmount);
      if (quote) {
        setToAmount(quote.outputAmount);
      } else {
        setToAmount("");
        toast({
          title: "No route found",
          description: "Unable to find a swap route for these tokens.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Quote error:', error);
      setToAmount("");
    } finally {
      setQuoting(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!isConnected || !signer || !fromToken || !toToken || !fromAmount || !uniswapService) {
      toast({
        title: "Missing requirements",
        description: "Please ensure wallet is connected and tokens are selected.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const txHash = await uniswapService.executeSwap(
        fromToken,
        toToken,
        fromAmount,
        signer
      );
      
      if (txHash) {
        toast({
          title: "Swap successful!",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        setFromAmount("");
        setToAmount("");
      } else {
        throw new Error("Swap failed");
      }
    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "Swap failed",
        description: "Please try again or check your transaction settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canSwap = isConnected && fromToken && toToken && fromAmount && toAmount && !loading && !quoting;

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
                Balance: {isConnected ? "0.00" : "0.00"} {fromToken?.symbol || ""}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none p-0 h-auto flex-1"
                disabled={!isConnected}
              />
              <TokenSelector
                selectedToken={fromToken}
                onTokenSelect={setFromToken}
                label="From"
              />
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
                Balance: {isConnected ? "0.00" : "0.00"} {toToken?.symbol || ""}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
                />
                {quoting && (
                  <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>
              <TokenSelector
                selectedToken={toToken}
                onTokenSelect={setToToken}
                label="To"
              />
            </div>
          </CardContent>
        </Card>

        {/* Swap Details */}
        {fromAmount && toAmount && isConnected && fromToken && toToken && (
          <div className="bg-muted/10 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span>
                1 {fromToken.symbol} = {toAmount && fromAmount ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6) : "0"} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span>{chain?.name || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage</span>
              <span>0.5%</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          className="w-full" 
          onClick={handleSwap}
          disabled={!canSwap}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Swapping...</span>
            </div>
          ) : !isConnected ? (
            "Connect Wallet"
          ) : !fromToken || !toToken ? (
            "Select Tokens"
          ) : !fromAmount ? (
            "Enter Amount"
          ) : quoting ? (
            "Getting Quote..."
          ) : (
            "Swap"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SwapInterface;
