// MultiSelect.tsx
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { DropdownTrigger } from './DropdownTrigger';
import { SimpleDropdown, SimpleDropdownItem } from './SimpleDropdown';
import { Input } from '../forms/Input';

export interface MultiSelectOption {
  value: any;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: any[];
  onChange: (selected: any[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect = ({ options, selected, onChange, placeholder = "Select...", className }: MultiSelectProps) => {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter(option =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (optionValue: any) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue];
    onChange(newSelected);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length <= 2) {
      return options
        .filter(opt => selected.includes(opt.value))
        .map(opt => opt.label)
        .join(', ');
    }
    return `${selected.length} items selected`;
  };

  const selectedOptions = options
    .filter(opt => selected.includes(opt.value))
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

  const unselectedFiltered = filteredOptions
    .filter(opt => !selected.includes(opt.value))
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

  return (
    <div className={className}>
      <SimpleDropdown
        multiselect={true}
        trigger={
          <DropdownTrigger>
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </DropdownTrigger>
        }
      >
        <div className="p-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {selectedOptions.length > 0 && (
          selectedOptions.map(option => (
            <SimpleDropdownItem
              key={option.value}
              onSelect={() => handleSelect(option.value)}
              className="justify-between"
            >
              <span>{option.label}</span>
              <Check className="h-4 w-4 text-primary-600" />
            </SimpleDropdownItem>
          ))
        )}

        {selectedOptions.length > 0 && (unselectedFiltered.length > 0 || query !== '') && (
          <hr className="my-1 border-gray-200 dark:border-zinc-700" />
        )}

        {unselectedFiltered.length > 0 ? (
          unselectedFiltered.map(option => (
            <SimpleDropdownItem
              key={option.value}
              onSelect={() => handleSelect(option.value)}
              className="justify-between"
            >
              <span>{option.label}</span>
              {selected.includes(option.value) && <Check className="h-4 w-4 text-primary-600" />}
            </SimpleDropdownItem>
          ))
        ) : query !== '' ? (
          <div className="px-3 py-2 text-sm text-gray-500">No options found.</div>
        ) : null}
      </SimpleDropdown>
    </div>
  );
};