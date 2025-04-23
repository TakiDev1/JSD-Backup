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
      // Check if Discord auth is configured
      const response = await apiRequest("GET", "/api/auth/discord", undefined, false);
      
      if (response.status === 503) {
        // Discord auth not configured
        toast({
          title: "Login Failed",
          description: "Discord authentication is not currently available. Please try again later or contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Discord auth is available, proceed with popup
      const width = 500;
      const height = 800;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `/api/auth/discord`,
        "discord-auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (popup) {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.location.reload();
          }
        }, 500);
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
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(user),
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
