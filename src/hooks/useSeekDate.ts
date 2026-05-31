import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useSeekDate(onSeek: (date: Date) => void) {
  const { state } = useLocation();
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  useEffect(() => {
    if (state?.seekDate) {
      onSeekRef.current(new Date(state.seekDate as number));
    }
  }, [state?.seekDate]);
}
