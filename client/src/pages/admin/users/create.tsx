import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Mail, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/admin-layout';

export default function CreateUser() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('POST', '/api/admin/users', userData);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setFormData({ username: '', email: '', password: '', isAdmin: false });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    createUserMutation.mutate(formData);
    setIsLoading(false);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create New User</h1>
          <p className="text-slate-400">Add a new user to the system</p>
        </div>

        <Card className="bg-slate-900/80 border-slate-700 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked as boolean })}
                />
                <Label htmlFor="isAdmin" className="text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Grant admin privileges
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || createUserMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600"
              >
                {isLoading || createUserMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating User...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create User
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