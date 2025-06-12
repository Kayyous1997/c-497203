
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isSearching, setIsSearching] = useState(false);
  const [tokenLogos, setTokenLogos] = useState<Map<string, { url: string; source: string }>>(new Map());

  const popularTokens: Token[] = [
    { symbol: "ETH", name: "Ethereum", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", icon: "🔷", price: 3200 },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86a33E6417b0de0aB4fC22c6f6b4A81C7be50", icon: "💵", price: 1 },
    { symbol: "USDT", name: "Tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", icon: "💰", price: 1 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", icon: "🟠", price: 65000 },
    { symbol: "WETH", name: "Wrapped Ethereum", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", icon: "🔹", price: 3200 },
  ];

  // Load logos for popular tokens
  useEffect(() => {
    if (chain?.id) {
      const loadLogos = async () => {
        const logoPromises = popularTokens.map(async (token) => {
          const logo = await tokenLogoService.getTokenLogo(token.address, chain.id, token.symbol);
          return { address: token.address, logo };
        });

        const logos = await Promise.all(logoPromises);
        const logoMap = new Map();
        logos.forEach(({ address, logo }) => {
          logoMap.set(address, logo);
        });
        setTokenLogos(logoMap);
      };

      loadLogos();
    }
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

  const getTokenIcon = (token: Token) => {
    const logoData = tokenLogos.get(token.address);
    if (logoData && logoData.source !== 'fallback') {
      return (
        <img 
          src={logoData.url} 
          alt={token.symbol}
          className="w-10 h-10 rounded-full"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.removeAttribute('style');
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-lg">
        {logoData?.url || token.icon}
      </div>
    );
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
            <div className="grid grid-cols-5 gap-3">
              {popularTokens.map((token) => (
                <Button
                  key={token.symbol}
                  variant="ghost"
                  onClick={() => handleTokenSelect(token)}
                  className="flex flex-col items-center p-3 h-auto bg-muted/10 hover:bg-muted/20 rounded-lg"
                >
                  {getTokenIcon(token)}
                  <span className="text-sm font-medium mt-1">{token.symbol}</span>
                </Button>
              ))}
            </div>
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
                      <div className="relative">
                        {getTokenIcon(token)}
                        <div 
                          className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-lg" 
                          style={{ display: 'none' }}
                        >
                          {token.icon}
                        </div>
                      </div>
                      
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
