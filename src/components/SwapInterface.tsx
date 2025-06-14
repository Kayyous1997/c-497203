
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ChevronDown, Settings, Info, AlertTriangle, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import TokenSelectorModal from "./TokenSelectorModal";
import { useDex } from "@/hooks/useUniswap";
import { useToast } from "@/hooks/use-toast";
import { priceFeedService } from "@/services/priceFeedService";
import { dexScreenerService } from "@/services/dexScreenerService";

interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: string;
  price: number;
}

const SwapInterface = () => {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const { 
    isInitialized, 
    isLoading: dexLoading, 
    quote, 
    contractsDeployed,
    getQuote, 
    executeSwap, 
    getTokenAddress,
    currentChainId 
  } = useDex();

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [fromToken, setFromToken] = useState<Token>({
    symbol: "ETH",
    name: "Ethereum",
    address: "0x...",
    icon: "",
    price: 0
  });
  const [toToken, setToToken] = useState<Token>({
    symbol: "USDC",
    name: "USD Coin",
    address: "0x...",
    icon: "",
    price: 0
  });
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [fromBalance, setFromBalance] = useState("0.00");
  const [toBalance, setToBalance] = useState("0.00");
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Load initial token data and prices
  useEffect(() => {
    const loadInitialTokens = async () => {
      setIsLoadingPrices(true);
      try {
        // Load ETH and USDC prices
        const [ethPrice, usdcPrice] = await Promise.all([
          priceFeedService.getTokenPrice("ETH"),
          priceFeedService.getTokenPrice("USDC")
        ]);

        if (ethPrice) {
          setFromToken(prev => ({ 
            ...prev, 
            price: ethPrice.price,
            icon: "⟠"
          }));
        }

        if (usdcPrice) {
          setToToken(prev => ({ 
            ...prev, 
            price: usdcPrice.price,
            icon: "💲"
          }));
        }
      } catch (error) {
        console.error('Error loading initial token data:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadInitialTokens();
  }, []);

  // Update token addresses when chain changes
  useEffect(() => {
    if (currentChainId && isInitialized) {
      const fromAddress = getTokenAddress(fromToken.symbol);
      const toAddress = getTokenAddress(toToken.symbol);
      
      if (fromAddress) {
        setFromToken(prev => ({ ...prev, address: fromAddress }));
      }
      if (toAddress) {
        setToToken(prev => ({ ...prev, address: toAddress }));
      }
    }
  }, [currentChainId, isInitialized, getTokenAddress, fromToken.symbol, toToken.symbol]);

  // Update token prices in real-time
  useEffect(() => {
    const updatePrices = async () => {
      if (fromToken.symbol && toToken.symbol) {
        try {
          const [fromPrice, toPrice] = await Promise.all([
            priceFeedService.getTokenPrice(fromToken.symbol, fromToken.address),
            priceFeedService.getTokenPrice(toToken.symbol, toToken.address)
          ]);

          if (fromPrice) {
            setFromToken(prev => ({ ...prev, price: fromPrice.price }));
          }
          if (toPrice) {
            setToToken(prev => ({ ...prev, price: toPrice.price }));
          }
        } catch (error) {
          console.error('Error updating token prices:', error);
        }
      }
    };

    // Update prices every 30 seconds
    const priceUpdateInterval = setInterval(updatePrices, 30000);
    return () => clearInterval(priceUpdateInterval);
  }, [fromToken.symbol, toToken.symbol, fromToken.address, toToken.address]);

  // Update balances when wallet connects or tokens change
  useEffect(() => {
    const updateBalances = async () => {
      if (!isConnected || !address) {
        setFromBalance("0.00");
        setToBalance("0.00");
        return;
      }

      try {
        // In a real implementation, you would fetch actual balances from the blockchain
        // For now, we'll use placeholder values since we don't have contract integration yet
        setFromBalance("0.00");
        setToBalance("0.00");
      } catch (error) {
        console.error('Error fetching balances:', error);
        setFromBalance("0.00");
        setToBalance("0.00");
      }
    };

    updateBalances();
  }, [isConnected, address, fromToken.address, toToken.address]);

  // Get real quote when amount or tokens change
  useEffect(() => {
    const getDexQuote = async () => {
      if (!fromAmount || !isInitialized || !fromToken.address || !toToken.address || fromToken.address === "0x..." || toToken.address === "0x...") {
        setToAmount("");
        return;
      }

      setIsGettingQuote(true);
      try {
        const result = await getQuote({
          tokenIn: fromToken.address,
          tokenOut: toToken.address,
          amountIn: fromAmount,
          slippageTolerance: parseFloat(isCustomSlippage ? customSlippage : slippageTolerance)
        });

        if (result) {
          setToAmount(result.amountOut);
        } else {
          // Fallback to price-based calculation when DEX quote is not available
          if (fromToken.price > 0 && toToken.price > 0) {
            const calculatedAmount = (Number(fromAmount) * fromToken.price) / toToken.price;
            setToAmount(calculatedAmount.toFixed(6));
          } else {
            setToAmount("");
          }
        }
      } catch (error) {
        console.error('Quote error:', error);
        setToAmount("");
      } finally {
        setIsGettingQuote(false);
      }
    };

    const timeoutId = setTimeout(getDexQuote, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken.address, toToken.address, fromToken.price, toToken.price, slippageTolerance, customSlippage, isCustomSlippage, getQuote, isInitialized]);

  const calculatePriceImpact = (fromAmount: string, fromToken: Token, toToken: Token) => {
    if (quote?.priceImpact) {
      return quote.priceImpact;
    }
    // Fallback calculation based on trade size
    if (!fromAmount || isNaN(Number(fromAmount))) return 0;
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
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    const tempBalance = fromBalance;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setFromBalance(toBalance);
    setToBalance(tempBalance);
  };

  const handleFromTokenSelect = async (token: Token) => {
    const address = getTokenAddress(token.symbol);
    let updatedToken = { ...token, address: address || token.address };
    
    // Get real-time price for the selected token
    try {
      const priceData = await priceFeedService.getTokenPrice(token.symbol, token.address);
      if (priceData) {
        updatedToken.price = priceData.price;
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
    }
    
    setFromToken(updatedToken);
  };

  const handleToTokenSelect = async (token: Token) => {
    const address = getTokenAddress(token.symbol);
    let updatedToken = { ...token, address: address || token.address };
    
    // Get real-time price for the selected token
    try {
      const priceData = await priceFeedService.getTokenPrice(token.symbol, token.address);
      if (priceData) {
        updatedToken.price = priceData.price;
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
    }
    
    setToToken(updatedToken);
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

  const handleSwap = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!isInitialized) {
      toast({
        title: "Network Not Supported",
        description: "DEX is not available on this network",
        variant: "destructive"
      });
      return;
    }

    if (!contractsDeployed) {
      toast({
        title: "Contracts Not Deployed",
        description: "Deploy your DEX contracts first to enable swapping",
        variant: "destructive"
      });
      return;
    }

    if (!fromAmount || !toAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive"
      });
      return;
    }

    console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    
    const txHash = await executeSwap({
      tokenIn: fromToken.address,
      tokenOut: toToken.address,
      amountIn: fromAmount,
      slippageTolerance: parseFloat(currentSlippage)
    });

    if (txHash) {
      // Reset form on successful swap
      setFromAmount("");
      setToAmount("");
    }
  };

  const getSwapButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (!isInitialized) return "Network Not Supported";
    if (!contractsDeployed) return "Deploy Contracts First";
    if (!fromAmount) return "Enter Amount";
    if (isGettingQuote || dexLoading || isLoadingPrices) return "Loading...";
    if (!toAmount) return "Invalid Pair";
    if (priceImpact > 3) return "Swap Anyway";
    return "Swap";
  };

  const isSwapDisabled = () => {
    return !isConnected || !isInitialized || !contractsDeployed || !fromAmount || !toAmount || isGettingQuote || dexLoading || isLoadingPrices;
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

        {!contractsDeployed && isConnected && isInitialized && (
          <div className="mb-4 p-3 bg-blue-500/10 rounded-lg flex items-center gap-2 text-blue-600">
            <Info className="h-4 w-4" />
            <span className="text-sm">Your DEX contracts are not deployed yet. You can test with price-based quotes.</span>
          </div>
        )}

        {!isInitialized && isConnected && (
          <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">DEX is not available on this network</span>
          </div>
        )}

        <div className="space-y-4">
          {/* From Token */}
          <Card className="bg-secondary/20 border-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="text-sm text-muted-foreground">
                  Balance: {fromBalance} {fromToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
                  disabled={!isConnected || !isInitialized || isLoadingPrices}
                />
                <Button
                  variant="ghost"
                  onClick={() => setIsFromTokenModalOpen(true)}
                  className="flex items-center space-x-2 bg-muted/20 hover:bg-muted/30 px-3 py-2 rounded-lg"
                  disabled={isLoadingPrices}
                >
                  <span className="text-lg">{fromToken.icon || "🔵"}</span>
                  <span className="font-medium">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              {fromAmount && fromToken.price > 0 && (
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
              disabled={!isConnected || !isInitialized || isLoadingPrices}
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
                  Balance: {toBalance} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
                  />
                  {(isGettingQuote || isLoadingPrices) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsToTokenModalOpen(true)}
                  className="flex items-center space-x-2 bg-muted/20 hover:bg-muted/30 px-3 py-2 rounded-lg"
                  disabled={isLoadingPrices}
                >
                  <span className="text-lg">{toToken.icon || "🔵"}</span>
                  <span className="font-medium">{toToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              {toAmount && toToken.price > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  ≈ ${(Number(toAmount) * toToken.price).toLocaleString()}
                  {!contractsDeployed && <span className="ml-2 text-blue-500">(Price-based)</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Swap Details */}
          {fromAmount && toAmount && isConnected && isInitialized && !isLoadingPrices && (
            <div className="bg-muted/10 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>1 {fromToken.symbol} = {toAmount && fromAmount ? (Number(toAmount) / Number(fromAmount)).toFixed(6) : "0"} {toToken.symbol}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>{quote?.gasEstimate ? `~$${(parseInt(quote.gasEstimate) * 0.000000001 * 2000).toFixed(2)}` : "~$2.50"}</span>
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
            disabled={isSwapDisabled()}
            variant={priceImpact > 3 ? "destructive" : "default"}
          >
            {(dexLoading || isLoadingPrices) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {getSwapButtonText()}
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
