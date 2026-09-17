import { HardHat, Building2, Bell, Globe, Mic, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '@/AppContext';
import { LANGUAGES } from '@/i18n';

export function TopBar() {
  const { role, conversations, lang, setLang, setScreen, playVoice, stopVoice, voiceActive, voiceText, workerStats, setRole } = useApp();
  const unread = conversations.reduce((s, c) => s + c.unread, 0);

  const toggleRole = () => {
    setRole(role === 'labourer' ? 'contractor' : 'labourer');
  };

  const handleVoiceInput = () => {
    const RecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!RecognitionCtor) {
      playVoice('Voice navigation is only available in supported browsers on mobile or desktop.');
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
    }[lang] || 'en-IN';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const command = transcript.trim();

      if (command.includes('home') || command.includes('dashboard')) {
        setScreen('home');
        playVoice('Opening home screen.');
      } else if (command.includes('job') || command.includes('work')) {
        setScreen('jobs');
        playVoice('Opening jobs.');
      } else if (command.includes('earning') || command.includes('wage') || command.includes('money')) {
        setScreen('earnings');
        playVoice('Opening earnings.');
      } else if (command.includes('save') || command.includes('savings')) {
        setScreen('savings');
        playVoice('Opening savings.');
      } else if (command.includes('profile')) {
        setScreen('profile');
        playVoice('Opening profile.');
      } else if (command.includes('message') || command.includes('chat')) {
        setScreen('messages');
        playVoice('Opening messages.');
      } else if (command.includes('balance') || command.includes('available')) {
        setScreen('home');
        playVoice(`Your available balance is ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(workerStats.availableBalance)}.`);
      } else {
        playVoice('Voice command not recognized. Try home, jobs, earnings, savings, or profile.');
      }
    };

    recognition.onerror = () => {
      playVoice('Voice control could not understand that command.');
    };

    recognition.onend = () => {
      stopVoice();
    };

    recognition.start();
    playVoice('Listening for your command.');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-50">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${role === 'labourer' ? 'bg-brand-600' : 'bg-accent-600'}`}>
            {role === 'labourer' ? <HardHat size={18} /> : <Building2 size={18} />}
          </div>
          <span className="font-extrabold text-gray-900 text-sm">Mango Bytes</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
            <Globe size={14} className="text-gray-500" />
            <select
              aria-label="Select language"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-[11px] font-medium text-gray-700 outline-none"
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.nativeLabel}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => (voiceActive ? stopVoice() : playVoice())}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Toggle voice assistant"
          >
            {voiceActive ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            aria-label="Start voice command"
          >
            <Mic size={18} />
          </button>
          <button className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error-500 ring-2 ring-white" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleRole}
            className={`w-8 h-8 rounded-full ${role === 'labourer' ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'} flex items-center justify-center text-sm font-bold`}
            aria-label="Switch role"
            title="Switch role"
          >
            {role === 'labourer' ? 'RK' : 'KC'}
          </button>
        </div>
      </div>
      {voiceActive && (
        <div className="border-t border-gray-100 bg-brand-50 px-4 py-2 text-center text-xs text-brand-700">
          {voiceText}
        </div>
      )}
    </header>
  );
}
