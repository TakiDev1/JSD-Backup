import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/admin/admin-layout';

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: purchases, isLoading } = useQuery<any[]>({
    queryKey: ['/api/purchases'],
  });

  const { data: stats } = useQuery<{
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  }>({
    queryKey: ['/api/admin/stats'],
  });

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
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const orders = purchases || [];
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.mod?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/50 to-blue-800/30 border-blue-500/20",
      change: "+12%"
    },
    {
      title: "Completed Orders",
      value: orders.filter((o: any) => o.status === 'completed').length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/50 to-green-800/30 border-green-500/20",
      change: "+8%"
    },
    {
      title: "Pending Orders",
      value: orders.filter((o: any) => o.status === 'pending').length,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-900/50 to-yellow-800/30 border-yellow-500/20",
      change: "-5%"
    },
    {
      title: "Total Revenue",
      value: `$${stats?.revenue || 0}`,
      icon: RefreshCw,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-900/50 to-purple-800/30 border-purple-500/20",
      change: "+15%"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/20 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20';
      case 'failed': return 'bg-red-900/20 text-red-400 border-red-500/20';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-slate-400">Track and manage customer orders and transactions</p>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {orderStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={`bg-gradient-to-r ${stat.bgColor} border backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm font-medium mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-green-400 mt-1">{stat.change} vs last month</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">All Orders</SelectItem>
                    <SelectItem value="completed" className="text-white hover:bg-slate-700">Completed</SelectItem>
                    <SelectItem value="pending" className="text-white hover:bg-slate-700">Pending</SelectItem>
                    <SelectItem value="failed" className="text-white hover:bg-slate-700">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-white font-medium">#{order.id}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{order.mod?.title || 'Unknown Product'}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(order.purchaseDate).toLocaleDateString()} • 
                          Transaction: {order.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status}
                      </Badge>
                      <span className="text-white font-bold">${order.price}</span>
                      <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}