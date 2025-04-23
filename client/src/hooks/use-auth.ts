
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => Promise<void>;
  getUserAvatar: (user: any) => string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,

      login: () => {
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
      },

      logout: async () => {
        try {
          await apiRequest("POST", "/api/auth/logout");
          set({ user: null, isAuthenticated: false, isAdmin: false });
          window.location.reload();
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },

      getUserAvatar: (user) => {
        if (!user) return "";
        if (user.discordAvatar) {
          return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`;
      }
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    }
  )
);

// Auth provider wrapper component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("GET", "/api/auth/user"),
    retry: false,
    refetchOnWindowFocus: false
  });

  useAuth.setState({
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  });

  return children;
};
