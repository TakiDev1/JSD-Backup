import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function useModLocker() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["/api/mod-locker"],
    queryFn: async () => {
      if (!isAuthenticated) {
        return { purchasedMods: [], subscriptionMods: [], hasSubscription: false };
      }
      
      const response = await fetch("/api/mod-locker", {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch mod locker data");
      }
      
      return response.json();
    },
    enabled: isAuthenticated
  });
}