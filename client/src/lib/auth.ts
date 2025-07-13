import { apiRequest } from "./queryClient";

// JWT token management
const TOKEN_KEY = 'jsd_auth_token';

// Get JWT token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Set JWT token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove JWT token from localStorage
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Check if the user is logged in
export async function checkAuth() {
  try {
    console.log("Checking auth status...");
    const token = getAuthToken();
    
    if (!token) {
      console.log("Auth status: No token found");
      return null;
    }
    
    const res = await fetch("/api/auth/user", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });
    
    if (res.ok) {
      const userData = await res.json();
      console.log("Auth status: Authenticated as", userData?.username);
      return userData;
    }
    
    // If token is invalid, remove it
    if (res.status === 401) {
      removeAuthToken();
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
    const token = getAuthToken();
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
    removeAuthToken();
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    removeAuthToken(); // Remove token even if logout request fails
    return false;
  }
}

// Login with Discord
export async function loginWithDiscord() {
  try {
    // Check if Discord auth is available
    const statusRes = await fetch("/api/auth/discord-status");
    const statusData = await statusRes.json();
    
    if (!statusData.available) {
      console.error("Discord auth is not available");
      return false;
    }
    
    // Redirect to Discord OAuth
    window.location.href = "/api/auth/discord";
    return true;
  } catch (error) {
    console.error("Error during Discord login:", error);
    return false;
  }
}

// Regular login with username and password
export async function login(username: string, password: string) {
  try {
    console.log("Attempting login for:", username);
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log("Login response:", data);
    
    if (response.ok && data.token) {
      setAuthToken(data.token);
      return { 
        success: true, 
        user: data.user 
      };
    }
    
    return { 
      success: false, 
      error: data.message || "Invalid credentials" 
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: error.message || "Login failed. Please try again." 
    };
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
    });
    
    const data = await response.json();
    console.log("Admin login response:", data);
    
    if (response.ok && data.token) {
      setAuthToken(data.token);
      return { 
        success: true, 
        user: data.user 
      };
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

// Regular register function
export async function register(username: string, email: string, password: string) {
  try {
    console.log("Attempting registration for:", username);
    
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await response.json();
    console.log("Registration response:", data);
    
    if (response.ok && data.token) {
      setAuthToken(data.token);
      return { 
        success: true, 
        user: data.user 
      };
    }
    
    return { 
      success: false, 
      error: data.message || "Registration failed" 
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: error.message || "Registration failed. Please try again." 
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
