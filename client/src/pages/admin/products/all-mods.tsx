import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Package,
  DollarSign,
  Users,
  TrendingUp 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  isSubscriptionOnly: boolean;
  downloads: number;
  rating: number;
  createdAt: string;
  author: {
    username: string;
  };
}

export default function AllMods() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mods, isLoading } = useQuery<Mod[]>({
    queryKey: ['/api/admin/mods'],
  });

  const deleteMod = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/mods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mods'] });
      toast({
        title: "Success",
        description: "Mod deleted successfully",
      });
    },
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

  const filteredMods = mods?.filter(mod => {
    const matchesSearch = mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || mod.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'featured' && mod.featured) ||
                         (statusFilter === 'subscription' && mod.isSubscriptionOnly);
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              All Mods
            </h1>
            <p className="text-slate-300 text-lg mt-2">
              Manage all mods in your marketplace
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white hover:from-purple-700 hover:to-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Mod
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Mods</p>
                  <p className="text-2xl font-bold text-white">{mods?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Featured Mods</p>
                  <p className="text-2xl font-bold text-white">
                    {mods?.filter(m => m.featured).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg. Price</p>
                  <p className="text-2xl font-bold text-white">
                    ${mods?.length ? (mods.reduce((sum, m) => sum + m.price, 0) / mods.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Categories</p>
                  <p className="text-2xl font-bold text-white">
                    {mods ? new Set(mods.map(m => m.category)).size : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search mods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700/50 text-white">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vehicles">Vehicles</SelectItem>
              <SelectItem value="drift">Drift Cars</SelectItem>
              <SelectItem value="sports">Sports Cars</SelectItem>
              <SelectItem value="tracks">Tracks</SelectItem>
              <SelectItem value="maps">Maps</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700/50 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="subscription">Subscription Only</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Mods Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Mods ({filteredMods.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Mod</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Downloads</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMods.map((mod) => (
                      <tr key={mod.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">{mod.title}</div>
                              <div className="text-sm text-slate-400">
                                {mod.description.length > 50 
                                  ? `${mod.description.substring(0, 50)}...` 
                                  : mod.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="capitalize">
                            {mod.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">
                            ${mod.discountPrice || mod.price}
                            {mod.discountPrice && (
                              <span className="text-slate-400 line-through ml-2">${mod.price}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {mod.featured && (
                              <Badge className="bg-yellow-500/20 text-yellow-400">Featured</Badge>
                            )}
                            {mod.isSubscriptionOnly && (
                              <Badge className="bg-purple-500/20 text-purple-400">Subscription</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white">
                          {mod.downloads || 0}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-400 hover:text-yellow-300"
                              onClick={() => toggleFeatured.mutate({ id: mod.id, featured: !mod.featured })}
                            >
                              <Star className={`w-4 h-4 ${mod.featured ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => deleteMod.mutate(mod.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMods.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No mods found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}