import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Eye, Pin, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface Thread {
  id: number;
  title: string;
  content: string;
  userId: number;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface PostListProps {
  threads: Thread[];
  isLoading?: boolean;
  error?: any;
}

const PostList = ({ threads, isLoading, error }: PostListProps) => {
  const [, navigate] = useLocation();
  const { getUserAvatar } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-dark-card">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="ml-4 flex flex-col items-end justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-32 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-dark-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-neutral-light">Error loading threads. Please try again.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Card className="bg-dark-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-neutral-light">No threads found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <Card 
          key={thread.id}
          className="bg-dark-card hover:border-primary/30 transition-all duration-300 cursor-pointer"
          onClick={() => navigate(`/forum/thread/${thread.id}`)}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={getUserAvatar({ id: thread.userId })} />
                    <AvatarFallback>{`U${thread.userId}`}</AvatarFallback>
                  </Avatar>
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
                </div>
                <div className="text-neutral mt-2 text-sm line-clamp-1 ml-11">
                  {thread.content}
                </div>
              </div>
              <div className="ml-4 flex flex-col items-end justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-neutral">
                    <Eye className="h-3 w-3 mr-1" /> {thread.viewCount}
                  </Badge>
                  <Badge variant="outline" className="text-neutral">
                    <MessageSquare className="h-3 w-3 mr-1" /> {thread.replyCount || 0}
                  </Badge>
                </div>
                <div className="text-neutral text-sm mt-2">
                  Updated {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
