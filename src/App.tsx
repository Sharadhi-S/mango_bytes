import { AppProvider, useApp } from './AppContext';
import { RoleSelect } from './components/RoleSelect';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { LabourerDashboard } from './components/LabourerDashboard';
import { EarningsScreen } from './components/EarningsScreen';
import { SavingsScreen } from './components/SavingsScreen';
import { JobsScreen } from './components/JobsScreen';
import { MessagesScreen } from './components/MessagesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ContractorDashboard } from './components/ContractorDashboard';
import { WorkersScreen } from './components/WorkersScreen';
import { PostJobScreen } from './components/PostJobScreen';
import { AttendanceScreen } from './components/AttendanceScreen';
import { WagesScreen } from './components/WagesScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { InsuranceScreen } from './components/InsuranceScreen';
import { AIChatbot } from './components/AIChatbot';
import { HomeWorkScreen } from './components/HomeWorkScreen';
import { SkilledWorkerDashboard } from './components/SkilledWorkerDashboard';
import { ShramaIDScreen } from './components/ShramaIDScreen';
import { AuthScreen } from './components/AuthScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { EmployerDashboard } from './components/EmployerDashboard';
import { ProjectCommandCenter } from './components/ProjectCommandCenter';
import { Card } from './components/ui';

function AppContent() {
  const { role, screen, wellbeingAlertOpen, dismissWellbeingAlert } = useApp();

  if (!role) return <RoleSelect />;

  const renderScreen = () => {
    if (screen === 'auth') return <AuthScreen />;
    if (screen === 'register') return <RegistrationScreen />;
    if (screen === 'alerts') return <AlertsScreen />;
    if (screen === 'shramId') return <ShramaIDScreen />;
    if (screen === 'projectDetail') return <ProjectCommandCenter />;

    if (role === 'labourer') {
      switch (screen) {
        case 'home': return <LabourerDashboard />;
        case 'earnings': return <EarningsScreen />;
        case 'savings': return <SavingsScreen />;
        case 'jobs': return <JobsScreen />;
        case 'messages': return <MessagesScreen />;
        case 'profile': return <ProfileScreen />;
        case 'insurance': return <InsuranceScreen />;
        case 'homeWork': return <HomeWorkScreen />;
        default: return <LabourerDashboard />;
      }
    }

    if (role === 'skilledWorker') {
      switch (screen) {
        case 'home': return <SkilledWorkerDashboard />;
        case 'earnings': return <EarningsScreen />;
        case 'savings': return <SavingsScreen />;
        case 'jobs': return <JobsScreen />;
        case 'messages': return <MessagesScreen />;
        case 'profile': return <ProfileScreen />;
        case 'insurance': return <InsuranceScreen />;
        default: return <SkilledWorkerDashboard />;
      }
    }

    if (role === 'employer') {
      return screen === 'profile' ? <EmployerDashboard /> : <EmployerDashboard />;
    }

    if (role === 'contractor') {
      switch (screen) {
        case 'home': return <ContractorDashboard />;
        case 'profile': return <ContractorDashboard showProfileInitially />;
        case 'workers': return <WorkersScreen />;
        case 'postJob': return <PostJobScreen />;
        case 'attendance': return <AttendanceScreen />;
        case 'wages': return <WagesScreen />;
        case 'messages': return <MessagesScreen />;
        case 'homeWork': return <HomeWorkScreen />;
        default: return <ContractorDashboard />;
      }
    }

    return <RoleSelect />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors">
      <TopBar />
      <main key={screen} className="animate-fade-in">
        {renderScreen()}
      </main>
      {screen !== 'register' && screen !== 'auth' && screen !== 'alerts' && <BottomNav />}
      {screen !== 'register' && screen !== 'auth' && <AIChatbot />}
      {wellbeingAlertOpen && screen !== 'register' && screen !== 'auth' && (
        <div className="fixed inset-0 z-[60] bg-black/35 flex items-center justify-center p-5" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md p-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl mb-4">🔔</div>
            <h2 className="text-xl font-extrabold text-gray-900">ShramaSetu wellbeing alert</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">Protect your work, health and earnings. Avoid excessive reels, social media and other online distractions; stay away from alcohol before or during work; and avoid unnecessary or impulsive spending.</p>
            <p className="text-xs text-gray-400 mt-3">You will see this reminder once after registration or sign-in, and then again every 20 minutes during the prototype session.</p>
            <button onClick={dismissWellbeingAlert} className="w-full mt-5 py-3 rounded-xl bg-brand-600 text-white font-extrabold">Got it</button>
          </Card>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
