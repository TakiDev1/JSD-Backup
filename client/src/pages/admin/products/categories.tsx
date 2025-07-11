import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  Tag,
  TrendingUp,
  BarChart3 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CategoryData {
  category: string;
  count: number;
  totalRevenue: number;
  averagePrice: number;
}

const PREDEFINED_CATEGORIES = [
  { name: 'vehicles', label: 'Vehicles', description: 'Complete vehicle modifications', color: 'bg-blue-500' },
  { name: 'drift', label: 'Drift Cars', description: 'Cars optimized for drifting', color: 'bg-purple-500' },
  { name: 'sports', label: 'Sports Cars', description: 'High-performance sports cars', color: 'bg-red-500' },
  { name: 'trucks', label: 'Trucks', description: 'Heavy-duty trucks and commercial vehicles', color: 'bg-green-500' },
  { name: 'tracks', label: 'Tracks', description: 'Racing tracks and circuits', color: 'bg-orange-500' },
  { name: 'maps', label: 'Maps', description: 'Open world maps and environments', color: 'bg-teal-500' },
  { name: 'scenarios', label: 'Scenarios', description: 'Custom scenarios and challenges', color: 'bg-yellow-500' },
  { name: 'parts', label: 'Parts & Tuning', description: 'Individual parts and tuning components', color: 'bg-pink-500' },
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mods, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/mods'],
  });

  // Calculate category statistics
  const categoryStats: CategoryData[] = PREDEFINED_CATEGORIES.map(category => {
    const categoryMods = mods?.filter(mod => mod.category === category.name) || [];
    const totalRevenue = categoryMods.reduce((sum, mod) => sum + (mod.price * (mod.downloads || 0)), 0);
    const averagePrice = categoryMods.length > 0 
      ? categoryMods.reduce((sum, mod) => sum + mod.price, 0) / categoryMods.length 
      : 0;

    return {
      category: category.name,
      count: categoryMods.length,
      totalRevenue,
      averagePrice,
    };
  });

  const filteredCategories = PREDEFINED_CATEGORIES.filter(category =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Mod Categories
            </h1>
            <p className="text-slate-300 text-lg mt-2">
              Manage mod categories and view category statistics
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white hover:from-purple-700 hover:to-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Categories</p>
                  <p className="text-2xl font-bold text-white">{PREDEFINED_CATEGORIES.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-green-400" />
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
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Most Popular</p>
                  <p className="text-2xl font-bold text-white">
                    {categoryStats.length > 0 
                      ? categoryStats.reduce((max, cat) => cat.count > max.count ? cat : max).category 
                      : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg. Mods per Category</p>
                  <p className="text-2xl font-bold text-white">
                    {mods?.length && PREDEFINED_CATEGORIES.length 
                      ? Math.round(mods.length / PREDEFINED_CATEGORIES.length) 
                      : 0}
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
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => {
              const stats = categoryStats.find(s => s.category === category.name);
              
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl hover:bg-slate-700/50 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Category Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                            <h3 className="font-semibold text-white text-lg">{category.label}</h3>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-400 text-sm">{category.description}</p>

                        {/* Stats */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Mods</span>
                            <Badge variant="outline" className="text-white">
                              {stats?.count || 0}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Avg. Price</span>
                            <span className="text-green-400 font-medium">
                              ${stats?.averagePrice?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Revenue</span>
                            <span className="text-green-400 font-medium">
                              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Usage</span>
                            <span>{((stats?.count || 0) / Math.max(mods?.length || 1, 1) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
                              style={{ 
                                width: `${Math.min(((stats?.count || 0) / Math.max(mods?.length || 1, 1) * 100), 100)}%` 
                              }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            View Mods
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Management Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Category Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Plus className="w-6 h-6" />
                  <span>Add New Category</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Edit className="w-6 h-6" />
                  <span>Edit Categories</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>Category Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}