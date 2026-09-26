import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/AppContext';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-2xl shadow-card ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
    secondary: 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900 active:bg-brand-200',
    ghost: 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700',
    success: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
    outline: 'border-2 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 active:bg-brand-100',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-sm rounded-xl',
    lg: 'px-6 py-4 text-base rounded-2xl',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  color = 'gray',
}: {
  children: ReactNode;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}) {
  const colors = {
    green: 'bg-accent-100 dark:bg-accent-950/60 text-accent-700 dark:text-accent-300',
    yellow: 'bg-warning-100 dark:bg-warning-950/60 text-warning-700 dark:text-warning-300',
    red: 'bg-error-100 dark:bg-error-950/60 text-error-700 dark:text-error-300',
    blue: 'bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300',
    gray: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Avatar({ initials, color = 'brand', size = 'md' }: { initials: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' };
  const colors: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    accent: 'bg-accent-100 text-accent-700',
    warning: 'bg-warning-100 text-warning-700',
  };
  return (
    <div className={`rounded-full flex items-center justify-center font-bold ${sizes[size]} ${colors[color] || colors.brand}`}>
      {initials}
    </div>
  );
}

export function ProgressRing({ progress, size = 80, color = '#1b76f0', bgColor = '#eef7ff' }: { progress: number; size?: number; color?: string; bgColor?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth="8" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500"
      />
    </svg>
  );
}

export function ProgressBar({ value, max, colorClass = 'bg-brand-500' }: { value: number; max: number; colorClass?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ScreenHeader({ title, subtitle, showBack = true }: { title: string; subtitle?: string; showBack?: boolean }) {
  const { goBack } = useApp();
  return (
    <div className="mb-5 animate-slide-up">
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="mt-0.5 w-10 h-10 shrink-0 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            <ArrowLeft size={19} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <p className="text-gray-700 font-semibold">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
