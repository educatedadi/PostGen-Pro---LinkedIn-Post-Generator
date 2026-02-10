import { useState, forwardRef } from "react";
import { History, Trash2, ChevronDown, ChevronUp, Copy, Check, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedPost } from "@/hooks/usePostHistory";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostHistoryProps {
  savedPosts: SavedPost[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const SavedPostCard = ({
  post,
  onRemove,
}: {
  post: SavedPost;
  onRemove: (id: string) => void;
}) => {
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const copyToClipboard = async (text: string, type: "content" | "prompt") => {
    await navigator.clipboard.writeText(text);
    if (type === "content") {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
    toast.success(`${type === "content" ? "Post" : "Image prompt"} copied!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {post.topic}
            </span>
            <p className="text-xs text-muted-foreground">
              {formatDate(post.savedAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(post.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
          {post.content}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => copyToClipboard(post.content, "content")}
          >
            {copiedContent ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            Copy Post
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => copyToClipboard(post.imagePrompt, "prompt")}
          >
            {copiedPrompt ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Image className="h-3 w-3 mr-1" />
            )}
            Copy Prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PostHistory = forwardRef<HTMLDivElement, PostHistoryProps>(
  ({ savedPosts, onRemove, onClearAll }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (savedPosts.length === 0) {
      return null;
    }

    return (
      <Card className="bg-card border-border/50" ref={ref}>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Saved Posts ({savedPosts.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              {isExpanded && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all saved posts?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {savedPosts.length} saved
                        posts from your history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onClearAll();
                          toast.success("History cleared");
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {savedPosts.map((post) => (
                <SavedPostCard key={post.id} post={post} onRemove={onRemove} />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }
);

PostHistory.displayName = "PostHistory";

export default PostHistory;
