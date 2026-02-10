import { Zap, Infinity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsageBadgeProps {
  remaining: number;
  isAuthenticated: boolean;
  maxFree: number;
}

const UsageBadge = ({ remaining, isAuthenticated, maxFree }: UsageBadgeProps) => {
  if (isAuthenticated) {
    return (
      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
        <Infinity className="h-3 w-3" />
        Unlimited
      </Badge>
    );
  }

  const usedCount = maxFree - remaining;

  return (
    <Badge
      variant="secondary"
      className={`gap-1 ${
        remaining === 0
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : remaining === 1
          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Zap className="h-3 w-3" />
      {usedCount}/{maxFree} used
    </Badge>
  );
};

export default UsageBadge;
