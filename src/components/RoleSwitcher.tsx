import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, HardHat, Wrench, Users, Check, X, LogOut, RotateCcw } from 'lucide-react';
import { Role } from '../types';
import { useApp } from '@/AppContext';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role | null;
  onSelectRole: (role: Role) => void;
}

const ROLES = [
  {
    id: 'employer' as const,
    title: 'Employer',
    icon: Briefcase,
    color: 'border-purple-200 dark:border-purple-800/70 hover:border-purple-400 bg-purple-50/60 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200',
    activeColor: 'border-purple-500 dark:border-purple-500 bg-purple-100 dark:bg-purple-950/80 ring-2 ring-purple-500/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
  },
  {
    id: 'contractor' as const,
    title: 'Contractor',
    icon: HardHat,
    color: 'border-amber-200 dark:border-amber-800/70 hover:border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200',
    activeColor: 'border-amber-500 dark:border-amber-500 bg-amber-100 dark:bg-amber-950/80 ring-2 ring-amber-500/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'skilledWorker' as const,
    title: 'Skilled Worker',
    icon: Wrench,
    color: 'border-blue-200 dark:border-blue-800/70 hover:border-blue-400 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200',
    activeColor: 'border-blue-500 dark:border-blue-500 bg-blue-100 dark:bg-blue-950/80 ring-2 ring-blue-500/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'labourer' as const,
    title: 'Labourer',
    icon: Users,
    color: 'border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200',
    activeColor: 'border-emerald-500 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 ring-2 ring-emerald-500/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
  },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  const { setRole, setScreen, resetPlatformData } = useApp();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (role: Role) => {
    onSelectRole(role);
    onClose();
  };

  const handleSignOut = () => {
    setRole(null);
    setScreen('home');
    onClose();
  };

  const handleResetData = () => {
    if (window.confirm('Reset prototype data to fresh defaults? This will clear custom tenders, test attendance and newly created entries without touching backend code.')) {
      resetPlatformData();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700/80 w-full max-w-sm overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-switcher-title"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/80 dark:bg-slate-950/60">
          <div>
            <h2 id="role-switcher-title" className="text-base font-extrabold text-gray-900 dark:text-white">
              Switch Persona
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-slate-300">
              Select persona to test workflows
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Clean 2x2 Grid without role descriptions */}
        <div className="p-3.5 grid grid-cols-2 gap-2.5">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isCurrent = currentRole === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.97] ${
                  isCurrent
                    ? `${r.activeColor} shadow-xs`
                    : `${r.color} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${r.iconBg}`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                    {r.title}
                  </span>
                </div>
                {isCurrent && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 ml-1">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/60 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleSignOut}
            className="font-bold text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={13} /> Log Out
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors"
            title="Reset additional tenders and custom entries to default prototype models"
          >
            <RotateCcw size={13} /> Reset Fresh Data
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
