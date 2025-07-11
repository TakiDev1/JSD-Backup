import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  Download, 
  DollarSign,
  X,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const categories = [
  "All Categories",
  "Vehicles",
  "Maps",
  "Mods",
  "Skins",
  "Tools",
  "Scenarios"
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "downloads", label: "Most Downloaded" }
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
  onSearch,
  onReset
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const activeFiltersCount = 
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search mods, vehicles, maps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <div className="relative">
              <Button
                onClick={() => setShowSort(!showSort)}
                variant="outline"
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Sort
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[200px]"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSort(false);
                          onSearch();
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          sortBy === option.value ? 'bg-purple-600/20 text-purple-400' : 'text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button
              onClick={onSearch}
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-700 pt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        className={`${
                          selectedCategory === category
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        }`}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="bg-slate-800/50 border-slate-600 text-white w-20"
                      />
                      <span className="text-slate-400">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="bg-slate-800/50 border-slate-600 text-white w-20"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                        className={`p-1 rounded transition-colors ${
                          rating <= minRating
                            ? "text-yellow-400"
                            : "text-slate-500 hover:text-slate-400"
                        }`}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={onReset}
                    variant="outline"
                    className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-400">Active filters:</span>
                    {selectedCategory !== "All Categories" && (
                      <Badge
                        variant="outline"
                        className="bg-purple-600/20 border-purple-600 text-purple-400"
                      >
                        {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory("All Categories")}
                          className="ml-2 hover:text-purple-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 100) && (
                      <Badge
                        variant="outline"
                        className="bg-green-600/20 border-green-600 text-green-400"
                      >
                        ${priceRange[0]} - ${priceRange[1]}
                        <button
                          onClick={() => setPriceRange([0, 100])}
                          className="ml-2 hover:text-green-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {minRating > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-600/20 border-yellow-600 text-yellow-400"
                      >
                        {minRating}+ stars
                        <button
                          onClick={() => setMinRating(0)}
                          className="ml-2 hover:text-yellow-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;