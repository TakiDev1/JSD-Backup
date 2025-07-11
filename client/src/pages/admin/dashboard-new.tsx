import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Package, ShoppingCart, DollarSign, Activity, TrendingUp, Eye, Download, Bell, Settings, BarChart3, CreditCard, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/admin-layout";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type Stats = {
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  };

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.isAdmin,
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ['/api/admin/settings'],
    enabled: !!user && user.isAdmin,
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: async (maintenanceMode: boolean) => {
      const settingsArray = [{
        key: 'maintenanceMode',
        value: maintenanceMode.toString()
      }];
      return apiRequest('POST', '/api/admin/settings', { settings: settingsArray });
    },
    onSuccess: () => {
      toast({
        title: "Maintenance Mode Updated",
        description: "The maintenance mode setting has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance mode",
        variant: "destructive",
      });
    }
  });

  const handleMaintenanceToggle = (checked: boolean) => {
    updateMaintenanceMutation.mutate(checked);
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-96 flex items-center justify-center">
          <Card className="w-96 bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
      change: "+12%",
      changeColor: "text-green-600"
    },
    {
      title: "Total Mods",
      value: stats?.mods || 0,
      icon: Package,
      gradient: "from-green-500 to-green-600",
      change: "+8%",
      changeColor: "text-green-600"
    },
    {
      title: "Total Purchases",
      value: stats?.purchases || 0,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-blue-600",
      change: "+23%",
      changeColor: "text-green-600"
    },
    {
      title: "Revenue",
      value: `$${(stats?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-yellow-500 to-yellow-600",
      change: "+15%",
      changeColor: "text-green-600"
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: Activity,
      gradient: "from-pink-500 to-pink-600",
      change: "+5%",
      changeColor: "text-green-600"
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews || 0,
      icon: Eye,
      gradient: "from-indigo-500 to-indigo-600",
      change: "-2%",
      changeColor: "text-red-600"
    }
  ];

  const quickActions = [
    { 
      title: "Manage Users", 
      description: "View and manage user accounts", 
      href: "/admin/users", 
      icon: Users,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    { 
      title: "Manage Mods", 
      description: "Add, edit, or remove mods", 
      href: "/admin/mods", 
      icon: Package,
      color: "bg-green-500 hover:bg-green-600"
    },
    { 
      title: "Analytics", 
      description: "View detailed analytics", 
      href: "/admin/analytics", 
      icon: BarChart3,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    { 
      title: "Site Settings", 
      description: "Configure site settings", 
      href: "/admin/settings", 
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600"
    },
    { 
      title: "Send Notifications", 
      description: "Send email notifications to users", 
      href: "/admin/notifications", 
      icon: Bell,
      color: "bg-orange-500 hover:bg-orange-600"
    },
    { 
      title: "Payment Settings", 
      description: "Configure payment options", 
      href: "/admin/payments/settings", 
      icon: CreditCard,
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    { 
      title: "Order Management", 
      description: "View and manage orders", 
      href: "/admin/orders", 
      icon: ShoppingCart,
      color: "bg-teal-500 hover:bg-teal-600"
    },
    { 
      title: "Database Management", 
      description: "Backup and manage database", 
      href: "/admin/database/backup", 
      icon: Download,
      color: "bg-red-500 hover:bg-red-600"
    }
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user.username}. Here's what's happening with your site.
        </p>
      </motion.div>

      {/* Maintenance Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Label className="text-lg font-semibold text-gray-900">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">
                    Enable to show maintenance page to all users except admins
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.maintenanceMode === 'true'}
                onCheckedChange={handleMaintenanceToggle}
                disabled={updateMaintenanceMutation.isPending}
              />
            </div>
            {settings?.maintenanceMode === 'true' && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ Maintenance mode is currently enabled. Regular users will see a maintenance page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative group"
          >
            <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <span className={`text-xs font-medium ${stat.changeColor}`}>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Link to={action.href}>
                <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer group h-full shadow-lg hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Maintenance Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-bold text-gray-900">
              Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Toggle maintenance mode for the site.
                </p>
              </div>
              <div>
                <Label className="mr-2" htmlFor="maintenance-mode">
                  {settings?.maintenanceMode === 'true' ? 'Enabled' : 'Disabled'}
                </Label>
                <Switch
                  id="maintenance-mode"
                  checked={settings?.maintenanceMode === 'true'}
                  onCheckedChange={handleMaintenanceToggle}
                  className="bg-gray-200 border-transparent rounded-full relative inline-flex items-center h-6 w-11 focus:outline-none"
                >
                  <span className="sr-only">Enable maintenance mode</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      settings?.maintenanceMode === 'true' ? 'translate-x-6' : 'translate-x-1'
                    } pointer-events-none inline-block w-4 h-4 rounded-full bg-white shadow ring-0 transition-transform duration-200`}
                  />
                </Switch>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}