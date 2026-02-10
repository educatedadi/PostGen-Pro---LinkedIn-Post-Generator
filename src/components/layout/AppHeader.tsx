import { User, Settings } from "lucide-react";

interface AppHeaderProps {
  title: string;
  rightIcon?: "settings" | "filter" | "search";
  onRightAction?: () => void;
}

export default function AppHeader({ title, rightIcon = "settings", onRightAction }: AppHeaderProps) {
  const RightIcon = rightIcon === "settings" ? Settings : rightIcon === "filter" ? Settings : Settings;

  return (
    <header className="flex items-center bg-background p-4 pb-2 justify-between border-b border-border sticky top-0 z-10">
      <div className="flex size-12 shrink-0 items-center text-foreground">
        <User className="h-6 w-6" />
      </div>
      <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight flex-1 px-2 text-center">
        {title}
      </h2>
      <div className="flex w-12 items-center justify-end">
        <button 
          onClick={onRightAction}
          className="flex cursor-pointer items-center justify-center h-12 bg-transparent text-foreground p-0"
        >
          <RightIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
