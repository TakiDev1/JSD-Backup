import { useState, useEffect } from "react";
import { useModsList } from "@/hooks/use-mods";
import ModCard from "@/components/mods/mod-card";
import SearchAndFilter from "@/components/search/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ChevronRight, ChevronLeft, Filter, X } from "lucide-react";
import { Mod } from "@shared/schema";
import { useLocation } from "wouter";
import { FloatingDealNotification, StickyDealBanner } from "@/components/shared/sales-banner";
import { Badge } from "@/components/ui/badge";

const ModsPage = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFloatingDeal, setShowFloatingDeal] = useState(false);
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    category: "",
    priceRange: { min: "", max: "" },
    sortBy: "newest",
    rating: "",
    featured: false,
    premium: false
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("search")) setSearchTerm(params.get("search") || "");
    if (params.has("page")) setCurrentPage(parseInt(params.get("page") || "1"));
    if (params.has("category")) setFilters(prev => ({ ...prev, category: params.get("category") || "" }));
    if (params.has("sortBy")) setFilters(prev => ({ ...prev, sortBy: params.get("sortBy") || "newest" }));
    if (params.has("featured")) setFilters(prev => ({ ...prev, featured: params.get("featured") === "true" }));
    if (params.has("premium")) setFilters(prev => ({ ...prev, premium: params.get("premium") === "true" }));
  }, []);

  // Show floating deals very rarely while browsing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.8) { // Only 20% chance for initial
        setShowFloatingDeal(true);
      }
    }, 60000); // Wait 1 minute
    
    const interval = setInterval(() => {
      if (Math.random() > 0.9) { // Only 10% chance to show
        setShowFloatingDeal(true);
      }
    }, Math.random() * 180000 + 120000); // Every 2-5 minutes

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Get mods from API with enhanced filtering
  const { data, isLoading, error } = useModsList({
    search: searchTerm,
    category: filters.category,
    sortBy: filters.sortBy,
    minPrice: filters.priceRange.min ? parseFloat(filters.priceRange.min) : undefined,
    maxPrice: filters.priceRange.max ? parseFloat(filters.priceRange.max) : undefined,
    minRating: filters.rating ? parseFloat(filters.rating) : undefined,
    featured: filters.featured || undefined,
    premium: filters.premium || undefined,
    limit: 12,
    page: currentPage,
  });

  const mods: Mod[] = data?.mods || [];
  const pagination = data?.pagination || { total: 0, pageSize: 12, currentPage: 1, totalPages: 0 };

  // Handle search and filter changes
  const handleSearch = (searchData: any) => {
    setSearchTerm(searchData.query);
    setFilters(searchData.filters);
    setCurrentPage(1);
    setTimeout(updateUrl, 0);
  };

  // Update URL with current filters
  const updateUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (currentPage > 1) params.append("page", currentPage.toString());
    if (filters.category) params.append("category", filters.category);
    if (filters.sortBy !== "newest") params.append("sortBy", filters.sortBy);
    if (filters.featured) params.append("featured", "true");
    if (filters.premium) params.append("premium", "true");
    
    setLocation(`/mods?${params.toString()}`);
  };

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setTimeout(updateUrl, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      priceRange: { min: "", max: "" },
      sortBy: "newest",
      rating: "",
      featured: false,
      premium: false
    });
    setCurrentPage(1);
    setLocation("/mods");
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filters.category || filters.featured || filters.premium || 
    filters.rating || filters.priceRange.min || filters.priceRange.max || filters.sortBy !== "newest";

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Browse <span className="text-primary">Mods</span>
        </h1>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-slate-600 hover:border-primary text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-primary text-white">
                {[searchTerm, filters.category, filters.featured && "Featured", filters.premium && "Premium"]
                  .filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Component */}
      <SearchAndFilter
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onSearch={handleSearch}
        initialQuery={searchTerm}
        initialFilters={filters}
      />

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="outline" className="bg-slate-800 text-white border-slate-600">
              Search: {searchTerm}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTimeout(updateUrl, 0);
                }}
                className="ml-2 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.category && (
            <Badge variant="outline" className="bg-slate-800 text-white border-slate-600">
              Category: {filters.category}
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: "" }));
                  setTimeout(updateUrl, 0);
                }}
                className="ml-2 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.featured && (
            <Badge variant="outline" className="bg-slate-800 text-white border-slate-600">
              Featured Only
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, featured: false }));
                  setTimeout(updateUrl, 0);
                }}
                className="ml-2 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.premium && (
            <Badge variant="outline" className="bg-slate-800 text-white border-slate-600">
              Premium Only
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, premium: false }));
                  setTimeout(updateUrl, 0);
                }}
                className="ml-2 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.sortBy !== "newest" && (
            <Badge variant="outline" className="bg-slate-800 text-white border-slate-600">
              Sort: {filters.sortBy}
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, sortBy: "newest" }));
                  setTimeout(updateUrl, 0);
                }}
                className="ml-2 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && (
        <div className="mb-6 text-slate-400">
          {pagination.total > 0 ? (
            <p>
              Showing {((currentPage - 1) * pagination.pageSize) + 1}-{Math.min(currentPage * pagination.pageSize, pagination.total)} of {pagination.total} mods
            </p>
          ) : (
            <p>No mods found</p>
          )}
        </div>
      )}

      <div className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-dark-card rounded-xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading mods. Please try again.</p>
          </div>
        ) : mods.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              {hasActiveFilters ? "No Matching Mods Found" : "No Mods Available Yet"}
            </h2>
            <p className="text-neutral-light mb-6">
              {hasActiveFilters 
                ? "Try adjusting your search criteria or clear some filters." 
                : "Stay tuned for upcoming mods!"
              }
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-slate-600 hover:border-primary text-white"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Deal Notification */}
      <FloatingDealNotification
        onClose={() => setShowFloatingDeal(false)}
      />
    </div>
  );
};

export default ModsPage;

interface FloatingDealProps {
  onClose: () => void;
}

function FloatingDeal({ onClose }: FloatingDealProps) {
  // ...existing code...
}
