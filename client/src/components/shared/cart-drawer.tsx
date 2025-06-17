import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { useCart, CartItem } from "@/hooks/use-cart";

export function CartDrawer() {
  try {
    const cartContext = useCart();
    
    if (!cartContext) {
      return (
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      );
    }

    const { 
      items = [], 
      total = 0, 
      count = 0, 
      isLoading = false, 
      removeItem, 
      clearCart 
    } = cartContext;

    const safeItems: CartItem[] = Array.isArray(items) ? items : [];
    const safeCount = typeof count === 'number' ? count : safeItems.length;
    const safeTotal = typeof total === 'number' ? total : 0;

    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {safeCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {safeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>
              {safeCount === 0 ? "Your cart is empty" : `${safeCount} item${safeCount > 1 ? 's' : ''} in your cart`}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading cart...</p>
              </div>
            ) : safeItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add some mods to get started!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {safeItems.map((item: CartItem) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <img
                        src={item.mod?.previewImageUrl || "/images/mod-placeholder.jpg"}
                        alt={item.mod?.title || "Mod"}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.mod?.title || "Unknown Mod"}</h4>
                        <p className="text-xs text-muted-foreground truncate">{item.mod?.description || ""}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.mod?.category || "misc"}
                          </Badge>
                          <span className="font-medium text-sm">
                            ${item.mod?.discountPrice ?? item.mod?.price ?? 0}
                          </span>
                          {item.mod?.discountPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${item.mod?.price ?? 0}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem && removeItem(item.modId)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">${safeTotal.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <Link href="/checkout" className="w-full">
                      <Button className="w-full">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      onClick={() => clearCart && clearCart()}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  } catch (error) {
    console.error('Cart drawer error:', error);
    return (
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
      </Button>
    );
  }
}

export default CartDrawer;