import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, ShoppingCart, CreditCard, Calendar, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/admin/admin-layout';

export default function SalesReport() {
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const salesData = [
    {
      title: "Total Revenue",
      value: `$${stats?.revenue || 0}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/50 to-green-800/30 border-green-500/20",
      change: "+15%"
    },
    {
      title: "Total Orders",
      value: stats?.purchases || 0,
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/50 to-blue-800/30 border-blue-500/20",
      change: "+8%"
    },
    {
      title: "Average Order Value",
      value: `$${stats?.purchases > 0 ? ((stats?.revenue || 0) / stats.purchases).toFixed(2) : '0'}`,
      icon: CreditCard,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-900/50 to-purple-800/30 border-purple-500/20",
      change: "+12%"
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Sales Report</h1>
          <p className="text-slate-400">Track your sales performance and revenue metrics</p>
        </div>

        {/* Sales Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {salesData.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className={`bg-gradient-to-r ${metric.bgColor} border backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm font-medium mb-1">{metric.title}</p>
                      <p className="text-3xl font-bold text-white">{metric.value}</p>
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

        {/* Sales Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sales chart would be displayed here</p>
                  <p className="text-sm">Integration with chart library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Revenue growth chart would be displayed here</p>
                  <p className="text-sm">Integration with chart library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases && purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.slice(0, 10).map((purchase: any) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Purchase #{purchase.id}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${purchase.amount}</p>
                      <p className="text-slate-400 text-sm">User ID: {purchase.userId}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No purchases found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}