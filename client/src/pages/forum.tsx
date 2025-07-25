import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  MessageCircle, 
  User, 
  Clock, 
  ArrowLeft, 
  Plus, 
  Search,
  Filter,
  ChevronRight,
  Pin,
  Lock,
  Trash2,
  Edit,
  Loader2,
  PlusCircle,
  Reply,
  Eye,
  MessageSquare
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Form schemas
const threadFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

const replyFormSchema = z.object({
  content: z.string().min(5, "Reply must be at least 5 characters"),
});

// Form types
type ThreadFormValues = z.infer<typeof threadFormSchema>;
type ReplyFormValues = z.infer<typeof replyFormSchema>;

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  threadCount: number;
  lastActivity: string;
}

interface ForumThread {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  authorId: number;
  authorName: string;
  userId: number;
  viewCount: number;
  createdAt: string;
  lastReplyAt: string;
  updatedAt?: string;
}

interface ForumReply {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  userId: number;
  createdAt: string;
}

interface ThreadData {
  thread: ForumThread;
  replies: ForumReply[];
}

export default function Forum() {
  const { categoryId, threadId } = useParams<{ categoryId?: string; threadId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);

  // Form instances
  const threadForm = useForm<ThreadFormValues>({
    resolver: zodResolver(threadFormSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const replyForm = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Authentication check
  const isAuthenticated = !!user;

  // Fetch forum categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ['/api/forum/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/forum/categories');
      return res.json();
    },
  });

  // Fetch threads for a category
  const { data: threads = [], isLoading: isThreadsLoading } = useQuery<ForumThread[]>({
    queryKey: ['/api/forum/threads', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await apiRequest('GET', `/api/forum/categories/${categoryId}/threads`);
      return res.json();
    },
    enabled: !!categoryId && !threadId,
  });

  // Fetch thread details and replies
  const { data: threadData, isLoading: isThreadLoading } = useQuery<ThreadData>({
    queryKey: ['/api/forum/thread', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      const res = await apiRequest('GET', `/api/forum/threads/${threadId}`);
      return res.json();
    },
    enabled: !!threadId,
  });

  const thread = threadData?.thread;
  const replies = threadData?.replies || [];

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: async (data: ThreadFormValues) => {
      const res = await apiRequest('POST', `/api/forum/categories/${categoryId}/threads`, data);
      return res.json();
    },
    onSuccess: (newThread) => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/threads', categoryId] });
      setIsNewThreadOpen(false);
      threadForm.reset();
      toast({
        title: "Thread created",
        description: "Your thread has been created successfully.",
      });
      navigate(`/forum/${categoryId}/thread/${newThread.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (data: ReplyFormValues) => {
      const res = await apiRequest('POST', `/api/forum/threads/${threadId}/replies`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/thread', threadId] });
      replyForm.reset();
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const onCreateThread = (data: ThreadFormValues) => {
    createThreadMutation.mutate(data);
  };

  const onCreateReply = (data: ReplyFormValues) => {
    createReplyMutation.mutate(data);
  };

  // Utility function to get user avatar
  const getUserAvatar = (user: { id: number }) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user.id}`;
  };

  // Find current category
  const currentCategory = categories?.find((cat: ForumCategory) => cat.id === Number(categoryId));

  // Filter threads
  const filteredThreads = threads?.filter((thread: ForumThread) =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || 
     (filterType === 'pinned' && thread.isPinned) ||
     (filterType === 'locked' && thread.isLocked))
  );

  // Determine what to render
  let content;
  
  if (threadId) {
    // Show single thread with replies
    content = (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-neutral hover:text-white"
              onClick={() => navigate(`/forum/${categoryId}`)}
            >
              Forum
            </Button>
            <ChevronRight className="h-4 w-4 text-neutral" />
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-neutral hover:text-white"
              onClick={() => navigate(`/forum/${categoryId}`)}
            >
              {currentCategory?.name || "Category"}
            </Button>
            <ChevronRight className="h-4 w-4 text-neutral" />
            <span className="text-white">Thread</span>
          </div>
          
          <div className="flex space-x-3">
            {isAuthenticated && !thread?.isLocked && (
              <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                <Reply className="mr-2 h-4 w-4" /> Reply
              </Button>
            )}
          </div>
        </div>
        
        {isThreadLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : !thread ? (
          <Card className="bg-dark-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-neutral-light">Thread not found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/forum")}
                >
                  Back to Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-dark-card">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-white">
                      {thread.title}
                      {thread.isPinned && (
                        <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
                          <Pin className="h-3 w-3 mr-1" /> Pinned
                        </Badge>
                      )}
                      {thread.isLocked && (
                        <Badge variant="outline" className="ml-2 bg-red-500/10 text-red-500 border-red-500/20">
                          <Lock className="h-3 w-3 mr-1" /> Locked
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-neutral">
                        <Eye className="h-3 w-3 mr-1" /> {thread.viewCount || 0} views
                      </Badge>
                      <Badge variant="outline" className="text-neutral">
                        <MessageSquare className="h-3 w-3 mr-1" /> {replies.length} replies
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserAvatar({ id: thread.userId })} />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">
                          {/* In a real app, you would fetch the username */}
                          User {thread.userId}
                        </h3>
                        <p className="text-neutral text-sm">
                          Posted {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={thread.userId === user?.id ? "bg-primary/10 text-primary border-primary/20" : ""}
                      >
                        {thread.userId === user?.id ? "Author" : "Member"}
                      </Badge>
                    </div>
                    <div className="mt-4 text-neutral-light whitespace-pre-wrap">
                      {thread.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Replies */}
            {replies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-display font-semibold text-white">
                  Replies ({replies.length})
                </h3>
                
                <div className="space-y-4">
                  {replies.map((reply: any) => (
                    <Card key={reply.id} className="bg-dark-card">
                      <CardContent className="pt-6">
                        <div className="flex">
                          <div className="flex-shrink-0 mr-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={getUserAvatar({ id: reply.userId })} />
                              <AvatarFallback>US</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-white font-medium">
                                  {/* In a real app, you would fetch the username */}
                                  User {reply.userId}
                                </h3>
                                <p className="text-neutral text-sm">
                                  Replied {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={reply.userId === thread.userId ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                  reply.userId === user?.id ? "bg-primary/10 text-primary border-primary/20" : ""}
                              >
                                {reply.userId === thread.userId ? "Original Poster" : 
                                  reply.userId === user?.id ? "You" : "Member"}
                              </Badge>
                            </div>
                            <div className="mt-4 text-neutral-light whitespace-pre-wrap">
                              {reply.content}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reply form */}
            {isAuthenticated && !thread?.isLocked && (
              <Card className="bg-dark-card">
                <CardHeader>
                  <CardTitle className="text-xl font-display text-white">
                    Post Reply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...replyForm}>
                    <form onSubmit={replyForm.handleSubmit(onCreateReply)} className="space-y-4">
                      <FormField
                        control={replyForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Write your reply here..."
                                className="h-32 bg-dark resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={createReplyMutation.isPending}
                        >
                          {createReplyMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Reply className="mr-2 h-4 w-4" />
                              Post Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  } else if (categoryId) {
    // Show threads in a category
    content = (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-neutral hover:text-white"
              onClick={() => navigate("/forum")}
            >
              Forum
            </Button>
            <ChevronRight className="h-4 w-4 text-neutral" />
            <span className="text-white">{currentCategory?.name || "Category"}</span>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search threads..."
                className="pl-10 bg-dark-card md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
            {isAuthenticated && (
              // Show the New Thread button unless we're in Announcements category (ID 1) and user is not JSD or Von
              (categoryId !== '1' || user?.isAdmin || user?.username === 'JSD' || user?.username === 'Von') ? (
                <Button onClick={() => setIsNewThreadOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Thread
                </Button>
              ) : null
            )}
          </div>
        </div>
        
        {isThreadsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : !threads || threads.length === 0 ? (
          <Card className="bg-dark-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-neutral-light">No threads found in this category</p>
                {isAuthenticated && (
                  // Only show the Create First Thread button if user has permission
                  (categoryId !== '1' || user?.isAdmin || user?.username === 'JSD' || user?.username === 'Von') ? (
                    <Button 
                      className="mt-4"
                      onClick={() => setIsNewThreadOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Create First Thread
                    </Button>
                  ) : (
                    <p className="mt-4 text-neutral">Only JSD and Von can post announcements</p>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ) : filteredThreads.length === 0 ? (
          <Card className="bg-dark-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-neutral-light">No threads match your search</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredThreads.map((thread: any) => (
              <Card key={thread.id} className="bg-dark-card hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/forum/${categoryId}/thread/${thread.id}`)}
                    >
                      <h3 className="text-lg font-display font-semibold text-white group-hover:text-primary-light transition-colors flex items-center">
                        {thread.title}
                        {thread.isPinned && (
                          <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
                            <Pin className="h-3 w-3 mr-1" /> Pinned
                          </Badge>
                        )}
                        {thread.isLocked && (
                          <Badge variant="outline" className="ml-2 bg-red-500/10 text-red-500 border-red-500/20">
                            <Lock className="h-3 w-3 mr-1" /> Locked
                          </Badge>
                        )}
                      </h3>
                      <div className="text-neutral mt-2 text-sm line-clamp-1">
                        {thread.content}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-neutral">
                          <Eye className="h-3 w-3 mr-1" /> {thread.viewCount || 0}
                        </Badge>
                        <Badge variant="outline" className="text-neutral">
                          <MessageSquare className="h-3 w-3 mr-1" /> {thread.replyCount || 0}
                        </Badge>
                      </div>
                      <div className="text-neutral text-sm mt-2">
                        Updated {thread.updatedAt ? formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true }) : 'recently'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    // Show categories
    content = (
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-white">
          Forum Categories
        </h2>
        
        {isCategoriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <Card className="bg-dark-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-neutral-light">No categories found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category: any) => (
              <Card 
                key={category.id}
                className="bg-dark-card hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/forum/${category.id}`)}
              >
                <CardContent className="pt-6">
                  <h3 className="text-xl font-display font-semibold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-neutral line-clamp-2">
                    {category.description || "No description"}
                  </p>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      View Threads
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
        Community <span className="text-primary">Forum</span>
      </h1>
      
      {content}
      
      {/* Create Thread Dialog */}
      <Dialog open={isNewThreadOpen} onOpenChange={setIsNewThreadOpen}>
        <DialogContent className="bg-dark-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">
              Create New Thread
            </DialogTitle>
          </DialogHeader>
          
          <Form {...threadForm}>
            <form onSubmit={threadForm.handleSubmit(onCreateThread)} className="space-y-6">
              <FormField
                control={threadForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thread Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter thread title" className="bg-dark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={threadForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post here..."
                        className="h-48 bg-dark resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewThreadOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createThreadMutation.isPending}
                >
                  {createThreadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : "Create Thread"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
