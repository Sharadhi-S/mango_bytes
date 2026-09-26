import {
  BellRing,
  Smartphone,
  Wallet,
  Wine,
  PlaySquare,
  ShieldAlert,
  CheckCheck,
  Briefcase,
  HardHat,
  Calendar,
  IndianRupee,
  MessageSquare,
  Bell,
  Clock,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader } from './ui';
import type { PlatformNotification } from '@/types';

const wellbeingAlerts = [
  { icon: Smartphone, title: 'Digital wellbeing', text: 'Avoid excessive phone and social-media use during work hours. Keep your attention on safety and the people around you.' },
  { icon: PlaySquare, title: 'Reels & endless scrolling', text: 'Take control of screen time. Use short-video apps intentionally and avoid letting scrolling interfere with work, rest or family time.' },
  { icon: Wine, title: 'Stay away from alcohol before work', text: 'Do not report to a worksite after drinking. Staying sober helps protect you and everyone working around you.' },
  { icon: Wallet, title: 'Spend with a plan', text: 'Pause before unnecessary purchases. Keep an emergency buffer and prioritize essential household expenses.' },
  { icon: ShieldAlert, title: 'Protect your work & money', text: 'Never share your ShramaID, OTP or banking PIN. Report suspicious requests instead of paying unknown people.' },
];

function getNotificationIcon(type: PlatformNotification['type']) {
  switch (type) {
    case 'rfp':
      return { icon: Briefcase, color: 'bg-amber-100 text-amber-700' };
    case 'invitation':
      return { icon: HardHat, color: 'bg-blue-100 text-blue-700' };
    case 'attendance':
      return { icon: Calendar, color: 'bg-emerald-100 text-emerald-700' };
    case 'wage':
      return { icon: IndianRupee, color: 'bg-purple-100 text-purple-700' };
    case 'message':
      return { icon: MessageSquare, color: 'bg-indigo-100 text-indigo-700' };
    default:
      return { icon: Bell, color: 'bg-gray-100 text-gray-700' };
  }
}

export function AlertsScreen() {
  const {
    role,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setScreen,
  } = useApp();

  const roleName =
    role === 'skilledWorker'
      ? 'skilled craftsmen'
      : role === 'labourer'
      ? 'workers'
      : role === 'contractor'
      ? 'contractors'
      : 'employers';

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto space-y-5">
      <ScreenHeader
        title="Notifications & Alerts"
        subtitle={`Live operational platform events & wellbeing for ${roleName}`}
      />

      {/* OPERATIONAL NOTIFICATIONS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-extrabold text-gray-900">
              Live Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-5 text-center text-xs text-gray-500 border border-gray-100">
            No new notifications right now.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif) => {
              const { icon: Icon, color } = getNotificationIcon(notif.type);
              return (
                <Card
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 border transition-all cursor-pointer ${
                    !notif.read
                      ? 'border-brand-300 bg-brand-50/30 shadow-xs'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-extrabold text-gray-900 text-xs truncate">
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1.5">
                        <Clock size={11} />
                        <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* WELLBEING ADVISORIES SECTION */}
      <div className="pt-2">
        <h2 className="text-sm font-extrabold text-gray-900 mb-3">Workplace Safety & Wellbeing</h2>
        <Card className="p-3.5 mb-3 bg-brand-50 border-brand-100 text-xs text-gray-700 flex gap-2.5 items-start">
          <BellRing className="text-brand-600 shrink-0 mt-0.5" size={17} />
          <p>
            ShramaSetu promotes safe site conduct, sober reporting, financial caution, and healthy digital balance.
          </p>
        </Card>

        <div className="space-y-2.5">
          {wellbeingAlerts.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-3.5 flex gap-3 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-brand-600 shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-xs">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
