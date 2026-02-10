import { Copy, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SavedPost {
  id: string;
  topic: string;
  content: string;
  tone?: string;
  savedAt: Date;
}

interface SavedTabProps {
  posts: SavedPost[];
  onRemove: (id: string) => void;
}

const toneColors: Record<string, string> = {
  professional: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  inspirational: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  humorous: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  educational: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

const topicColors: Record<string, string> = {
  default: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
};

export default function SavedTab({ posts, onRemove }: SavedTabProps) {
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleShare = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ text: content });
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopy(content);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pb-24">
      <div className="flex justify-between items-end pt-8 pb-4">
        <div>
          <h1 className="text-foreground tracking-tight text-2xl font-bold leading-tight">Your Library</h1>
          <p className="text-muted-foreground text-sm">
            {posts.length} saved {posts.length === 1 ? "template" : "templates"} ready to use
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No saved posts yet</p>
          <p className="text-sm mt-1">Save posts from the Create tab to see them here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 py-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col rounded-xl bg-card border border-border shadow-sm overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-2">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", topicColors.default)}>
                      Topic: {post.topic}
                    </span>
                    {post.tone && (
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider capitalize", toneColors[post.tone] || toneColors.professional)}>
                        {post.tone}
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    Saved {formatDistanceToNow(post.savedAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>
              <div className="flex border-t border-border px-2 py-2 justify-between items-center bg-muted/30">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleCopy(post.content)}
                    className="p-2 text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">Copy</span>
                  </button>
                  <button
                    onClick={() => handleShare(post.content)}
                    className="p-2 text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">Share</span>
                  </button>
                </div>
                <button
                  onClick={() => onRemove(post.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
