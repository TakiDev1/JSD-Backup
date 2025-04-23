import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="min-h-screen flex items-center justify-center bg-dark p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You must be logged in as an administrator to access this page.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Go Home
              </Button>
              {!user && (
                <Button asChild>
                  <Link href="/admin-login">
                    <i className="fab fa-discord mr-2"></i> Login
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

export default AdminRoute;