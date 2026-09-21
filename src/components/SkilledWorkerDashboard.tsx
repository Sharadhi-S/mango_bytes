import type { ReactNode } from 'react';
import { FileText, Languages, MonitorPlay, Sparkles, Briefcase, GraduationCap, MessageCircle, ArrowRight, Target, BookOpen, MapPin, WalletCards } from 'lucide-react';
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
  const { registrationProfile, setScreen } = useApp();
  const skill = registrationProfile?.primarySkill || 'Skilled Worker';

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title={`Welcome, ${registrationProfile?.name?.split(' ')[0] || 'Skilled Worker'}`} subtitle={`${skill} · build skills, prove skills, find work`} />

      <Card className="p-5 mb-5 bg-gradient-to-br from-purple-50 via-white to-brand-50 border-purple-100">
        <div className="flex items-start gap-3"><div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center"><Sparkles size={24} /></div><div className="flex-1"><p className="text-xs font-bold text-purple-700 uppercase tracking-wide">ShramaSetu Skill Studio</p><h2 className="text-xl font-extrabold text-gray-900 mt-1">AI-powered career practice</h2><p className="text-sm text-gray-600 mt-1">Prepare resumes, practise languages, learn computer skills and watch profession-specific demos — all from one place.</p><button onClick={() => window.dispatchEvent(new CustomEvent('open-shramasetu-ai'))} className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold"><MessageCircle size={16} /> Open AI Coach</button></div></div>
      </Card>

      <Card className="p-4 mb-5 border-purple-100 bg-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center"><Target size={20} /></div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Personalized Career Roadmap</p>
            <h3 className="font-extrabold text-gray-900 mt-1">From today’s skill to the next job</h3>
            <p className="text-xs text-gray-500 mt-1">The roadmap turns a career goal into small steps, tracks progress and highlights the next action.</p>
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
        <Card className="p-4"><div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><MapPin size={18} /></div><p className="font-extrabold text-gray-900 text-sm mt-3">Hyper-local work</p><p className="text-xs text-gray-500 mt-1">Prioritise jobs within a practical 5–15 km radius.</p></Card>
        <Card className="p-4"><div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center"><WalletCards size={18} /></div><p className="font-extrabold text-gray-900 text-sm mt-3">Goal + money nudges</p><p className="text-xs text-gray-500 mt-1">Track savings toward courses, tools and career goals; get reminders before unnecessary spending.</p></Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        {learning.map(({ title, desc, icon: Icon, color, translator }) => <Card key={title} className="p-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div><h3 className="font-extrabold text-gray-900 mt-3">{title}</h3><p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p><button onClick={() => window.dispatchEvent(new CustomEvent('open-shramasetu-ai', { detail: translator ? 'translator' : title }))} className="mt-3 text-xs font-bold text-brand-600 inline-flex items-center gap-1">Start with AI <ArrowRight size={13} /></button></Card>)}
      </div>

      <Card className="p-4 mb-5">
        <div className="flex items-center justify-between mb-3"><div><p className="font-extrabold text-gray-900">Your Skilled Worker Profile</p><p className="text-xs text-gray-500 mt-1">Visible to contractors searching for your profession</p></div><Badge color="green">Verified-ready</Badge></div>
        <div className="flex flex-wrap gap-2">{(registrationProfile?.skills || [skill]).map((item) => <Badge key={item} color="blue">{item}</Badge>)}</div>
        <button onClick={() => setScreen('profile')} className="mt-4 w-full rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-700">View & improve profile</button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Briefcase size={20} /></div><div className="flex-1"><p className="font-bold text-gray-900">Find nearby skilled work</p><p className="text-xs text-gray-500">Jobs can match your skill, location and availability.</p></div><button onClick={() => setScreen('jobs')} className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center"><ArrowRight size={18} /></button></div>
      </Card>
    </div>
  );
}

function RoadmapStep({ icon, title, done = false }: { icon: ReactNode; title: string; done?: boolean }) {
  return <div className="flex items-center gap-2 text-xs"><div className={`w-7 h-7 rounded-lg flex items-center justify-center ${done ? 'bg-accent-50 text-accent-600' : 'bg-gray-100 text-gray-500'}`}>{icon}</div><span className={`flex-1 ${done ? 'text-gray-500 line-through' : 'font-semibold text-gray-800'}`}>{title}</span><span className={`text-[10px] font-bold ${done ? 'text-accent-600' : 'text-gray-400'}`}>{done ? 'Done' : 'Next'}</span></div>;
}
