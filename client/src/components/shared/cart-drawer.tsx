import { useCart, type CartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CartDrawerProps {
  children?: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps = {}) {
  const cart = useCart();
  
  const safeItems: CartItem[] = Array.isArray(cart.items) ? cart.items : [];
  const total = safeItems.reduce((sum, item) => sum + (item.mod.discountPrice || item.mod.price), 0);
  const safeCount = cart.itemCount || safeItems.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {safeCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {safeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {safeCount === 0 ? "Your cart is empty" : `${safeCount} item${safeCount === 1 ? '' : 's'} in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex-1 overflow-y-auto">
          {cart.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">Loading cart...</div>
            </div>
          ) : safeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-muted-foreground">Add some mods to get started!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {safeItems.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-card">
                    <img
                      src={item.mod?.previewImageUrl || "/images/mod-placeholder.jpg"}
                      alt={item.mod?.title || "Mod"}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.mod?.title || "Unknown Mod"}</h4>
                      <p className="text-xs text-muted-foreground truncate">{item.mod?.description || ""}</p>
                      <div className="flex items-center space-x-2 mt-2">
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
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.modId)}
                        className="h-8 w-8 p-0 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.modId)}
                        className="text-xs px-2 py-1 h-6"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>${safeTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={cart.clearCart}
                    disabled={safeItems.length === 0}
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
}