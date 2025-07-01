import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { CartProvider } from "@/hooks/use-cart";
import AdminRoute from "@/components/protected/admin-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Mods from "@/pages/mods";
import ModDetails from "@/pages/mod-details";
import ModLocker from "@/pages/mod-locker";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Profile from "@/pages/profile";
import AdminLogin from "@/pages/admin-login";
import Login from "@/pages/login";
import Register from "@/pages/register";
import MaintenancePage from "@/pages/maintenance";
import DebugCart from "@/pages/debug-cart";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminMods from "@/pages/admin/mods";
import AdminSettings from "@/pages/admin/settings";
import AdminAnalytics from "@/pages/admin/analytics";
import UserManagement from "@/pages/admin/user-management";
import ProductManagement from "@/pages/admin/product-management";
import OrderManagement from "@/pages/admin/orders";
import AdminNotifications from "@/pages/admin-notifications";
import SalesReport from "@/pages/admin/analytics/sales";
import UserAnalytics from "@/pages/admin/analytics/users";
import CreateUser from "@/pages/admin/users/create";
import UserTracking from "@/pages/admin/user-tracking";
import CreateMod from "@/pages/admin/mods/create";
import OrderManagementIndex from "@/pages/admin/orders/index";
import AdminSettingsIndex from "@/pages/admin/settings/index";
import AnalyticsIndex from "@/pages/admin/analytics/index";
import LegalTerms from "@/pages/admin/legal-terms";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { MaintenanceMode } from "@/components/shared/maintenance-mode";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

function Router() {
  const { user, isAdmin } = useAuth();
  
  // Only fetch admin settings if the user is an admin
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      if (!user || !isAdmin) {
        // Return default settings if not admin
        return { maintenanceMode: false };
      }
      const res = await apiRequest("GET", "/api/admin/settings");
      return await res.json();
    },
    refetchInterval: isAdmin ? 5000 : false, // Only auto-refresh for admins
    refetchOnWindowFocus: isAdmin,
  });

  if (isLoading && isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  const showMaintenance = settings?.maintenanceMode === true;
  
  if (showMaintenance) {
    return <MaintenanceMode />;
  }
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mods" component={Mods} />
      <Route path="/mods/:id" component={ModDetails} />
      <Route path="/mod-locker" component={ModLocker} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/debug-cart" component={DebugCart} />
      {/* Forum routes removed as requested */}
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/maintenance" component={MaintenancePage} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      
      {/* Analytics */}
      <AdminRoute path="/admin/analytics" component={AnalyticsIndex} />
      <AdminRoute path="/admin/analytics/sales" component={SalesReport} />
      <AdminRoute path="/admin/analytics/users" component={UserAnalytics} />
      <AdminRoute path="/admin/analytics/performance" component={AdminAnalytics} />
      
      {/* User Management */}
      <AdminRoute path="/admin/users" component={UserManagement} />
      <AdminRoute path="/admin/users/tracking" component={UserTracking} />
      <AdminRoute path="/admin/users/create" component={CreateUser} />
      <AdminRoute path="/admin/users/roles" component={UserManagement} />
      <AdminRoute path="/admin/users/banned" component={UserManagement} />
      
      {/* Product Management */}
      <AdminRoute path="/admin/products" component={ProductManagement} />
      <AdminRoute path="/admin/products/categories" component={ProductManagement} />
      <AdminRoute path="/admin/products/create" component={ProductManagement} />
      <AdminRoute path="/admin/mods" component={AdminMods} />
      <AdminRoute path="/admin/mods/create" component={CreateMod} />
      <AdminRoute path="/admin/mods/featured" component={AdminMods} />
      <AdminRoute path="/admin/mods/categories" component={AdminMods} />
      <AdminRoute path="/admin/mods/reviews" component={AdminMods} />
      
      {/* Order Management */}
      <AdminRoute path="/admin/orders" component={OrderManagementIndex} />
      <AdminRoute path="/admin/orders/pending" component={OrderManagement} />
      <AdminRoute path="/admin/orders/completed" component={OrderManagement} />
      <AdminRoute path="/admin/orders/refunds" component={OrderManagement} />
      
      {/* Payment Management */}
      <AdminRoute path="/admin/payments/settings" component={AdminSettings} />
      <AdminRoute path="/admin/payments/stripe" component={AdminSettings} />
      <AdminRoute path="/admin/payments/subscriptions" component={AdminSettings} />
      <AdminRoute path="/admin/payments/webhooks" component={AdminSettings} />
      
      {/* Communications */}
      <AdminRoute path="/admin/notifications" component={AdminNotifications} />
      <AdminRoute path="/admin/communications/templates" component={AdminNotifications} />
      <AdminRoute path="/admin/communications/newsletter" component={AdminNotifications} />
      <AdminRoute path="/admin/communications/discord" component={AdminNotifications} />
      
      {/* Site Settings */}
      <AdminRoute path="/admin/settings" component={AdminSettingsIndex} />
      <AdminRoute path="/admin/settings/appearance" component={AdminSettingsIndex} />
      <AdminRoute path="/admin/settings/seo" component={AdminSettingsIndex} />
      <AdminRoute path="/admin/settings/security" component={AdminSettingsIndex} />
      <AdminRoute path="/admin/settings/maintenance" component={AdminSettingsIndex} />
      
      {/* Legal & Policies */}
      <AdminRoute path="/admin/legal/terms" component={LegalTerms} />
      <AdminRoute path="/admin/legal/privacy" component={LegalTerms} />
      <AdminRoute path="/admin/legal/cookies" component={LegalTerms} />
      <AdminRoute path="/admin/legal/refunds" component={LegalTerms} />
      
      {/* Database */}
      <AdminRoute path="/admin/database/backup" component={AdminSettings} />
      <AdminRoute path="/admin/database/cleanup" component={AdminSettings} />
      <AdminRoute path="/admin/database/logs" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col bg-dark text-white font-body overflow-x-hidden">
                <Navbar />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>
              <CartDrawer>{null}</CartDrawer>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
