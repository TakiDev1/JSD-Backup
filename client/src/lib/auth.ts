import { apiRequest } from "./queryClient";

// Check if the user is logged in
export async function checkAuth() {
  try {
    console.log("Checking auth status...");
    const res = await fetch("/api/auth/user", {
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    
    if (res.ok) {
      const userData = await res.json();
      console.log("Auth status: Authenticated as", userData?.username);
      return userData;
    }
    
    console.log("Auth status: Not authenticated");
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

// Login with Discord - redirects to maintenance page
export async function loginWithDiscord() {
  try {
    // Redirect to maintenance page for Discord login
    window.location.href = "/maintenance";
    return true;
  } catch (error) {
    console.error("Error redirecting to maintenance page:", error);
    window.location.href = "/maintenance";
    return false;
  }
}

// Admin login with username and password
export async function adminLogin(username: string, password: string) {
  try {
    console.log("Attempting admin login for:", username);
    
    const response = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    
    const data = await response.json();
    console.log("Admin login response:", data);
    
    if (response.ok) {
      console.log("Admin login response data:", data);
      if (data && data.success && data.user) {
        return { 
          success: true, 
          user: data.user 
        };
      } else {
        return data; // Server response should already be in the correct format
      }
    }
    
    return { 
      success: false, 
      error: data.message || "Invalid credentials" 
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
  return user && (user.isAdmin || user.is_admin);
}

// Get the user's avatar (Discord or default)
export function getUserAvatar(user: any) {
  if (user?.discordAvatar) {
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`;
  }
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=7300ff&color=fff`;
}
