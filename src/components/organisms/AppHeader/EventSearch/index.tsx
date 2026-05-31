import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar } from 'app/components/molecules/Inputs/SearchBar';
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
        <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden z-50'>
          {results.map((event) => (
            <button
              key={event.id}
              type='button'
              className='w-full px-4 py-2.5 text-left hover:bg-surface-container-high flex items-center gap-3 transition-colors'
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(event);
              }}>
              <span className='flex-1 text-body-md text-on-surface truncate'>{event.name}</span>
              <span className='text-label-sm text-on-surface-variant shrink-0'>
                {new Date(event.start).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
