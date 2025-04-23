import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

export function useForumCategories() {
  return useQuery({
    queryKey: [API.FORUM.CATEGORIES],
    queryFn: async () => {
      const response = await apiRequest("GET", API.FORUM.CATEGORIES);
      // Ensure we always return an array
      return Array.isArray(response) ? response : [];
    },
  });
}

export function useForumThreads(categoryId?: number) {
  return useQuery({
    queryKey: [API.FORUM.THREADS, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await apiRequest("GET", API.FORUM.THREADS(categoryId));
      return Array.isArray(response) ? response : [];
    },
    enabled: !!categoryId,
  });
}

export function useForumThread(threadId?: number) {
  return useQuery({
    queryKey: [API.FORUM.THREAD, threadId],
    queryFn: async () => {
      if (!threadId) return { thread: null, replies: [] };
      const response = await apiRequest("GET", API.FORUM.THREAD(threadId));
      return {
        thread: response?.thread || null,
        replies: Array.isArray(response?.replies) ? response.replies : [],
      };
    },
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, title, content }: any) => {
      return apiRequest("POST", API.FORUM.THREADS(categoryId), { title, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API.FORUM.THREADS] });
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, content }: any) => {
      return apiRequest("POST", API.FORUM.REPLIES(threadId), { content });
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: [API.FORUM.THREAD, threadId] });
    },
  });
}