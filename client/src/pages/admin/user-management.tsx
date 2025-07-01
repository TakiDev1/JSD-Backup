import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Users, UserPlus, Shield, Ban, Crown, Mail, Calendar, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email?: string;
  isAdmin: boolean;
  isBanned: boolean;
  stripeCustomerId?: string;
  createdAt: string;
  lastLogin?: string;
  discordId?: string;
}

interface EditUserData {
  username?: string;
  email?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
}

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditUserData>({});
  const usersPerPage = 9;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: allUsers, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EditUserData }) => {
      return apiRequest('PATCH', `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      setEditingUser(null);
      setEditFormData({});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user information.",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email || '',
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
    });
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({ id: editingUser.id, data: editFormData });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 pb-8">
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

  const users = allUsers || [];
  const adminUsers = users.filter((user) => user.isAdmin);
  const bannedUsers = users.filter((user) => user.isBanned);
  const premiumUsers = users.filter((user) => user.stripeCustomerId);

  // Pagination logic
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-neutral-light">Manage user accounts and permissions</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-200">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats?.users || users.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-200">Admin Users</p>
                      <p className="text-2xl font-bold text-white">{adminUsers.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-200">Banned Users</p>
                      <p className="text-2xl font-bold text-white">{bannedUsers.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <Ban className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-200">Premium Users</p>
                      <p className="text-2xl font-bold text-white">{premiumUsers.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Users Grid with Pagination */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({users.length})
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {currentUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{user.username}</h3>
                        {user.email && (
                          <p className="text-sm text-slate-400 truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {user.isAdmin && (
                        <Badge className="bg-green-600 text-white text-xs">Admin</Badge>
                      )}
                      {user.stripeCustomerId && (
                        <Badge className="bg-yellow-600 text-white text-xs">Premium</Badge>
                      )}
                      {user.isBanned && (
                        <Badge className="bg-red-600 text-white text-xs">Banned</Badge>
                      )}
                      {user.discordId && (
                        <Badge className="bg-blue-600 text-white text-xs">Discord</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-white border-slate-600 hover:bg-slate-700 h-7 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit User: {editingUser?.username}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="username" className="text-white">Username</Label>
                              <Input
                                id="username"
                                value={editFormData.username || ''}
                                onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                                className="bg-slate-800 border-slate-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email" className="text-white">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                className="bg-slate-800 border-slate-600 text-white"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isAdmin"
                                checked={editFormData.isAdmin || false}
                                onCheckedChange={(checked) => setEditFormData({...editFormData, isAdmin: checked})}
                              />
                              <Label htmlFor="isAdmin" className="text-white">Admin Status</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="isBanned"
                                checked={editFormData.isBanned || false}
                                onCheckedChange={(checked) => setEditFormData({...editFormData, isBanned: checked})}
                              />
                              <Label htmlFor="isBanned" className="text-white">Banned Status</Label>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                                className="text-white border-slate-600 hover:bg-slate-700"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveUser}
                                disabled={updateUserMutation.isPending}
                                className="bg-gradient-to-r from-purple-600 to-green-600 text-white"
                              >
                                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={
                        currentPage === page
                          ? "bg-gradient-to-r from-purple-600 to-green-600 text-white"
                          : "text-white border-slate-600 hover:bg-slate-700"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-white border-slate-600 hover:bg-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}