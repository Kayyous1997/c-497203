
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
    getQuote, 
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
  const [isSwapping, setIsSwapping] = useState(false);

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
        // Mock balances for demo - in production this would fetch real balances
        const mockBalances = {
          ETH: "2.45",
          USDC: "1,250.00",
          USDT: "890.50",
          DAI: "500.00",
          WBTC: "0.15"
        };
        
        setFromBalance(mockBalances[fromToken.symbol as keyof typeof mockBalances] || "0.00");
        setToBalance(mockBalances[toToken.symbol as keyof typeof mockBalances] || "0.00");
      } catch (error) {
        console.error('Error fetching balances:', error);
        setFromBalance("0.00");
        setToBalance("0.00");
      }
    };

    updateBalances();
  }, [isConnected, address, fromToken.address, toToken.address, fromToken.symbol, toToken.symbol]);

  // Get quote when amount or tokens change
  useEffect(() => {
    const getDexQuote = async () => {
      if (!fromAmount || !fromToken.price || !toToken.price) {
        setToAmount("");
        return;
      }

      setIsGettingQuote(true);
      try {
        // Use price-based calculation for mock swaps
        const calculatedAmount = (Number(fromAmount) * fromToken.price) / toToken.price;
        // Add small random variation to simulate market conditions
        const variation = 0.995 + (Math.random() * 0.01); // 0.5% variation
        const finalAmount = calculatedAmount * variation;
        setToAmount(finalAmount.toFixed(6));
      } catch (error) {
        console.error('Quote error:', error);
        setToAmount("");
      } finally {
        setIsGettingQuote(false);
      }
    };

    const timeoutId = setTimeout(getDexQuote, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken.price, toToken.price]);

  const calculatePriceImpact = (fromAmount: string, fromToken: Token, toToken: Token) => {
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

    if (!fromAmount || !toAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Successful!",
        description: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });

      // Reset form on successful swap
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "Swap Failed",
        description: "The swap transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const getSwapButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (!fromAmount) return "Enter Amount";
    if (isGettingQuote || dexLoading || isLoadingPrices || isSwapping) return "Loading...";
    if (!toAmount) return "Invalid Pair";
    if (priceImpact > 3) return "Swap Anyway";
    return "Swap";
  };

  const isSwapDisabled = () => {
    return !isConnected || !fromAmount || !toAmount || isGettingQuote || dexLoading || isLoadingPrices || isSwapping;
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
                  disabled={!isConnected || isLoadingPrices}
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
              disabled={!isConnected || isLoadingPrices}
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
                  <span className="ml-2 text-blue-500">(Demo Mode)</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Swap Details */}
          {fromAmount && toAmount && isConnected && !isLoadingPrices && (
            <div className="bg-muted/10 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>1 {fromToken.symbol} = {toAmount && fromAmount ? (Number(toAmount) / Number(fromAmount)).toFixed(6) : "0"} {toToken.symbol}</span>
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
            disabled={isSwapDisabled()}
            variant={priceImpact > 3 ? "destructive" : "default"}
          >
            {(dexLoading || isLoadingPrices || isSwapping) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
