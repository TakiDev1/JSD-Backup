import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  DollarSign,
  X,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchAndFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (data: {
    query: string;
    filters: {
      category: string;
      priceRange: { min: string; max: string };
      sortBy: string;
      rating: string;
      featured: boolean;
      premium: boolean;
    };
  }) => void;
  initialQuery?: string;
  initialFilters?: {
    category: string;
    priceRange: { min: string; max: string };
    sortBy: string;
    rating: string;
    featured: boolean;
    premium: boolean;
  };
}

const categories = [
  "All Categories",
  "vehicles",
  "sports", 
  "drift",
  "offroad",
  "racing",
  "muscle",
  "jdm",
  "supercars",
  "custom",
  "plushies",
  "rugs"
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "oldest", label: "Oldest" }
];

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialQuery = "",
  initialFilters = {
    category: "",
    priceRange: { min: "", max: "" },
    sortBy: "newest",
    rating: "",
    featured: false,
    premium: false
  }
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);

  // Update state when props change
  useEffect(() => {
    setQuery(initialQuery);
    setFilters(initialFilters);
  }, [initialQuery, initialFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }));
  };

  const handleSearch = () => {
    onSearch({
      query,
      filters
    });
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      category: "",
      priceRange: { min: "", max: "" },
      sortBy: "newest",
      rating: "",
      featured: false,
      premium: false
    };
    setQuery("");
    setFilters(resetFilters);
    onSearch({
      query: "",
      filters: resetFilters
    });
  };

  const activeFiltersCount = 
    (filters.category ? 1 : 0) +
    (filters.priceRange.min || filters.priceRange.max ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.premium ? 1 : 0) +
    (filters.sortBy !== "newest" ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-white flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search & Filter
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search mods, vehicles, maps..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full bg-slate-800/50 border-slate-600 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:ring-purple-500/20"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category === "All Categories" ? "" : category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full bg-slate-800/50 border-slate-600 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:ring-purple-500/20"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full bg-slate-800/50 border-slate-600 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:ring-purple-500/20"
                  >
                    <option value="">Any Rating</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                  <span className="text-slate-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Toggle Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="rounded border-slate-600 text-purple-600 focus:ring-purple-500/20"
                  />
                  <span className="text-slate-300">Featured Only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.premium}
                    onChange={(e) => handleFilterChange('premium', e.target.checked)}
                    className="rounded border-slate-600 text-purple-600 focus:ring-purple-500/20"
                  />
                  <span className="text-slate-300">Premium Only</span>
                </label>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-400">Active filters:</span>
                    {filters.category && (
                      <Badge variant="outline" className="bg-purple-600/20 border-purple-600 text-purple-400">
                        {filters.category}
                        <button
                          onClick={() => handleFilterChange('category', '')}
                          className="ml-2 hover:text-purple-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {(filters.priceRange.min || filters.priceRange.max) && (
                      <Badge variant="outline" className="bg-green-600/20 border-green-600 text-green-400">
                        ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                        <button
                          onClick={() => handleFilterChange('priceRange', { min: '', max: '' })}
                          className="ml-2 hover:text-green-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.rating && (
                      <Badge variant="outline" className="bg-yellow-600/20 border-yellow-600 text-yellow-400">
                        {filters.rating}+ stars
                        <button
                          onClick={() => handleFilterChange('rating', '')}
                          className="ml-2 hover:text-yellow-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.featured && (
                      <Badge variant="outline" className="bg-blue-600/20 border-blue-600 text-blue-400">
                        Featured
                        <button
                          onClick={() => handleFilterChange('featured', false)}
                          className="ml-2 hover:text-blue-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.premium && (
                      <Badge variant="outline" className="bg-indigo-600/20 border-indigo-600 text-indigo-400">
                        Premium
                        <button
                          onClick={() => handleFilterChange('premium', false)}
                          className="ml-2 hover:text-indigo-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.sortBy !== "newest" && (
                      <Badge variant="outline" className="bg-pink-600/20 border-pink-600 text-pink-400">
                        Sort: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
                        <button
                          onClick={() => handleFilterChange('sortBy', 'newest')}
                          className="ml-2 hover:text-pink-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchAndFilter;