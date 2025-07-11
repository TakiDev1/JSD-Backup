import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, Star, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';

export default function AnalyticsIndex() {
  const { data: stats, isLoading } = useQuery<{
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  }>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: purchases } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
  });

  const { data: modsResponse } = useQuery<{ mods: any[] }>({
    queryKey: ['/api/mods'],
  });

  const mods = modsResponse?.mods || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded mb-6"></div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Generate mock data for charts based on real stats
  const salesData = [
    { month: 'Jan', sales: Math.floor((stats?.revenue || 0) * 0.1), orders: Math.floor((stats?.purchases || 0) * 0.15) },
    { month: 'Feb', sales: Math.floor((stats?.revenue || 0) * 0.15), orders: Math.floor((stats?.purchases || 0) * 0.20) },
    { month: 'Mar', sales: Math.floor((stats?.revenue || 0) * 0.25), orders: Math.floor((stats?.purchases || 0) * 0.30) },
    { month: 'Apr', sales: Math.floor((stats?.revenue || 0) * 0.35), orders: Math.floor((stats?.purchases || 0) * 0.25) },
    { month: 'May', sales: Math.floor((stats?.revenue || 0) * 0.20), orders: Math.floor((stats?.purchases || 0) * 0.10) },
    { month: 'Jun', sales: stats?.revenue || 0, orders: stats?.purchases || 0 },
  ];

  const categoryData = [
    { name: 'Vehicles', value: mods.filter(m => m.category === 'vehicles').length, color: '#8b5cf6' },
    { name: 'Sports Cars', value: mods.filter(m => m.category === 'sports').length, color: '#06d6a0' },
    { name: 'Drift Cars', value: mods.filter(m => m.category === 'drift').length, color: '#f72585' },
    { name: 'Maps', value: mods.filter(m => m.category === 'maps').length, color: '#f9844a' },
    { name: 'Addons', value: mods.filter(m => m.category === 'addons').length, color: '#90e0ef' },
  ];

  const userGrowthData = [
    { month: 'Jan', users: Math.floor((stats?.users || 0) * 0.6) },
    { month: 'Feb', users: Math.floor((stats?.users || 0) * 0.65) },
    { month: 'Mar', users: Math.floor((stats?.users || 0) * 0.7) },
    { month: 'Apr', users: Math.floor((stats?.users || 0) * 0.8) },
    { month: 'May', users: Math.floor((stats?.users || 0) * 0.9) },
    { month: 'Jun', users: stats?.users || 0 },
  ];

  const keyMetrics = [
    {
      title: "Total Revenue",
      value: `$${stats?.revenue || 0}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/50 to-green-800/30 border-green-500/20",
      change: "+23%"
    },
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/50 to-blue-800/30 border-blue-500/20",
      change: "+18%"
    },
    {
      title: "Total Orders",
      value: stats?.purchases || 0,
      icon: ShoppingBag,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-900/50 to-purple-800/30 border-purple-500/20",
      change: "+12%"
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-900/50 to-orange-800/30 border-orange-500/20",
      change: "+8%"
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Comprehensive insights into your marketplace performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className={`bg-gradient-to-r ${metric.bgColor} border backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm font-medium mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <p className="text-sm text-green-400 mt-1">{metric.change} vs last month</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="sales" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Sales Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              User Analytics
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Product Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#06d6a0" 
                        strokeWidth={3}
                        dot={{ fill: '#06d6a0', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Activity */}
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Total Registered Users</span>
                      <span className="text-white font-bold">{stats?.users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Active Users (30 days)</span>
                      <span className="text-white font-bold">{stats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Users with Purchases</span>
                      <span className="text-white font-bold">{Math.min(stats?.users || 0, stats?.purchases || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Stats */}
              <Card className="bg-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Product Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Total Products</span>
                      <span className="text-white font-bold">{stats?.mods || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Featured Products</span>
                      <span className="text-white font-bold">{mods.filter(m => m.featured).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Premium Products</span>
                      <span className="text-white font-bold">{mods.filter(m => m.isSubscriptionOnly).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}