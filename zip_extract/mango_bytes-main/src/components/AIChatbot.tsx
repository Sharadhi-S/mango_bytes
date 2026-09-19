import { useMemo, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card } from './ui';

export function AIChatbot() {
  const { role, lang, registrationProfile, workerSkill } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot' as const, text: 'Hi! I’m ShramaSetu AI Assistant (prototype). Ask me about registration, jobs, insurance, performance pay, skills, languages or your profile.' },
  ]);

  const profileName = registrationProfile?.name || 'there';
  const suggestions = useMemo(() => role === 'labourer'
    ? ['Which insurance is mandatory for me?', 'How is my performance pay calculated?', 'How can I find jobs?', 'How do I use UPI or my bank account?']
    : ['How do I register workers?', 'How can I find workers?', 'How is performance pay calculated?'], [role]);

  const answer = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes('insurance') || q.includes('insur')) {
      const skills = registrationProfile?.skills?.join(', ') || workerSkill || 'your selected skill';
      return `Based on your prototype profile (${skills}), the Insurance page analyses the skills you entered and marks the relevant high-risk protection as mandatory. You can review yearly life, health and accident plans there.`;
    }
    if (q.includes('performance') || q.includes('pay') || q.includes('bonus')) return 'ShramaSetu prototype pay protects the agreed base wage, then adds a transparent performance bonus from attendance/reliability (25%), task completion (30%), quality (20%), safety (15%), teamwork (5%) and punctuality (5%). Overtime is added separately. Rain, traffic, material shortages, approved sick/festival leave and emergencies do not reduce the base wage.';
    if (q.includes('job') || q.includes('work')) return role === 'labourer' ? 'Open Jobs to browse work opportunities and apply. Your profile skills can be used to match you with suitable work.' : 'Use Find Workers to browse workers, or Post Job to create a new requirement.';
    if (q.includes('upi') || q.includes('bank') || q.includes('money') || q.includes('scan') || q.includes('account')) return 'Open Money to see your demo UPI ID, Scan & Pay flow, bank account, transfers, recent activity and savings. These controls are prototype-only and do not move real money.';
    if (q.includes('language') || q.includes('regional')) return 'You can choose your preferred regional language during registration. You can also type your personal details directly in that language.';
    if (q.includes('skill')) return 'Add your primary skill and any additional skills separated by commas. The insurance prototype analyses all of them, not just Mason.';
    if (q.includes('profile') || q.includes('name')) return `Your prototype profile is for ${profileName}. Details shown after registration come from the information you entered.`;
    return 'I can help with registration, skills, insurance, performance pay, jobs, wages, languages and profile questions. Try one of the suggested questions.';
  };

  const send = (text = input) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { from: 'user' as const, text: clean }, { from: 'bot' as const, text: answer(clean) }]);
    setInput('');
  };

  if (!role) return null;

  return <>
    {open && <div className="fixed right-4 bottom-20 z-[60] w-[min(360px,calc(100vw-2rem))]">
      <Card className="overflow-hidden shadow-float border border-gray-100">
        <div className="bg-gray-900 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center"><Bot size={21} /></div>
          <div className="flex-1"><p className="font-extrabold text-sm">Mango AI Assistant</p><p className="text-[11px] text-gray-300">Prototype guidance only</p></div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="max-h-72 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((m, i) => <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${m.from === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>{m.text}</div></div>)}
          {messages.length === 1 && <div className="flex flex-wrap gap-2 pt-1">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="px-2.5 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-600">{s}</button>)}</div>}
        </div>
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="Ask Mango AI..." className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-gray-100 text-xs outline-none focus:ring-2 focus:ring-brand-200" />
          <button onClick={() => send()} className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center"><Send size={16} /></button>
        </div>
      </Card>
    </div>}
    <button onClick={() => setOpen((v) => !v)} className="fixed right-4 bottom-[78px] z-[61] w-14 h-14 rounded-full bg-gray-900 text-white shadow-float flex items-center justify-center active:scale-95 transition-transform" aria-label="Open Mango AI Assistant">
      {open ? <X size={22} /> : <MessageCircle size={22} />}
      {!open && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center"><Bot size={12} /></span>}
    </button>
  </>;
}
