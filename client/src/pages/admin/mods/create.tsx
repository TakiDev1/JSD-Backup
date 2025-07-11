import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackagePlus, Upload, DollarSign, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/admin-layout';

export default function CreateMod() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    features: '',
    downloadUrl: '',
    previewImageUrl: '',
    isFeatured: false,
    isSubscriptionOnly: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = [
    'vehicles', 'sports-cars', 'drift-cars', 'racing-cars', 'trucks', 
    'maps', 'parts', 'sounds', 'visual', 'gameplay'
  ];

  const createModMutation = useMutation({
    mutationFn: async (modData: any) => {
      return apiRequest('POST', '/api/admin/mods', modData);
    },
    onSuccess: () => {
      toast({
        title: "Mod Created",
        description: "New mod has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mods'] });
      setFormData({
        title: '', description: '', price: '', category: '', tags: '',
        features: '', downloadUrl: '', previewImageUrl: '', 
        isFeatured: false, isSubscriptionOnly: false
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mod",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const processedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      features: formData.features.split(',').map(feature => feature.trim()).filter(Boolean),
    };
    createModMutation.mutate(processedData);
    setIsLoading(false);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Mod</h1>
          <p className="text-slate-400">Add a new mod to the marketplace</p>
        </div>

        <Card className="bg-slate-900/80 border-slate-700 max-w-4xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              Mod Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter mod title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter mod description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previewImageUrl" className="text-white">Preview Image URL</Label>
                  <Input
                    id="previewImageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.previewImageUrl}
                    onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downloadUrl" className="text-white">Download URL</Label>
                <div className="relative">
                  <Upload className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="downloadUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/..."
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    type="text"
                    placeholder="car, racing, sports"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features" className="text-white">Features (comma separated)</Label>
                  <Input
                    id="features"
                    type="text"
                    placeholder="High quality, Custom sounds"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                  />
                  <Label htmlFor="isFeatured" className="text-white flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Featured mod
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSubscriptionOnly"
                    checked={formData.isSubscriptionOnly}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSubscriptionOnly: checked as boolean })}
                  />
                  <Label htmlFor="isSubscriptionOnly" className="text-white">
                    Subscription only
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || createModMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600"
              >
                {isLoading || createModMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating Mod...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <PackagePlus className="h-4 w-4" />
                    Create Mod
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}