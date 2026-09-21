import { useMemo, useState } from 'react';
import { ShieldCheck, BadgeCheck, TrendingUp, WalletCards, Briefcase, Clock3, AlertTriangle, Share2, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge, Button, ProgressBar } from './ui';

export function getShramaId(name?: string, phone?: string) {
  const initials = (name || 'WORKER').replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 3).toUpperCase().padEnd(2, 'X');
  const last4 = (phone || '4821').replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `SHR-${initials}-${last4}`;
}

export function ShramaIDScreen() {
  const { registrationProfile, role, setScreen, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const id = useMemo(() => getShramaId(registrationProfile?.name, registrationProfile?.phone), [registrationProfile]);
  const isWorker = role === 'labourer' || role === 'skilledWorker';

  const copyId = async () => {
    try { await navigator.clipboard.writeText(id); } catch { /* prototype fallback */ }
    setCopied(true);
    showToast('ShramaID copied');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="px-5 pt-6 pb-28 max-w-3xl mx-auto">
      <ScreenHeader title="ShramaID" subtitle="Your verified workforce identity and trust profile" />

      <Card className="p-5 mb-5 overflow-hidden bg-gradient-to-br from-brand-700 to-brand-500 text-white border-0 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/70">Smart Workforce Machine</p>
            <h2 className="text-2xl font-black mt-1">ShramaID</h2>
            <p className="text-sm text-white/80 mt-1">Verified identity · skills · work history · trust</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center"><ShieldCheck size={27} /></div>
        </div>
        <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/65 font-bold">Your unique ID</p>
          <div className="flex items-center justify-between gap-3 mt-1">
            <p className="text-xl font-black tracking-wide">{id}</p>
            <button onClick={copyId} className="px-3 py-2 rounded-xl bg-white text-brand-700 text-xs font-extrabold flex items-center gap-1.5">
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-5 border-brand-100 bg-brand-50/60">
        <div className="flex items-center gap-3">
          <BadgeCheck className="text-brand-600" size={25} />
          <div className="flex-1"><p className="font-extrabold text-gray-900 text-sm">What happens after you get a ShramaID?</p><p className="text-xs text-gray-600 mt-1">Your ID becomes a portable work identity. Contractors can verify you, see your trust history and use milestone-based payments when they hire you.</p></div>
        </div>
      </Card>

      <div className="grid gap-3 mb-5">
        <FeatureCard icon={<BadgeCheck size={21} />} title="1. Credential-backed verified profile" text="Your identity, practical skills, qualifications and past work can be attached to the ID. This reduces hiring uncertainty without requiring a polished corporate CV." status="Verified profile" />
        <FeatureCard icon={<TrendingUp size={21} />} title="2. Workforce Trust Score" text="Your reliability can improve through completed jobs, punctuality and good work history. Repeated no-shows or performance issues can be flagged transparently." status="94 / 100" />
        <FeatureCard icon={<WalletCards size={21} />} title="3. Escrow payment protection" text="For eligible jobs, the contractor can place agreed funds into an escrow workflow. Payments are released when the agreed work milestones are verified." status="Milestone-ready" />
      </div>

      <SectionTitle>What contractors can see</SectionTitle>
      <Card className="p-4 mb-5">
        <div className="space-y-3">
          <Row icon={<Briefcase size={17} />} label="Skills & work history" value={`${registrationProfile?.skills?.length || 1} skills · practical experience`} />
          <Row icon={<Clock3 size={17} />} label="Reliability" value="Attendance, punctuality & completed work" />
          <Row icon={<TrendingUp size={17} />} label="Trust Score" value="Updated from verified job outcomes" />
          <Row icon={<AlertTriangle size={17} />} label="Performance flags" value="Only relevant reliability issues are highlighted" />
        </div>
      </Card>

      {isWorker && (
        <Card className="p-4 mb-5">
          <p className="font-extrabold text-gray-900 text-sm">Build a stronger ShramaID</p>
          <p className="text-xs text-gray-500 mt-1">Add evidence so your profile becomes easier for local employers to trust.</p>
          <div className="mt-4 space-y-3">
            <ProgressRow label="Basic profile" value={100} />
            <ProgressRow label="Skills & experience" value={80} />
            <ProgressRow label="Credential evidence" value={60} />
            <ProgressRow label="Verified work history" value={45} />
          </div>
          <Button className="w-full mt-4" onClick={() => setScreen('profile')}>Manage my profile <ChevronRight size={16} className="ml-1" /></Button>
        </Card>
      )}

      <Button variant="secondary" className="w-full" onClick={() => { void copyId(); }}><Share2 size={17} className="mr-2" /> Share ShramaID</Button>
    </div>
  );
}

function FeatureCard({ icon, title, text, status }: { icon: React.ReactNode; title: string; text: string; status: string }) {
  return <Card className="p-4"><div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">{icon}</div><div className="flex-1"><div className="flex items-start justify-between gap-2"><p className="font-extrabold text-gray-900 text-sm">{title}</p><Badge color="green">{status}</Badge></div><p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{text}</p></div></div></Card>;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">{icon}</div><div className="flex-1"><p className="text-xs font-bold text-gray-800">{label}</p><p className="text-[11px] text-gray-500 mt-0.5">{value}</p></div></div>;
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return <div><div className="flex justify-between text-[11px] font-bold mb-1"><span className="text-gray-600">{label}</span><span className="text-brand-600">{value}%</span></div><ProgressBar value={value} max={100} colorClass="bg-brand-500" /></div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) { return <h2 className="text-sm font-bold text-gray-700 mb-3">{children}</h2>; }
