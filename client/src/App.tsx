import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MouseParticles from "@/components/shared/mouse-particles";
import CartDrawer from "@/components/shared/cart-drawer";
import AdminRoute from "@/components/protected/admin-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Mods from "@/pages/mods";
import ModDetails from "@/pages/mod-details";
import ModLocker from "@/pages/mod-locker";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Forum from "@/pages/forum";
import Profile from "@/pages/profile";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMods from "@/pages/admin/mods";
import AdminUsers from "@/pages/admin/users";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mods" component={Mods} />
      <Route path="/mods/:id" component={ModDetails} />
      <Route path="/mod-locker" component={ModLocker} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/forum" component={Forum} />
      <Route path="/forum/:categoryId" component={Forum} />
      <Route path="/forum/thread/:id" component={Forum} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin-login" component={AdminLogin} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/mods" component={AdminMods} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-dark text-white font-body overflow-x-hidden">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
              <MouseParticles />
            </div>
            <CartDrawer />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
