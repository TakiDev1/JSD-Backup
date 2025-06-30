import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

export default function OrderManagement() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Order Management</h1>
              <p className="text-neutral-light">Manage orders, payments, and transactions</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
              Export Orders
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-200">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <p className="text-xs text-green-300">+15% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,187</div>
                  <p className="text-xs text-blue-300">96.2% success rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-200">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">32</div>
                  <p className="text-xs text-orange-300">Awaiting processing</p>
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
                  <CardTitle className="text-sm font-medium text-red-200">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">15</div>
                  <p className="text-xs text-red-300">Needs attention</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Orders List */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "#ORD-001", customer: "John Doe", items: "Drift King GT86", amount: "$15.99", status: "Completed" },
                  { id: "#ORD-002", customer: "Jane Smith", items: "Speed Demon McLaren", amount: "$24.99", status: "Pending" },
                  { id: "#ORD-003", customer: "Mike Johnson", items: "Off-Road Beast", amount: "$19.99", status: "Completed" },
                  { id: "#ORD-004", customer: "Sarah Wilson", items: "Classic Muscle Car", amount: "$12.99", status: "Failed" },
                  { id: "#ORD-005", customer: "Tom Brown", items: "Rally Champion", amount: "$18.99", status: "Completed" }
                ].map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {order.id.slice(-3)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{order.customer}</p>
                        <p className="text-slate-400 text-sm">{order.items} • {order.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        order.status === "Completed" ? "default" : 
                        order.status === "Pending" ? "secondary" : "destructive"
                      }>
                        {order.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}