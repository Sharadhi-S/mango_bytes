import React from 'react';
import { Briefcase, HardHat, Wrench, Users, Check, X, LogOut, RotateCcw } from 'lucide-react';
import { Role } from '../types';
import { useApp } from '@/AppContext';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role | null;
  onSelectRole: (role: Role) => void;
}

interface RoleOption {
  id: Role;
  title: string;
  subtitle: string;
  tagline: string;
  color: string;
  activeColor: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleOption[] = [
  {
    id: 'employer',
    title: 'Employer',
    subtitle: 'Project Owner / Client',
    tagline: 'Create tenders, review workforce & dispatch RFPs',
    color: 'border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200',
    activeColor: 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 ring-2 ring-purple-500/20',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200',
    icon: Briefcase,
  },
  {
    id: 'contractor',
    title: 'Contractor',
    subtitle: 'Workforce Operator',
    tagline: 'Match workers, mark daily muster & disburse wages',
    color: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
    activeColor: 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 ring-2 ring-amber-500/20',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200',
    icon: HardHat,
  },
  {
    id: 'skilledWorker',
    title: 'Skilled Worker',
    subtitle: 'Craftsman / Specialist',
    tagline: 'Accept priority invitations, verified wages & savings',
    color: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200',
    activeColor: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-500/20',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200',
    icon: Wrench,
  },
  {
    id: 'labourer',
    title: 'Labourer',
    subtitle: 'General Workforce',
    tagline: 'Site assignments, attendance roll & daily earnings',
    color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
    activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200',
    icon: Users,
  },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  const { setRole, setScreen, resetPlatformData } = useApp();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-switcher-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 id="role-switcher-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                Switch Role Persona
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select persona to test interconnected workflows
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scalable Roles Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isCurrent = currentRole === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r.id)}
                className={`relative group rounded-2xl p-3.5 border text-left transition-all duration-150 flex flex-col justify-between active:scale-[0.98] ${
                  isCurrent
                    ? `${r.activeColor} shadow-sm`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${r.badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        Select →
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {r.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {r.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug line-clamp-2">
                    {r.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full sm:w-auto font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={14} /> Log Out / Switch Account
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="w-full sm:w-auto font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors"
            title="Reset additional tenders and custom entries to default prototype models"
          >
            <RotateCcw size={13} /> Reset Fresh Data
          </button>
        </div>
      </div>
    </div>
  );
};
