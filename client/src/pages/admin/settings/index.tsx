import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Globe, Mail, Shield, Database, Palette, Bell } from 'lucide-react';
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
    maintenanceMode: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    emailNotifications: true,
    autoApproveUsers: false,
    maxFileSize: '50',
    allowedFileTypes: '.zip,.rar,.7z',
  });

  // Update form when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        siteTitle: settings.siteTitle || '',
        siteDescription: settings.siteDescription || '',
        siteName: settings.siteName || '',
        maintenanceMode: settings.maintenanceMode === 'true',
        stripePublicKey: settings.stripePublicKey || '',
        stripeSecretKey: settings.stripeSecretKey || '',
        emailNotifications: settings.emailNotifications !== 'false',
        autoApproveUsers: settings.autoApproveUsers === 'true',
        maxFileSize: settings.maxFileSize || '50',
        allowedFileTypes: settings.allowedFileTypes || '.zip,.rar,.7z',
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      return apiRequest('POST', '/api/admin/settings', newSettings);
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
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-slate-400">Configure site settings and system preferences</p>
        </div>

        <div className="space-y-6">
          {/* Site Configuration */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle" className="text-white">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={formData.siteTitle}
                    onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    placeholder="Enter site title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-white">Site Name</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    placeholder="Enter site name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={formData.siteDescription}
                  onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-white">Maintenance Mode</Label>
                  <p className="text-sm text-slate-400">
                    Enable to show maintenance page to all users except admins
                  </p>
                </div>
                <Switch
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto-approve Users</Label>
                  <p className="text-sm text-slate-400">
                    Automatically approve new user registrations
                  </p>
                </div>
                <Switch
                  checked={formData.autoApproveUsers}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoApproveUsers: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-slate-400">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload Settings */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                File Upload Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize" className="text-white">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={formData.maxFileSize}
                    onChange={(e) => setFormData({ ...formData, maxFileSize: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes" className="text-white">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={formData.allowedFileTypes}
                    onChange={(e) => setFormData({ ...formData, allowedFileTypes: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    placeholder=".zip,.rar,.7z"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stripePublicKey" className="text-white">Stripe Public Key</Label>
                  <Input
                    id="stripePublicKey"
                    type="password"
                    value={formData.stripePublicKey}
                    onChange={(e) => setFormData({ ...formData, stripePublicKey: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    placeholder="pk_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey" className="text-white">Stripe Secret Key</Label>
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={formData.stripeSecretKey}
                    onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    placeholder="sk_..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600"
            >
              {updateSettingsMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
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