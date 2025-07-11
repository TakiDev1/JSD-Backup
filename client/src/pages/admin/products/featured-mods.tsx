import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  StarOff 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Mod {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  tags: string[];
  featured: boolean;
  downloads: number;
  rating: number;
  createdAt: string;
}

export default function FeaturedMods() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mods, isLoading } = useQuery<Mod[]>({
    queryKey: ['/api/admin/mods'],
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      apiRequest('PATCH', `/api/admin/mods/${id}`, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mods'] });
      toast({
        title: "Success",
        description: "Mod updated successfully",
      });
    },
  });

  const featuredMods = mods?.filter(mod => mod.featured) || [];
  const filteredMods = featuredMods.filter(mod =>
    mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 bg-clip-text text-transparent">
              Featured Mods
            </h1>
            <p className="text-slate-300 text-lg mt-2">
              Manage featured mods displayed on the homepage
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Featured Mods</p>
                  <p className="text-2xl font-bold text-white">{featuredMods.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg. Rating</p>
                  <p className="text-2xl font-bold text-white">
                    {featuredMods.length ? 
                      (featuredMods.reduce((sum, m) => sum + (m.rating || 4.5), 0) / featuredMods.length).toFixed(1) 
                      : '0.0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Downloads</p>
                  <p className="text-2xl font-bold text-white">
                    {featuredMods.reduce((sum, m) => sum + (m.downloads || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search featured mods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>
        </motion.div>

        {/* Featured Mods Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredMods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMods.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header with Featured Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/20">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-400 hover:text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => toggleFeatured.mutate({ id: mod.id, featured: false })}
                            >
                              <StarOff className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Mod Image */}
                        <div className="w-full h-32 bg-slate-700 rounded-lg flex items-center justify-center">
                          <Package className="w-12 h-12 text-slate-500" />
                        </div>

                        {/* Mod Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white text-lg">{mod.title}</h3>
                          <p className="text-slate-400 text-sm line-clamp-2">
                            {mod.description}
                          </p>
                        </div>

                        {/* Price and Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 font-bold">
                              ${mod.discountPrice || mod.price}
                            </span>
                            {mod.discountPrice && (
                              <span className="text-slate-400 line-through text-sm">
                                ${mod.price}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">
                            {mod.category}
                          </Badge>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {mod.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-slate-700 text-slate-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {mod.tags.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-slate-700 text-slate-300"
                            >
                              +{mod.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span>{mod.downloads || 0} downloads</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{mod.rating || 4.5}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Featured Mods</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm 
                    ? "No featured mods match your search criteria" 
                    : "You haven't featured any mods yet"}
                </p>
                {!searchTerm && (
                  <p className="text-slate-500 text-sm">
                    Go to "All Mods" to feature some mods and showcase them on your homepage
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}