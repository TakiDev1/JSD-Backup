import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useModLocker } from "@/hooks/use-mods";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Lock, 
  Download, 
  Clock, 
  Filter, 
  Search, 
  Info, 
  AlertCircle, 
  Package, 
  Calendar,
  Star,
  FileDown,
  Zap,
  Crown,
  Sparkles,
  HardDrive
} from "lucide-react";
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
  const { isAuthenticated, user, isPremium, premiumExpiresAt } = useAuth();
  const { data, isLoading, error } = useModLocker();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMod, setSelectedMod] = useState<LockerMod | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const filterMods = (mods: LockerMod[]) => {
    return mods.filter(({ mod }) => {
      const matchesSearch = searchTerm === "" || 
        mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === null || mod.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const purchasedMods: LockerMod[] = data?.purchasedMods || [];
  const subscriptionMods: LockerMod[] = data?.subscriptionMods || [];
  const hasSubscription = data?.hasSubscription || false;

  const filteredPurchasedMods = filterMods(purchasedMods);
  const filteredSubscriptionMods = filterMods(subscriptionMods);

  const categoriesArray = [
    ...purchasedMods.map(({ mod }) => mod.category),
    ...subscriptionMods.map(({ mod }) => mod.category)
  ];
  const categories = Array.from(new Set(categoriesArray));

  const showModDetails = (mod: LockerMod) => {
    setSelectedMod(mod);
    setIsDetailsOpen(true);
  };

  const handleDownload = (modId: number) => {
    window.location.href = `/api/mods/${modId}/download`;
  };

  const needsUpgrade = !hasSubscription && subscriptionMods.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading your mod collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-slate-300 mb-6">We couldn't load your mod locker. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary-light">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 text-white border border-primary/30 px-6 py-3 text-base font-medium backdrop-blur-sm">
              <Package className="mr-2 h-5 w-5" />
              Your Personal Collection
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Mod
            </span>{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Locker
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Access and manage your premium mod collection with lightning-fast downloads
          </p>

          {isPremium && (
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold">
                <Crown className="mr-2 h-4 w-4" />
                Premium Member {premiumExpiresAt && `until ${new Date(premiumExpiresAt).toLocaleDateString()}`}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-6 mb-12 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search your mods..."
                className="pl-12 bg-slate-800/50 border-slate-600 focus:border-primary text-white placeholder-slate-400 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 h-5 w-5" />
              <select
                className="bg-slate-800/50 border border-slate-600 text-white p-3 rounded-lg focus:border-primary outline-none backdrop-blur-sm"
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
        </motion.div>

        {/* Premium Upgrade Banner */}
        {needsUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-2xl p-8 border border-amber-500/30 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Unlock Premium Mods
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Get access to exclusive premium content and early releases with our subscription
                  </p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg shadow-xl shadow-amber-500/25"
                  onClick={() => navigate("/subscribe")}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="purchased" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-2 rounded-xl mb-8">
            <TabsTrigger 
              value="purchased" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Purchased ({purchasedMods.length})
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-slate-400 font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Crown className="mr-2 h-4 w-4" />
              Premium ({subscriptionMods.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchased">
            {filteredPurchasedMods.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-16 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50"
              >
                {purchasedMods.length === 0 ? (
                  <>
                    <Package className="h-16 w-16 text-slate-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">No Purchased Mods Yet</h3>
                    <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                      Start building your collection by browsing our premium mod selection
                    </p>
                    <Button 
                      onClick={() => navigate("/mods")}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-light hover:to-purple-500 text-white font-semibold px-8 py-3 text-lg shadow-xl shadow-primary/25"
                    >
                      Browse Mods
                    </Button>
                  </>
                ) : (
                  <>
                    <Search className="h-16 w-16 text-slate-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">No Matching Mods</h3>
                    <p className="text-slate-400 text-lg mb-8">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory(null);
                      }}
                      className="border-slate-600 hover:border-primary text-white hover:bg-primary/10"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPurchasedMods.map(({ mod, purchase, latestVersion }, index) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
                      <CardHeader className="p-0">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={mod.thumbnail || "/api/placeholder/400/300"} 
                            alt={mod.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-slate-900/90 backdrop-blur-sm text-white border-0">
                              {mod.category}
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-amber-400 fill-current" />
                                <span className="text-white text-sm font-medium">4.8</span>
                              </div>
                              <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                                <HardDrive className="h-3 w-3 text-slate-300" />
                                <span className="text-white text-xs">
                                  {latestVersion ? `${(latestVersion.fileSize / 1024 / 1024).toFixed(1)}MB` : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                          {mod.title}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Version:</span>
                            <span className="text-white font-medium">{latestVersion?.version || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Purchased:</span>
                            <span className="text-white font-medium">
                              {purchase ? formatDistanceToNow(new Date(purchase.purchaseDate), { addSuffix: true }) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-6 pt-0 flex gap-3">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25"
                          onClick={() => handleDownload(mod.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="border-slate-600 hover:border-primary hover:bg-primary/10 text-white"
                          onClick={() => showModDetails({ mod, purchase, latestVersion })}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="subscription">
            {!hasSubscription ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-16 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/30"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Premium Subscription Required</h3>
                <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
                  Unlock exclusive premium mods and get early access to new releases
                </p>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg shadow-xl shadow-amber-500/25"
                  onClick={() => navigate("/subscribe")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Subscribe Now
                </Button>
              </motion.div>
            ) : filteredSubscriptionMods.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-16 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50"
              >
                {subscriptionMods.length === 0 ? (
                  <>
                    <Crown className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">No Premium Mods Available</h3>
                    <p className="text-slate-400 text-lg mb-8">
                      Premium content will appear here as it becomes available
                    </p>
                    <Button 
                      onClick={() => navigate("/mods")}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-light hover:to-purple-500 text-white font-semibold px-8 py-3 text-lg shadow-xl shadow-primary/25"
                    >
                      Browse All Mods
                    </Button>
                  </>
                ) : (
                  <>
                    <Search className="h-16 w-16 text-slate-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">No Matching Mods</h3>
                    <p className="text-slate-400 text-lg mb-8">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory(null);
                      }}
                      className="border-slate-600 hover:border-primary text-white hover:bg-primary/10"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSubscriptionMods.map(({ mod, latestVersion }, index) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-900/40 backdrop-blur-xl border border-amber-500/30 hover:border-amber-400/50 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden">
                      <CardHeader className="p-0">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={mod.thumbnail || "/api/placeholder/400/300"} 
                            alt={mod.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-slate-900/90 backdrop-blur-sm text-white border-0">
                              {mod.category}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              <Crown className="mr-1 h-3 w-3" />
                              Premium
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-amber-400 fill-current" />
                                <span className="text-white text-sm font-medium">4.9</span>
                              </div>
                              <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                                <HardDrive className="h-3 w-3 text-slate-300" />
                                <span className="text-white text-xs">
                                  {latestVersion ? `${(latestVersion.fileSize / 1024 / 1024).toFixed(1)}MB` : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                          {mod.title}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Version:</span>
                            <span className="text-white font-medium">{latestVersion?.version || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Access:</span>
                            <span className="text-amber-400 font-medium">Premium Only</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-6 pt-0 flex gap-3">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25"
                          onClick={() => handleDownload(mod.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/10 text-white"
                          onClick={() => showModDetails({ mod, latestVersion, subscription: true })}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mod Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedMod?.mod.title}
            </DialogTitle>
          </DialogHeader>
          {selectedMod && (
            <div className="space-y-6">
              <img 
                src={selectedMod.mod.thumbnail || "/api/placeholder/600/300"} 
                alt={selectedMod.mod.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="text-slate-300">{selectedMod.mod.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Category:</span>
                  <span className="text-white ml-2">{selectedMod.mod.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Version:</span>
                  <span className="text-white ml-2">{selectedMod.latestVersion?.version || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400">File Size:</span>
                  <span className="text-white ml-2">
                    {selectedMod.latestVersion ? `${(selectedMod.latestVersion.fileSize / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white ml-2">
                    {selectedMod.subscription ? "Premium" : "Purchased"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                  onClick={() => {
                    handleDownload(selectedMod.mod.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsOpen(false)}
                  className="border-slate-600 hover:border-primary text-white hover:bg-primary/10"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModLockerPage;