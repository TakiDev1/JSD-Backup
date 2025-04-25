import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react";

const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, cartTotal, removeItem, clearCart } = useCart();
  const [, navigate] = useLocation();

  // Listen for cart updates to open drawer when items are added
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c" && e.ctrlKey) {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRemoveItem = async (modId: number) => {
    await removeItem(modId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="cart-button fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary hover:bg-primary-light text-white shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-6 w-6" />
        {cartItems.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-secondary text-white">
            {cartItems.length}
          </Badge>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md bg-dark-lighter border-l border-dark-card">
          <SheetHeader className="mb-5">
            <SheetTitle className="font-display text-2xl text-white flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Your Cart
              <span className="ml-2 text-sm text-neutral-light">
                ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
              </span>
            </SheetTitle>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="w-20 h-20 rounded-full bg-dark-card flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-neutral" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">
                Your cart is empty
              </h3>
              <p className="text-neutral-light text-center mb-6">
                Add some awesome mods to your cart to see them here
              </p>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/mods");
                }}
              >
                Browse Mods
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 h-[60vh] pr-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex bg-dark-card p-4 rounded-lg border border-dark-card"
                    >
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4">
                        <img
                          src={item.mod?.previewImageUrl || "/images/mod-placeholder.jpg"}
                          alt={item.mod?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/mod-placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {item.mod?.title}
                        </h3>
                        <div className="flex items-center mt-1">
                          <Badge className="bg-dark text-secondary text-xs">
                            {item.mod?.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-white font-semibold">
                            ${item.mod?.discountPrice?.toFixed(2) || item.mod?.price.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-neutral hover:text-red-500"
                            onClick={() => handleRemoveItem(item.modId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-6">
                <Separator className="mb-4" />

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-light">Subtotal</span>
                    <span className="text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-light">Tax</span>
                    <span className="text-white">$0.00</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col space-y-3">
                  <Button onClick={handleCheckout} className="w-full">
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CartDrawer;
