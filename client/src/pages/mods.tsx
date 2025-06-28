import { useState, useEffect } from "react";
import { useModsList } from "@/hooks/use-mods";
import ModCard from "@/components/mods/mod-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Mod } from "@shared/schema";
import { useLocation } from "wouter";
import { FloatingDealNotification, StickyDealBanner } from "@/components/shared/sales-banner";

const ModsPage = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFloatingDeal, setShowFloatingDeal] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("search")) setSearchTerm(params.get("search") || "");
    if (params.has("page")) setCurrentPage(parseInt(params.get("page") || "1"));
  }, []);

  // Show floating deals while browsing
  useEffect(() => {
    const timer = setTimeout(() => setShowFloatingDeal(true), 15000);
    
    const interval = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance to show
        setShowFloatingDeal(true);
      }
    }, Math.random() * 60000 + 30000); // Every 30-90 seconds

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Get mods from API - removed filters
  const { data, isLoading, error } = useModsList({
    search: searchTerm,
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

  // Update URL with current filters - simplified
  const updateUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (currentPage > 1) params.append("page", currentPage.toString());
    
    setLocation(`/mods?${params.toString()}`);
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
            <h2 className="text-2xl font-display font-bold text-white mb-4">No Mods Available Yet</h2>
            <p className="text-neutral-light">Stay tuned for upcoming mods!</p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                  setTimeout(() => setLocation("/mods"), 0);
                }}
              >
                Clear Search
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
    </div>
  );
};

export default ModsPage;
