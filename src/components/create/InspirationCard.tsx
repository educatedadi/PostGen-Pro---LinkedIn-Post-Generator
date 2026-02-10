import { TrendingUp, Rocket, Briefcase, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InspirationCardProps {
  title: string;
  description: string;
  icon: "trending" | "rocket" | "briefcase";
  iconColor: "blue" | "green" | "purple";
  onClick: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  trending: TrendingUp,
  rocket: Rocket,
  briefcase: Briefcase,
};

const colorMap = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-primary",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
};

export default function InspirationCard({ title, description, icon, iconColor, onClick }: InspirationCardProps) {
  const Icon = iconMap[icon];

  return (
    <button
      onClick={onClick}
      className="flex items-center p-4 rounded-xl bg-card border border-border text-left hover:border-primary transition-colors group shadow-sm"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colorMap[iconColor])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}
