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

function AppContent() {
  const { role, screen, conversations } = useApp();

  if (!role) return <RoleSelect />;

  const renderScreen = () => {
    if (screen === 'register') return <RegistrationScreen />;
    if (screen === 'shramId') return <ShramaIDScreen />;

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
    } else {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main key={screen} className="animate-fade-in">
        {renderScreen()}
      </main>
      {screen !== 'register' && <BottomNav />}
      {screen !== 'register' && <AIChatbot />}
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
