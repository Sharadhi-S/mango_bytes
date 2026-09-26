import { PlatformNotification, Role } from '../types';
import { broadcastRealtimeEvent } from './realtime';

const STORAGE_KEY = 'shramasetu_notifications_v1';

const INITIAL_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-1',
    recipientId: 'c1',
    recipientRole: 'contractor',
    title: 'Workforce RFP for Belagavi Highway',
    message: 'Demo Infrastructure Pvt Ltd dispatched an RFP for 100 workers on Tender #KA-2026-1042.',
    type: 'rfp',
    relatedId: 'rfp-1042',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif-2',
    recipientId: 'w1',
    recipientRole: 'skilledWorker',
    title: 'Welcome to ShramaSetu',
    message: 'Your profile has been verified for Skilled Masonry at Belagavi sites.',
    type: 'system',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'notif-3',
    recipientId: 'w2',
    recipientRole: 'labourer',
    title: 'Welcome to ShramaSetu',
    message: 'Your daily attendance and wage tracking is now active.',
    type: 'system',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export function getNotifications(recipientRole?: Role, recipientId?: string): PlatformNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: PlatformNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    if (!recipientRole) return all;
    return all.filter((n) => {
      if (recipientRole === 'labourer' || recipientRole === 'skilledWorker') {
        return (
          n.recipientRole === recipientRole ||
          n.recipientRole === 'labourer' ||
          n.recipientRole === 'skilledWorker' ||
          (recipientId && n.recipientId === recipientId)
        );
      }
      return n.recipientRole === recipientRole || (recipientId && n.recipientId === recipientId);
    });
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: PlatformNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    // ignore
  }
}

export function createNotification(
  params: Omit<PlatformNotification, 'id' | 'createdAt' | 'read'>
): PlatformNotification {
  const all = getNotifications();
  const notif: PlatformNotification = {
    id: 'notif-' + Math.random().toString(36).substring(2, 9),
    ...params,
    read: false,
    createdAt: new Date().toISOString(),
  };

  all.unshift(notif);
  saveNotifications(all);

  broadcastRealtimeEvent('NOTIFICATION_CREATED', notif);
  return notif;
}

export function markNotificationAsRead(id: string): void {
  const all = getNotifications();
  const item = all.find((n) => n.id === id);
  if (item) {
    item.read = true;
    saveNotifications(all);
  }
}

export function markAllNotificationsAsRead(recipientRole?: Role): void {
  const all = getNotifications();
  all.forEach((n) => {
    if (!recipientRole || n.recipientRole === recipientRole) {
      n.read = true;
    }
  });
  saveNotifications(all);
}

export function getUnreadNotificationCount(recipientRole?: Role, recipientId?: string): number {
  return getNotifications(recipientRole, recipientId).filter((n) => !n.read).length;
}
