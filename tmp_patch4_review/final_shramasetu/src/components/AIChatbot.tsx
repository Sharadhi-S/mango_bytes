import { useEffect, useMemo, useState } from 'react';
import { Bot, MessageCircle, Send, X, ExternalLink, FileText, Languages, MonitorPlay } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card } from './ui';

const videoLinks = [
  { label: 'Chef: recipe & kitchen technique demos', query: 'professional chef new recipe tutorial' },
  { label: 'Driver: defensive driving & customer service', query: 'professional driver defensive driving customer service' },
  { label: 'Hotel: front-office & hospitality skills', query: 'hotel management hospitality training tutorial' },
  { label: 'Computer: Excel & digital basics', query: 'computer basics excel beginner tutorial' },
].map((item) => ({ ...item, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.query)}` }));


const translatorLanguages = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali'] as const;
type TranslatorLanguage = typeof translatorLanguages[number];

const googleLanguageCodes: Record<TranslatorLanguage, string> = {
  English: 'en',
  Hindi: 'hi',
  Kannada: 'kn',
  Tamil: 'ta',
  Telugu: 'te',
  Malayalam: 'ml',
  Marathi: 'mr',
  Bengali: 'bn',
};

const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string | undefined;

const phraseTranslations: Record<string, Partial<Record<TranslatorLanguage, string>>> = {
  'i need work': { English: 'I need work', Hindi: 'मुझे काम चाहिए', Kannada: 'ನನಗೆ ಕೆಲಸ ಬೇಕು', Tamil: 'எனக்கு வேலை வேண்டும்', Telugu: 'నాకు పని కావాలి', Malayalam: 'എനിക്ക് ജോലി വേണം', Marathi: 'मला काम हवे आहे', Bengali: 'আমার কাজ দরকার' },
  'where is the work location': { English: 'Where is the work location?', Hindi: 'काम की जगह कहाँ है?', Kannada: 'ಕೆಲಸದ ಸ್ಥಳ ಎಲ್ಲಿದೆ?', Tamil: 'வேலை செய்யும் இடம் எங்கே?', Telugu: 'పని చేసే ప్రదేశం ఎక్కడ ఉంది?', Malayalam: 'ജോലി സ്ഥലം എവിടെയാണ്?', Marathi: 'कामाचे ठिकाण कुठे आहे?', Bengali: 'কাজের জায়গা কোথায়?' },
  'what is the daily wage': { English: 'What is the daily wage?', Hindi: 'दिहाड़ी कितनी है?', Kannada: 'ದಿನಗೂಲಿ ಎಷ್ಟು?', Tamil: 'தினக்கூலி எவ்வளவு?', Telugu: 'రోజువారీ వేతనం ఎంత?', Malayalam: 'ദിവസ വേതനം എത്രയാണ്?', Marathi: 'दिवसाची मजुरी किती आहे?', Bengali: 'দৈনিক মজুরি কত?' },
  'when will i get paid': { English: 'When will I get paid?', Hindi: 'मुझे भुगतान कब मिलेगा?', Kannada: 'ನನಗೆ ಹಣ ಯಾವಾಗ ಸಿಗುತ್ತದೆ?', Tamil: 'எனக்கு பணம் எப்போது கிடைக்கும்?', Telugu: 'నాకు డబ్బు ఎప్పుడు వస్తుంది?', Malayalam: 'എനിക്ക് പണം എപ്പോൾ ലഭിക്കും?', Marathi: 'मला पैसे कधी मिळतील?', Bengali: 'আমি কখন টাকা পাব?' },
  'i need help': { English: 'I need help', Hindi: 'मुझे मदद चाहिए', Kannada: 'ನನಗೆ ಸಹಾಯ ಬೇಕು', Tamil: 'எனக்கு உதவி வேண்டும்', Telugu: 'నాకు సహాయం కావాలి', Malayalam: 'എനിക്ക് സഹായം വേണം', Marathi: 'मला मदत हवी आहे', Bengali: 'আমার সাহায্য দরকার' },
  'please speak slowly': { English: 'Please speak slowly', Hindi: 'कृपया धीरे बोलिए', Kannada: 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ', Tamil: 'தயவுசெய்து மெதுவாக பேசுங்கள்', Telugu: 'దయచేసి నెమ్మదిగా మాట్లాడండి', Malayalam: 'ദയവായി പതുക്കെ സംസാരിക്കുക', Marathi: 'कृपया हळू बोला', Bengali: 'দয়া করে ধীরে কথা বলুন' },
  'i am a mason': { English: 'I am a mason', Hindi: 'मैं राजमिस्त्री हूँ', Kannada: 'ನಾನು ಮೇಸ್ತ್ರಿ', Tamil: 'நான் கொத்தனார்', Telugu: 'నేను మేస్త్రీని', Malayalam: 'ഞാൻ ഒരു മേസണാണ്', Marathi: 'मी गवंडी आहे', Bengali: 'আমি রাজমিস্ত্রি' },
};

function translatePhrase(text: string, from: TranslatorLanguage, to: TranslatorLanguage) {
  const clean = text.trim();
  if (!clean) return '';
  if (from === to) return clean;
  const key = clean.toLowerCase().replace(/[?.!]+$/g, '');
  const match = phraseTranslations[key];
  return match?.[to] || '';
}

async function translateWithGoogle(text: string, from: TranslatorLanguage, to: TranslatorLanguage) {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key is not configured. Add VITE_GOOGLE_TRANSLATE_API_KEY to .env.local.');
  }

  const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_TRANSLATE_API_KEY,
    },
    body: JSON.stringify({
      q: text,
      source: googleLanguageCodes[from],
      target: googleLanguageCodes[to],
      format: 'text',
      model: 'nmt',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Google Translate request failed.');
  }

  const translated = data?.data?.translations?.[0]?.translatedText;
  if (!translated) throw new Error('Google Translate returned no translation.');
  return translated;
}

export function AIChatbot() {
  const { role, registrationProfile, workerSkill } = useApp();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'coach' | 'translator'>('coach');
  const [input, setInput] = useState('');
  const [translationInput, setTranslationInput] = useState('');
  const [fromLanguage, setFromLanguage] = useState<TranslatorLanguage>('English');
  const [toLanguage, setToLanguage] = useState<TranslatorLanguage>('Hindi');
  const [translationResult, setTranslationResult] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [messages, setMessages] = useState([{ from: 'bot' as const, text: role === 'skilledWorker' ? 'Hi! I’m your ShramaSetu Skilled Worker AI Coach. I can help you build a resume, practise languages, learn computer skills, prepare for interviews, or follow profession-specific demo videos.' : 'Hi! I’m ShramaSetu AI Assistant (prototype). Ask me about registration, jobs, insurance, smart savings, skills, languages or your profile.' }]);

  useEffect(() => {
    const openCoach = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === 'translator') setMode('translator');
      else setMode('coach');
      setOpen(true);
    };
    window.addEventListener('open-shramasetu-ai', openCoach);
    return () => window.removeEventListener('open-shramasetu-ai', openCoach);
  }, []);

  const profileName = registrationProfile?.name || 'there';
  const profession = registrationProfile?.primarySkill || workerSkill || 'your profession';
  const suggestions = useMemo(() => {
    if (role === 'skilledWorker') return ['Help me make a resume', 'Create my career roadmap', 'Teach me computer basics', `Prepare me like an intern for ${profession}`];
    return role === 'labourer' ? ['Which insurance is mandatory for me?', 'How does smart savings work?', 'How can I find jobs?', 'How do I use UPI or my bank account?'] : ['How do I register workers?', 'How can I find workers?', 'How does smart savings work?'];
  }, [role, profession]);

  const answer = (question: string) => {
    const q = question.toLowerCase();
    if (role === 'skilledWorker') {
      if (q.includes('resume') || q.includes('cv')) return `Resume Coach: you do not need a corporate-style CV to be discoverable. Start with your name, ${profession}, practical skills, certifications, languages, location, experience and 2–3 real work examples. ShramaSetu can turn those details into a simple job-ready profile and resume.`;
      if (q.includes('roadmap') || q.includes('career') || q.includes('goal')) return `Career Roadmap for ${profession}: 1) strengthen your core practical skill, 2) complete one short industry course or micro-credential, 3) practise communication/computer skills, 4) complete a small real-world task, 5) update your ShramaID evidence, and 6) apply for better local roles. Progress can be tracked step by step so you can see what to do next.`;
      if (q.includes('save') || q.includes('spend') || q.includes('money')) return 'Smart money nudge: connect your savings goal to your career roadmap. Before an unnecessary expense, compare it with the amount needed for your emergency fund, course fee or career goal. The prototype can show reminders and progress without blocking your spending.';
      if (q.includes('language') || q.includes('english') || q.includes('hindi') || q.includes('kannada')) return 'Language Coach: practise a 10-minute routine — greetings, workplace vocabulary, customer conversations, safety instructions and a short interview answer. You can repeat the same lesson in English, Hindi, Kannada, Tamil, Telugu, Marathi or Bengali.';
      if (q.includes('computer') || q.includes('coding') || q.includes('excel')) return 'Computer Coach: begin with typing, email, file management, browser safety, online forms and Excel/Sheets. For technical roles, I can also explain basic programming concepts step by step.';
      if (q.includes('intern') || q.includes('demo') || q.includes('practice') || q.includes('prepare')) return `Intern Mode for ${profession}: learn one concept, watch a demo, complete a small practice task, then self-check with a short quiz. For a chef, for example, practise mise en place, recipe costing, food safety and one new recipe.`;
      if (q.includes('video') || q.includes('youtube') || q.includes('recipe')) return 'I added profession-focused YouTube learning searches below. Choose the closest topic and review the video before practising safely.';
      return `I can coach you for ${profession} with a resume-free profile, career roadmap, short-course preparation, languages, computer skills, interview practice and internship-style tasks.`;
    }
    if (q.includes('insurance') || q.includes('insur')) return `Based on your prototype profile (${registrationProfile?.skills?.join(', ') || workerSkill || 'your selected skill'}), the Insurance page analyses the skills you entered and marks relevant protection as mandatory. You can review the prototype plans there.`;
    if (q.includes('saving') || q.includes('salary') || q.includes('deduct')) return 'Smart Savings is dynamic. A low-income day can save ₹0, a stronger day can automatically move 2% of earnings to savings, and a very good day can move 3%. The idea is to save more when the worker can afford it, without adding a fixed deduction on difficult days.';
    if (q.includes('job') || q.includes('work')) return role === 'labourer' ? 'Open Jobs to browse work opportunities and apply. Your profile skills can be used to match you with suitable work.' : 'Use Find Workers to browse workers, or Post Job to create a new requirement.';
    if (q.includes('upi') || q.includes('bank') || q.includes('money') || q.includes('scan') || q.includes('account')) return 'Open Money to see your demo UPI ID, Scan & Pay flow, bank account, transfers, recent activity and savings. These controls are prototype-only and do not move real money.';
    if (q.includes('language') || q.includes('regional')) return 'You can choose your preferred regional language during registration. You can also type your personal details directly in that language.';
    if (q.includes('skill')) return 'Add your primary skill and any additional skills separated by commas. The prototype uses all skills for matching and insurance recommendations.';
    if (q.includes('profile') || q.includes('name')) return `Your prototype profile is for ${profileName}. Details shown after registration come from the information you entered.`;
    return 'I can help with registration, skills, insurance, smart savings, jobs, wages, languages and profile questions. Try one of the suggested questions.';
  };

  const handleTranslate = async () => {
    const clean = translationInput.trim();
    if (!clean) return;
    setTranslationLoading(true);
    setTranslationError('');
    setTranslationResult('');
    try {
      const translated = GOOGLE_TRANSLATE_API_KEY
        ? await translateWithGoogle(clean, fromLanguage, toLanguage)
        : translatePhrase(clean, fromLanguage, toLanguage);
      setTranslationResult(translated || 'No offline phrase match. Configure the Google Translate API key for full free-form translation.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Translation failed.';
      setTranslationError(message);
      const fallback = translatePhrase(clean, fromLanguage, toLanguage);
      if (fallback) setTranslationResult(fallback);
    } finally {
      setTranslationLoading(false);
    }
  };

  const send = (text = input) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { from: 'user' as const, text: clean }, { from: 'bot' as const, text: answer(clean) }]);
    setInput('');
  };

  if (!role) return null;

  return <>
    {open && <div className="fixed right-4 bottom-20 z-[60] w-[min(390px,calc(100vw-2rem))]">
      <Card className="overflow-hidden shadow-float border border-gray-100">
        <div className="bg-gray-900 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center"><Bot size={21} /></div>
          <div className="flex-1"><p className="font-extrabold text-sm">{role === 'skilledWorker' ? 'Skilled Worker AI Coach' : 'ShramaSetu AI Assistant'}</p><p className="text-[11px] text-gray-300">Prototype guidance only</p></div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><X size={17} /></button>
        </div>
        <div className="p-2 bg-white border-b border-gray-100 flex gap-2">
          <button onClick={() => setMode('coach')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'coach' ? 'bg-brand-50 text-brand-700' : 'text-gray-500'}`}><Bot size={14} className="inline mr-1" /> AI Coach</button>
          <button onClick={() => setMode('translator')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'translator' ? 'bg-brand-50 text-brand-700' : 'text-gray-500'}`}><Languages size={14} className="inline mr-1" /> Translator</button>
        </div>
        {mode === 'translator' ? <div className="p-3 bg-gray-50 space-y-3">
          <div><p className="text-sm font-extrabold text-gray-900">Language Translator</p><p className="text-[11px] text-gray-500 mt-1">Useful for workers, contractors and skilled workers when communicating at work.</p></div>
          <div className="grid grid-cols-2 gap-2">
            <select value={fromLanguage} onChange={(e) => setFromLanguage(e.target.value as TranslatorLanguage)} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold">{translatorLanguages.map((lang) => <option key={lang}>{lang}</option>)}</select>
            <select value={toLanguage} onChange={(e) => setToLanguage(e.target.value as TranslatorLanguage)} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold">{translatorLanguages.map((lang) => <option key={lang}>{lang}</option>)}</select>
          </div>
          <textarea value={translationInput} onChange={(e) => setTranslationInput(e.target.value)} placeholder="Type a work message, question or instruction..." rows={3} className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-brand-200 resize-none" />
          <button onClick={handleTranslate} disabled={translationLoading || !translationInput.trim()} className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Languages size={15} /> {translationLoading ? "Translating with Google…" : "Translate"}</button>
          {translationResult && <div className="p-3 rounded-xl bg-white border border-brand-100"><p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">{toLanguage} translation {GOOGLE_TRANSLATE_API_KEY && <span className="text-green-600">• Google Cloud</span>}</p><p className="text-sm font-semibold text-gray-800 mt-1">{translationResult}</p>{translationError && <p className="text-[10px] text-amber-600 mt-2">{translationError}</p>}</div>}
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Quick workplace phrases</p><div className="flex flex-wrap gap-2">{Object.keys(phraseTranslations).slice(0, 5).map((phrase) => <button key={phrase} onClick={() => setTranslationInput(phrase)} className="px-2.5 py-1.5 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-600">{phrase}</button>)}</div></div>
          <p className="text-[10px] text-gray-400">{GOOGLE_TRANSLATE_API_KEY ? "Connected to Google Cloud Translation for free-form text." : "Offline workplace phrases are available. Add the Google Cloud API key to enable free-form translation."}</p>
        </div> : <div className="max-h-80 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((m, i) => <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs ${m.from === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>{m.text}</div></div>)}
          {messages.length === 1 && <div className="flex flex-wrap gap-2 pt-1">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="px-2.5 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-600">{s}</button>)}</div>}
          {role === 'skilledWorker' && <div className="mt-3 p-3 rounded-2xl bg-white border border-gray-100"><p className="text-xs font-extrabold text-gray-800 mb-2">Learning links</p><div className="space-y-2">{videoLinks.map((v, i) => <a key={v.label} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-brand-700 hover:underline"><span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">{i === 0 ? <FileText size={13} /> : i === 1 ? <Languages size={13} /> : i === 2 ? <MonitorPlay size={13} /> : <ExternalLink size={13} />}</span>{v.label}<ExternalLink size={11} className="ml-auto" /></a>)}</div></div>}
        </div>}
        {mode === 'coach' && <div className="p-3 border-t border-gray-100 flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="Ask your AI coach..." className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-gray-100 text-xs outline-none focus:ring-2 focus:ring-brand-200" /><button onClick={() => send()} className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center"><Send size={16} /></button></div>}
      </Card>
    </div>}
    <button onClick={() => setOpen((v) => !v)} className="fixed right-4 bottom-[78px] z-[61] w-14 h-14 rounded-full bg-gray-900 text-white shadow-float flex items-center justify-center active:scale-95 transition-transform" aria-label="Open ShramaSetu AI Coach">{open ? <X size={22} /> : <MessageCircle size={22} />}{!open && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center"><Bot size={12} /></span>}</button>
  </>;
}
