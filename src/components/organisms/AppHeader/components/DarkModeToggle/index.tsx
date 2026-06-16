import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from 'app/hooks/useDarkMode';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';

export function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <IconButton
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}
