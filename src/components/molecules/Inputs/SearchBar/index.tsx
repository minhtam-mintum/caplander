import { Search } from 'lucide-react';
import { Input } from 'app/components/atoms/input';

interface ISearchBarProps {
  placeholder?: string;
  onFocus?: () => void;
}

export function SearchBar({
  placeholder = 'Search tasks, events (Cmd+K)',
  onFocus,
}: ISearchBarProps) {
  return (
    <Input
      variant='filled'
      placeholder={placeholder}
      onFocus={onFocus}
      startAdornment={<Search size={15} />}
      endAdornment={
        <kbd className='hidden sm:inline-flex items-center gap-0.5 text-label-sm border border-outline-variant rounded px-1.5 py-0.5'>
          ⌘K
        </kbd>
      }
    />
  );
}
