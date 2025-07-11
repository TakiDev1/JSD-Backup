import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['/api/admin/settings'],
  });

  const [formData, setFormData] = useState({
    siteTitle: '',
    siteDescription: '',
    siteName: '',
  });

  // Update form when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        siteTitle: settings.siteTitle || '',
        siteDescription: settings.siteDescription || '',
        siteName: settings.siteName || '',
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      // Convert the settings object to key-value pairs for the database
      const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value
      }));
      
      return apiRequest('POST', '/api/admin/settings', { settings: settingsArray });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your changes have been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-1 tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-purple-400" />
              System Settings
            </h1>
            <p className="text-slate-400 text-lg">Configure site settings and system preferences</p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {/* Site Configuration */}
            <Card className="bg-slate-900/70 border-none shadow-xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-400" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <Separator className="bg-slate-700/60 mb-4" />
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle" className="text-white">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={formData.siteTitle}
                    onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                    className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 rounded-xl"
                    placeholder="Enter site title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-white">Site Name</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 rounded-xl"
                    placeholder="Enter site name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={formData.siteDescription}
                    onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                    className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 rounded-xl"
                    placeholder="Enter site description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sticky Save Button */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="px-8 py-4 text-lg font-bold rounded-2xl shadow-xl bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 focus:ring-4 focus:ring-purple-400/40 transition-all duration-200"
            >
              {updateSettingsMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </div>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}