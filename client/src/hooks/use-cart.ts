import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCart, addToCart, removeFromCart, clearCart, calculateCartTotal } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartItem } from "@/lib/cart";

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  cartTotal: number;
  cartCount: number;
  addItem: (modId: number) => Promise<CartItem | null>;
  removeItem: (modId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isModInCart: (modId: number) => boolean;
  isPending: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: false,
  cartTotal: 0,
  cartCount: 0,
  addItem: async (_modId: number) => null,
  removeItem: async (_modId: number) => {},
  clearCart: async () => {},
  isModInCart: (_modId: number) => false,
  isPending: false,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  // Get cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: () => getCart(),
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  const cartTotal = calculateCartTotal(cartItems);
  const cartCount = cartItems.length;

  // Check if a mod is in the cart
  const isModInCart = (modId: number) => {
    return cartItems.some(item => item.modId === modId);
  };

  // Add item to cart
  const addItemMutation = useMutation({
    mutationFn: async (modId: number) => {
      console.log("[use-cart] Adding to cart, modId:", modId, "Type:", typeof modId);
      
      if (!isAuthenticated) {
        console.error("[use-cart] Not authenticated");
        
        // Show toast before redirecting
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to add items to your cart.",
        });
        
        // Delay redirect to allow toast to be seen
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        
        return null;
      }
      
      // Convert modId to number explicitly
      const numericModId = Number(modId);
      console.log("[use-cart] Converted modId to number:", numericModId);
      
      if (isModInCart(numericModId)) {
        console.log("[use-cart] Item already in cart");
        toast({
          title: "Already in cart",
          description: "This mod is already in your cart.",
        });
        return null;
      }
      
      console.log("[use-cart] Calling addToCart with modId:", numericModId);
      
      try {
        // Set a timeout to catch hanging requests
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out. Server may be unavailable.")), 10000);
        });
        
        // Race between the actual request and the timeout
        const result = await Promise.race([
          addToCart(numericModId),
          timeoutPromise
        ]) as CartItem | null;
        
        console.log("[use-cart] Add to cart result:", result);
        
        // Verify success with explicit check since null is a valid response
        if (result === null) {
          console.warn("[use-cart] Result was null but no error thrown - this may indicate a server issue");
        }
        
        return result;
      } catch (error) {
        console.error("[use-cart] Add to cart error:", error);
        throw error;
      }
    },
    onMutate: () => {
      setIsPending(true);
    },
    onSuccess: (data) => {
      console.log("[use-cart] onSuccess with data:", data);
      
      // Always invalidate the cart queries to refresh the cart state
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      if (data) {
        toast({
          title: "Added to cart",
          description: `${data.mod?.title || 'Item'} successfully added to your cart.`,
        });
      } else {
        // Check if the item actually made it to the cart despite null result
        setTimeout(() => {
          getCart().then(updatedCart => {
            console.log("[use-cart] Checking cart after null result:", updatedCart);
          }).catch(e => console.error("[use-cart] Error checking cart after null result:", e));
        }, 500);
      }
    },
    onError: (error: Error) => {
      console.error("[use-cart] onError:", error);
      
      if (error.message.includes("already own this mod")) {
        toast({
          title: "Already purchased",
          description: "You already own this mod.",
          variant: "destructive",
        });
      } else if (error.message.includes("timed out")) {
        toast({
          title: "Server issue",
          description: "The server is taking too long to respond. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add the mod to your cart. Please try again.",
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Remove from cart
  const removeItemMutation = useMutation({
    mutationFn: async (modId: number) => {
      console.log("Removing from cart, modId:", modId);
      
      if (!isAuthenticated) {
        throw new Error("You must be logged in to modify your cart");
      }
      
      return await removeFromCart(modId);
    },
    onMutate: () => {
      setIsPending(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "The mod has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove the mod from your cart. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      console.log("Clearing cart");
      
      if (!isAuthenticated) {
        throw new Error("You must be logged in to modify your cart");
      }
      
      return await clearCart();
    },
    onMutate: () => {
      setIsPending(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear your cart. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Context value
  const value = {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    isPending,
    addItem: async (modId: number) => {
      try {
        console.log("[use-cart] addItem called with modId:", modId);
        const result = await addItemMutation.mutateAsync(modId);
        console.log("[use-cart] addItem result:", result);
        return result;
      } catch (error) {
        console.error("[use-cart] addItem error:", error);
        // Error is handled in the mutation callbacks
        throw error; // Re-throw for component-level handling
      }
    },
    removeItem: async (modId: number) => {
      try {
        await removeItemMutation.mutateAsync(modId);
      } catch (error) {
        // Error is handled in the mutation callbacks
      }
    },
    clearCart: async () => {
      try {
        await clearCartMutation.mutateAsync();
      } catch (error) {
        // Error is handled in the mutation callbacks
      }
    },
    isModInCart,
  };

  return React.createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}