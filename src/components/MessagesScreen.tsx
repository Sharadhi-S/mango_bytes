import { useRef, useState } from 'react';
import { ArrowLeft, Phone, MapPin, CheckCircle2, Send, Image as ImageIcon, MapPinned } from 'lucide-react';
import { useApp } from '@/AppContext';
import { ScreenHeader, Avatar } from './ui';
import type { Conversation } from '@/types';

export function MessagesScreen() {
  const { conversations, sendMessage, markConversationRead, role, showToast } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const active = conversations.find((c) => c.id === activeId);
  const isBusinessSide = role === 'contractor' || role === 'employer';

  const handleSend = (text: string) => {
    if (!text.trim() || !activeId) return;
    sendMessage(activeId, text);
    setInput('');
  };

  const sendLocation = () => {
    if (!activeId) return;
    if (!navigator.geolocation) { handleSend('Send me your location'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSend(`Location shared: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`),
      () => handleSend('Send me your location'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const callContact = () => { window.location.href = 'tel:+919876543210'; };

  const attachPhoto = (file: File | undefined) => {
    if (!file || !activeId) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file.'); return; }
    const url = URL.createObjectURL(file);
    sendMessage(activeId, `Photo shared: ${file.name}`, { type: 'image', url, name: file.name });
  };

  if (!active) {
    return (
      <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
        <ScreenHeader title="Messages" subtitle={isBusinessSide ? 'Chat with workers, manage work updates & tenders' : 'Chat with your employers'} />
        <div className="space-y-2">
          {conversations.map((c) => (
            <button key={c.id} onClick={() => { setActiveId(c.id); markConversationRead(c.id); }} className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow text-left">
              <Avatar initials={c.name.substring(0, 2).toUpperCase()} size="md" />
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="font-bold text-gray-900 truncate">{c.name}</p><span className="text-xs text-gray-400">{c.time}</span></div><p className="text-sm text-gray-500 truncate mt-0.5">{c.lastMessage}</p></div>
              {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const quickActions = isBusinessSide
    ? [['Confirm', 'confirm'], ['Ask location', 'location'], ['Send location', 'send-location'], ['Call', 'call'], ['Work photo', 'photo'], ['Progress update', 'progress'], ['Tender update', 'tender']] as const
    : [['Confirm', 'confirm'], ['Ask location', 'location'], ['Send location', 'send-location'], ['Call contractor', 'call']] as const;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => setActiveId(null)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"><ArrowLeft size={20} /></button>
        <Avatar initials={active.name.substring(0, 2).toUpperCase()} size="sm" />
        <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 truncate text-sm">{active.name}</p><p className="text-xs text-accent-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Online</p></div>
        <button onClick={callContact} title="Call" className="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center text-accent-600"><Phone size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {active.messages.map((msg) => {
          const isMine = isBusinessSide ? msg.sender === 'contractor' : msg.sender === 'worker';
          return <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${isMine ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-card'}`}>
              {msg.attachment?.type === 'image' && msg.attachment.url && <img src={msg.attachment.url} alt={msg.attachment.name || 'Shared work photo'} className="rounded-xl max-h-56 w-auto mb-2" />}
              <p className="text-sm break-words">{msg.text}</p><p className={`text-[10px] mt-1 ${isMine ? 'text-brand-100' : 'text-gray-400'}`}>{msg.time}</p>
            </div>
          </div>;
        })}
      </div>

      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
          {quickActions.map(([label, action]) => <button key={action} onClick={() => {
            if (action === 'location') return handleSend('Send me your location');
            if (action === 'send-location') return sendLocation();
            if (action === 'call') return callContact();
            if (action === 'photo') return fileRef.current?.click();
            if (action === 'progress') return handleSend('Work progress update attached.');
            if (action === 'tender') return handleSend('Tender/work management update shared.');
            return handleSend(label);
          }} className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold whitespace-nowrap flex items-center gap-1">
            {action === 'confirm' && <CheckCircle2 size={12} />}{action.includes('location') && <MapPin size={12} />}{action === 'call' && <Phone size={12} />}{action === 'photo' && <ImageIcon size={12} />}{label}
          </button>)}
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { attachPhoto(e.target.files?.[0]); e.currentTarget.value = ''; }} />
        <button onClick={() => fileRef.current?.click()} title="Send photo" className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><ImageIcon size={18} /></button>
        <button onClick={sendLocation} title="Send location" className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><MapPinned size={18} /></button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-full bg-gray-100 focus:bg-white border-2 border-transparent focus:border-brand-300 outline-none text-sm" />
        <button onClick={() => handleSend(input)} className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center"><Send size={18} /></button>
      </div>
    </div>
  );
}
