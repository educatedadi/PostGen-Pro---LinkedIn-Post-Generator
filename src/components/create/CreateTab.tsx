import { useState } from "react";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToneSelector, { type ToneType } from "./ToneSelector";
import InspirationCard from "./InspirationCard";

interface CreateTabProps {
  onGenerate: (topic: string, tone: ToneType) => void;
  isLoading: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onOpenSettings?: () => void;
}

const MAX_CHARS = 200;

const inspirations = [
  { title: "Recent industry trends", description: "Share your take on the latest news", icon: "trending" as const, iconColor: "blue" as const },
  { title: "Product launch announcement", description: "Build hype for your new project", icon: "rocket" as const, iconColor: "green" as const },
  { title: "A day in the life", description: "Give a behind-the-scenes look at your work", icon: "briefcase" as const, iconColor: "purple" as const },
];

export default function CreateTab({ onGenerate, isLoading, disabled, disabledReason, onOpenSettings }: CreateTabProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled && onOpenSettings) {
      onOpenSettings();
      return;
    }
    if (topic.trim()) {
      onGenerate(topic.trim(), tone);
    }
  };

  const handleInspirationClick = (title: string) => {
    setTopic(title);
  };

  const isButtonDisabled = !topic.trim() || isLoading;
  const showSignInState = disabled && !isLoading;
  const charCount = topic.length;

  return (
    <div className="max-w-md mx-auto w-full px-4 mb-24">
      <h1 className="text-foreground tracking-tight text-[28px] font-bold leading-tight pb-3 pt-8">
        Create your next LinkedIn post
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Enter a topic and our AI will craft a high-engagement post for your professional network.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 py-3">
          <label className="flex flex-col w-full">
            <div className="flex justify-between items-center pb-2">
              <p className="text-foreground text-base font-medium leading-normal">Topic</p>
              <span className="text-primary text-xs font-semibold">{charCount}/{MAX_CHARS}</span>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, MAX_CHARS))}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-card placeholder:text-muted-foreground min-h-[160px] p-4 text-base font-normal leading-relaxed shadow-sm"
              placeholder="What do you want to write about today? e.g. The future of remote work..."
              disabled={isLoading}
            />
          </label>
        </div>

        <ToneSelector selectedTone={tone} onToneChange={setTone} disabled={isLoading} />

        <div className="flex py-6">
          <Button
            type="submit"
            disabled={isButtonDisabled && !showSignInState}
            className="w-full h-14 text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating...
              </>
            ) : showSignInState ? (
              <>
                <Lock className="h-5 w-5 mr-2" />
                {disabledReason || "Limit Reached"}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Post
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t border-border">
        <h3 className="text-foreground text-lg font-bold leading-tight tracking-tight pb-4">
          Need some inspiration?
        </h3>
        <div className="grid grid-cols-1 gap-3 pb-10">
          {inspirations.map((item) => (
            <InspirationCard
              key={item.title}
              {...item}
              onClick={() => handleInspirationClick(item.title)}
            />
          ))}
        </div>
      </div>

      {/* Footer Credit */}
      <div className="text-center text-sm text-muted-foreground pt-6 pb-4">
        Created with love❤️ in India🇮🇳 by{" "}
        <a
          href="https://www.linkedin.com/in/adityarajshah24/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          Adi
        </a>
      </div>
    </div>
  );
}
