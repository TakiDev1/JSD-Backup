import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, RefreshCw, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function DebugCartPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modId, setModId] = useState("25");

  // Direct fetch to the cart API
  const testAddToCart = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Show current auth status
      console.log("Auth status before request:", { isAuthenticated, user });
      
      // Log cookies
      console.log("Cookies:", document.cookie);

      // Try the API request
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ modId: Number(modId) })
      });

      // Log response headers
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Get response body as text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Parse as JSON if possible
      try {
        if (responseText) {
          const jsonResponse = JSON.parse(responseText);
          setResponse(jsonResponse);
          
          toast({
            title: response.ok ? "Success" : "Error",
            description: response.ok 
              ? `Successfully added mod to cart` 
              : `Error: ${jsonResponse.message || 'Unknown error'}`,
            variant: response.ok ? "default" : "destructive"
          });
        } else {
          setResponse("Empty response received");
        }
      } catch (e) {
        setResponse(responseText);
        
        if (!response.ok) {
          setError(`Failed to parse response: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } catch (e) {
      setError(`Network error: ${e instanceof Error ? e.message : String(e)}`);
      
      toast({
        title: "Connection Error",
        description: `Failed to connect to server: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <CardHeader className="mb-6">
        <CardTitle className="text-2xl">Cart API Debug Page</CardTitle>
        <CardDescription>Test the cart API directly without any abstractions</CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-4">
                <Badge className="bg-green-600 hover:bg-green-700">
                  Authenticated
                </Badge>
                <div className="flex flex-col space-y-2">
                  <div><strong>User ID:</strong> {user?.id}</div>
                  <div><strong>Username:</strong> {user?.username}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                  <div><strong>Role:</strong> {user?.isAdmin ? 'Admin' : 'User'}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge variant="destructive">Not Authenticated</Badge>
                <p>Please log in to test the cart API.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add to Cart Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="modId" className="w-24">Mod ID:</label>
                <Input 
                  id="modId" 
                  type="number" 
                  value={modId} 
                  onChange={(e) => setModId(e.target.value)}
                  disabled={loading || !isAuthenticated}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={testAddToCart} 
              disabled={loading || !isAuthenticated}
              className="bg-primary text-white"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              Test Add to Cart
            </Button>
          </CardFooter>
        </Card>
      </div>

      {(response || error) && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Response</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setResponse(null);
                  setError(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap overflow-auto max-h-96">
                {response && typeof response === 'object' 
                  ? JSON.stringify(response, null, 2) 
                  : response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}