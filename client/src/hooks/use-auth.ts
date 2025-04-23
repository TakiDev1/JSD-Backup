import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { checkAuth, logout, loginWithDiscord, isAdmin, getUserAvatar } from "@/lib/auth";
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
    staleTime: 300000, // 5 minutes
  });
  
  const handleLogin = () => {
    loginWithDiscord();
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
    refreshUser: () => refetch(),
  };
  
  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
