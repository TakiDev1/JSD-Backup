import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart,
  Loader2,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Layers,
  MessageSquare
} from "lucide-react";

const AdminDashboard = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else if (!isAdmin) {
      navigate("/profile");
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <Card className="bg-dark-card">
          <CardContent className="flex flex-col items-center pt-6">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">
              Checking permissions...
            </h3>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/5">
          <Card className="bg-dark-card sticky top-24">
            <CardHeader>
              <CardTitle className="font-display text-white flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-primary/20 hover:bg-primary/30 text-primary"
                >
                  <BarChart className="mr-2 h-4 w-4" /> 
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/mods")}
                >
                  <Package className="mr-2 h-4 w-4" /> 
                  Manage Mods
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin/users")}
                >
                  <Users className="mr-2 h-4 w-4" /> 
                  Manage Users
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-4/5">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
            Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-dark-card border-violet-500/20 hover:border-violet-500/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-light text-sm">Total Mods</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">42</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Package className="h-6 w-6 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-card border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-light text-sm">Total Users</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">158</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-card border-green-500/20 hover:border-green-500/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-light text-sm">Revenue</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">$5,248</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-card border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-light text-sm">Active Subscribers</p>
                    <h3 className="text-2xl font-display font-bold text-white mt-1">32</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="revenue">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="mods">Mod Performance</TabsTrigger>
              <TabsTrigger value="users">User Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-dark-card md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Revenue Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border border-dashed border-neutral-light/20 rounded-md">
                      <p className="text-neutral-light">Chart displaying monthly revenue would appear here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                          <span className="text-neutral-light">One-time purchases</span>
                        </div>
                        <span className="text-white font-semibold">68%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
                          <span className="text-neutral-light">Subscriptions</span>
                        </div>
                        <span className="text-white font-semibold">32%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="mods">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Top Selling Mods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-dark-lighter rounded-md mr-3 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-primary/60 to-primary/20"></div>
                          </div>
                          <span className="text-white">Offroad Monster Truck Pack</span>
                        </div>
                        <span className="text-white font-semibold">84 sales</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-dark-lighter rounded-md mr-3 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-blue-500/60 to-blue-500/20"></div>
                          </div>
                          <span className="text-white">Drift Tuning Kit</span>
                        </div>
                        <span className="text-white font-semibold">76 sales</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-dark-lighter rounded-md mr-3 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-yellow-500/60 to-yellow-500/20"></div>
                          </div>
                          <span className="text-white">Realistic Racing Physics</span>
                        </div>
                        <span className="text-white font-semibold">65 sales</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Most Downloaded Mods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-dark-lighter rounded-md mr-3 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-green-500/60 to-green-500/20"></div>
                          </div>
                          <span className="text-white">Ultra Graphics Enhancement</span>
                        </div>
                        <span className="text-white font-semibold">210 downloads</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-dark-lighter rounded-md mr-3 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/60 to-purple-500/20"></div>
                          </div>
                          <span className="text-white">Offroad Monster Truck Pack</span>
                        </div>
                        <span className="text-white font-semibold">198 downloads</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-dark-lighter rounded-md mr-3 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-red-500/60 to-red-500/20"></div>
                          </div>
                          <span className="text-white">Advanced Weather System</span>
                        </div>
                        <span className="text-white font-semibold">184 downloads</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      New Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-display font-bold text-white text-center mt-6">
                      24
                    </div>
                    <p className="text-neutral-light text-center text-sm mt-2">
                      New users this week
                    </p>
                    <div className="flex items-center justify-center mt-4">
                      <div className="text-green-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="ml-1">16%</span>
                      </div>
                      <span className="text-neutral-light text-sm ml-2">vs last week</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-display font-bold text-white text-center mt-6">
                      78
                    </div>
                    <p className="text-neutral-light text-center text-sm mt-2">
                      Active users today
                    </p>
                    <div className="flex items-center justify-center mt-4">
                      <div className="text-green-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="ml-1">8%</span>
                      </div>
                      <span className="text-neutral-light text-sm ml-2">vs yesterday</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Conversion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-display font-bold text-white text-center mt-6">
                      5.4%
                    </div>
                    <p className="text-neutral-light text-center text-sm mt-2">
                      Visitors who make a purchase
                    </p>
                    <div className="flex items-center justify-center mt-4">
                      <div className="text-red-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="ml-1">2%</span>
                      </div>
                      <span className="text-neutral-light text-sm ml-2">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;