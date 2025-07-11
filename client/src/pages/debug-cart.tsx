import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, RefreshCw, Trash2, X, List, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function DebugCartPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modId, setModId] = useState("25");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Direct fetch to add to cart API
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
          
          // Refresh cart items after adding
          if (response.ok) {
            fetchCartItems();
          }
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
  
  // Fetch cart items
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("[debug-cart] Fetching cart items...");
      
      const response = await fetch("/api/cart", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      console.log("[debug-cart] Cart GET response status:", response.status);
      
      if (response.status === 401) {
        setError("You must be logged in to view your cart");
        setCartItems([]);
        return;
      }
      
      if (!response.ok) {
        setError(`Error fetching cart: ${response.status} ${response.statusText}`);
        return;
      }
      
      // Get response text for debugging
      const responseText = await response.text();
      console.log("[debug-cart] Cart GET raw response:", responseText);
      
      // Parse as JSON if not empty
      if (responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          console.log("[debug-cart] Cart data:", data);
          
          if (Array.isArray(data)) {
            setCartItems(data);
            // Calculate total
            const total = data.reduce((sum, item) => {
              const price = item.mod?.discountPrice !== null ? 
                item.mod?.discountPrice : 
                (item.mod?.price || 0);
              return sum + price;
            }, 0);
            setCartTotal(total);
            
            setResponse({
              operation: "GET Cart",
              items: data,
              count: data.length,
              total: total
            });
          } else {
            setError("Invalid response format: expected array");
            setCartItems([]);
          }
        } catch (e) {
          setError(`JSON parse error: ${e instanceof Error ? e.message : String(e)}`);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setError(`Network error: ${e instanceof Error ? e.message : String(e)}`);
      setCartItems([]);
      
      toast({
        title: "Connection Error",
        description: `Failed to connect to server: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemModId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[debug-cart] Removing item ${itemModId} from cart...`);
      
      const response = await fetch(`/api/cart/${itemModId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      console.log("[debug-cart] Cart DELETE response status:", response.status);
      
      if (response.status === 401) {
        setError("You must be logged in to remove items from your cart");
        return;
      }
      
      if (!response.ok) {
        setError(`Error removing item: ${response.status} ${response.statusText}`);
        return;
      }
      
      // Get response text for debugging
      const responseText = await response.text();
      console.log("[debug-cart] Cart DELETE raw response:", responseText);
      
      // Parse as JSON if not empty
      if (responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          console.log("[debug-cart] Remove response:", data);
          
          setResponse({
            operation: "DELETE Item",
            modId: itemModId,
            result: data
          });
          
          toast({
            title: "Success",
            description: "Item removed from cart",
          });
          
          // Refresh cart items after removing
          fetchCartItems();
        } catch (e) {
          setError(`JSON parse error: ${e instanceof Error ? e.message : String(e)}`);
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
  
  // Clear cart
  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("[debug-cart] Clearing cart...");
      
      const response = await fetch("/api/cart", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      console.log("[debug-cart] Cart CLEAR response status:", response.status);
      
      if (response.status === 401) {
        setError("You must be logged in to clear your cart");
        return;
      }
      
      if (!response.ok) {
        setError(`Error clearing cart: ${response.status} ${response.statusText}`);
        return;
      }
      
      // Get response text for debugging
      const responseText = await response.text();
      console.log("[debug-cart] Cart CLEAR raw response:", responseText);
      
      // Parse as JSON if not empty
      if (responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          console.log("[debug-cart] Clear response:", data);
          
          setResponse({
            operation: "CLEAR Cart",
            result: data
          });
          
          toast({
            title: "Success",
            description: "Cart cleared successfully",
          });
          
          // Refresh cart items after clearing
          setCartItems([]);
          setCartTotal(0);
        } catch (e) {
          setError(`JSON parse error: ${e instanceof Error ? e.message : String(e)}`);
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
          <Tabs defaultValue="view" className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cart Operations</CardTitle>
                <TabsList>
                  <TabsTrigger value="view">
                    <Eye className="w-4 h-4 mr-2" />
                    View Cart
                  </TabsTrigger>
                  <TabsTrigger value="add">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add Item
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            
            <TabsContent value="view" className="mt-0">
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={fetchCartItems} 
                    disabled={loading || !isAuthenticated}
                    className="w-full"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <List className="w-4 h-4 mr-2" />
                    )}
                    Fetch Cart Items
                  </Button>
                  
                  {cartItems.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Cart Items ({cartItems.length})</h3>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={clearCart}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                      
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                          <div>
                            <div className="font-medium">{item.mod?.title || 'Unknown Mod'}</div>
                            <div className="text-sm text-muted-foreground">ID: {item.modId}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="font-semibold">
                              ${item.mod?.discountPrice !== null 
                                ? item.mod?.discountPrice.toFixed(2) 
                                : (item.mod?.price || 0).toFixed(2)}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeFromCart(item.modId)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center font-bold">
                        <div>Total:</div>
                        <div>${cartTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  ) : (
                    !loading && (
                      <div className="text-center py-6 text-muted-foreground">
                        No items in cart
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="add" className="mt-0">
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
                  Add to Cart
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {(response || error) && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Response 
                {response?.operation && <span className="text-sm ml-2 text-muted-foreground">({response.operation})</span>}
              </CardTitle>
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