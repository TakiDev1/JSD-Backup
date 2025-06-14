import { Mod } from "@shared/schema";

export interface CartItem {
  id: number;
  userId: number;
  modId: number;
  addedAt: string;
  mod?: Mod;
}

/**
 * Fetches the current user's cart items from the server
 */
export async function getCart(): Promise<CartItem[]> {
  try {
    console.log("[cart.ts] Fetching cart items...");
    
    const response = await fetch("/api/cart", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log("[cart.ts] Cart GET response status:", response.status);
    
    if (response.status === 401) {
      console.warn("[cart.ts] User not authenticated for cart fetch");
      return [];
    }
    
    if (!response.ok) {
      console.error("[cart.ts] Error fetching cart:", response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log("[cart.ts] Cart data received:", data);
    
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error("[cart.ts] Invalid cart data format:", data);
      return [];
    }
  } catch (error) {
    console.error("[cart.ts] Error fetching cart:", error);
    return [];
  }
}

/**
 * Adds a mod to the current user's cart
 */
export async function addToCart(modId: number): Promise<CartItem | null> {
  const numericModId = Number(modId);
  
  if (!numericModId || isNaN(numericModId)) {
    console.error("Invalid mod ID provided:", modId);
    return null;
  }
  
  try {
    console.log(`[cart.ts] Adding mod ${numericModId} to cart...`);
    
    const response = await fetch("/api/cart", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ modId: numericModId })
    });
    
    console.log("[cart.ts] Response status:", response.status);
    
    if (response.status === 401) {
      throw new Error("You must be logged in to add items to your cart");
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Failed to add item to cart";
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log("[cart.ts] Successfully added to cart:", data);
    
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

/**
 * Removes a mod from the current user's cart
 */
export async function removeFromCart(modId: number): Promise<void> {
  try {
    console.log(`[cart.ts] Removing mod ${modId} from cart...`);
    
    const response = await fetch(`/api/cart/${modId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Failed to remove item from cart";
      throw new Error(errorMessage);
    }
    
    console.log("[cart.ts] Successfully removed from cart");
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

/**
 * Clears all items from the current user's cart
 */
export async function clearCart(): Promise<void> {
  try {
    console.log("[cart.ts] Clearing cart...");
    
    const response = await fetch("/api/cart", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Failed to clear cart";
      throw new Error(errorMessage);
    }
    
    console.log("[cart.ts] Successfully cleared cart");
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

/**
 * Calculates the total price of items in the cart
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    if (!item.mod) return total;
    const price = item.mod.discountPrice !== null ? item.mod.discountPrice : item.mod.price;
    return total + (price || 0);
  }, 0);
}

/**
 * Completes the purchase process after successful payment
 */
export async function completePurchase(transactionId: string): Promise<void> {
  try {
    console.log("[cart.ts] Completing purchase with transaction ID:", transactionId);
    
    const response = await fetch("/api/purchase/complete", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ transactionId })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Failed to complete purchase";
      throw new Error(errorMessage);
    }
    
    console.log("[cart.ts] Purchase completed successfully");
  } catch (error) {
    console.error("Error completing purchase:", error);
    throw error;
  }
}