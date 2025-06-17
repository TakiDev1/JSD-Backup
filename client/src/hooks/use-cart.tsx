import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  CartItem,
  fetchCartItems,
  addItemToCart,
  removeItemFromCart,
  clearEntireCart,
  calculateTotal
} from '@/lib/cart-api';

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

  // Fetch cart items
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

  const total = calculateTotal(items);
  const count = items.length;

  // Add item mutation
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

  // Remove item mutation
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

  // Clear cart mutation
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
    return addMutation.mutateAsync(modId);
  };

  const removeItem = async (modId: number) => {
    return removeMutation.mutateAsync(modId);
  };

  const clearCart = async () => {
    return clearMutation.mutateAsync();
  };

  const isInCart = (modId: number) => {
    return items.some(item => item.modId === modId);
  };

  const contextValue: CartContextType = {
    items,
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
    <CartContext.Provider value={contextValue}>
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