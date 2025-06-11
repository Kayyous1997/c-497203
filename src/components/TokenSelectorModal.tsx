
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Token {
  symbol: string;
  name: string;
  address: string;
  icon: string;
  price: number;
  volume24h?: number;
}

interface TokenSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: string;
}

const TokenSelectorModal = ({ open, onOpenChange, onSelectToken, selectedToken }: TokenSelectorModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const popularTokens: Token[] = [
    { symbol: "ETH", name: "Ethereum", address: "0x...", icon: "🔷", price: 3200 },
    { symbol: "USDC", name: "USD Coin", address: "0x...", icon: "💵", price: 1 },
    { symbol: "USDT", name: "Tether", address: "0x...", icon: "💰", price: 1 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x...", icon: "🟠", price: 65000 },
    { symbol: "WETH", name: "Wrapped Ethereum", address: "0x...", icon: "🔹", price: 3200 },
  ];

  const tokensByVolume: Token[] = [
    { 
      symbol: "USDT", 
      name: "Binance Bridged USDT (BNB Smart Chain)", 
      address: "0x55d3...7955", 
      icon: "💰", 
      price: 1,
      volume24h: 1250000000 
    },
    { 
      symbol: "ETH", 
      name: "Ethereum", 
      address: "0x...", 
      icon: "🔷", 
      price: 3200,
      volume24h: 980000000 
    },
    { 
      symbol: "USDC", 
      name: "USDC", 
      address: "0xA0b8...eB48", 
      icon: "💵", 
      price: 1,
      volume24h: 850000000 
    },
    { 
      symbol: "USDT", 
      name: "Tether", 
      address: "0xdAC1...1ec7", 
      icon: "💰", 
      price: 1,
      volume24h: 720000000 
    },
    { 
      symbol: "KOGE", 
      name: "KOGE", 
      address: "0xe6DF...5528", 
      icon: "🟡", 
      price: 0.0125,
      volume24h: 45000000 
    },
    { 
      symbol: "ETH", 
      name: "Base ETH", 
      address: "0x...", 
      icon: "🔹", 
      price: 3200,
      volume24h: 35000000 
    },
    { 
      symbol: "ETH", 
      name: "Unichain ETH", 
      address: "0x...", 
      icon: "🦄", 
      price: 3200,
      volume24h: 28000000 
    },
    { 
      symbol: "USDC", 
      name: "USD Coin", 
      address: "0xaf88...5831", 
      icon: "💵", 
      price: 1,
      volume24h: 22000000 
    },
  ];

  const filteredTokens = tokensByVolume.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onSelectToken(token);
    onOpenChange(false);
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
            placeholder="Search tokens"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/10 border-muted/20"
          />
        </div>

        {/* Popular Tokens */}
        {!searchQuery && (
          <div className="mb-6">
            <div className="grid grid-cols-5 gap-3">
              {popularTokens.map((token) => (
                <Button
                  key={token.symbol}
                  variant="ghost"
                  onClick={() => handleTokenSelect(token)}
                  className="flex flex-col items-center p-3 h-auto bg-muted/10 hover:bg-muted/20 rounded-lg"
                >
                  <div className="text-2xl mb-1">{token.icon}</div>
                  <span className="text-sm font-medium">{token.symbol}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tokens by 24H Volume */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <span>📈</span>
            <span>Tokens by 24H volume</span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredTokens.map((token, index) => (
              <Button
                key={`${token.symbol}-${index}`}
                variant="ghost"
                onClick={() => handleTokenSelect(token)}
                className="w-full justify-start p-3 h-auto hover:bg-muted/10 rounded-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-lg">
                      {token.icon}
                    </div>
                    {token.symbol === "USDT" && index === 0 && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                        🏆
                      </div>
                    )}
                    {token.symbol === "KOGE" && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                        🏆
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {token.symbol} {token.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelectorModal;
