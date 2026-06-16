import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar } from 'app/components/molecules/Inputs/SearchBar';
import { EventSearchResults } from 'app/components/organisms/AppHeader/components/EventSearch/components/EventSearchResults';
import { useAppSelector } from 'app/store';
import type { IEvent } from 'app/store/slices/eventSlice';

interface IEventSearchProps {
  onEventSelect: (event: IEvent) => void;
}

export function EventSearch({ onEventSelect }: IEventSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const events = useAppSelector((state) => state.events.items);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const trimmed = debouncedQuery.trim().toLowerCase();
  const results = trimmed
    ? events.filter((e) => e.name.toLowerCase().includes(trimmed)).slice(0, 8)
    : [];

  const handleSelect = useCallback(
    (event: IEvent) => {
      onEventSelect(event);
      setQuery('');
      setOpen(false);
    },
    [onEventSelect],
  );

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className='relative'>
      <SearchBar
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && results.length > 0 && (
        <EventSearchResults events={results} onEventSelect={handleSelect} />
      )}
    </div>
  );
}
