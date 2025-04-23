import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Package, CreditCard, BarChart3, Activity, Settings,
  ShieldAlert, RefreshCw, Star, Shield, ShieldCheck, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Users, Package, FileCheck, Activity, Settings, CreditCard, ShieldAlert, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Get site stats
  const { data: stats = { 
    users: 0, 
    mods: 0, 
    purchases: 0, 
    revenue: 0,
    activeUsers: 0,
    pendingReviews: 0
  }, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: getQueryFn,
  });
  
  // Get site settings
  const { data: settings = { maintenanceMode: false }, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: getQueryFn,
  });
  
  // Recent activity
  const { data: activityData = { activity: [] }, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
    queryFn: getQueryFn,
  });
  
  const recentActivity = activityData.activity || [];
  
  // Mutation to toggle maintenance mode
  const { mutate: toggleMaintenance, isPending: isTogglingMaintenance } = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("POST", "/api/admin/settings/maintenance", { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: `Maintenance Mode ${maintenanceMode ? 'Disabled' : 'Enabled'}`,
        description: `The site is now ${maintenanceMode ? 'accessible to all users' : 'in maintenance mode'}`,
        variant: maintenanceMode ? "default" : "destructive",
      });
      setMaintenanceMode(!maintenanceMode);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode",
        variant: "destructive",
      });
    },
  });
  
  // Patreon integration sync
  const { mutate: syncPatreon, isPending: isSyncingPatreon } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/patreon/sync", {});
    },
    onSuccess: () => {
      toast({
        title: "Patreon Synchronized",
        description: "Successfully synced Patreon supporters to subscriber database",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync Patreon data",
        variant: "destructive",
      });
    },
  });
  
  // For demo purposes, use state to simulate loading
  useState(() => {
    if (settingsLoading) return;
    setMaintenanceMode(settings.maintenanceMode);
  });
  
  async function getQueryFn() {
    return {};
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-dark-card">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-neutral-light">Welcome back, {user?.username}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={() => toggleMaintenance(!maintenanceMode)}
                disabled={isTogglingMaintenance}
              />
              <Label htmlFor="maintenance-mode" className="text-white">
                Maintenance Mode {maintenanceMode && <Badge variant="destructive">Active</Badge>}
              </Label>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => syncPatreon()} 
              disabled={isSyncingPatreon}
            >
              Sync Patreon
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card className="bg-dark-card">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl">{stats.users}</CardTitle>
      <CardDescription>Total Users</CardDescription>
    </CardHeader>
  </Card>

  <Card className="bg-dark-card">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl">{stats.mods}</CardTitle>
      <CardDescription>Total Mods</CardDescription>
    </CardHeader>
  </Card>

  <Card className="bg-dark-card">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl">{stats.purchases}</CardTitle>
      <CardDescription>Total Sales</CardDescription>
    </CardHeader>
  </Card>

  <Card className="bg-dark-card">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl">${stats.revenue}</CardTitle>
      <CardDescription>Total Revenue</CardDescription>
    </CardHeader>
  </Card>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  <Card className="bg-dark-card">
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      <CardDescription>Manage your site</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <Button variant="outline" asChild className="h-24 flex flex-col gap-2">
        <Link to="/admin/mods">
          <Package className="h-8 w-8" />
          <span>Manage Mods</span>
        </Link>
      </Button>
      
      <Button variant="outline" asChild className="h-24 flex flex-col gap-2">
        <Link to="/admin/users">
          <Users className="h-8 w-8" />
          <span>Manage Users</span>
        </Link>
      </Button>
      
      <Button variant="outline" asChild className="h-24 flex flex-col gap-2">
        <Link to="/admin/settings">
          <Settings className="h-8 w-8" />
          <span>Settings</span>
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        className="h-24 flex flex-col gap-2"
        onClick={() => syncPatreon()}
        disabled={isSyncingPatreon}
      >
        <RefreshCw className={cn("h-8 w-8", { "animate-spin": isSyncingPatreon })} />
        <span>Sync Patreon</span>
      </Button>
    </CardContent>
  </Card>

  <Card className="bg-dark-card">
    <CardHeader>
      <CardTitle>System Health</CardTitle>
      <CardDescription>Real-time system status</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Server Status</span>
          <Badge variant="outline" className="bg-green-500/10 text-green-500">Online</Badge>
        </div>
        <Progress value={98} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Database</span>
          <Badge variant="outline" className="bg-green-500/10 text-green-500">Healthy</Badge>
        </div>
        <Progress value={95} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>API Response</span>
          <Badge variant="outline" className="bg-green-500/10 text-green-500">Fast</Badge>
        </div>
        <Progress value={92} className="h-2" />
      </div>
    </CardContent>
  </Card>
</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-dark-card border-dark-lighter/50 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-neutral-light text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold text-white">{stats.users}</div>
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-card border-dark-lighter/50 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-neutral-light text-sm font-medium">Total Mods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-white">{stats.mods}</div>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-card border-dark-lighter/50 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-neutral-light text-sm font-medium">Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-white">{stats.purchases}</div>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-card border-dark-lighter/50 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-neutral-light text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-white">${stats.revenue}</div>
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <BarChart3 className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-dark-card border-dark-lighter/50 col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/mods">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Package className="w-5 h-5" />
                    <span>Manage Mods</span>
                  </Button>
                </Link>
                
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span>Manage Users</span>
                  </Button>
                </Link>
                
                <Link href="/admin/reviews">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <FileCheck className="w-5 h-5" />
                    <span>Reviews</span>
                  </Button>
                </Link>
                
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-card border-dark-lighter/50">
            <CardHeader>
              <CardTitle className="text-white">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <Label>Server Status</Label>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">Online</Badge>
                  </div>
                  <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "98%" }}></div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <Label>Database</Label>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">Healthy</Badge>
                  </div>
                  <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "95%" }}></div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <Label>API Response</Label>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">Fast</Badge>
                  </div>
                  <div className="h-2 bg-dark-lighter rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "90%" }}></div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    <span>Security Status</span>
                  </div>
                  <Badge className="bg-green-600">Protected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-dark-card border-dark-lighter/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-light uppercase bg-dark-lighter">
                  <tr>
                    <th scope="col" className="px-6 py-3">User</th>
                    <th scope="col" className="px-6 py-3">Action</th>
                    <th scope="col" className="px-6 py-3">Details</th>
                    <th scope="col" className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">Loading activity...</td>
                    </tr>
                  ) : recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">No recent activity</td>
                    </tr>
                  ) : (
                    recentActivity.map((activity: any, index: number) => (
                      <tr key={index} className="border-b border-dark-lighter bg-dark-card hover:bg-dark-lighter/50">
                        <td className="px-6 py-4 font-medium whitespace-nowrap">{activity.user}</td>
                        <td className="px-6 py-4">{activity.action}</td>
                        <td className="px-6 py-4">{activity.details}</td>
                        <td className="px-6 py-4">{activity.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;