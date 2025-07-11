import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth"; // Added import for useAuth
import { Mod } from "@shared/schema";

interface ModsQueryParams {
  category?: string;
  search?: string;
  featured?: boolean;
  subscription?: boolean;
  limit?: number;
  page?: number;
}

export function useModsList(params: ModsQueryParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);
  if (params.featured !== undefined) queryParams.append("featured", params.featured.toString());
  if (params.subscription !== undefined) queryParams.append("subscription", params.subscription.toString());
  if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
  if (params.page !== undefined) queryParams.append("page", params.page.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `${API.MODS.LIST}${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await apiRequest("GET", endpoint);
      const data = await response.json();
      
      // Ensure we have proper structure
      if (!data) return { mods: [], pagination: { total: 0, pageSize: 10, page: 1 } };
      return {
        mods: Array.isArray(data.mods) ? data.mods : [],
        pagination: data.pagination || { total: 0, pageSize: 10, page: 1 }
      };
    },
    staleTime: 60000, // 1 minute
  });
}

export function useModDetails(id: number | undefined) {
  return useQuery({
    queryKey: [API.MODS.DETAILS(id || 0)],
    queryFn: async () => {
      if (!id) return { mod: null };
      const response = await apiRequest("GET", API.MODS.DETAILS(id));
      const data = await response.json();
      
      // Ensure we have proper structure
      if (!data) return { mod: null };
      return {
        mod: data || null,
        latestVersion: data.latestVersion || null
      };
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

export function useModVersions(modId: number | undefined) {
  return useQuery({
    queryKey: [API.MODS.VERSIONS(modId || 0)],
    queryFn: async () => {
      if (!modId) return [];
      const response = await apiRequest("GET", API.MODS.VERSIONS(modId));
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!modId,
    staleTime: 60000, // 1 minute
  });
}

export function useModLocker() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [API.MOD_LOCKER],
    queryFn: async () => {
      const response = await apiRequest("GET", API.MOD_LOCKER);
      const data = await response.json();
      return data;
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCategoryCounts() {
  const endpoint = `/api/mods/counts/by-category`;
  
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await apiRequest("GET", endpoint);
      const data = await response.json();
      return data || [];
    },
    staleTime: 60000, // 1 minute
  });
}

export function useDownloadMod(modId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/mods/${modId}/download`);
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mod-${modId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  });
}

// Review system has been removed

// Admin mutations
export function useCreateMod() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mod: Omit<Mod, "id" | "downloadCount" | "averageRating" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", API.MODS.LIST, mod);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API.MODS.LIST] });
      queryClient.invalidateQueries({ queryKey: ["/api/mods/counts/by-category"] });
      toast({
        title: "Mod created",
        description: "The mod has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the mod. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMod() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      mod,
    }: {
      id: number;
      mod: Partial<Omit<Mod, "id" | "downloadCount" | "averageRating" | "createdAt" | "updatedAt">>;
    }) => {
      const res = await apiRequest("PUT", API.MODS.DETAILS(id), mod);
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [API.MODS.LIST] });
      queryClient.invalidateQueries({ queryKey: [API.MODS.DETAILS(id)] });
      queryClient.invalidateQueries({ queryKey: ["/api/mods/counts/by-category"] });
      toast({
        title: "Mod updated",
        description: "The mod has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the mod. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMod() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", API.MODS.DETAILS(id));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API.MODS.LIST] });
      queryClient.invalidateQueries({ queryKey: ["/api/mods/counts/by-category"] });
      toast({
        title: "Mod deleted",
        description: "The mod has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the mod. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Removed useTogglePublishMod function as publish/unpublish functionality has been removed
// All mods are now shown directly without requiring a publish step