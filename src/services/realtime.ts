import { supabase, isSupabaseConfigured } from './supabase';

export type RealtimeEventType =
  | 'PROJECT_UPDATED'
  | 'RFP_CREATED'
  | 'RFP_UPDATED'
  | 'WORKER_INVITED'
  | 'INVITATION_UPDATED'
  | 'ASSIGNMENT_CREATED'
  | 'ATTENDANCE_MARKED'
  | 'WAGE_RECORD_UPDATED'
  | 'MESSAGE_SENT'
  | 'NOTIFICATION_CREATED'
  | 'SAVINGS_GOAL_UPDATED';

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
  sourceTabId?: string;
}

const TAB_ID = 'tab_' + Math.random().toString(36).substring(2, 9);
const CHANNEL_NAME = 'shramasetu-realtime';

// Local in-memory listeners
type Listener = (event: RealtimeEvent) => void;
const listeners: Set<Listener> = new Set();

// Native BroadcastChannel support
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.type) {
        notifyLocalListeners(ev.data);
      }
    };
  } catch (err) {
    console.warn('BroadcastChannel initialization failed, using storage fallback', err);
  }
}

// Window storage event fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ev: StorageEvent) => {
    if (ev.key === 'shramasetu_realtime_event' && ev.newValue) {
      try {
        const parsed = JSON.parse(ev.newValue) as RealtimeEvent;
        if (parsed && parsed.sourceTabId !== TAB_ID) {
          notifyLocalListeners(parsed);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  });
}

// Optional Supabase Realtime channel
if (isSupabaseConfigured() && supabase) {
  try {
    const supabaseChannel = supabase.channel('shramasetu-global');
    supabaseChannel
      .on('broadcast', { event: 'shramasetu_event' }, ({ payload }) => {
        if (payload && payload.sourceTabId !== TAB_ID) {
          notifyLocalListeners(payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('Connected to Supabase Realtime broadcast channel');
        }
      });
  } catch (e) {
    console.warn('Supabase realtime subscription failed:', e);
  }
}

function notifyLocalListeners(event: RealtimeEvent) {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error('Error in realtime listener callback:', err);
    }
  });
}

/**
 * Broadcast an event to all tabs, windows, and roles in real time.
 */
export function broadcastRealtimeEvent<T = any>(type: RealtimeEventType, payload: T): void {
  const event: RealtimeEvent<T> = {
    type,
    payload,
    timestamp: new Date().toISOString(),
    sourceTabId: TAB_ID,
  };

  // 1. Immediately notify current tab listeners
  notifyLocalListeners(event);

  // 2. Broadcast via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event);
    } catch (err) {
      console.warn('Error posting to BroadcastChannel:', err);
    }
  }

  // 3. Update localStorage for cross-tab storage event
  try {
    localStorage.setItem('shramasetu_realtime_event', JSON.stringify(event));
  } catch (e) {
    // Storage might be full or disabled
  }

  // 4. Send via Supabase Realtime if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      supabase.channel('shramasetu-global').send({
        type: 'broadcast',
        event: 'shramasetu_event',
        payload: event,
      });
    } catch (e) {
      // Supabase send error
    }
  }
}

/**
 * Subscribe to all realtime events.
 * Returns an unsubscribe callback for automatic cleanup in useEffect.
 */
export function subscribeToAllRealtime(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Subscribe to a specific realtime event type.
 * Returns an unsubscribe callback for automatic cleanup in useEffect.
 */
export function subscribeToRealtimeEvent<T = any>(
  type: RealtimeEventType,
  callback: (payload: T) => void
): () => void {
  const wrapper: Listener = (ev) => {
    if (ev.type === type) {
      callback(ev.payload);
    }
  };
  listeners.add(wrapper);
  return () => {
    listeners.delete(wrapper);
  };
}
