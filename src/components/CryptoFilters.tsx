
import { Search, Filter, TrendingUp, TrendingDown, Star } from "lucide-react";
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

interface CryptoFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  showWatchlistOnly: boolean;
  onWatchlistToggle: () => void;
}

const CryptoFilters = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  showWatchlistOnly,
  onWatchlistToggle
}: CryptoFiltersProps) => {
  const filters = [
    { key: 'all', label: 'All', icon: null },
    { key: 'gainers', label: 'Top Gainers', icon: TrendingUp },
    { key: 'losers', label: 'Top Losers', icon: TrendingDown },
    { key: 'volume', label: 'High Volume', icon: Filter },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
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
