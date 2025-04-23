import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useModLocker } from "@/hooks/use-mods";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { LogOut, Download, ShoppingBag, CreditCard, User, Settings, Star, Clock, Package } from "lucide-react";

const ProfilePage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  // Get user's purchases and mod locker data
  const { data: lockerData } = useModLocker();
  
  // Get recent purchases
  const recentPurchases = lockerData?.purchasedMods?.slice(0, 5) || [];
  
  // Get active subscription
  const hasSubscription = lockerData?.hasSubscription || false;
  
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <Card className="bg-dark-card">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-display font-bold text-white mb-2">
                Please log in to view your profile
              </h3>
              <Button onClick={() => navigate("/")} className="mt-4">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3">
            <Card className="bg-dark-card sticky top-24">
              <CardHeader className="pb-0">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.discordAvatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png` : undefined} />
                    <AvatarFallback className="text-2xl bg-primary text-white">
                      {user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-center text-2xl font-display text-white">
                  {user.username}
                </CardTitle>
                <div className="flex justify-center mt-2 mb-4">
                  {isAdmin ? (
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Admin</Badge>
                  ) : hasSubscription ? (
                    <Badge className="bg-secondary/20 text-secondary border-secondary/30">Premium Subscriber</Badge>
                  ) : (
                    <Badge className="bg-primary/20 text-primary border-primary/30">Member</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="my-4" />
                
                <nav className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("overview")}
                  >
                    <User className="mr-2 h-4 w-4" /> 
                    Overview
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate("/mod-locker")}
                  >
                    <Download className="mr-2 h-4 w-4" /> 
                    Mod Locker
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("purchases")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> 
                    Purchase History
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("subscription")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> 
                    Subscription
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" /> 
                    Settings
                  </Button>
                  
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => navigate("/admin")}
                    >
                      <i className="fas fa-crown mr-2 text-yellow-500"></i>
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> 
                    Logout
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-8">
                  <Card className="bg-dark-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-display text-white">
                        Account Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-neutral-light text-sm">Username</h4>
                            <p className="text-white">{user.username}</p>
                          </div>
                          <div>
                            <h4 className="text-neutral-light text-sm">Email</h4>
                            <p className="text-white">{user.email || "No email provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-neutral-light text-sm">Discord ID</h4>
                            <p className="text-white">{user.discordId || "Not connected"}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-neutral-light text-sm">Account Created</h4>
                            <p className="text-white">
                              {user.createdAt 
                                ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
                                : "Unknown"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-neutral-light text-sm">Last Login</h4>
                            <p className="text-white">
                              {user.lastLogin 
                                ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                                : "Unknown"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-neutral-light text-sm">Subscription Status</h4>
                            <p className="text-white flex items-center">
                              {hasSubscription ? (
                                <>
                                  <span className="bg-green-500 h-2 w-2 rounded-full mr-2"></span>
                                  Active Premium
                                </>
                              ) : (
                                <>
                                  <span className="bg-neutral h-2 w-2 rounded-full mr-2"></span>
                                  No Active Subscription
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-dark-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-display text-white">
                        Recent Purchases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentPurchases.length > 0 ? (
                        <div className="space-y-4">
                          {recentPurchases.map(({ mod, purchase }) => (
                            <div key={purchase.id} className="flex items-center">
                              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-4">
                                <img 
                                  src={mod.thumbnail} 
                                  alt={mod.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">
                                  {mod.title}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-dark text-secondary text-xs">
                                    {mod.category}
                                  </Badge>
                                  <span className="text-neutral text-xs ml-2">
                                    Purchased {formatDistanceToNow(new Date(purchase.purchaseDate), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span className="text-white font-semibold">
                                  ${purchase.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          <div className="pt-4 text-center">
                            <Button 
                              variant="outline"
                              onClick={() => setActiveTab("purchases")}
                            >
                              View All Purchases
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="h-8 w-8 text-neutral" />
                          </div>
                          <h3 className="text-lg font-display font-semibold text-white mb-2">
                            No Purchases Yet
                          </h3>
                          <p className="text-neutral-light mb-6">
                            You haven't made any purchases yet
                          </p>
                          <Button onClick={() => navigate("/mods")}>
                            Browse Mods
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="purchases">
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Purchase History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentPurchases.length > 0 ? (
                      <div className="space-y-6">
                        {recentPurchases.map(({ mod, purchase }) => (
                          <div key={purchase.id} className="bg-dark-lighter p-4 rounded-lg border border-dark-card">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex items-center mb-4 md:mb-0">
                                <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4">
                                  <img 
                                    src={mod.thumbnail} 
                                    alt={mod.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">
                                    {mod.title}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    <Badge className="bg-dark text-secondary text-xs">
                                      {mod.category}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center mt-2 text-neutral text-sm">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>
                                      {formatDistanceToNow(new Date(purchase.purchaseDate), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end">
                                <div className="text-white font-semibold text-lg">
                                  ${purchase.price.toFixed(2)}
                                </div>
                                <div className="text-neutral text-sm">
                                  Transaction ID: {purchase.transactionId.substring(0, 8)}...
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => window.open(`/api/mods/${mod.id}/download`, '_blank')}
                                >
                                  <Download className="h-3 w-3 mr-2" /> Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="h-8 w-8 text-neutral" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-white mb-2">
                          No Purchase History
                        </h3>
                        <p className="text-neutral-light mb-6">
                          You haven't made any purchases yet
                        </p>
                        <Button onClick={() => navigate("/mods")}>
                          Browse Mods
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="subscription">
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Subscription Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasSubscription ? (
                      <div className="space-y-6">
                        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <Star className="h-6 w-6 text-secondary mr-3" />
                            <h3 className="text-xl font-display font-semibold text-white">Premium Subscription</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-neutral-light text-sm">Status</h4>
                                <p className="text-white flex items-center">
                                  <span className="bg-green-500 h-2 w-2 rounded-full mr-2"></span>
                                  Active
                                </p>
                              </div>
                              <div>
                                <h4 className="text-neutral-light text-sm">Plan</h4>
                                <p className="text-white">Monthly Premium</p>
                              </div>
                              <div>
                                <h4 className="text-neutral-light text-sm">Price</h4>
                                <p className="text-white">$9.99 / month</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-neutral-light text-sm">Next Billing Date</h4>
                                <p className="text-white">
                                  {/* Simulated next billing date */}
                                  {new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-neutral-light text-sm">Payment Method</h4>
                                <p className="text-white flex items-center">
                                  <i className="fas fa-credit-card mr-2"></i>
                                  •••• 4242
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-4">
                            <Button
                              variant="outline"
                              className="border-secondary/30 text-secondary"
                              onClick={() => alert("This would manage your subscription")}
                            >
                              Manage Subscription
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500/30 text-red-500"
                              onClick={() => alert("This would cancel your subscription")}
                            >
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-display font-semibold text-white mb-4">Premium Benefits</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <div className="bg-secondary/20 p-2 rounded-full mr-3">
                                <Package className="h-4 w-4 text-secondary" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">Exclusive Premium Mods</h4>
                                <p className="text-neutral-light">Access to all premium subscription-only mods</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-secondary/20 p-2 rounded-full mr-3">
                                <Download className="h-4 w-4 text-secondary" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">Unlimited Downloads</h4>
                                <p className="text-neutral-light">Download as many mods as you want</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-secondary/20 p-2 rounded-full mr-3">
                                <Clock className="h-4 w-4 text-secondary" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">Early Access</h4>
                                <p className="text-neutral-light">Get new mods before everyone else</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-dark-lighter rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-8 w-8 text-neutral" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-white mb-2">
                          No Active Subscription
                        </h3>
                        <p className="text-neutral-light mb-6">
                          Upgrade to Premium to unlock exclusive mods and benefits
                        </p>
                        <Button 
                          className="bg-secondary hover:bg-secondary-dark text-white"
                          onClick={() => navigate("/subscribe")}
                        >
                          <Star className="mr-2 h-4 w-4" /> Subscribe Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card className="bg-dark-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display text-white">
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-display font-semibold text-white mb-4">Profile Settings</h3>
                        <p className="text-neutral-light mb-4">
                          Your profile information is synchronized with Discord. 
                          To update your profile, please make changes in your Discord account.
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => window.open("https://discord.com/users/@me", "_blank")}
                        >
                          <i className="fab fa-discord mr-2"></i> Open Discord Settings
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-display font-semibold text-white mb-4">Notification Preferences</h3>
                        <p className="text-neutral-light mb-4">
                          Notification settings are coming soon. You'll be able to customize how you
                          receive mod updates, discount notifications, and more.
                        </p>
                        <Button 
                          variant="outline"
                          disabled
                        >
                          Manage Notifications (Coming Soon)
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-display font-semibold text-white mb-4">Danger Zone</h3>
                        <p className="text-neutral-light mb-4">
                          These actions are permanent and cannot be undone.
                        </p>
                        <div className="space-y-4">
                          <Button 
                            variant="outline"
                            className="border-red-500/30 text-red-500 w-full justify-start"
                            onClick={() => logout()}
                          >
                            <LogOut className="mr-2 h-4 w-4" /> 
                            Logout from all devices
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-500/30 text-red-500 w-full justify-start"
                            onClick={() => alert("This would delete your account")}
                          >
                            <i className="fas fa-trash-alt mr-2"></i>
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
