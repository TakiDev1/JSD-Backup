import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, DollarSign, Download, Eye, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AdminAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-neutral-light">Comprehensive analytics and insights</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="text-white border-slate-600">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 text-white">
                Export Report
              </Button>
            </div>
          </div>

          {/* Real Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${stats?.revenue || 0}</div>
                  <p className="text-xs text-purple-300">Real revenue data</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-200">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.users || 0}</div>
                  <p className="text-xs text-green-300">Registered users</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">Total Mods</CardTitle>
                  <Eye className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.mods || 0}</div>
                  <p className="text-xs text-blue-300">Published mods</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-200">Total Purchases</CardTitle>
                  <Download className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.purchases || 0}</div>
                  <p className="text-xs text-orange-300">Total sales</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-pink-200">Active Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-pink-300">Recently active</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border-indigo-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-200">Pending Reviews</CardTitle>
                  <BarChart3 className="h-4 w-4 text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.pendingReviews || 0}</div>
                  <p className="text-xs text-indigo-300">Need attention</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Growth Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p>Revenue charts coming soon</p>
                    <p className="text-sm">Current revenue: ${stats?.revenue || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p>User growth charts coming soon</p>
                    <p className="text-sm">Total users: {stats?.users || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}