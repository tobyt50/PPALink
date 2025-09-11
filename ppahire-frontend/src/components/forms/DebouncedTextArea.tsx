import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

type SavingState = 'idle' | 'saving' | 'saved';

interface DebouncedTextareaProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
}

export const DebouncedTextarea = ({ initialValue, onSave, placeholder }: DebouncedTextareaProps) => {
  const [text, setText] = useState(initialValue);
  const debouncedText = useDebounce(text, 1500); // Debounce for 1.5 seconds
  const [savingState, setSavingState] = useState<SavingState>('idle');

  // This effect triggers the save operation when the debounced text changes
  useEffect(() => {
    // Don't save on the initial render
    if (debouncedText !== initialValue) {
      setSavingState('saving');
      onSave(debouncedText)
        .then(() => setSavingState('saved'))
        .catch(() => setSavingState('idle')); // Reset on error
    }
  }, [debouncedText, initialValue, onSave]);

  const SavingIndicator = () => {
    if (savingState === 'saving') return <span className="flex items-center text-xs text-gray-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving...</span>;
    if (savingState === 'saved') return <span className="text-xs text-gray-500">Saved</span>;
    return null;
  };

  return (
    <div>
      <textarea
        rows={6}
        placeholder={placeholder}
        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSavingState('idle'); // Reset saved status on new input
        }}
      />
      <div className="text-right h-4 mt-1">
        <SavingIndicator />
      </div>
    </div>
  );
};