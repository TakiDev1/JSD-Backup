import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useModLocker } from "@/hooks/use-mods";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Download, Clock, Filter, Search, Info, AlertCircle, Package, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface LockerMod {
  mod: any;
  purchase?: any;
  latestVersion?: any;
  subscription?: boolean;
}

const ModLockerPage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { data, isLoading, error } = useModLocker();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMod, setSelectedMod] = useState<LockerMod | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Filter mods based on search and category
  const filterMods = (mods: LockerMod[]) => {
    return mods.filter(({ mod }) => {
      const matchesSearch = searchTerm === "" || 
        mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === null || mod.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Extract mod data
  const purchasedMods: LockerMod[] = data?.purchasedMods || [];
  const subscriptionMods: LockerMod[] = data?.subscriptionMods || [];
  const hasSubscription = data?.hasSubscription || false;

  // Filter mods
  const filteredPurchasedMods = filterMods(purchasedMods);
  const filteredSubscriptionMods = filterMods(subscriptionMods);

  // Get unique categories
  const categories = [...new Set([
    ...purchasedMods.map(({ mod }) => mod.category),
    ...subscriptionMods.map(({ mod }) => mod.category)
  ])];

  // Show mod details
  const showModDetails = (mod: LockerMod) => {
    setSelectedMod(mod);
    setIsDetailsOpen(true);
  };

  // Handle download
  const handleDownload = (modId: number) => {
    window.location.href = `/api/mods/${modId}/download`;
  };

  // Check if user needs to upgrade for subscription-only mods
  const needsUpgrade = !hasSubscription && subscriptionMods.length > 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-4">
            Error Loading Mod Locker
          </h2>
          <p className="text-neutral-light mb-8">
            There was an error loading your mod locker. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
            My <span className="text-primary">Mod Locker</span>
          </h1>
          <p className="text-neutral-light">
            Manage and download your purchased mods
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center md:w-auto w-full">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral h-4 w-4" />
              <Input
                type="text"
                placeholder="Search mods..."
                className="pl-10 bg-dark-card w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-neutral h-4 w-4" />
            <select
              className="bg-dark-card text-white p-2 rounded-md border border-dark-card focus:border-primary outline-none"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscription Banner */}
      {needsUpgrade && (
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-primary/20 p-3 rounded-full mr-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">
                    Upgrade to Premium
                  </h3>
                  <p className="text-neutral-light">
                    Subscribe to get access to exclusive premium mods and early releases
                  </p>
                </div>
              </div>
              <Button 
                className="bg-secondary hover:bg-secondary-dark text-white"
                onClick={() => navigate("/subscribe")}
              >
                <Clock className="mr-2 h-4 w-4" /> Subscribe Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Tabs defaultValue="purchased" className="w-full">
        <TabsList className="w-full mb-8">
          <TabsTrigger value="purchased" className="flex-1">
            Purchased Mods ({purchasedMods.length})
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex-1">
            Subscription Mods ({subscriptionMods.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchased">
          {filteredPurchasedMods.length === 0 ? (
            <div className="text-center py-12 bg-dark-card rounded-xl">
              {purchasedMods.length === 0 ? (
                <>
                  <AlertCircle className="h-12 w-12 text-neutral mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    No Purchased Mods
                  </h3>
                  <p className="text-neutral-light mb-6">
                    You haven't purchased any mods yet
                  </p>
                  <Button onClick={() => navigate("/mods")}>
                    Browse Mods
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-neutral mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    No Matching Mods
                  </h3>
                  <p className="text-neutral-light mb-6">
                    No mods match your current search or filter
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPurchasedMods.map(({ mod, purchase, latestVersion }) => (
                <Card key={mod.id} className="bg-dark-card hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-48">
                      <img 
                        src={mod.thumbnail} 
                        alt={mod.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-dark-card text-neutral-light">
                          {mod.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-display font-bold text-white mb-2">
                      {mod.title}
                    </CardTitle>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral">Version:</span>
                        <span className="text-white">{latestVersion?.version || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral">Purchased:</span>
                        <span className="text-white">
                          {purchase ? formatDistanceToNow(new Date(purchase.purchaseDate), { addSuffix: true }) : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral">Size:</span>
                        <span className="text-white">
                          {latestVersion ? `${(latestVersion.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => handleDownload(mod.id)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => showModDetails({ mod, purchase, latestVersion })}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="subscription">
          {!hasSubscription ? (
            <div className="text-center py-12 bg-dark-card rounded-xl">
              <Lock className="h-12 w-12 text-neutral mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-white mb-2">
                Premium Subscription Required
              </h3>
              <p className="text-neutral-light mb-6">
                Subscribe to access exclusive premium mods
              </p>
              <Button 
                className="bg-secondary hover:bg-secondary-dark text-white"
                onClick={() => navigate("/subscribe")}
              >
                Subscribe Now
              </Button>
            </div>
          ) : filteredSubscriptionMods.length === 0 ? (
            <div className="text-center py-12 bg-dark-card rounded-xl">
              {subscriptionMods.length === 0 ? (
                <>
                  <AlertCircle className="h-12 w-12 text-neutral mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    No Subscription Mods Available
                  </h3>
                  <p className="text-neutral-light mb-6">
                    There are currently no subscription mods available
                  </p>
                  <Button onClick={() => navigate("/mods")}>
                    Browse Mods
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-neutral mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    No Matching Mods
                  </h3>
                  <p className="text-neutral-light mb-6">
                    No mods match your current search or filter
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptionMods.map(({ mod, latestVersion }) => (
                <Card key={mod.id} className="bg-dark-card hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-48">
                      <img 
                        src={mod.thumbnail} 
                        alt={mod.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-dark-card text-neutral-light">
                          {mod.category}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-secondary text-white">Premium</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-display font-bold text-white mb-2">
                      {mod.title}
                    </CardTitle>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral">Version:</span>
                        <span className="text-white">{latestVersion?.version || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral">Released:</span>
                        <span className="text-white">
                          {latestVersion ? formatDistanceToNow(new Date(latestVersion.releaseDate), { addSuffix: true }) : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral">Size:</span>
                        <span className="text-white">
                          {latestVersion ? `${(latestVersion.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => handleDownload(mod.id)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => showModDetails({ mod, latestVersion, subscription: true })}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mod Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-dark-card max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-white">
              {selectedMod?.mod.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMod && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={selectedMod.mod.thumbnail} 
                  alt={selectedMod.mod.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-white mb-2">
                      Description
                    </h3>
                    <p className="text-neutral-light text-sm">
                      {selectedMod.mod.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-dark text-secondary">{selectedMod.mod.category}</Badge>
                    {selectedMod.mod.tags && selectedMod.mod.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-neutral-light">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-display font-semibold text-white mb-4">
                    Version Information
                  </h3>
                  
                  <div className="bg-dark p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-light flex items-center">
                        <Package className="mr-2 h-4 w-4" /> Version
                      </span>
                      <span className="text-white font-medium">
                        {selectedMod.latestVersion?.version || "N/A"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-light flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> Released
                      </span>
                      <span className="text-white">
                        {selectedMod.latestVersion ? 
                          formatDistanceToNow(new Date(selectedMod.latestVersion.releaseDate), { addSuffix: true }) :
                          "N/A"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-light flex items-center">
                        <Info className="mr-2 h-4 w-4" /> File Size
                      </span>
                      <span className="text-white">
                        {selectedMod.latestVersion ? 
                          `${(selectedMod.latestVersion.fileSize / 1024 / 1024).toFixed(2)} MB` :
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedMod.latestVersion?.changelog && (
                  <div>
                    <h3 className="text-lg font-display font-semibold text-white mb-4">
                      Changelog
                    </h3>
                    <div className="bg-dark p-4 rounded-lg">
                      <p className="text-neutral-light text-sm whitespace-pre-wrap">
                        {selectedMod.latestVersion.changelog}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    onClick={() => handleDownload(selectedMod.mod.id)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Latest Version
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModLockerPage;
