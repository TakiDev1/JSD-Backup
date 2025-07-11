import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Upload, 
  X, 
  Star,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  File,
  Save,
  Eye 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function CreateMod() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch available mod locker folders
  const { data: availableFolders = [] } = useQuery<string[]>({
    queryKey: ['/api/admin/mod-locker/folders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/mod-locker/folders', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      return response.json();
    },
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    tags: [] as string[],
    featured: false,
    isSubscriptionOnly: false,
    previewImageUrl: '',
    downloadUrl: '',
    changelog: '',
    requirements: '',
    version: '1.0.0',
    lockerFolder: ''
  });
  
  const [newTag, setNewTag] = useState('');

  const createMod = useMutation({
    mutationFn: (modData: any) => apiRequest('POST', '/api/admin/mods', modData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mods'] });
      toast({
        title: "Success",
        description: "Mod created successfully",
      });
      setLocation('/admin/products/all-mods');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mod",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    const modData = {
      ...formData,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      lockerFolder: formData.lockerFolder === 'default' ? null : formData.lockerFolder,
    };

    createMod.mutate(modData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Create New Mod
            </h1>
            <p className="text-slate-300 text-lg mt-2">
              Add a new mod to your marketplace
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => setLocation('/admin/products/all-mods')}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-green-600 text-white hover:from-purple-700 hover:to-green-700"
              onClick={handleSubmit}
              disabled={createMod.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createMod.isPending ? 'Creating...' : 'Create Mod'}
            </Button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-400" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-300">Mod Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter mod title..."
                      className="bg-slate-700/50 border-slate-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your mod..."
                      rows={4}
                      className="bg-slate-700/50 border-slate-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="text-slate-300">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vehicles">Vehicles</SelectItem>
                        <SelectItem value="drift">Drift Cars</SelectItem>
                        <SelectItem value="sports">Sports Cars</SelectItem>
                        <SelectItem value="trucks">Trucks</SelectItem>
                        <SelectItem value="tracks">Tracks</SelectItem>
                        <SelectItem value="maps">Maps</SelectItem>
                        <SelectItem value="scenarios">Scenarios</SelectItem>
                        <SelectItem value="parts">Parts & Tuning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="version" className="text-slate-300">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => handleInputChange('version', e.target.value)}
                      placeholder="1.0.0"
                      className="bg-slate-700/50 border-slate-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lockerFolder" className="text-slate-300">Mod Locker Folder</Label>
                    <Select value={formData.lockerFolder} onValueChange={(value) => handleInputChange('lockerFolder', value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                        <SelectValue placeholder="Select mod locker folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (No folder)</SelectItem>
                        {availableFolders.map((folder: string) => (
                          <SelectItem key={folder} value={folder}>
                            {folder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400 mt-1">
                      Select which mod folder to distribute when generating IP-locked installers
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing & Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                    Pricing & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-slate-300">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountPrice" className="text-slate-300">Discount Price ($)</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discountPrice}
                        onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                        placeholder="Optional"
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured" className="text-slate-300">Featured Mod</Label>
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleInputChange('featured', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="subscription" className="text-slate-300">Subscription Only</Label>
                      <Switch
                        id="subscription"
                        checked={formData.isSubscriptionOnly}
                        onCheckedChange={(checked) => handleInputChange('isSubscriptionOnly', checked)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="requirements" className="text-slate-300">System Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Minimum system requirements..."
                      rows={3}
                      className="bg-slate-700/50 border-slate-600 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lockerFolder" className="text-slate-300">Mod Locker Folder</Label>
                    <Input
                      id="lockerFolder"
                      value={formData.lockerFolder}
                      onChange={(e) => handleInputChange('lockerFolder', e.target.value)}
                      placeholder="e.g., JSD_IS300, unlocked, my-mod-v2..."
                      className="bg-slate-700/50 border-slate-600 text-white mt-1"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Folder name in the mod locker server (leave empty for default)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-400" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-slate-700 text-slate-200 hover:bg-slate-600"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media & Downloads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-orange-400" />
                  Media & Downloads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="previewImage" className="text-slate-300">Preview Image URL</Label>
                  <Input
                    id="previewImage"
                    value={formData.previewImageUrl}
                    onChange={(e) => handleInputChange('previewImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="downloadUrl" className="text-slate-300">Download URL</Label>
                  <Input
                    id="downloadUrl"
                    value={formData.downloadUrl}
                    onChange={(e) => handleInputChange('downloadUrl', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="changelog" className="text-slate-300">Changelog</Label>
                  <Textarea
                    id="changelog"
                    value={formData.changelog}
                    onChange={(e) => handleInputChange('changelog', e.target.value)}
                    placeholder="What's new in this version..."
                    rows={3}
                    className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </form>
      </div>
    </div>
  );
}