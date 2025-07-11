import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Forum categories
export function useForumCategories() {
  return useQuery({
    queryKey: ["/api/forum/categories"],
  });
}

// Forum threads for a category
export function useForumThreads(categoryId?: number) {
  return useQuery({
    queryKey: ["/api/forum/categories", categoryId, "threads"],
    enabled: !!categoryId,
  });
}

// Forum thread details with replies
export function useForumThread(threadId?: number) {
  return useQuery({
    queryKey: ["/api/forum/threads", threadId],
    enabled: !!threadId,
  });
}

// Create a new thread
export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, title, content }: { categoryId: number; title: string; content: string }) => {
      const res = await apiRequest("POST", `/api/forum/categories/${categoryId}/threads`, {
        title,
        content,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories", variables.categoryId, "threads"] });
    },
  });
}

// Create a reply to a thread
export function useCreateReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ threadId, content }: { threadId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/forum/threads/${threadId}/replies`, {
        content,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads", variables.threadId] });
    },
  });
}