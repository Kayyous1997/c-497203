
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { tokenLogoService } from "@/services/tokenLogoService";
import { dexScreenerService } from "@/services/dexScreenerService";
import { useAccount } from "wagmi";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [popularTokens, setPopularTokens] = useState<Token[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [tokenLogos, setTokenLogos] = useState<Map<string, { url: string; source: string }>>(new Map());

  // Load popular tokens from DEX Screener
  useEffect(() => {
    const loadPopularTokens = async () => {
      if (!chain?.id) return;
      
      setIsLoadingPopular(true);
      try {
        // Get popular tokens by searching for well-known symbols
        const popularSymbols = ['ETH', 'USDC', 'USDT', 'WBTC', 'UNI'];
        const tokenPromises = popularSymbols.map(async (symbol) => {
          try {
            const pairs = await dexScreenerService.searchPairs(symbol);
            const bestPair = pairs.find(p => 
              p.baseToken.symbol.toUpperCase() === symbol.toUpperCase() ||
              p.quoteToken.symbol.toUpperCase() === symbol.toUpperCase()
            );
            
            if (bestPair) {
              const isBase = bestPair.baseToken.symbol.toUpperCase() === symbol.toUpperCase();
              const token = isBase ? bestPair.baseToken : bestPair.quoteToken;
              
              return {
                symbol: token.symbol,
                name: token.name,
                address: token.address,
                icon: "❓",
                price: parseFloat(bestPair.priceUsd || "0"),
                volume24h: bestPair.volume?.h24 || 0
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to load ${symbol}:`, error);
            return null;
          }
        });

        const tokens = (await Promise.all(tokenPromises)).filter(Boolean) as Token[];
        setPopularTokens(tokens);

        // Load logos for popular tokens
        if (tokens.length > 0) {
          const logoPromises = tokens.map(async (token) => {
            const logo = await tokenLogoService.getTokenLogo(token.address, chain.id, token.symbol);
            return { address: token.address, logo };
          });

          const logos = await Promise.all(logoPromises);
          const logoMap = new Map();
          logos.forEach(({ address, logo }) => {
            logoMap.set(address, logo);
          });
          setTokenLogos(logoMap);
        }
      } catch (error) {
        console.error('Error loading popular tokens:', error);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    loadPopularTokens();
  }, [chain?.id]);

  // Search tokens using DEX Screener
  useEffect(() => {
    const searchTokens = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const pairs = await dexScreenerService.searchPairs(searchQuery);
        
        // Convert pairs to tokens and fetch logos
        const tokens: Token[] = [];
        const logoPromises: Promise<void>[] = [];

        for (const pair of pairs.slice(0, 20)) { // Limit to 20 results
          const token: Token = {
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            address: pair.baseToken.address,
            icon: "❓",
            price: parseFloat(pair.priceUsd || "0"),
            volume24h: pair.volume?.h24 || 0
          };

          tokens.push(token);

          // Load logo asynchronously
          if (chain?.id) {
            logoPromises.push(
              tokenLogoService.getTokenLogo(token.address, chain.id, token.symbol).then((logo) => {
                setTokenLogos(prev => new Map(prev.set(token.address, logo)));
              })
            );
          }
        }

        setSearchResults(tokens);
        
        // Load logos in background
        Promise.all(logoPromises).catch(console.error);
        
      } catch (error) {
        console.error('Error searching tokens:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchTokens, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, chain?.id]);

  const handleTokenSelect = (token: Token) => {
    onSelectToken(token);
    onOpenChange(false);
  };

  const getTokenLogo = (token: Token) => {
    const logoData = tokenLogos.get(token.address);
    return logoData?.url || token.icon;
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
                          {token.symbol} • ${dexScreenerService.formatPrice(token.price)}
                        </div>
                      </div>

                      {token.volume24h && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">24h Vol</div>
                          <div className="text-sm font-medium">
                            {dexScreenerService.formatVolume(token.volume24h)}
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
