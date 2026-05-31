import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { Input } from 'app/components/atoms/Input';

interface ISearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, ISearchBarProps>(function SearchBar(
  { placeholder = 'Search events...', ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      variant='filled'
      placeholder={placeholder}
      startAdornment={<Search size={15} />}
      {...props}
    />
  );
});
