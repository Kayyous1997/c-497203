
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, Search } from "lucide-react";
import { Token, tokenService } from "@/services/tokenService";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  label: string;
}

const TokenSelector = ({ selectedToken, onTokenSelect, label }: TokenSelectorProps) => {
  const { chain } = useAccount();
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTokens();
  }, [chain?.id]);

  const loadTokens = async () => {
    if (!chain?.id) return;
    
    setLoading(true);
    try {
      const tokensWithPrices = await tokenService.getTokensWithPrices(chain.id);
      setTokens(tokensWithPrices);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[120px]">
          <div className="flex items-center space-x-2">
            {selectedToken?.logoURI && (
              <img 
                src={selectedToken.logoURI} 
                alt={selectedToken.symbol}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span>{selectedToken?.symbol || `Select ${label}`}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select {label} Token</DialogTitle>
        </DialogHeader>
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading tokens...
              </div>
            ) : filteredTokens.length === 0 ? (
              <CommandEmpty>No tokens found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredTokens.map((token) => (
                  <CommandItem
                    key={`${token.chainId}-${token.address}`}
                    onSelect={() => handleTokenSelect(token)}
                    className="flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      {token.logoURI && (
                        <img 
                          src={token.logoURI} 
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {token.price && (
                        <div className="text-sm font-medium">
                          ${token.price.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelector;
