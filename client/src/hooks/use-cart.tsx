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

const fetchCartItems = async (): Promise<CartItem[]> => {
  const response = await fetch('/api/cart', { credentials: 'include' });
  if (response.status === 401) return [];
  if (!response.ok) throw new Error('Failed to fetch cart items');
  return response.json();
};

const addItemToCart = async (modId: number): Promise<CartItem> => {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ modId })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to add item to cart');
  }
  return response.json();
};

const removeItemFromCart = async (modId: number): Promise<void> => {
  const response = await fetch(`/api/cart/${modId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to remove item from cart');
};

const clearEntireCart = async (): Promise<void> => {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to clear cart');
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.mod.discountPrice ?? item.mod.price;
    return total + price;
  }, 0);
};

interface CartContextType {
  items: CartItem[];
  total: number;
  count: number;
  isLoading: boolean;
  addItem: (modId: number) => Promise<void>;
  removeItem: (modId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (modId: number) => boolean;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    refetch
  } = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: fetchCartItems,
    enabled: isAuthenticated,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const safeItems = items || [];
  const total = calculateTotal(safeItems);
  const count = safeItems.length;

  const addMutation = useMutation({
    mutationFn: addItemToCart,
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart"
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const removeMutation = useMutation({
    mutationFn: removeItemFromCart,
    onSuccess: () => {
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart"
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const clearMutation = useMutation({
    mutationFn: clearEntireCart,
    onSuccess: () => {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart"
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addItem = async (modId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    await addMutation.mutateAsync(modId);
  };

  const removeItem = async (modId: number) => {
    await removeMutation.mutateAsync(modId);
  };

  const clearCart = async () => {
    await clearMutation.mutateAsync();
  };

  const isInCart = (modId: number) => {
    return safeItems.some(item => item.modId === modId);
  };

  const value: CartContextType = {
    items: safeItems,
    total,
    count,
    isLoading,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    refetch
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}