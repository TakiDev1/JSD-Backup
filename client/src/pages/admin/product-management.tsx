import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Package, Plus, Edit, Trash2, Eye, DollarSign, Star, Search, Filter, Upload, Download, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const modFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  discountPrice: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  isSubscriptionOnly: z.boolean().default(false),
  previewImageUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

type ModFormData = z.infer<typeof modFormSchema>;

export default function ProductManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMod, setEditingMod] = useState<any>(null);

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

  const { data: modsResponse, isLoading } = useQuery<{ mods: any[]; pagination: any }>({
    queryKey: ['/api/mods'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/mods");
      return response.json();
    },
  });

  const allMods = modsResponse?.mods || [];

  const form = useForm<ModFormData>({
    resolver: zodResolver(modFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      tags: [],
      featured: false,
      isSubscriptionOnly: false,
    },
  });

  const createModMutation = useMutation({
    mutationFn: async (data: ModFormData) => {
      const response = await apiRequest("POST", "/api/mods", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Mod created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mod",
        variant: "destructive",
      });
    },
  });

  const updateModMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ModFormData> }) => {
      const response = await apiRequest("PATCH", `/api/mods/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setEditingMod(null);
      toast({
        title: "Success",
        description: "Mod updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mod",
        variant: "destructive",
      });
    },
  });

  const deleteModMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/mods/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Mod deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete mod",
        variant: "destructive",
      });
    },
  });

  const handleCreateMod = (data: ModFormData) => {
    createModMutation.mutate(data);
  };

  const handleUpdateMod = (data: ModFormData) => {
    if (editingMod) {
      updateModMutation.mutate({ id: editingMod.id, data });
    }
  };

  const handleDeleteMod = (id: number) => {
    if (confirm("Are you sure you want to delete this mod?")) {
      deleteModMutation.mutate(id);
    }
  };

  const openEditDialog = (mod: any) => {
    setEditingMod(mod);
    form.reset({
      title: mod.title || "",
      description: mod.description || "",
      price: mod.price || 0,
      discountPrice: mod.discountPrice || undefined,
      category: mod.category || "",
      tags: mod.tags || [],
      featured: mod.featured || false,
      isSubscriptionOnly: mod.isSubscriptionOnly || false,
      previewImageUrl: mod.previewImageUrl || "",
      downloadUrl: mod.downloadUrl || "",
    });
  };

  // Filter mods based on search and category
  const filteredMods = allMods.filter((mod: any) => {
    const matchesSearch = mod.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || mod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredMods = allMods.filter((mod: any) => mod.featured);
  const subscriptionMods = allMods.filter((mod: any) => mod.isSubscriptionOnly);
  const categories = Array.from(new Set(allMods.map((mod: any) => mod.category)));

  const ModForm = ({ onSubmit, isEditing }: { onSubmit: (data: ModFormData) => void; isEditing: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Title</FormLabel>
                <FormControl>
                  <Input placeholder="Mod title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="drift">Drift</SelectItem>
                    <SelectItem value="racing">Racing</SelectItem>
                    <SelectItem value="maps">Maps</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Mod description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Discount Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="previewImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Preview Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="downloadUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Download URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-white">Featured</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Display this mod prominently
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isSubscriptionOnly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-white">Premium Only</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Require subscription to access
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={createModMutation.isPending || updateModMutation.isPending}>
            {createModMutation.isPending || updateModMutation.isPending ? "Saving..." : (isEditing ? "Update Mod" : "Create Mod")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6 p-6">
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

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Product Management</h1>
            <p className="text-slate-400">Manage mods, categories, and inventory</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/admin/mods/create")}
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Mod
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Mod</DialogTitle>
                  <DialogDescription>
                    Add a new mod to your marketplace
                  </DialogDescription>
                </DialogHeader>
                <ModForm onSubmit={handleCreateMod} isEditing={false} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
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
                <div className="text-2xl font-bold text-white">{allMods?.length || 0}</div>
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
                <Filter className="h-4 w-4 text-blue-400" />
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

        {/* Search and Filters */}
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Mods ({filteredMods?.length || 0})
              </CardTitle>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search mods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {filteredMods?.map((mod: any) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                >
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
                        <p className="text-slate-500 text-xs truncate max-w-md mt-1">{mod.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {mod.featured && (
                      <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {mod.isSubscriptionOnly && (
                      <Badge variant="secondary" className="bg-purple-600 hover:bg-purple-700">
                        <Eye className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-slate-600">
                      {mod.category}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(mod)}
                        className="hover:bg-blue-600/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMod(mod.id)}
                        className="hover:bg-red-600/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )) || (
                <div className="text-slate-400 text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No mods found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingMod} onOpenChange={() => setEditingMod(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Mod</DialogTitle>
              <DialogDescription>
                Update the details for {editingMod?.title}
              </DialogDescription>
            </DialogHeader>
            <ModForm onSubmit={handleUpdateMod} isEditing={true} />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}