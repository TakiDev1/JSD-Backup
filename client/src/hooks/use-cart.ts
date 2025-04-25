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
  addItem: (modId: number) => Promise<void>;
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
  addItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  isModInCart: () => false,
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
      console.log("Adding to cart, modId:", modId);
      
      if (!isAuthenticated) {
        throw new Error("You must be logged in to add items to your cart");
      }
      
      if (isModInCart(modId)) {
        console.log("Item already in cart");
        return null;
      }
      
      return await addToCart(modId);
    },
    onMutate: () => {
      setIsPending(true);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Added to cart",
          description: "The mod has been added to your cart.",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Add to cart error:", error);
      
      if (error.message.includes("already own this mod")) {
        toast({
          title: "Already purchased",
          description: "You already own this mod.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add the mod to your cart. Please try again.",
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
        await addItemMutation.mutateAsync(modId);
      } catch (error) {
        // Error is handled in the mutation callbacks
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