import { apiRequest } from "./queryClient";
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
 * @returns Array of cart items with mod details
 */
export async function getCart(): Promise<CartItem[]> {
  try {
    const res = await apiRequest("GET", "/api/cart");
    const data = await res.json();
    
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error("Invalid cart data format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

/**
 * Adds a mod to the user's cart
 * @param modId The ID of the mod to add to cart
 * @returns The cart item if successful, null otherwise
 */
export async function addToCart(modId: number): Promise<CartItem | null> {
  // Ensure modId is a number
  const numericModId = Number(modId);
  
  if (!numericModId || isNaN(numericModId)) {
    console.error("Invalid mod ID provided:", modId);
    return null;
  }
  
  try {
    console.log(`[cart.ts] Adding mod ${numericModId} to cart...`);
    
    // Create payload with explicit modId value
    const payload = { modId: numericModId };
    console.log("[cart.ts] Request payload:", payload, "Type:", typeof payload);
    
    // Log URL before making request
    const apiUrl = "/api/cart";
    console.log("[cart.ts] About to send request to URL:", apiUrl, "with method:", "POST");
    
    // Use apiRequest for consistency
    const result = await apiRequest("POST", apiUrl, payload);
    console.log("[cart.ts] Cart API response status:", result.status);
    
    if (result.status === 401) {
      console.error("[cart.ts] Authentication error - User not authenticated");
      throw new Error("You must be logged in to add items to your cart");
    }
    
    // Get response as JSON first, falling back to text if JSON parsing fails
    let data;
    try {
      data = await result.json();
      console.log("[cart.ts] Cart API JSON response:", data);
    } catch (jsonError) {
      console.error("[cart.ts] JSON parse error:", jsonError);
      
      // If the status is ok but JSON parsing failed, this is unexpected
      if (result.ok) {
        console.error("[cart.ts] Unexpected: Response status OK but invalid JSON");
        throw new Error("Server returned an invalid response format");
      } else {
        // If not OK and JSON parsing failed, create a generic error
        throw new Error(`Server error: ${result.status} ${result.statusText}`);
      }
    }
    
    if (!result.ok) {
      console.error("[cart.ts] Server error adding to cart:", data);
      throw new Error((data && data.message) || "Failed to add item to cart");
    }
    
    console.log("[cart.ts] Successfully added to cart:", data);
    
    // If item is already in cart, server returns a success message
    if (data.message === "Item already in cart" && data.cartItem) {
      return data.cartItem;
    }
    
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error; // Re-throw to allow consumers to handle errors
  }
}

/**
 * Removes a mod from the user's cart
 * @param modId The ID of the mod to remove from cart
 * @returns true if removal was successful, false otherwise
 */
export async function removeFromCart(modId: number): Promise<boolean> {
  if (!modId || isNaN(modId)) {
    console.error("Invalid mod ID provided for removal:", modId);
    return false;
  }
  
  try {
    console.log(`Removing mod ${modId} from cart...`);
    
    const res = await apiRequest("DELETE", `/api/cart/${modId}`);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error removing from cart:", errorData);
      throw new Error(errorData.message || "Failed to remove item from cart");
    }
    
    const data = await res.json();
    console.log("Remove from cart response:", data);
    
    return data.success === true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error; // Re-throw to allow consumers to handle errors
  }
}

/**
 * Clears all items from the user's cart
 * @returns true if clear was successful, false otherwise
 */
export async function clearCart(): Promise<boolean> {
  try {
    console.log("Clearing cart...");
    
    const res = await apiRequest("DELETE", "/api/cart");
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error clearing cart:", errorData);
      throw new Error(errorData.message || "Failed to clear cart");
    }
    
    const data = await res.json();
    console.log("Clear cart response:", data);
    
    return data.success === true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error; // Re-throw to allow consumers to handle errors
  }
}

/**
 * Calculates the total price of all items in the cart
 * @param cartItems Array of cart items
 * @returns The total price
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 0;
  }
  
  return cartItems.reduce((total, item) => {
    // Make sure we have mod data and a valid price
    if (!item.mod) {
      console.warn("Cart item has no mod data:", item);
      return total;
    }
    
    // Use discounted price if available, otherwise use regular price
    const price = item.mod.discountPrice !== null ? 
      item.mod.discountPrice : 
      (item.mod.price || 0);
      
    return total + price;
  }, 0);
}

/**
 * Completes a purchase after successful payment
 * @param transactionId The ID of the payment transaction
 * @returns The purchase data
 */
export async function completePurchase(transactionId: string) {
  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }
  
  try {
    console.log("Completing purchase with transaction ID:", transactionId);
    
    const res = await apiRequest("POST", "/api/purchase/complete", { transactionId });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error completing purchase:", errorData);
      throw new Error(errorData.message || "Failed to complete purchase");
    }
    
    const data = await res.json();
    console.log("Purchase completion response:", data);
    
    return data;
  } catch (error) {
    console.error("Error completing purchase:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error;
  }
}
