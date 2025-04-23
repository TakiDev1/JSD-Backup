import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCart, addToCart, removeFromCart, clearCart, calculateCartTotal } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: () => getCart(),
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  });

  const cartTotal = calculateCartTotal(cartItems);
  const cartCount = cartItems.length;

  const addItemMutation = useMutation({
    mutationFn: (modId: number) => addToCart(modId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "The mod has been added to your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the mod to your cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (modId: number) => removeFromCart(modId),
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
  });

  const clearCartMutation = useMutation({
    mutationFn: () => clearCart(),
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
  });

  const isModInCart = (modId: number) => {
    return cartItems.some(item => item.modId === modId);
  };

  const value = {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    addItem: async (modId: number) => {
      await addItemMutation.mutateAsync(modId);
    },
    removeItem: async (modId: number) => {
      await removeItemMutation.mutateAsync(modId);
    },
    clearCart: async () => {
      await clearCartMutation.mutateAsync();
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