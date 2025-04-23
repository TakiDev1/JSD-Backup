import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

export function useForumCategories() {
  return useQuery({
    queryKey: [API.FORUM.CATEGORIES],
    queryFn: () => apiRequest("GET", API.FORUM.CATEGORIES),
  });
}

export function useForumThreads(categoryId?: number) {
  return useQuery({
    queryKey: [API.FORUM.THREADS, categoryId],
    queryFn: () => categoryId ? apiRequest("GET", API.FORUM.THREADS(categoryId)) : null,
    enabled: !!categoryId,
  });
}

export function useForumThread(threadId?: number) {
  return useQuery({
    queryKey: [API.FORUM.THREAD, threadId],
    queryFn: () => threadId ? apiRequest("GET", API.FORUM.THREAD(threadId)) : null,
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