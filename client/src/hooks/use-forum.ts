import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useForumCategories() {
  return useQuery({
    queryKey: [API.FORUM.CATEGORIES],
    staleTime: 300000, // 5 minutes
  });
}

export function useForumThreads(categoryId: number | undefined) {
  return useQuery({
    queryKey: [API.FORUM.THREADS(categoryId || 0)],
    enabled: !!categoryId,
    staleTime: 60000, // 1 minute
  });
}

export function useForumThread(threadId: number | undefined) {
  return useQuery({
    queryKey: [API.FORUM.THREAD(threadId || 0)],
    enabled: !!threadId,
    staleTime: 60000, // 1 minute
  });
}

export function useCreateThread() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      categoryId,
      title,
      content,
    }: {
      categoryId: number;
      title: string;
      content: string;
    }) => {
      const res = await apiRequest("POST", API.FORUM.THREADS(categoryId), {
        title,
        content,
      });
      return res.json();
    },
    onSuccess: (data, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: [API.FORUM.THREADS(categoryId)] });
      toast({
        title: "Thread created",
        description: "Your thread has been created successfully.",
      });
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your thread. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useCreateReply() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      threadId,
      content,
    }: {
      threadId: number;
      content: string;
    }) => {
      const res = await apiRequest("POST", API.FORUM.REPLIES(threadId), {
        content,
      });
      return res.json();
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: [API.FORUM.THREAD(threadId)] });
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive",
      });
    },
  });
}
