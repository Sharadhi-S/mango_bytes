import React from 'react';
import { Briefcase, HardHat, Wrench, Users, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Role } from '../types';

interface RoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  onSelectRole: (role: Role) => void;
}

interface RoleOption {
  id: Role;
  title: string;
  subtitle: string;
  persona: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
}

const ROLES: RoleOption[] = [
  {
    id: 'employer',
    title: 'Employer',
    subtitle: 'Project Owner / Client',
    persona: 'Demo Infrastructure Pvt Ltd (Meera Iyer)',
    badge: 'Tender Authority',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Briefcase,
    description: 'Create tenders, review AI workforce breakdowns, dispatch RFPs, and monitor project milestones.',
    features: ['Create tenders & RFPs', 'Select primary contractor', 'Milestone & wage oversight'],
  },
  {
    id: 'contractor',
    title: 'Contractor',
    subtitle: 'Workforce Operator',
    persona: 'Kumar Construction Services (Rajesh Kumar)',
    badge: 'Operations Hub',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: HardHat,
    description: 'Accept client RFPs, run 100-point worker matching, invite trades, log daily muster, and disburse wages.',
    features: ['RFP acceptance & bids', 'Deterministic worker matching', 'Daily muster & wage ledger'],
  },
  {
    id: 'skilledWorker',
    title: 'Skilled Worker',
    subtitle: 'Craftsman / Specialist',
    persona: 'Ravi Kumar (Skilled Mason • Belagavi)',
    badge: 'Grade A Craftsman',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Wrench,
    description: 'Accept high-wage project invitations, track live daily muster, compute earnings, and manage savings goals.',
    features: ['Real-time project invites', 'Live wage & attendance record', 'Automated daily savings plan'],
  },
  {
    id: 'labourer',
    title: 'Labourer',
    subtitle: 'General Workforce',
    persona: 'Suresh Patel (Construction Labourer)',
    badge: 'Essential Crew',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Users,
    description: 'Receive site assignments, review daily attendance logs, view pending payouts, and track family savings goals.',
    features: ['Direct site assignment', 'Daily attendance verification', 'Earnings & savings tracking'],
  },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  const handleSelect = (role: Role) => {
    onSelectRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-switcher-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 id="role-switcher-title" className="text-lg font-bold text-slate-900">
                Switch ShramaSetu Persona
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Experience the end-to-end platform workflow across all 4 interconnected roles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close role switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isCurrent = currentRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className={`relative group rounded-xl p-4 border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isCurrent
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {r.title}
                          {isCurrent && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{r.subtitle}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.badgeColor}`}
                    >
                      {r.badge}
                    </span>
                  </div>

                  <div className="bg-slate-100/70 rounded-md px-2.5 py-1.5 mb-2.5">
                    <p className="text-[11px] font-semibold text-slate-700 truncate">
                      👤 {r.persona}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="space-y-1 mb-3">
                    {r.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isCurrent
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white'
                  }`}
                >
                  {isCurrent ? 'Current Active Role' : 'Switch to this Role'}
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>💡 Tip: Open separate browser windows/tabs to test live multi-role syncing</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
