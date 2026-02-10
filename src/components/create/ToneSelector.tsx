import { cn } from "@/lib/utils";

export type ToneType = "professional" | "inspirational" | "humorous" | "educational";

interface ToneSelectorProps {
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
  disabled?: boolean;
}

const tones: { id: ToneType; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "inspirational", label: "Inspirational" },
  { id: "humorous", label: "Humorous" },
  { id: "educational", label: "Educational" },
];

export default function ToneSelector({ selectedTone, onToneChange, disabled }: ToneSelectorProps) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <p className="text-foreground text-sm font-medium">Desired Tone</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {tones.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onToneChange(id)}
            disabled={disabled}
            className={cn(
              "flex-none px-4 py-2 rounded-full text-xs font-bold transition-colors",
              selectedTone === id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
