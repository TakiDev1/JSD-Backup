import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getCart, addToCart, removeFromCart, clearCart, calculateCartTotal, CartItem } from "@/lib/cart";

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
  refreshCart: () => Promise<void>;
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
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get cart items
  const { data: cartItems = [], isLoading, refetch: refetchCart } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 5000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
      console.log("[use-cart] Adding to cart, modId:", modId);
      
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to add items to your cart.",
        });
        return null;
      }
      
      const numericModId = Number(modId);
      
      if (isModInCart(numericModId)) {
        toast({
          title: "Already in cart",
          description: "This mod is already in your cart.",
        });
        return null;
      }
      
      return await addToCart(numericModId);
    },
    onSuccess: (result) => {
      if (result) {
        toast({
          title: "Added to cart",
          description: "Mod has been added to your cart.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add to cart",
        description: error.message,
      });
    },
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      toast({
        title: "Removed from cart",
        description: "Mod has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to remove from cart",
        description: error.message,
      });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to clear cart",
        description: error.message,
      });
    },
  });

  const isPending = addItemMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending;

  const value: CartContextType = {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    addItem: async (modId: number) => {
      try {
        return await addItemMutation.mutateAsync(modId);
      } catch (error) {
        return null;
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
    isPending,
    refreshCart: async () => {
      console.log("[use-cart] Manual cart refresh requested");
      await refetchCart();
    }
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