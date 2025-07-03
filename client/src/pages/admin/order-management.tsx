import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, DollarSign, User, Calendar, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/admin-layout";

interface Order {
  id: number;
  userId: number;
  modId: number;
  price: number;
  purchaseDate: string;
  transactionId: string;
  customerIpAddress: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  mod: {
    id: number;
    title: string;
  };
}

export default function OrderManagement() {
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <p className="text-red-400">Error loading orders: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-slate-300 text-lg">
            Track all customer orders with IP information
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{orders?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${orders?.reduce((sum, order) => sum + order.price, 0).toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Unique Customers</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(orders?.map(order => order.userId)).size || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Monitor className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Tracked IPs</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(orders?.map(order => order.customerIpAddress).filter(Boolean)).size || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-400" />
                All Orders
              </CardTitle>
              <CardDescription className="text-slate-400">
                Complete order history with customer IP tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-slate-300 font-medium">Order ID</th>
                        <th className="text-left p-3 text-slate-300 font-medium">Customer</th>
                        <th className="text-left p-3 text-slate-300 font-medium">Mod</th>
                        <th className="text-left p-3 text-slate-300 font-medium">Price</th>
                        <th className="text-left p-3 text-slate-300 font-medium">Date</th>
                        <th className="text-left p-3 text-slate-300 font-medium">IP Address</th>
                        <th className="text-left p-3 text-slate-300 font-medium">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="p-3">
                            <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                              #{order.id}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <p className="text-white font-medium">{order.user?.username || 'Unknown'}</p>
                              <p className="text-slate-400 text-sm">{order.user?.email || 'No email'}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-white">{order.mod?.title || 'Unknown Mod'}</p>
                          </td>
                          <td className="p-3">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              ${order.price.toFixed(2)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">
                                {new Date(order.purchaseDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-orange-400" />
                              <span className="text-orange-400 font-mono text-sm">
                                {order.customerIpAddress || 'Not tracked'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-400 font-mono text-xs">
                              {order.transactionId?.substring(0, 16)}...
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400 text-lg">No orders found</p>
                  <p className="text-slate-500 text-sm">Orders will appear here once customers make purchases</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}