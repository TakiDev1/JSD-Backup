import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForumCategories, useForumThreads, useForumThread, useCreateThread, useCreateReply } from "@/hooks/use-forum";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PostList from "@/components/forum/post-list";
import PostEditor from "@/components/forum/post-editor";
import { Loader2, MessageSquare, Eye, Pin, Lock, ChevronRight, PlusCircle, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

const ForumPage = () => {
  const params = useParams<{ categoryId?: string, threadId?: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, user, getUserAvatar } = useAuth();
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Parse IDs from params
  const categoryId = params.categoryId ? parseInt(params.categoryId) : undefined;
  const threadId = params.threadId ? parseInt(params.threadId) : undefined;
  
  // Fetch data based on params
  const { data: categories, isLoading: isCategoriesLoading } = useForumCategories();
  const { data: threads, isLoading: isThreadsLoading } = useForumThreads(categoryId);
  const { data: threadData, isLoading: isThreadLoading } = useForumThread(threadId);
  
  // Current thread and replies
  const thread = threadData?.thread;
  const replies = threadData?.replies || [];
  
  // Get current category name
  const currentCategory = categories?.find((cat: any) => cat.id === categoryId);
  
  // Thread form
  const threadForm = useForm<ThreadFormValues>({
    resolver: zodResolver(threadFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  
  // Reply form
  const replyForm = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Create thread mutation
  const createThreadMutation = useCreateThread();
  
  // Create reply mutation
  const createReplyMutation = useCreateReply();
  
  // Handle create thread
  const onCreateThread = (values: ThreadFormValues) => {
    if (!categoryId) return;
    
    createThreadMutation.mutate({
      categoryId,
      title: values.title,
      content: values.content,
    }, {
      onSuccess: (newThread) => {
        setIsNewThreadOpen(false);
        threadForm.reset();
        // Navigate to new thread
        navigate(`/forum/thread/${newThread.id}`);
      },
    });
  };
  
  // Handle create reply
  const onCreateReply = (values: ReplyFormValues) => {
    if (!threadId) return;
    
    createReplyMutation.mutate({
      threadId,
      content: values.content,
    }, {
      onSuccess: () => {
        replyForm.reset();
      },
    });
  };
  
  // Filter threads based on search
  const filteredThreads = threads?.filter((thread: any) => 
    searchTerm === "" || 
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                        <Eye className="h-3 w-3 mr-1" /> {thread.viewCount} views
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
              (categoryId !== 1 || user?.isAdmin || user?.username === 'JSD' || user?.username === 'Von') ? (
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
                  (categoryId !== 1 || user?.isAdmin || user?.username === 'JSD' || user?.username === 'Von') ? (
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
                      onClick={() => navigate(`/forum/thread/${thread.id}`)}
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
                          <Eye className="h-3 w-3 mr-1" /> {thread.viewCount}
                        </Badge>
                        <Badge variant="outline" className="text-neutral">
                          <MessageSquare className="h-3 w-3 mr-1" /> {/* In a real app, you would fetch reply count */}
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
};

export default ForumPage;
