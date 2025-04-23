import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useModsList } from "@/hooks/use-mods";
import ModCard from "@/components/mods/mod-card";
import ModFilters from "@/components/mods/mod-filters";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ChevronRight, ChevronLeft, Search, Filter } from "lucide-react";
import { MOD_CATEGORIES } from "@/lib/constants";
import { Mod } from "@shared/schema";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ModsPage = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);
  const [subscription, setSubscription] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("category")) setCategory(params.get("category") || undefined);
    if (params.has("search")) setSearchTerm(params.get("search") || "");
    if (params.has("featured")) setFeatured(params.get("featured") === "true");
    if (params.has("subscription")) setSubscription(params.get("subscription") === "true");
    if (params.has("page")) setCurrentPage(parseInt(params.get("page") || "1"));
  }, []);

  // Get mods from API
  const { data, isLoading, error } = useModsList({
    category,
    search: searchTerm,
    featured,
    subscription,
    limit: 12,
    page: currentPage,
  });

  const mods: Mod[] = data?.mods || [];
  const pagination = data?.pagination || { total: 0, pageSize: 12, currentPage: 1, totalPages: 0 };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrl();
  };

  // Update URL with current filters
  const updateUrl = () => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (searchTerm) params.append("search", searchTerm);
    if (featured !== undefined) params.append("featured", featured.toString());
    if (subscription !== undefined) params.append("subscription", subscription.toString());
    if (currentPage > 1) params.append("page", currentPage.toString());
    
    setLocation(`/mods?${params.toString()}`);
  };

  // Apply filters
  const applyFilters = (newCategory?: string, newFeatured?: boolean, newSubscription?: boolean) => {
    if (newCategory !== undefined) setCategory(newCategory);
    if (newFeatured !== undefined) setFeatured(newFeatured);
    if (newSubscription !== undefined) setSubscription(newSubscription);
    setCurrentPage(1);
    setIsFilterOpen(false);
    
    // Use setTimeout to ensure state updates before updating URL
    setTimeout(updateUrl, 0);
  };

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setTimeout(updateUrl, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Browse <span className="text-primary">Mods</span>
        </h1>
        
        <div className="flex items-center space-x-3">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-dark-lighter p-6">
              <h3 className="text-xl font-display font-semibold mb-6">Filters</h3>
              <ModFilters
                categories={MOD_CATEGORIES}
                selectedCategory={category}
                featured={featured}
                subscription={subscription}
                onApplyFilters={applyFilters}
                className="flex flex-col"
              />
            </SheetContent>
          </Sheet>

          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search mods..."
              className="bg-dark-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 lg:w-1/5 hidden md:block">
          <ModFilters
            categories={MOD_CATEGORIES}
            selectedCategory={category}
            featured={featured}
            subscription={subscription}
            onApplyFilters={applyFilters}
          />
        </div>

        <div className="w-full md:w-3/4 lg:w-4/5">
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
              <h2 className="text-2xl font-display font-bold text-white mb-4">No Mods Available Yet</h2>
              <p className="text-neutral-light">Stay tuned for upcoming mods!</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setCategory(undefined);
                  setFeatured(undefined);
                  setSubscription(undefined);
                  setSearchTerm("");
                  setCurrentPage(1);
                  setTimeout(updateUrl, 0);
                }}
              >
                Clear Filters
              </Button>
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
      </div>
    </div>
  );
};

export default ModsPage;
