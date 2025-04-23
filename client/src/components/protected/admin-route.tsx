import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface AdminRouteProps {
  path: string;
  component: React.ComponentType;
}

function AdminRoute({ path, component: Component }: AdminRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/admin-login" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

export default AdminRoute;