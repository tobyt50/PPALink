import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

type SavingState = "idle" | "saving" | "saved";

interface DebouncedTextareaProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string; // ✅ allow passing className
}

export const DebouncedTextarea = ({
  initialValue,
  onSave,
  placeholder,
  className,
}: DebouncedTextareaProps) => {
  const [text, setText] = useState(initialValue);
  const debouncedText = useDebounce(text, 1500); // Debounce for 1.5 seconds
  const [savingState, setSavingState] = useState<SavingState>("idle");

  // Trigger save when debounced text changes
  useEffect(() => {
    if (debouncedText !== initialValue) {
      setSavingState("saving");
      onSave(debouncedText)
        .then(() => setSavingState("saved"))
        .catch(() => setSavingState("idle")); // Reset on error
    }
  }, [debouncedText, initialValue, onSave]);

  const SavingIndicator = () => {
    if (savingState === "saving")
      return (
        <span className="flex items-center text-xs text-gray-500 dark:text-zinc-400">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Saving...
        </span>
      );
    if (savingState === "saved")
      return <span className="text-xs text-gray-500 dark:text-zinc-400">Saved</span>;
    return null;
  };

  return (
    <div>
      <textarea
        rows={6}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSavingState("idle"); // Reset saved status on new input
        }}
        className={`w-full rounded-md border-gray-300 dark:border-zinc-800 text-sm shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 
          focus:border-primary-500 focus:ring-primary-500 
          placeholder:text-gray-400 dark:placeholder:text-zinc-500
          ${className || ""}`}
      />
      <div className="text-right h-4 mt-1">
        <SavingIndicator />
      </div>
    </div>
  );
};
