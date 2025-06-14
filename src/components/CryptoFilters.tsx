
import { Search, Filter, TrendingUp, TrendingDown, Star, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from "react";
import { cryptoSearchService, CryptoSearchResult } from "@/services/cryptoSearchService";
import { useDebounce } from "@/hooks/useDebounce";

interface CryptoFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  showWatchlistOnly: boolean;
  onWatchlistToggle: () => void;
  onSearchResults?: (results: CryptoSearchResult[]) => void;
  isSearching?: boolean;
}

const CryptoFilters = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  showWatchlistOnly,
  onWatchlistToggle,
  onSearchResults,
  isSearching = false
}: CryptoFiltersProps) => {
  const [searchResults, setSearchResults] = useState<CryptoSearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filters = [
    { key: 'all', label: 'All', icon: null },
    { key: 'gainers', label: 'Top Gainers', icon: TrendingUp },
    { key: 'losers', label: 'Top Losers', icon: TrendingDown },
    { key: 'volume', label: 'High Volume', icon: Filter },
  ];

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      onSearchResults?.([]);
      return;
    }

    setIsLoadingSearch(true);
    try {
      const results = await cryptoSearchService.searchCryptocurrencies(query);
      setSearchResults(results);
      onSearchResults?.(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [onSearchResults]);

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        {(isLoadingSearch || isSearching) && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
        )}
        <Input
          placeholder="Search any cryptocurrency..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
            {searchResults.slice(0, 10).map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                onClick={() => {
                  onSearchChange(result.symbol);
                  setSearchResults([]);
                }}
              >
                <img src={result.image} alt={result.name} className="w-6 h-6 rounded-full" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{result.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{result.symbol}</p>
                </div>
                {result.market_cap_rank && (
                  <Badge variant="outline" className="text-xs">
                    #{result.market_cap_rank}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={showWatchlistOnly ? "default" : "outline"}
          size="sm"
          onClick={onWatchlistToggle}
        >
          <Star className="w-4 h-4 mr-2" />
          Watchlist
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {filters.find(f => f.key === activeFilter)?.label || 'Filter'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
              >
                {filter.icon && <filter.icon className="w-4 h-4 mr-2" />}
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CryptoFilters;
