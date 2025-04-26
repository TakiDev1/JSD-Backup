import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { checkAuth, logout, loginWithDiscord, isAdmin, getUserAvatar } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  login: () => void;
  logout: () => Promise<void>;
  getUserAvatar: (user: any) => string;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isPremium: false,
  premiumExpiresAt: null,
  login: () => {},
  logout: async () => {},
  getUserAvatar: () => "",
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: checkAuth,
    staleTime: 60000, // 1 minute
    retry: false, // Don't retry failed auth requests
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  
  const handleLogin = async () => {
    try {
      // Use the loginWithDiscord function from auth.ts
      const result = await loginWithDiscord();
      
      // The function will redirect to Discord OAuth page
      // If it returns false, that means Discord auth is not available
      if (result === false) {
        toast({
          title: "Login Failed",
          description: "Discord authentication is not currently available. Please try again later or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Discord login error:", error);
      toast({
        title: "Login Failed",
        description: "There was a problem with Discord authentication. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = async () => {
    const success = await logout();
    
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Check if premium status is active
  const now = new Date();
  const premiumExpiresAt = user?.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
  const isPremium = user?.isPremium && premiumExpiresAt ? premiumExpiresAt > now : false;

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(user),
    isPremium,
    premiumExpiresAt,
    login: handleLogin,
    logout: handleLogout,
    getUserAvatar: getUserAvatar,
    refreshUser: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      return refetch();
    },
  };
  
  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
