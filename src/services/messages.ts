import { Conversation, ChatMessage, Role } from '../types';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';

const STORAGE_KEY = 'shramasetu_conversations_v1';

export interface ExtendedConversation extends Conversation {
  roleType: 'employer_contractor' | 'contractor_worker';
  employerId?: string;
  contractorId?: string;
  workerId?: string;
  contractorName?: string;
  employerName?: string;
  workerName?: string;
}

const INITIAL_CONVERSATIONS: ExtendedConversation[] = [
  {
    id: 'conv-emp-c1',
    name: 'Kumar Construction Services',
    role: 'Contractor • Grade A',
    roleType: 'employer_contractor',
    employerId: 'emp-demo',
    employerName: 'Demo Infrastructure Pvt Ltd',
    contractorId: 'c1',
    contractorName: 'Kumar Construction Services',
    lastMessage: 'Received Meera ji. We reviewed the workforce requirements and are ready to deploy.',
    time: '10:45 AM',
    unread: 0,
    messages: [
      {
        id: 'm1',
        sender: 'employer',
        text: 'Namaste Rajesh ji, we sent the RFP for the Belagavi Highway project (#KA-2026-1042).',
        time: '10:30 AM',
      },
      {
        id: 'm2',
        sender: 'contractor',
        text: 'Received Meera ji. We reviewed the workforce requirements and are ready to deploy 30 masons and 40 helpers.',
        time: '10:45 AM',
      },
    ],
  },
  {
    id: 'conv-c1-w1',
    name: 'Ravi Kumar',
    role: 'Skilled Mason • Belagavi',
    roleType: 'contractor_worker',
    contractorId: 'c1',
    contractorName: 'Kumar Construction Services',
    workerId: 'w1',
    workerName: 'Ravi Kumar',
    lastMessage: 'Yes sir, I received the invitation and accepted. Will report to Site A on time.',
    time: '08:30 AM',
    unread: 0,
    messages: [
      {
        id: 'm3',
        sender: 'contractor',
        text: 'Namaste Ravi, we have assigned you to Section 2 pier masonry starting tomorrow at 8:00 AM.',
        time: '08:15 AM',
      },
      {
        id: 'm4',
        sender: 'worker',
        text: 'Yes sir, I received the invitation and accepted. Will report to Site A on time.',
        time: '08:30 AM',
      },
    ],
  },
  {
    id: 'conv-c1-w2',
    name: 'Suresh Patel',
    role: 'Construction Labourer',
    roleType: 'contractor_worker',
    contractorId: 'c1',
    contractorName: 'Kumar Construction Services',
    workerId: 'w2',
    workerName: 'Suresh Patel',
    lastMessage: 'Dhanyawad sir.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      {
        id: 'm5',
        sender: 'contractor',
        text: 'Suresh, your half-day attendance for yesterday has been logged and wage updated.',
        time: 'Yesterday',
      },
      {
        id: 'm6',
        sender: 'worker',
        text: 'Dhanyawad sir.',
        time: 'Yesterday',
      },
    ],
  },
];

export function getConversations(): ExtendedConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_CONVERSATIONS;
}

export function saveConversations(convs: ExtendedConversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch (e) {
    // ignore
  }
}

/**
 * Filter and present conversations strictly based on the current user's role:
 * - Employer: Only sees chats with Contractors. Name displays the contractor.
 * - Contractor: Sees chats with Employers and Workers.
 * - Worker: Only sees chat with their Contractor. Name displays the contractor.
 */
export function getConversationsForRole(role: Role, userId: string = 'w1'): Conversation[] {
  const all = getConversations();

  if (role === 'employer') {
    return all
      .filter((c) => c.roleType === 'employer_contractor')
      .map((c) => ({
        ...c,
        name: c.contractorName || c.name,
        role: 'Contractor Partner',
      }));
  }

  if (role === 'contractor') {
    return all.map((c) => ({
      ...c,
      name:
        c.roleType === 'employer_contractor'
          ? `${c.employerName || 'Employer'} (Client)`
          : c.workerName || c.name,
      role:
        c.roleType === 'employer_contractor'
          ? 'Project Owner / Client'
          : 'Site Worker',
    }));
  }

  // Worker (labourer or skilledWorker)
  return all
    .filter((c) => c.roleType === 'contractor_worker' && (!c.workerId || c.workerId === userId || userId === 'all'))
    .map((c) => ({
      ...c,
      name: c.contractorName || 'Kumar Construction Services',
      role: 'Project Contractor',
    }));
}

export function getConversationById(id: string): ExtendedConversation | undefined {
  return getConversations().find((c) => c.id === id);
}

export function sendMessage(params: {
  conversationId: string;
  senderRole: Role;
  text: string;
  senderName?: string;
}): ChatMessage | null {
  const convs = getConversations();
  const conv = convs.find((c) => c.id === params.conversationId);
  if (!conv) return null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Map role to ChatMessage sender type
  let senderType: 'contractor' | 'worker' | 'employer' = 'contractor';
  if (params.senderRole === 'employer') senderType = 'employer';
  else if (params.senderRole === 'contractor') senderType = 'contractor';
  else senderType = 'worker';

  const newMsg: ChatMessage = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    sender: senderType,
    text: params.text,
    time: timeStr,
  };

  conv.messages.push(newMsg);
  conv.lastMessage = params.text;
  conv.time = timeStr;

  saveConversations(convs);

  // Broadcast realtime event
  broadcastRealtimeEvent('MESSAGE_SENT', {
    conversationId: conv.id,
    message: newMsg,
  });

  // Determine recipient for notification
  let recipientRole: Role = 'contractor';
  let recipientId = conv.contractorId || 'c1';

  if (params.senderRole === 'contractor') {
    if (conv.roleType === 'employer_contractor') {
      recipientRole = 'employer';
      recipientId = conv.employerId || 'emp-demo';
    } else {
      recipientRole = 'skilledWorker';
      recipientId = conv.workerId || 'w1';
    }
  } else if (params.senderRole === 'employer') {
    recipientRole = 'contractor';
    recipientId = conv.contractorId || 'c1';
  } else {
    // Worker sent message -> to contractor
    recipientRole = 'contractor';
    recipientId = conv.contractorId || 'c1';
  }

  createNotification({
    recipientId,
    recipientRole,
    title: `Message from ${params.senderName || params.senderRole}`,
    message: params.text,
    type: 'message',
    relatedId: conv.id,
  });

  return newMsg;
}
