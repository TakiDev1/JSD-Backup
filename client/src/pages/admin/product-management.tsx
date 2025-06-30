import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Package, Plus, Edit, Trash2, Eye, DollarSign, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ProductManagement() {
  const { data: stats } = useQuery<{
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  }>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: modsResponse, isLoading } = useQuery<{ mods: any[] }>({
    queryKey: ['/api/mods'],
  });

  const allMods = modsResponse?.mods || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const featuredMods = allMods.filter((mod: any) => mod.featured);
  const subscriptionMods = allMods.filter((mod: any) => mod.isSubscriptionOnly);
  const categories = Array.from(new Set(allMods.map((mod: any) => mod.category)));

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Product Management</h1>
              <p className="text-neutral-light">Manage mods, categories, and inventory</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Mod
            </Button>
          </div>

          {/* Real Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Total Mods</CardTitle>
                  <Package className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.mods || 0}</div>
                  <p className="text-xs text-purple-300">Published mods</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-200">Featured</CardTitle>
                  <Star className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{featuredMods.length}</div>
                  <p className="text-xs text-green-300">Featured mods</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Categories</CardTitle>
                  <Package className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{categories.length}</div>
                  <p className="text-xs text-blue-300">Active categories</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-200">Premium Only</CardTitle>
                  <Eye className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{subscriptionMods.length}</div>
                  <p className="text-xs text-orange-300">Subscription mods</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Real Mod List */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                All Mods ({allMods?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allMods?.map((mod: any) => (
                  <div key={mod.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {mod.title?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{mod.title}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                          {mod.category} • 
                          <DollarSign className="w-3 h-3" />
                          ${mod.price}
                          {mod.discountPrice && (
                            <span className="text-green-400">
                              (${mod.discountPrice} sale)
                            </span>
                          )}
                        </p>
                        {mod.description && (
                          <p className="text-slate-500 text-xs truncate max-w-md">{mod.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {mod.featured && (
                        <Badge variant="default" className="bg-yellow-600">
                          Featured
                        </Badge>
                      )}
                      {mod.isSubscriptionOnly && (
                        <Badge variant="secondary" className="bg-purple-600">
                          Premium
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {mod.category}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-slate-400 text-center py-8">No mods found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}