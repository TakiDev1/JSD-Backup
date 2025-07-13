import { apiRequest } from "./queryClient";

// JWT token management
const TOKEN_KEY = 'jsd_auth_token';

// Get JWT token from cookie
function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_KEY) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Get JWT token from localStorage or cookie
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First check localStorage
  let token = localStorage.getItem(TOKEN_KEY);
  
  // If not found in localStorage, check cookies
  if (!token) {
    token = getTokenFromCookie();
    // If found in cookie, also store in localStorage for future use
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }
  
  return token;
}

// Set JWT token in localStorage and cookie
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, token);
  
  // Also set in cookie for consistency
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
}

// Remove JWT token from localStorage and cookie
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  
  // Also remove from cookie
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// Check if the user is logged in
export async function checkAuth() {
  try {
    // First, try to get token from localStorage (token-based auth)
    const token = getAuthToken();
    
    if (token) {
      console.log("Checking token-based authentication");
      const response = await fetch("/api/auth/user", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const user = await response.json();
        console.log("Token-based auth successful:", user);
        return user;
      } else {
        console.log("Token-based auth failed, removing invalid token");
        removeAuthToken();
      }
    }
    
    // If token-based auth fails, try session-based auth
    console.log("Checking session-based authentication");
    const sessionResponse = await fetch("/api/auth/user", {
      method: "GET",
      credentials: 'include', // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (sessionResponse.ok) {
      const user = await sessionResponse.json();
      console.log("Session-based auth successful:", user);
      return user;
    } else {
      console.log("Session-based auth failed");
    }
    
    // If both fail, check if there's a JWT token in cookies (Discord auth)
    const cookieToken = getCookieValue('jsd_auth_token');
    if (cookieToken) {
      console.log("Found JWT token in cookie, checking authentication");
      const cookieResponse = await fetch("/api/auth/user", {
        headers: {
          "Authorization": `Bearer ${cookieToken}`,
          "Content-Type": "application/json",
        },
      });

      if (cookieResponse.ok) {
        const user = await cookieResponse.json();
        console.log("Cookie-based auth successful:", user);
        // Store the token in localStorage for future use
        setAuthToken(cookieToken);
        return user;
      }
    }
    
    console.log("All authentication methods failed");
    return null;
  } catch (error) {
    console.error("Error checking auth:", error);
    return null;
  }
}

// Helper function to get cookie value
function getCookieValue(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Logout the user
export async function logout() {
  try {
    const token = getAuthToken();
    
    // Try to logout from both systems
    const logoutPromises = [];
    
    // Token-based logout
    if (token) {
      logoutPromises.push(
        fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );
    }
    
    // Session-based logout
    logoutPromises.push(
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include', // Include cookies for session
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    
    // Wait for all logout requests to complete
    await Promise.allSettled(logoutPromises);
    
    // Clear local authentication state
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
