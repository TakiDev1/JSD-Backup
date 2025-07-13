import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  Calendar,
  Download,
  RefreshCw,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/admin-layout';

interface AdminStats {
  users: number;
  mods: number;
  purchases: number;
  revenue: number;
  activeUsers: number;
  pendingReviews: number;
}

export default function UsersAnalytics() {
  const { data: stats = {} as AdminStats, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/stats');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const userMetrics = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/50 to-blue-800/30 border-blue-500/20",
      change: "+12%"
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/50 to-green-800/30 border-green-500/20",
      change: "+8%"
    },
    {
      title: "New Users This Month",
      value: "23",
      icon: UserPlus,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-900/50 to-purple-800/30 border-purple-500/20",
      change: "+18%"
    },
    {
      title: "User Retention",
      value: "85%",
      icon: UserMinus,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-900/50 to-orange-800/30 border-orange-500/20",
      change: "+5%"
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">User Analytics</h1>
          <p className="text-slate-400">Monitor user engagement and growth patterns</p>
        </div>

        {/* User Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userMetrics.map((metric, index) => {
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

        {/* User Growth Chart Placeholder */}
        <Card className="bg-slate-900/80 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>User growth chart would be displayed here</p>
                <p className="text-sm">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}