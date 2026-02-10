import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Image, Sparkles, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface PostCardProps {
  postNumber: number;
  content: string;
  imagePrompt: string;
  onSave?: () => void;
  isSaved?: boolean;
}

const PostCard = ({ postNumber, content, imagePrompt, onSave, isSaved }: PostCardProps) => {
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const characterCount = content.length;
  const isOptimalLength = characterCount >= 1200 && characterCount <= 2500;

  const copyToClipboard = async (text: string, type: "post" | "prompt") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "post") {
        setCopiedPost(true);
        setTimeout(() => setCopiedPost(false), 2000);
        toast.success("Post copied to clipboard!");
      } else {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
        toast.success("Image prompt copied to clipboard!");
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Post {postNumber}</span>
          </div>
          <Badge 
            variant={isOptimalLength ? "default" : "secondary"}
            className={isOptimalLength ? "bg-primary/10 text-primary border-primary/20" : ""}
          >
            {characterCount} characters
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
          <p className="whitespace-pre-wrap text-foreground leading-relaxed text-sm">
            {content}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">AI Image Prompt</span>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 border border-border/30">
            <p className="text-sm text-muted-foreground italic">{imagePrompt}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="gap-2 pt-2">
        <Button
          onClick={() => copyToClipboard(content, "post")}
          className="flex-1"
          variant={copiedPost ? "secondary" : "default"}
        >
          {copiedPost ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Post
            </>
          )}
        </Button>
        <Button
          onClick={() => copyToClipboard(imagePrompt, "prompt")}
          variant="outline"
          className="flex-1"
        >
          {copiedPrompt ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Image className="h-4 w-4" />
              Copy Prompt
            </>
          )}
        </Button>
        {onSave && (
          <Button
            onClick={() => {
              onSave();
              toast.success("Post saved to history!");
            }}
            variant="outline"
            disabled={isSaved}
            className={isSaved ? "text-primary border-primary/50" : ""}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
