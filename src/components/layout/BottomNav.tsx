import { PenLine, History, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "create" | "history" | "saved";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "create" as const, label: "Create", icon: PenLine },
    { id: "history" as const, label: "History", icon: History },
    { id: "saved" as const, label: "Saved", icon: Bookmark },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border px-12 py-3 flex justify-between items-center max-w-md mx-auto z-50">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-bold">{label}</span>
        </button>
      ))}
    </nav>
  );
}
