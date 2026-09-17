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

function LabourerApp() {
  const { screen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <LabourerDashboard />;
      case 'earnings': return <EarningsScreen />;
      case 'savings': return <SavingsScreen />;
      case 'jobs': return <JobsScreen />;
      case 'messages': return <MessagesScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <LabourerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main key={screen} className="animate-fade-in">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
}

function ContractorApp() {
  const { screen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <ContractorDashboard />;
      case 'workers': return <WorkersScreen />;
      case 'postJob': return <PostJobScreen />;
      case 'attendance': return <AttendanceScreen />;
      case 'wages': return <WagesScreen />;
      case 'messages': return <MessagesScreen />;
      default: return <ContractorDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main key={screen} className="animate-fade-in">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
}

function AppContent() {
  const { role } = useApp();

  if (!role) return <RoleSelect />;
  return role === 'labourer' ? <LabourerApp /> : <ContractorApp />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
