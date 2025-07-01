import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { FileText, Save, Eye, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LegalTerms() {
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  // Update form data when settings load
  React.useEffect(() => {
    if (settings) {
      setTermsContent((settings as any).termsOfService || "");
      setPrivacyContent((settings as any).privacyPolicy || "");
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      return apiRequest('POST', '/api/admin/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Settings Updated",
        description: "Legal documents have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update legal documents.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTerms = () => {
    updateSettingsMutation.mutate({ key: 'termsOfService', value: termsContent });
  };

  const handleSavePrivacy = () => {
    updateSettingsMutation.mutate({ key: 'privacyPolicy', value: privacyContent });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 gap-6 mb-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-96 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Legal Documents</h1>
              <p className="text-neutral-light">Manage terms of service and privacy policy</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
                <Globe className="h-4 w-4 mr-2" />
                View Live Site
              </Button>
            </div>
          </div>

          {/* Terms of Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Terms of Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="terms" className="text-white mb-2 block">
                      Terms of Service Content
                    </Label>
                    <textarea
                      id="terms"
                      value={termsContent}
                      onChange={(e) => setTermsContent(e.target.value)}
                      placeholder="Enter your terms of service content here..."
                      className="w-full h-64 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveTerms}
                      disabled={updateSettingsMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-green-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Terms'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="privacy" className="text-white mb-2 block">
                      Privacy Policy Content
                    </Label>
                    <textarea
                      id="privacy"
                      value={privacyContent}
                      onChange={(e) => setPrivacyContent(e.target.value)}
                      placeholder="Enter your privacy policy content here..."
                      className="w-full h-64 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePrivacy}
                      disabled={updateSettingsMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-green-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Privacy Policy'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Generate Template</span>
                    <span className="text-xs text-slate-400">Create standard legal templates</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Eye className="h-6 w-6" />
                    <span>Preview Changes</span>
                    <span className="text-xs text-slate-400">See how changes will appear</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Globe className="h-6 w-6" />
                    <span>Legal Compliance</span>
                    <span className="text-xs text-slate-400">Check compliance guidelines</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}