import { useCart, type CartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function CartPage() {
  const { 
    items, 
    total, 
    count, 
    isLoading, 
    removeItem, 
    clearCart 
  } = useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some mods to get started!</p>
          <Link href="/mods">
            <Button>Browse Mods</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({count} items)</h1>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: CartItem) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.mod?.previewImageUrl || "/images/mod-placeholder.jpg"}
                      alt={item.mod?.title || "Mod"}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{item.mod?.title || "Unknown Mod"}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{item.mod?.description || ""}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          {item.mod?.category || "misc"}
                        </Badge>
                        <span className="font-semibold text-lg">
                          ${item.mod?.discountPrice ?? item.mod?.price ?? 0}
                        </span>
                        {item.mod?.discountPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${item.mod?.price ?? 0}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.modId)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearCart}
                    disabled={items.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                  <Link href="/mods">
                    <Button variant="ghost" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}