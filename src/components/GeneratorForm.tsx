import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Lightbulb, Lock } from "lucide-react";

interface GeneratorFormProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

const exampleTopics = [
  "AI in Indian startups",
  "Remote work culture in India",
  "Career growth tips for developers",
  "Tech layoffs and resilience",
  "Learning new programming languages",
];

const GeneratorForm = forwardRef<HTMLDivElement, GeneratorFormProps>(
  ({ onGenerate, isLoading, disabled = false, disabledReason }, ref) => {
    const [topic, setTopic] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (topic.trim() && !disabled) {
        onGenerate(topic.trim());
      }
    };

    const handleExampleClick = (example: string) => {
      setTopic(example);
    };

    const isButtonDisabled = !topic.trim() || isLoading || disabled;

    return (
      <Card className="border-primary/20 shadow-lg" ref={ref}>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium text-foreground">
                Enter your topic, phrase, or question
              </label>
              <div className="relative">
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The future of AI in Indian IT industry..."
                  className="h-12 text-base pr-4 border-border focus:border-primary focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Posts...
                </>
              ) : disabled ? (
                <>
                  <Lock className="h-5 w-5" />
                  {disabledReason || "Limit Reached"}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate 3 Posts
                </>
              )}
            </Button>

            {disabled && disabledReason && (
              <p className="text-sm text-center text-muted-foreground">
                {disabledReason}
              </p>
            )}
          </form>

          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Try these examples</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleTopics.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

GeneratorForm.displayName = "GeneratorForm";

export default GeneratorForm;
