import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { UnifiedClassification } from './components/UnifiedClassification';
import { ProductProfile } from './components/ProductProfile';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm, SignUpData } from './components/auth/SignUpForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { NewPasswordForm } from './components/auth/NewPasswordForm';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { OnboardingFlow } from './components/auth/OnboardingFlow';
import { Package, FileText, LayoutDashboard, LogOut, User } from 'lucide-react';
import logo from 'figma:asset/8dffc9a46764dc298d3dc392fb46f27f3eb8c7e5.png';

type View = 'dashboard' | 'classify' | 'profile';
type AuthView = 'login' | 'signup' | 'reset-password' | 'new-password';

interface UserData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  hasCompletedOnboarding?: boolean;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Authentication handlers
  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate credentials with a backend
    // and check if user has completed onboarding
    setUser({ email, hasCompletedOnboarding: true }); // Existing users have completed onboarding
    setIsAuthenticated(true);
  };

  const handleSignUp = (data: SignUpData) => {
    // In a real app, this would create the user account on the backend
    setUser({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      hasCompletedOnboarding: false, // New users haven't completed onboarding
    });
    setShowWelcome(true); // Show welcome screen for new users
    setIsAuthenticated(true);
  };

  const handleResetPassword = (email: string) => {
    // In a real app, this would send a reset email
    console.log('Password reset requested for:', email);
  };

  const handleResetComplete = () => {
    // After password reset, go back to login
    setAuthView('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('dashboard');
    setShowUserMenu(false);
  };

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignUp={() => setAuthView('signup')}
          onSwitchToResetPassword={() => setAuthView('reset-password')}
        />
      );
    }

    if (authView === 'signup') {
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }

    if (authView === 'reset-password') {
      return (
        <ResetPasswordForm
          onRequestReset={handleResetPassword}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }

    if (authView === 'new-password') {
      return <NewPasswordForm onResetComplete={handleResetComplete} />;
    }
  }

  // Show welcome screen for new users
  if (isAuthenticated && showWelcome) {
    return (
      <WelcomeScreen
        userName={user?.firstName || user?.email?.split('@')[0] || 'there'}
        company={user?.company}
        onGetStarted={() => setShowWelcome(false)}
      />
    );
  }

  // Show onboarding flow for new users
  if (isAuthenticated && !user?.hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        userName={user?.firstName || user?.email?.split('@')[0] || 'there'}
        company={user?.company}
        onComplete={() => {
          setUser({ ...user, hasCompletedOnboarding: true });
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Authenticated app
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="mb-8">
          <img src={logo} alt="Corduroy AI" className="w-full max-w-[200px]" />
        </div>
        
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentView('classify')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'classify'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Classify Product</span>
          </button>
          
          <button
            onClick={() => setCurrentView('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Product Profiles</span>
          </button>
        </nav>
        
        {/* User Profile Section */}
        <div className="mt-auto pt-6 border-t border-slate-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 truncate">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm text-slate-900">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email}
                  </p>
                  {user?.company && (
                    <p className="text-xs text-slate-500 mt-1">{user.company}</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 text-slate-500 text-xs">
            <p>Compliance OS v1.0</p>
            <p className="mt-1">US Importers & USMCA</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
        {currentView === 'classify' && <UnifiedClassification />}
        {currentView === 'profile' && <ProductProfile />}
      </main>
    </div>
  );
}