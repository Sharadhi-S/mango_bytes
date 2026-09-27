import { Check, Contrast, Moon, Sun } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/AppContext';
import type { ThemeMode } from '@/types';

const themeOptions: { id: ThemeMode; label: string; description: string }[] = [
  { id: 'light', label: 'Light', description: 'Bright surfaces and blue accents' },
  { id: 'dark', label: 'Dark', description: 'Dim surfaces with clear contrast' },
  { id: 'high-contrast', label: 'High contrast', description: 'Maximum text and control clarity' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useApp();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTheme = themeOptions.find((option) => option.id === theme);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={`Theme: ${currentTheme?.label}`}
        aria-expanded={open}
        title={`Theme: ${currentTheme?.label}`}
        className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-2xs"
      >
        {theme === 'light' ? (
          <Sun size={17} className="text-amber-500" />
        ) : theme === 'dark' ? (
          <Moon size={17} className="text-blue-400" />
        ) : (
          <Contrast size={17} className="text-purple-400" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-11 z-[60] w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl animate-scale-in"
            role="group"
            aria-label="Appearance theme"
          >
            <p className="px-2 pb-2 text-xs font-extrabold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Appearance
            </p>
            <div className="space-y-1">
              {themeOptions.map((option) => {
                const isSelected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setTheme(option.id);
                      setOpen(false);
                    }}
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`theme-preview theme-preview-${option.id}`} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-gray-900 dark:text-slate-100">
                        {option.label}
                      </span>
                      <span className="block text-[11px] text-gray-500 dark:text-slate-400">
                        {option.description}
                      </span>
                    </span>
                    {isSelected && <Check size={16} className="text-brand-600 dark:text-brand-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
