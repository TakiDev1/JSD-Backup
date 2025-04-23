import { apiRequest } from "./queryClient";

// Check if the user is logged in
export async function checkAuth() {
  try {
    const res = await fetch("/api/auth/user", {
      credentials: "include",
    });
    
    if (res.ok) {
      return await res.json();
    }
    
    return null;
  } catch (error) {
    console.error("Error checking auth:", error);
    return null;
  }
}

// Logout the user
export async function logout() {
  try {
    await apiRequest("POST", "/api/auth/logout");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}

// Login with Discord
export function loginWithDiscord() {
  window.location.href = "/api/auth/discord";
}

// Admin login with username and password
export async function adminLogin(username: string, password: string) {
  try {
    const response = await apiRequest("POST", "/api/admin/login", {
      username,
      password
    });
    
    if (response.ok) {
      return { success: true, data: await response.json() };
    }
    
    const errorData = await response.json();
    return { 
      success: false, 
      error: errorData.message || "Invalid credentials" 
    };
  } catch (error: any) {
    console.error("Admin login error:", error);
    return { 
      success: false, 
      error: error.message || "Login failed. Please try again." 
    };
  }
}

// Check if the user is an admin
export function isAdmin(user: any) {
  return user && user.isAdmin;
}

// Get the user's avatar (Discord or default)
export function getUserAvatar(user: any) {
  if (user?.discordAvatar) {
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`;
  }
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=7300ff&color=fff`;
}
