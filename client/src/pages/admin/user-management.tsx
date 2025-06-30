import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Users, UserPlus, Shield, Ban, Crown, Mail, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function UserManagement() {
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
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
  const adminUsers = users.filter((user: any) => user.isAdmin);
  const bannedUsers = users.filter((user: any) => user.banned);
  const premiumUsers = users.filter((user: any) => user.stripeCustomerId);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-neutral-light">Manage user accounts and permissions</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Real Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.users || 0}</div>
                  <p className="text-xs text-blue-300">Registered users</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Premium Users</CardTitle>
                  <Crown className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{premiumUsers.length}</div>
                  <p className="text-xs text-purple-300">Stripe customers</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-200">Admins</CardTitle>
                  <Shield className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{adminUsers.length}</div>
                  <p className="text-xs text-green-300">Admin accounts</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-200">Banned Users</CardTitle>
                  <Ban className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{bannedUsers.length}</div>
                  <p className="text-xs text-red-300">Banned accounts</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Real User List */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {user.email || 'No email'}
                        </p>
                        {user.discordUsername && (
                          <p className="text-slate-400 text-xs">Discord: {user.discordUsername}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {user.isAdmin && (
                        <Badge variant="default" className="bg-green-600">
                          Admin
                        </Badge>
                      )}
                      {user.stripeCustomerId && (
                        <Badge variant="secondary" className="bg-purple-600">
                          Premium
                        </Badge>
                      )}
                      {user.banned && (
                        <Badge variant="destructive">
                          Banned
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                )) || (
                  <div className="text-slate-400 text-center py-8">No users found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}