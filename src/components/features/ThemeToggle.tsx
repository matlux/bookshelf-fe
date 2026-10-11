import { useStore } from '@nanostores/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { theme } from '../../stores/theme';
export default function ThemeToggle() {
  const value = useStore(theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', value === 'dark');
  }, [value]);
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => theme.set(value === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle color theme"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
      <span>Change appearance</span>
    </button>
  );
}
