import { apiRequest } from "./queryClient";
import { Mod } from "@shared/schema";

export interface CartItem {
  id: number;
  userId: number;
  modId: number;
  addedAt: string;
  mod?: Mod;
}

// Get cart items
export async function getCart(): Promise<CartItem[]> {
  try {
    const res = await apiRequest("GET", "/api/cart");
    return await res.json();
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

// Add item to cart
export async function addToCart(modId: number): Promise<CartItem | null> {
  try {
    const res = await apiRequest("POST", "/api/cart", { modId });
    return await res.json();
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
}

// Remove item from cart
export async function removeFromCart(modId: number): Promise<boolean> {
  try {
    const res = await apiRequest("DELETE", `/api/cart/${modId}`);
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
}

// Clear cart
export async function clearCart(): Promise<boolean> {
  try {
    const res = await apiRequest("DELETE", "/api/cart");
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
}

// Calculate cart total
export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    const price = item.mod?.discountPrice || item.mod?.price || 0;
    return total + price;
  }, 0);
}

// Complete purchase after successful payment
export async function completePurchase(transactionId: string) {
  try {
    const res = await apiRequest("POST", "/api/purchase/complete", { transactionId });
    return await res.json();
  } catch (error) {
    console.error("Error completing purchase:", error);
    throw error;
  }
}
