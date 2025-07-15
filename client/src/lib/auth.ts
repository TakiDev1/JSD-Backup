import { apiRequest } from "./queryClient";

// Hybrid authentication - handles both session-based and token-based auth
// Sessions are handled automatically via HTTP cookies
// Tokens are stored in localStorage as fallback

// Helper function to get stored token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Helper function to store token
function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

// Helper function to remove token
function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

// Check if the user is logged in
export async function checkAuth() {
  try {
    console.log("Checking auth status...");
    
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Include token in Authorization header if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch("/api/auth/user", {
      method: "GET",
      credentials: 'include', // Include cookies for session
      headers,
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Auth status:", data.username ? `Authenticated as ${data.username}` : "Not authenticated");
      
      // If we have session auth but no token, generate one
      if (data.username && !token) {
        console.log("User has session but no token, generating token...");
        await generateTokenFromSession();
      }
      
      return data.username ? data : null;
    } else {
      console.log("Auth status: Not authenticated");
      // If we have a token but it's invalid, remove it
      if (token && response.status === 401) {
        removeToken();
      }
      return null;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return null;
  }
}

// Helper function to generate JWT token from existing session
async function generateTokenFromSession() {
  try {
    console.log("Attempting to generate token from session...");
    
    const response = await fetch("/api/auth/generate-token", {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        console.log("Token generated successfully from session");
        storeToken(data.token);
        return data.token;
      }
    } else {
      console.log("Failed to generate token from session, status:", response.status);
    }
  } catch (error) {
    console.error("Error generating token from session:", error);
  }
  return null;
}

// Helper function to get cookie value
function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Logout the user
export async function logout() {
  try {
    console.log("Logging out...");
    
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Include token in Authorization header if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: 'include', // Include cookies for session
      headers,
    });
    
    const data = await response.json();
    console.log("Logout response:", data);
    
    // Clear stored token regardless of response
    removeToken();
    
    if (response.ok) {
      // Force a page refresh to clear any cached state
      window.location.href = '/';
      return { success: true };
    }
    
    return { 
      success: false, 
      error: data.message || "Logout failed" 
    };
  } catch (error: any) {
    console.error("Logout error:", error);
    // Clear token even on error
    removeToken();
    return { 
      success: false, 
      error: error.message || "Logout failed" 
    };
  }
}

// Login with Discord
export async function loginWithDiscord() {
  try {
    console.log("Initiating Discord login...");
    // Redirect to Discord OAuth endpoint
    window.location.href = "/api/auth/discord";
  } catch (error: any) {
    console.error("Discord login error:", error);
    return { 
      success: false, 
      error: error.message || "Discord login failed" 
    };
  }
}

// Regular login with username and password
export async function login(username: string, password: string) {
  try {
    console.log("Attempting login for:", username);
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: 'include', // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log("Login response:", data);
    
    if (response.ok && data.success) {
      // Store token if provided (fallback mode)
      if (data.token) {
        storeToken(data.token);
      }
      
      return { 
        success: true, 
        user: data.user 
      };
    }
    
    return { 
      success: false, 
      error: data.message || "Login failed" 
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: error.message || "Login failed" 
    };
  }
}

// Admin login with username and password
export async function adminLogin(username: string, password: string) {
  try {
    console.log("Attempting admin login for:", username);
    
    const response = await fetch("/api/auth/admin-login", {
      method: "POST",
      credentials: 'include', // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log("Admin login response:", data);
    
    if (response.ok && data.success) {
      // Store token if provided (fallback mode)
      if (data.token) {
        storeToken(data.token);
      }
      
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
      error: error.message || "Admin login failed" 
    };
  }
}

// Regular register function
export async function register(username: string, email: string, password: string) {
  try {
    console.log("Attempting registration for:", username);
    
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: 'include', // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await response.json();
    console.log("Registration response:", data);
    
    if (response.ok && data.success) {
      // Store token if provided (fallback mode)
      if (data.token) {
        storeToken(data.token);
      }
      
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
      error: error.message || "Registration failed" 
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
