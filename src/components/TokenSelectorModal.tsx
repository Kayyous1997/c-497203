
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { uniswapPriceService } from "@/services/uniswapPriceService";
import { useAccount } from "wagmi";
import { useEthersProvider } from "@/hooks/useEthersProvider";

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

interface TokenSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: string;
}

const TokenSelectorModal = ({ open, onOpenChange, onSelectToken, selectedToken }: TokenSelectorModalProps) => {
  const { chain } = useAccount();
  const provider = useEthersProvider();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [popularTokens, setPopularTokens] = useState<Token[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [tokenLogos, setTokenLogos] = useState<Map<string, string>>(new Map());

  // Initialize Uniswap service
  useEffect(() => {
    if (provider && chain?.id) {
      uniswapPriceService.initialize(provider, chain.id);
    }
  }, [provider, chain?.id]);

  // Load popular tokens using Uniswap service
  useEffect(() => {
    const loadPopularTokens = async () => {
      if (!chain?.id) return;
      
      setIsLoadingPopular(true);
      try {
        // Popular token addresses for mainnet
        const popularTokenData = [
          { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
          { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6Dc7237b51E4b23b3F38E834EFdA5AE' },
          { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
          { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
          { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' }
        ];

        const tokens: Token[] = [];
        const logoPromises: Promise<void>[] = [];

        for (const tokenData of popularTokenData) {
          try {
            const priceData = await uniswapPriceService.getTokenPrice(
              tokenData.symbol, 
              tokenData.address, 
              chain.id
            );
            
            const token: Token = {
              symbol: tokenData.symbol,
              name: tokenData.name,
              address: tokenData.address,
              icon: "❓",
              price: priceData?.price || 0,
              volume24h: priceData?.volume24h || 0,
              logoUrl: priceData?.logoUrl
            };

            tokens.push(token);

            // Load logo asynchronously
            logoPromises.push(
              uniswapPriceService.getTokenLogo(token.address, chain.id, token.symbol).then((logoUrl) => {
                setTokenLogos(prev => new Map(prev.set(token.address, logoUrl)));
              })
            );
          } catch (error) {
            console.warn(`Failed to load ${tokenData.symbol}:`, error);
          }
        }

        setPopularTokens(tokens);
        
        // Load logos in background
        Promise.all(logoPromises).catch(console.error);
      } catch (error) {
        console.error('Error loading popular tokens:', error);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    loadPopularTokens();
  }, [chain?.id]);

  // Search tokens - for now using a simple search through popular tokens
  // In a real implementation, you'd search through Uniswap's token lists
  useEffect(() => {
    const searchTokens = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Simple search through popular tokens for now
        // In production, you'd search through comprehensive token lists
        const filteredTokens = popularTokens.filter(token =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Add some mock search results for demonstration
        if (filteredTokens.length === 0 && searchQuery.length >= 3) {
          const mockResults = await this.generateMockSearchResults(searchQuery);
          setSearchResults(mockResults);
        } else {
          setSearchResults(filteredTokens);
        }
        
      } catch (error) {
        console.error('Error searching tokens:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchTokens, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, popularTokens, chain?.id]);

  const generateMockSearchResults = async (query: string): Promise<Token[]> => {
    // Mock search results based on query
    const mockTokens = [
      { symbol: 'WETH', name: 'Wrapped Ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
      { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }
    ];

    const results: Token[] = [];
    for (const mockToken of mockTokens) {
      if (mockToken.symbol.toLowerCase().includes(query.toLowerCase()) ||
          mockToken.name.toLowerCase().includes(query.toLowerCase())) {
        
        const priceData = await uniswapPriceService.getTokenPrice(
          mockToken.symbol, 
          mockToken.address, 
          chain?.id || 1
        );

        results.push({
          symbol: mockToken.symbol,
          name: mockToken.name,
          address: mockToken.address,
          icon: "❓",
          price: priceData?.price || 0,
          volume24h: priceData?.volume24h || 0,
          logoUrl: priceData?.logoUrl
        });
      }
    }

    return results;
  };

  const handleTokenSelect = (token: Token) => {
    onSelectToken(token);
    onOpenChange(false);
  };

  const getTokenLogo = (token: Token) => {
    return tokenLogos.get(token.address) || token.logoUrl || token.icon;
  };

  const getTokenFallback = (token: Token) => {
    return token.symbol.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-muted/20">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-left">Search tokens</DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, symbol or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/10 border-muted/20"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Popular Tokens */}
        {!searchQuery && (
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-3">Popular tokens</div>
            {isLoadingPopular ? (
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center p-3 h-auto bg-muted/10 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-muted/30 rounded-full mb-1"></div>
                    <div className="w-8 h-3 bg-muted/30 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {popularTokens.map((token) => (
                  <Button
                    key={token.symbol}
                    variant="ghost"
                    onClick={() => handleTokenSelect(token)}
                    className="flex flex-col items-center p-3 h-auto bg-muted/10 hover:bg-muted/20 rounded-lg"
                  >
                    <Avatar className="w-10 h-10 mb-1">
                      <AvatarImage 
                        src={getTokenLogo(token)} 
                        alt={token.symbol}
                        className="rounded-full"
                      />
                      <AvatarFallback className="text-xs">
                        {getTokenFallback(token)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{token.symbol}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <span>🔍</span>
              <span>Search results</span>
              {isSearching && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((token, index) => (
                  <Button
                    key={`${token.address}-${index}`}
                    variant="ghost"
                    onClick={() => handleTokenSelect(token)}
                    className="w-full justify-start p-3 h-auto hover:bg-muted/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={getTokenLogo(token)} 
                          alt={token.symbol}
                          className="rounded-full"
                        />
                        <AvatarFallback className="text-xs">
                          {getTokenFallback(token)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 text-left">
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {token.symbol} • ${uniswapPriceService.formatPrice(token.price)}
                        </div>
                      </div>

                      {token.volume24h && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">24h Vol</div>
                          <div className="text-sm font-medium">
                            {uniswapPriceService.formatVolume(token.volume24h)}
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                ))
              ) : !isSearching && searchQuery ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-2xl mb-2">🔍</div>
                  <div>No tokens found</div>
                  <div className="text-sm">Try a different search term</div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelectorModal;
