import { Check, Contrast, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
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
  const currentTheme = themeOptions.find((option) => option.id === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={`Theme: ${currentTheme?.label}`}
        aria-expanded={open}
        title="Change theme"
        className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
      >
        {theme === 'light' ? <Sun size={17} /> : theme === 'dark' ? <Moon size={17} /> : <Contrast size={17} />}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-[60] w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl" role="group" aria-label="Appearance theme">
          <p className="px-2 pb-2 text-xs font-extrabold uppercase tracking-wide text-gray-500">Appearance</p>
          <div className="space-y-1">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => { setTheme(option.id); setOpen(false); }}
                aria-pressed={theme === option.id}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${theme === option.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`theme-preview theme-preview-${option.id}`} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-gray-900">{option.label}</span>
                  <span className="block text-[11px] text-gray-500">{option.description}</span>
                </span>
                {theme === option.id && <Check size={16} className="text-brand-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
