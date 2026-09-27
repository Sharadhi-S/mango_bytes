import { BellRing, Smartphone, Wallet, Wine, PlaySquare, ShieldAlert } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader } from './ui';

const alerts = [
  { icon: Smartphone, title: 'Digital wellbeing', text: 'Avoid excessive phone and social-media use during work hours. Keep your attention on safety and the people around you.' },
  { icon: PlaySquare, title: 'Reels & endless scrolling', text: 'Take control of screen time. Use short-video apps intentionally and avoid letting scrolling interfere with work, rest or family time.' },
  { icon: Wine, title: 'Stay away from alcohol before work', text: 'Do not report to a worksite after drinking. Staying sober helps protect you and everyone working around you.' },
  { icon: Wallet, title: 'Spend with a plan', text: 'Pause before unnecessary purchases. Keep an emergency buffer and prioritize essential household expenses.' },
  { icon: ShieldAlert, title: 'Protect your work & money', text: 'Never share your ShramaID, OTP or banking PIN. Report suspicious requests instead of paying unknown people.' },
];

export function AlertsScreen() {
  const { role } = useApp();
  const roleName = role === 'skilledWorker' ? 'skilled workers' : role === 'labourer' ? 'workers' : role === 'contractor' ? 'contractors' : 'employers';
  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title="Alerts & Wellbeing" subtitle={`Helpful reminders for ${roleName}`} />
      <Card className="p-4 mb-4 bg-brand-50 border-brand-100">
        <div className="flex gap-3 items-start"><BellRing className="text-brand-600 mt-0.5" size={22} /><p className="text-sm text-gray-700">ShramaSetu promotes safer work habits, responsible spending and healthier digital use. These are awareness reminders, not emergency services.</p></div>
      </Card>
      <div className="space-y-3">
        {alerts.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="p-4 flex gap-3">
            <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-brand-600 flex-shrink-0"><Icon size={21} /></div>
            <div><p className="font-extrabold text-gray-900 text-sm">{title}</p><p className="text-xs text-gray-500 mt-1 leading-relaxed">{text}</p></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
