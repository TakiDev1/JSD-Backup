import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PostEditorProps {
  isReply?: boolean;
  onSubmit: (title: string, content: string) => void;
  isSubmitting?: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({
  isReply = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content && (title || isReply)) {
      onSubmit(title, content);
    }
  };

  return (
    <Card className="bg-dark-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          {!isReply && (
            <div className="mb-4">
              <Input
                placeholder="Thread title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-dark text-white"
                required
              />
            </div>
          )}
          <div>
            <Textarea
              placeholder={isReply ? "Write your reply..." : "Write your post..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-dark text-white min-h-[150px]"
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={(!content || (!title && !isReply)) || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              {isReply ? "Posting..." : "Creating..."}
            </>
          ) : (
            isReply ? "Post Reply" : "Create Thread"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostEditor;