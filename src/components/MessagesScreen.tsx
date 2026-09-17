import { useState } from 'react';
import { ArrowLeft, Phone, MapPin, CheckCircle2, Send } from 'lucide-react';
import { useApp } from '@/AppContext';
import { ScreenHeader, Avatar, Badge } from './ui';
import type { Conversation } from '@/types';

export function MessagesScreen() {
  const { conversations, sendMessage, role, t } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const active = conversations.find((c) => c.id === activeId);

  const handleSend = (text: string) => {
    if (!text.trim() || !activeId) return;
    sendMessage(activeId, text);
    setInput('');
  };

  // Conversation list view (for contractor or as list for labourer)
  if (!active) {
    const list = conversations;
    return (
      <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
        <ScreenHeader title={t('messagesTitle')} subtitle={role === 'contractor' ? t('messagesSubtitleContractor') : t('messagesSubtitleWorker')} />
        <div className="space-y-2">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow text-left animate-slide-up"
            >
              <Avatar initials={c.name.substring(0, 2).toUpperCase()} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 truncate">{c.name}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{c.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  const quickActions = ['Confirm', 'Ask location', 'Call contractor'];
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-2xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => setActiveId(null)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <Avatar initials={active.name.substring(0, 2).toUpperCase()} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate text-sm">{active.name}</p>
          <p className="text-xs text-accent-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> {t('online')}</p>
        </div>
        <button className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center text-accent-600">
          <Phone size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {active.messages.map((msg) => {
          const isWorker = msg.sender === 'worker';
          const isMine = role === 'contractor' ? msg.sender === 'contractor' : msg.sender === 'worker';
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMine ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-card'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-brand-100' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
          {quickActions.map((qa) => {
            const translated = qa === 'Confirm' ? t('confirm') : qa === 'Ask location' ? t('askLocation') : t('callContractor');
            return (
              <button
                key={qa}
                onClick={() => handleSend(qa)}
                className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold whitespace-nowrap hover:bg-brand-100 transition-colors flex items-center gap-1"
              >
                {qa === 'Confirm' && <CheckCircle2 size={12} />}
                {qa === 'Ask location' && <MapPin size={12} />}
                {qa === 'Call contractor' && <Phone size={12} />}
                {translated}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder={t('typeMessage')}
          className="flex-1 px-4 py-3 rounded-full bg-gray-100 focus:bg-white border-2 border-transparent focus:border-brand-300 outline-none text-sm transition-all"
        />
        <button
          onClick={() => handleSend(input)}
          className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
