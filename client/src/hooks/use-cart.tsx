import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface CartItem {
  id: number;
  userId: number;
  modId: number;
  addedAt: string;
  mod: {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPrice: number | null;
    previewImageUrl: string;
    category: string;
    tags: string[];
    features: string[];
    isSubscriptionOnly: boolean;
  };
}

interface CartContextType {
  items: CartItem[];
  total: number;
  count: number;
  isLoading: boolean;
  addToCart: (modId: number) => Promise<void>;
  addItem: (modId: number) => Promise<void>;
  removeItem: (modId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (modId: number) => boolean;
  isModInCart: (modId: number) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error
  } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      const response = await fetch('/api/cart', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) return [];
      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      const data = await response.json();
      console.log('[cart] Cart items fetched:', data);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const addItemMutation = useMutation({
    mutationFn: async (modId: number) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ modId })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add item to cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (modId: number) => {
      const response = await fetch(`/api/cart/${modId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to remove item from cart');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to clear cart');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const total = items.reduce((sum, item) => {
    const price = item.mod?.discountPrice ?? item.mod?.price ?? 0;
    return sum + price;
  }, 0);

  const count = items.length;

  const isInCart = (modId: number): boolean => {
    return items.some(item => item.modId === modId);
  };

  const addItem = async (modId: number): Promise<void> => {
    await addItemMutation.mutateAsync(modId);
  };

  const removeItem = async (modId: number): Promise<void> => {
    await removeItemMutation.mutateAsync(modId);
  };

  const clearCart = async (): Promise<void> => {
    await clearCartMutation.mutateAsync();
  };

  const value: CartContextType = {
    items,
    total,
    count,
    isLoading: isLoading || addItemMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending,
    addToCart: addItem,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    isModInCart: isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}