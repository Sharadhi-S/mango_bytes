import type { ReactNode } from 'react';
import { FileText, Languages, MonitorPlay, Sparkles, Briefcase, GraduationCap, MessageCircle, ArrowRight, Target, BookOpen, MapPin, WalletCards, ShieldCheck } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge } from './ui';

const learning = [
  { title: 'Resume Builder', desc: 'Turn your skills and experience into a clean job-ready resume.', icon: FileText, color: 'bg-brand-50 text-brand-600' },
  { title: 'Language Coach', desc: 'Practice English and regional languages for interviews and work.', icon: Languages, color: 'bg-accent-50 text-accent-600' },
  { title: 'Workplace Translator', desc: 'Translate work instructions, customer messages and common workplace phrases.', icon: Languages, color: 'bg-purple-50 text-purple-600', translator: true },
  { title: 'Computer Basics', desc: 'Learn typing, email, spreadsheets and digital job skills.', icon: MonitorPlay, color: 'bg-warning-50 text-warning-600' },
  { title: 'Intern Mode', desc: 'Get step-by-step practice tasks and profession demos.', icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
];

export function SkilledWorkerDashboard() {
  const { registrationProfile, setScreen, t } = useApp();
  const skill = registrationProfile?.primarySkill || 'Skilled Worker';

  const learning = [
    { title: t('resumeBuilder') || 'Resume Builder', desc: t('resumeBuilderDesc') || 'Turn your skills and experience into a clean job-ready resume.', icon: FileText, color: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300' },
    { title: t('languageCoach') || 'Language Coach', desc: t('languageCoachDesc') || 'Practice English and regional languages for interviews and work.', icon: Languages, color: 'bg-accent-50 text-accent-600 dark:bg-emerald-950/60 dark:text-emerald-300' },
    { title: t('workplaceTranslator') || 'Workplace Translator', desc: t('workplaceTranslatorDesc') || 'Translate work instructions, customer messages and common workplace phrases.', icon: Languages, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300', translator: true },
    { title: t('computerBasics') || 'Computer Basics', desc: t('computerBasicsDesc') || 'Learn typing, email, spreadsheets and digital job skills.', icon: MonitorPlay, color: 'bg-warning-50 text-warning-600 dark:bg-amber-950/60 dark:text-amber-300' },
    { title: t('internMode') || 'Intern Mode', desc: t('internModeDesc') || 'Get step-by-step practice tasks and profession demos.', icon: GraduationCap, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300' },
  ];

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title={`${t('welcomeBack') || 'Welcome'}, ${registrationProfile?.name?.split(' ')[0] || 'Skilled Worker'}`} subtitle={`${skill} · build skills, prove skills, find work`} showBack={false} />

      <div className="mb-4 overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
        <div className="px-4 py-2.5 flex items-center gap-2 whitespace-nowrap animate-pulse">
          <ShieldCheck size={16} className="text-amber-700 dark:text-amber-400 shrink-0" />
          <p className="text-xs font-extrabold text-amber-800 dark:text-amber-200">{t('insuranceReminder') || 'Insurance reminder: mandatory skill-based insurance premiums are paid once every year. Keep your annual protection active.'}</p>
        </div>
      </div>

      <Card className="p-5 mb-5 bg-gradient-to-br from-purple-50 via-white to-brand-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-brand-950/30 border-purple-100 dark:border-purple-900/40">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">{t('skillStudioTitle') || 'ShramaSetu Skill Studio'}</p>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 mt-1">{t('aiCareerPractice') || 'AI-powered career practice'}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{t('skillStudioDesc') || 'Prepare resumes, practise languages, learn computer skills and watch profession-specific demos — all from one place.'}</p>
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-shramasetu-ai'))} className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-700 text-white text-sm font-bold active:scale-95 transition-all">
              <MessageCircle size={16} /> {t('openAiCoach') || 'Open AI Coach'}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-5 border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">{t('careerRoadmap') || 'Personalized Career Roadmap'}</p>
            <h3 className="font-extrabold text-gray-900 dark:text-slate-100 mt-1">{t('fromTodaySkill') || 'From today’s skill to the next job'}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('roadmapDesc') || 'The roadmap turns a career goal into small steps, tracks progress and highlights the next action.'}</p>
            <div className="mt-3 space-y-2">
              <RoadmapStep icon={<Briefcase size={15} />} title={`Strengthen ${skill}`} done />
              <RoadmapStep icon={<BookOpen size={15} />} title="Complete a short course / micro-credential" done />
              <RoadmapStep icon={<MonitorPlay size={15} />} title="Practise a real-world task with AI" />
              <RoadmapStep icon={<Target size={15} />} title="Add proof to ShramaID and apply for better local roles" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <MapPin size={18} />
          </div>
          <p className="font-extrabold text-gray-900 dark:text-slate-100 text-sm mt-3">{t('hyperLocalWork') || 'Hyper-local work'}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('hyperLocalDesc') || 'Prioritise jobs within a practical 5–15 km radius.'}</p>
        </Card>
        <Card className="p-4">
          <div className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-emerald-950/60 text-accent-600 dark:text-emerald-400 flex items-center justify-center">
            <WalletCards size={18} />
          </div>
          <p className="font-extrabold text-gray-900 dark:text-slate-100 text-sm mt-3">{t('goalMoneyNudges') || 'Goal + money nudges'}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('goalMoneyDesc') || 'Track savings toward courses, tools and career goals; get reminders before unnecessary spending.'}</p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        {learning.map(({ title, desc, icon: Icon, color, translator }) => (
          <Card key={title} className="p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-slate-100 mt-3">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-shramasetu-ai', { detail: translator ? 'translator' : title }))} className="mt-3 text-xs font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 active:underline">
              {t('startWithAi') || 'Start with AI'} <ArrowRight size={13} />
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-extrabold text-gray-900 dark:text-slate-100">{t('skilledProfileTitle') || 'Your Skilled Worker Profile'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('skilledProfileSubtitle') || 'Visible to contractors searching for your profession'}</p>
          </div>
          <Badge color="green">Verified-ready</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {(registrationProfile?.skills || [skill]).map((item) => <Badge key={item} color="blue">{item}</Badge>)}
        </div>
        <button onClick={() => setScreen('profile')} className="mt-4 w-full rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 py-3 text-sm font-bold text-gray-700 dark:text-slate-200 transition-colors">
          {t('viewImproveProfile') || 'View & improve profile'}
        </button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-slate-100">{t('findNearbySkilledWork') || 'Find nearby skilled work'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('findNearbyDesc') || 'Jobs can match your skill, location and availability.'}</p>
          </div>
          <button onClick={() => setScreen('jobs')} className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all">
            <ArrowRight size={18} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function RoadmapStep({ icon, title, done = false }: { icon: ReactNode; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${done ? 'bg-accent-50 dark:bg-emerald-950/60 text-accent-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
        {icon}
      </div>
      <span className={`flex-1 ${done ? 'text-gray-500 dark:text-slate-400 line-through' : 'font-semibold text-gray-800 dark:text-slate-200'}`}>
        {title}
      </span>
      <span className={`text-[10px] font-bold ${done ? 'text-accent-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
        {done ? 'Done' : 'Next'}
      </span>
    </div>
  );
}
