import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Crown,
  Gift,
  Target,
  Sparkles,
  Timer,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/admin/admin-layout';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageCount: number;
  maxUsage?: number;
  type: 'flash' | 'bundle' | 'premium' | 'limited' | 'seasonal';
  createdAt: string;
  updatedAt: string;
}

const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  discount: z.number().min(1).max(99),
  type: z.enum(['flash', 'bundle', 'premium', 'limited', 'seasonal']),
  duration: z.number().min(1).max(168) // Max 1 week
});

type DealFormData = z.infer<typeof dealFormSchema>;

const dealTypeIcons = {
  flash: Zap,
  bundle: Target,
  premium: Crown,
  limited: Timer,
  seasonal: Sparkles
};

const dealTypeColors = {
  flash: 'from-red-600 to-orange-600',
  bundle: 'from-purple-600 to-pink-600',
  premium: 'from-yellow-600 to-orange-600',
  limited: 'from-blue-600 to-indigo-600',
  seasonal: 'from-green-600 to-teal-600'
};

export default function DealsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: '',
      description: '',
      discount: 20,
      type: 'flash',
      duration: 24
    }
  });

  // Fetch deals with proper typing
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/admin/deals'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/deals');
      return await res.json();
    }
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const res = await apiRequest('POST', '/api/admin/deals', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deals'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Deal created",
        description: "New promotional deal has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deal> }) => {
      const res = await apiRequest('PATCH', `/api/admin/deals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deals'] });
      toast({
        title: "Deal updated",
        description: "Deal has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/admin/deals/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deals'] });
      toast({
        title: "Deal deleted",
        description: "Deal has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: DealFormData) => {
    createDealMutation.mutate(data);
  };

  const toggleDealStatus = (deal: Deal) => {
    updateDealMutation.mutate({
      id: deal.id,
      data: { isActive: !deal.isActive }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  // Calculate stats with proper typing
  const activeDeals = Array.isArray(deals) ? deals.filter((deal: Deal) => deal.isActive) : [];
  const totalUsage = Array.isArray(deals) ? deals.reduce((sum: number, deal: Deal) => sum + deal.usageCount, 0) : 0;
  const avgDiscount = Array.isArray(deals) && deals.length > 0 ? deals.reduce((sum: number, deal: Deal) => sum + deal.discount, 0) / deals.length : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Weekend Sales & Deals</h1>
            <p className="text-slate-400 mt-1">Manage promotional campaigns and special offers</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Set up a new promotional deal or special offer
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="⚡ Flash Sale" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Limited time offer - 40% off all mods!" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="99" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="168" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select deal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="flash">⚡ Flash Sale</SelectItem>
                            <SelectItem value="bundle">🎯 Bundle Deal</SelectItem>
                            <SelectItem value="premium">👑 Premium Offer</SelectItem>
                            <SelectItem value="limited">⏱️ Limited Time</SelectItem>
                            <SelectItem value="seasonal">✨ Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createDealMutation.isPending}>
                      {createDealMutation.isPending ? "Creating..." : "Create Deal"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Tag className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Deals</p>
                  <p className="text-2xl font-bold text-white">{Array.isArray(deals) ? deals.length : 0}</p>
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
                  <p className="text-sm text-slate-400">Active Deals</p>
                  <p className="text-2xl font-bold text-white">{activeDeals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Usage</p>
                  <p className="text-2xl font-bold text-white">
                    {totalUsage > 0 ? totalUsage.toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg. Discount</p>
                  <p className="text-2xl font-bold text-white">{avgDiscount.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : !Array.isArray(deals) || deals.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No deals created yet</p>
                <p className="text-sm text-slate-500">Create your first promotional deal to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal: Deal) => {
                  const IconComponent = dealTypeIcons[deal.type as keyof typeof dealTypeIcons];
                  const isExpired = new Date(deal.endDate) < new Date();
                  
                  return (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-slate-600 rounded-lg bg-slate-700/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 bg-gradient-to-r ${dealTypeColors[deal.type as keyof typeof dealTypeColors]} rounded-lg`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-white">{deal.title}</h3>
                            <p className="text-sm text-slate-400">{deal.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {deal.type}
                              </Badge>
                              <Badge variant="secondary">
                                {deal.discount}% OFF
                              </Badge>
                              {deal.usageCount > 0 && (
                                <Badge variant="outline" className="text-blue-400">
                                  {deal.usageCount} uses
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                Ends: {formatDate(deal.endDate)} ({getTimeRemaining(deal.endDate)})
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={deal.isActive && !isExpired}
                            onCheckedChange={() => toggleDealStatus(deal)}
                            disabled={updateDealMutation.isPending || isExpired}
                          />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDealMutation.mutate(deal.id)}
                            disabled={deleteDealMutation.isPending}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}