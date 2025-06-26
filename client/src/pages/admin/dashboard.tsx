import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  MessageSquare, 
  Settings, 
  Activity,
  Mail,
  Shield,
  Crown,
  Zap,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Get site stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && isAdmin,
  });
  
  const stats = {
    users: (statsData as any)?.users || 0,
    mods: (statsData as any)?.mods || 0,
    purchases: (statsData as any)?.purchases || 0,
    revenue: (statsData as any)?.revenue || 0,
    activeUsers: (statsData as any)?.activeUsers || 0,
    pendingReviews: (statsData as any)?.pendingReviews || 0
  };
  
  // Get site settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: !!user && isAdmin,
  });
  
  const settings = {
    maintenanceMode: (settingsData as any)?.maintenanceMode === 'true' || false
  };
  
  // Recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
    enabled: !!user && isAdmin,
  });
  
  const recentActivity = (activityData as any)?.activity || [];
  
  // Mutation to toggle maintenance mode
  const { mutate: toggleMaintenance, isPending: isTogglingMaintenance } = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiRequest("POST", "/api/admin/settings", {
        key: "maintenanceMode",
        value: enabled.toString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Settings Updated",
        description: `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update maintenance mode",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <CardTitle className="text-white text-2xl">Access Denied</CardTitle>
              <CardDescription className="text-white/70">
                You don't have permission to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link href="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/30 to-black">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-purple-500/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-white/70 text-lg">Manage your JSD Mods platform with advanced controls</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Label htmlFor="maintenance-mode" className="text-sm font-medium text-white">
                Maintenance Mode
              </Label>
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={(checked) => {
                  setMaintenanceMode(checked);
                  toggleMaintenance(checked);
                }}
                disabled={isTogglingMaintenance}
              />
            </div>
            
            <Badge 
              variant={maintenanceMode ? "destructive" : "secondary"}
              className={`px-3 py-1 ${
                maintenanceMode 
                  ? "bg-red-500/20 text-red-300 border-red-500/30" 
                  : "bg-green-500/20 text-green-300 border-green-500/30"
              }`}
            >
              {maintenanceMode ? "Maintenance" : "Live"}
            </Badge>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            { 
              title: "Total Users", 
              value: stats.users, 
              change: "+12% from last month", 
              icon: Users, 
              color: "from-purple-600 to-purple-700",
              delay: 0.1
            },
            { 
              title: "Total Mods", 
              value: stats.mods, 
              change: "+3 new this week", 
              icon: Package, 
              color: "from-green-600 to-green-700",
              delay: 0.2
            },
            { 
              title: "Total Revenue", 
              value: `$${stats.revenue}`, 
              change: "+25% from last month", 
              icon: DollarSign, 
              color: "from-purple-600 to-purple-700",
              delay: 0.3
            },
            { 
              title: "Total Purchases", 
              value: stats.purchases, 
              change: "+18% conversion rate", 
              icon: TrendingUp, 
              color: "from-green-600 to-green-700",
              delay: 0.4
            },
            { 
              title: "Active Users", 
              value: stats.activeUsers, 
              change: "Last 30 days", 
              icon: UserCheck, 
              color: "from-purple-600 to-purple-700",
              delay: 0.5
            },
            { 
              title: "Pending Reviews", 
              value: stats.pendingReviews, 
              change: "Requires attention", 
              icon: MessageSquare, 
              color: "from-green-600 to-green-700",
              delay: 0.6
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/80">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-xs text-white/60">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-1 lg:col-span-2"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-white/70">
                  Manage your platform with these essential tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { href: "/admin/mods", icon: Package, label: "Manage Mods", color: "from-purple-600 to-purple-700" },
                    { href: "/admin/users", icon: Users, label: "Manage Users", color: "from-green-600 to-green-700" },
                    { href: "/admin/notifications", icon: Mail, label: "Notifications", color: "from-purple-600 to-purple-700" },
                    { href: "/admin/settings", icon: Settings, label: "Settings", color: "from-green-600 to-green-700" }
                  ].map((action, index) => (
                    <Link key={action.href} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.color} p-4 h-24 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25`}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                          <action.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-sm font-medium text-center">{action.label}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-white/70">
                  Latest actions on your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors duration-200"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-purple-400 rounded-full animate-pulse"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-white/60 truncate">
                            {activity.details}
                          </p>
                        </div>
                        <div className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                        <Activity className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="text-sm text-white/60">No recent activity</p>
                      <p className="text-xs text-white/40 mt-1">Activity will appear here as users interact with your platform</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;