import React from 'react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, Pin, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Thread {
  id: number;
  title: string;
  content: string;
  userId: number;
  viewCount: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostListProps {
  threads: Thread[];
  isLoading?: boolean;
  error?: any;
}

const PostList: React.FC<PostListProps> = ({ threads }) => {
  const [, navigate] = useLocation();
  const { getUserAvatar } = useAuth();

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