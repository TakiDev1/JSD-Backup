import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Package, 
  CreditCard, 
  Crown, 
  LogOut, 
  Download,
  Calendar,
  Star,
  TrendingUp,
  Shield,
  Mail,
  Eye,
  Edit3,
  Save,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || ""
  });

  // Get user purchases
  const { data: purchasesData } = useQuery({
    queryKey: ['/api/purchases'],
    enabled: isAuthenticated,
  });

  // Get user subscription info
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated,
  });

  const purchases = (purchasesData as any[]) || [];
  const subscription = subscriptionData as any || null;

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSaveProfile = async () => {
    try {
      await apiRequest("PATCH", "/api/profile", editData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const stats = [
    { 
      icon: Package, 
      label: "Mods Owned", 
      value: purchases.length, 
      color: "from-purple-600 to-pink-600" 
    },
    { 
      icon: Download, 
      label: "Total Downloads", 
      value: "1.2K", 
      color: "from-purple-600 to-pink-600" 
    },
    { 
      icon: Star, 
      label: "Reviews Given", 
      value: "23", 
      color: "from-purple-600 to-pink-600" 
    },
    { 
      icon: Calendar, 
      label: "Member Since", 
      value: new Date(user?.createdAt || Date.now()).getFullYear(), 
      color: "from-purple-600 to-pink-600" 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Profile Dashboard
              </h1>
            </div>
            <p className="text-white/70 text-lg">Manage your account and view your activity</p>
          </div>
          
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                onClick={() => navigate("/admin")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                <Crown className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Button>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{user?.username}</CardTitle>
                <CardDescription className="text-white/60">{user?.email}</CardDescription>
                
                <div className="flex justify-center gap-2 mt-3">
                  {isAdmin && (
                    <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {subscription && (
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <nav className="space-y-2">
                  {[
                    { id: "overview", icon: User, label: "Overview" },
                    { id: "purchases", icon: Package, label: "My Purchases" },
                    { id: "subscription", icon: CreditCard, label: "Subscription" },
                    { id: "settings", icon: Settings, label: "Settings" }
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start text-white/70 hover:text-white hover:bg-white/10 ${
                        activeTab === item.id ? "bg-white/10 text-white" : ""
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                  
                  <Separator className="my-4 bg-white/20" />
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">{stat.label}</CardTitle>
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className="h-4 w-4 text-white" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Your latest interactions with the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: "Downloaded Test Mod", date: "2 hours ago", type: "download" },
                        { action: "Added Test Mod to cart", date: "1 day ago", type: "cart" },
                        { action: "Joined JSD Mods", date: "3 weeks ago", type: "join" }
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{activity.action}</p>
                            <p className="text-xs text-white/60">{activity.date}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Purchases Tab */}
              <TabsContent value="purchases" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-400" />
                      My Purchases
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Mods you have purchased and own
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {purchases && purchases.length > 0 ? (
                      <div className="grid gap-4">
                        {purchases.map((purchase: any, index: number) => (
                          <motion.div
                            key={purchase.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{purchase.mod?.title}</h3>
                                <p className="text-white/60 text-sm">Purchased {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-16 h-16 mx-auto mb-4 text-white/30" />
                        <p className="text-white/60">No purchases yet</p>
                        <p className="text-white/40 text-sm mt-1">Browse our mod collection to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      Subscription Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                          <div className="flex items-center gap-3">
                            <Crown className="w-8 h-8 text-purple-400" />
                            <div>
                              <h3 className="text-white font-semibold">Premium Member</h3>
                              <p className="text-white/70 text-sm">Full access to all premium content</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-white/5">
                            <Label className="text-white/70">Next Billing Date</Label>
                            <p className="text-white font-medium">{subscription?.nextBilling ? new Date(subscription.nextBilling).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/5">
                            <Label className="text-white/70">Plan</Label>
                            <p className="text-white font-medium">{subscription?.plan || 'Premium'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Crown className="w-16 h-16 mx-auto mb-4 text-white/30" />
                        <p className="text-white/60 mb-4">No active subscription</p>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Account Settings
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Update your account information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">Profile Information</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                          className="text-white border-white/20 hover:bg-white/10"
                        >
                          {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/70">Username</Label>
                          {isEditing ? (
                            <Input
                              value={editData.username}
                              onChange={(e) => setEditData({...editData, username: e.target.value})}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <div className="p-3 rounded-lg bg-white/5 text-white">{user?.username}</div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white/70">Email</Label>
                          {isEditing ? (
                            <Input
                              value={editData.email}
                              onChange={(e) => setEditData({...editData, email: e.target.value})}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          ) : (
                            <div className="p-3 rounded-lg bg-white/5 text-white">{user?.email}</div>
                          )}
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSaveProfile}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-white/20" />

                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Account Security</h3>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">Password</p>
                            <p className="text-white/60 text-sm">Last updated 30 days ago</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;