import { apiRequest } from "./queryClient";

// Session-based authentication - no token management needed
// Sessions are handled automatically via HTTP cookies

// Check if the user is logged in
export async function checkAuth() {
  try {
    console.log("Checking auth status...");
    
    const response = await fetch("/api/auth/user", {
      method: "GET",
      credentials: 'include', // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Auth status:", data.success ? `Authenticated as ${data.user.username}` : "Not authenticated");
      return data.success ? data.user : null;
    } else {
      console.log("Auth status: Not authenticated");
      return null;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return null;
  }
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
    
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: 'include', // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    console.log("Logout response:", data);
    
    if (response.ok) {
      // Session is destroyed server-side, no client-side cleanup needed
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
      // For session-based auth, we don't need to store tokens
      // The session is managed by cookies
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
      // For session-based auth, we don't need to store tokens
      // The session is managed by cookies
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
      // For session-based auth, we don't need to store tokens
      // The session is managed by cookies
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
