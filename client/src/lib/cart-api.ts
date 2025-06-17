/**
 * Clean cart API implementation
 */

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
  };
}

/**
 * Fetch cart items from server
 */
export async function fetchCartItems(): Promise<CartItem[]> {
  const response = await fetch('/api/cart', {
    credentials: 'include'
  });
  
  if (response.status === 401) {
    return [];
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch cart items');
  }
  
  return await response.json();
}

/**
 * Add item to cart
 */
export async function addItemToCart(modId: number): Promise<CartItem> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ modId })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to add item to cart');
  }
  
  return await response.json();
}

/**
 * Remove item from cart
 */
export async function removeItemFromCart(modId: number): Promise<void> {
  const response = await fetch(`/api/cart/${modId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove item from cart');
  }
}

/**
 * Clear entire cart
 */
export async function clearEntireCart(): Promise<void> {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to clear cart');
  }
}

/**
 * Calculate cart total
 */
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = item.mod.discountPrice ?? item.mod.price;
    return total + price;
  }, 0);
}