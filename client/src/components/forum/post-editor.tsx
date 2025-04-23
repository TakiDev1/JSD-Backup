import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Bold, Italic, List, Link as LinkIcon, Image, Eye } from "lucide-react";

interface PostEditorProps {
  isReply?: boolean;
  initialValue?: string;
  onSubmit: (content: string, title?: string) => void;
  isSubmitting?: boolean;
}

const PostEditor = ({
  isReply = false,
  initialValue = "",
  onSubmit,
  isSubmitting = false,
}: PostEditorProps) => {
  const [content, setContent] = useState(initialValue);
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState<string>("write");
  
  const handleSubmit = () => {
    if (isReply) {
      onSubmit(content);
    } else {
      onSubmit(content, title);
    }
  };
  
  const insertFormatting = (format: string) => {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "list":
        formattedText = `\n- ${selectedText}`;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        break;
      case "image":
        formattedText = `![${selectedText}](image_url)`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };
  
  // Basic markdown preview
  const getPreviewHtml = () => {
    // This is a very simplified markdown preview
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n- (.*)/g, '<ul><li>$1</li></ul>') // Lists
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>') // Links
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md" />') // Images
      .replace(/\n/g, '<br />'); // Line breaks
    
    return html;
  };
  
  return (
    <Card className="bg-dark-card">
      <CardHeader>
        <CardTitle className="text-xl font-display text-white">
          {isReply ? "Write Reply" : "Create New Thread"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReply && (
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-neutral-light">
              Thread Title
            </label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-dark"
            />
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-dark-lighter">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="space-y-4">
            <div className="flex flex-wrap gap-2 bg-dark-lighter p-2 rounded-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-neutral-light hover:text-white"
                onClick={() => insertFormatting("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-neutral-light hover:text-white"
                onClick={() => insertFormatting("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-neutral-light hover:text-white"
                onClick={() => insertFormatting("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-neutral-light hover:text-white"
                onClick={() => insertFormatting("link")}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-neutral-light hover:text-white"
                onClick={() => insertFormatting("image")}
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea 
              id="editor"
              placeholder={isReply ? "Write your reply here..." : "Write your post content here..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-dark font-mono resize-y"
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="bg-dark rounded-md p-4 min-h-[200px]">
              {content ? (
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              ) : (
                <div className="text-neutral-light flex items-center justify-center h-[200px]">
                  <Eye className="h-6 w-6 mr-2" />
                  <span>Preview will appear here</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
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
