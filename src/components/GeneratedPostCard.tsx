import { Copy, Bookmark, Image } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface GeneratedPostCardProps {
  content: string;
  imagePrompt?: string;
  onSave: () => void;
  isSaved: boolean;
}

export default function GeneratedPostCard({ content, imagePrompt, onSave, isSaved }: GeneratedPostCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleCopyImagePrompt = () => {
    if (imagePrompt) {
      navigator.clipboard.writeText(imagePrompt);
      toast.success("Image prompt copied!");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>

      {imagePrompt && (
        <div className="px-4 pb-4">
          <button
            onClick={handleCopyImagePrompt}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Image className="h-4 w-4" />
            <span className="truncate">{imagePrompt}</span>
          </button>
        </div>
      )}

      <div className="flex border-t border-border px-2 py-2 justify-between items-center bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-primary"
        >
          <Copy className="h-4 w-4 mr-1" />
          <span className="text-xs font-semibold">Copy</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={isSaved}
          className={isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}
        >
          <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? "fill-current" : ""}`} />
          <span className="text-xs font-semibold">{isSaved ? "Saved" : "Save"}</span>
        </Button>
      </div>
    </div>
  );
}
