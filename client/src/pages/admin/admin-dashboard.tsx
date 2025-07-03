import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Activity,
  Star,
  TrendingUp,
  Calendar,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  }>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: allUsersResponse } = useQuery<{ users: any[] }>({
    queryKey: ['/api/users'],
  });

  const { data: modsResponse } = useQuery<{ mods: any[] }>({
    queryKey: ['/api/mods'],
  });

  const allMods = modsResponse?.mods || [];
  const allUsers = allUsersResponse?.users || [];

  const { data: recentPurchases } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
  });

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const realStats = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/50 to-blue-800/30 border-blue-500/20",
      change: "+12%"
    },
    {
      title: "Total Mods",
      value: stats?.mods || 0,
      icon: Package,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/50 to-green-800/30 border-green-500/20",
      change: "+8%"
    },
    {
      title: "Total Purchases",
      value: stats?.purchases || 0,
      icon: ShoppingCart,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-900/50 to-purple-800/30 border-purple-500/20",
      change: "+23%"
    },
    {
      title: "Revenue",
      value: `$${stats?.revenue || 0}`,
      icon: DollarSign,
      color: "from-yellow-500 to-orange-500", 
      bgColor: "from-yellow-900/50 to-yellow-800/30 border-yellow-500/20",
      change: "+15%"
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-900/50 to-pink-800/30 border-pink-500/20",
      change: "+5%"
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews || 0,
      icon: Star,
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-indigo-900/50 to-indigo-800/30 border-indigo-500/20",
      change: "-2%"
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-neutral-light">Overview of your platform's performance</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="text-white border-slate-600">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-gradient-to-br ${stat.bgColor} border transition-all duration-300 hover:scale-105`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-200">{stat.title}</CardTitle>
                      <Icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <p className="text-xs text-slate-300">
                        <span className="text-green-400">{stat.change}</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users ({allUsers?.length || 0} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allUsers?.slice(0, 5).map((user: any, i: number) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.username}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.isAdmin ? "default" : "secondary"}>
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-slate-400 text-center py-4">No users found</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Mods */}
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Mods ({allMods?.length || 0} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allMods?.slice(0, 5).map((mod: any, i: number) => (
                    <div key={mod.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {mod.title?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{mod.title}</p>
                          <p className="text-slate-400 text-xs">{mod.category} • ${mod.price}</p>
                        </div>
                      </div>
                      <Badge variant={mod.featured ? "default" : "outline"}>
                        {mod.featured ? "Featured" : "Standard"}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-slate-400 text-center py-4">No mods found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Add Mod</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => window.location.href = '/admin/roles'}>
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Role Management</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
}