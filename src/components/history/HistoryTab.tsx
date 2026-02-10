import { useState } from "react";
import { Search, MoreVertical, Copy, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HistoryPost {
  id: string;
  topic: string;
  content: string;
  tone: string;
  createdAt: Date;
}

interface HistoryTabProps {
  posts: HistoryPost[];
}

const toneColors: Record<string, string> = {
  professional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  inspirational: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  humorous: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  educational: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

function groupByDate(posts: HistoryPost[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; posts: HistoryPost[] }[] = [];
  const todayPosts: HistoryPost[] = [];
  const yesterdayPosts: HistoryPost[] = [];
  const olderPosts: HistoryPost[] = [];

  posts.forEach((post) => {
    const postDate = new Date(post.createdAt);
    postDate.setHours(0, 0, 0, 0);

    if (postDate.getTime() === today.getTime()) {
      todayPosts.push(post);
    } else if (postDate.getTime() === yesterday.getTime()) {
      yesterdayPosts.push(post);
    } else {
      olderPosts.push(post);
    }
  });

  if (todayPosts.length) groups.push({ label: "Today", posts: todayPosts });
  if (yesterdayPosts.length) groups.push({ label: "Yesterday", posts: yesterdayPosts });
  if (olderPosts.length) groups.push({ label: "Earlier", posts: olderPosts });

  return groups;
}

export default function HistoryTab({ posts }: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter(
    (post) =>
      post.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPosts = groupByDate(filteredPosts);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pb-24">
      <div className="py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search past generations..."
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts in history yet</p>
          <p className="text-sm mt-1">Generate your first post to see it here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedPosts.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2 pb-3">
                {group.label}
              </p>
              <div className="flex flex-col gap-3">
                {group.posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-card border border-border rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-foreground font-bold text-base">{post.topic}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)} • {formatTime(post.createdAt)}
                        </p>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                          toneColors[post.tone] || toneColors.professional
                        )}
                      >
                        {post.tone}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCopy(post.content)}
                          className="text-primary flex items-center gap-1 text-xs font-bold"
                        >
                          <Copy className="h-4 w-4" /> Copy
                        </button>
                        <button className="text-muted-foreground flex items-center gap-1 text-xs font-bold">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
