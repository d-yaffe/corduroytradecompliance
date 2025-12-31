import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { UnifiedClassification } from './components/UnifiedClassification';
import { ProductProfile } from './components/ProductProfile';
import { Settings } from './components/Settings';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm, SignUpData } from './components/auth/SignUpForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { NewPasswordForm } from './components/auth/NewPasswordForm';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { OnboardingFlow } from './components/auth/OnboardingFlow';
import { Package, FileText, LayoutDashboard, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import logo from './assets/8dffc9a46764dc298d3dc392fb46f27f3eb8c7e5.png';
import { supabase } from './lib/supabase';
import { getUserMetadata, updateLastLogin, createOrUpdateUserMetadata } from './lib/userService';

type View = 'dashboard' | 'classify' | 'profile' | 'settings';
type AuthView = 'login' | 'signup' | 'reset-password' | 'new-password';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  companyName?: string;
  confidenceThreshold?: number;
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
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData(session.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        loadUserData(session.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (supabaseUser: any) => {
    try {
      // Fetch user metadata from user_metadata table
      const userMetadata = await getUserMetadata(supabaseUser.id);
      
      // Update last login timestamp
      await updateLastLogin(supabaseUser.id);

      // Extract profile info if available
      const profileInfo = userMetadata?.profile_info || {};
      
      setUser({
        id: supabaseUser.id,
        email: userMetadata?.email || supabaseUser.email || '',
        firstName: profileInfo.first_name || profileInfo.firstName || supabaseUser.user_metadata?.first_name,
        lastName: profileInfo.last_name || profileInfo.lastName || supabaseUser.user_metadata?.last_name,
        company: userMetadata?.company_name || supabaseUser.user_metadata?.company,
        companyName: userMetadata?.company_name,
        confidenceThreshold: userMetadata?.confidence_threshold,
        hasCompletedOnboarding: profileInfo.has_completed_onboarding ?? true,
      });

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to basic user data if metadata fetch fails
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: supabaseUser.user_metadata?.first_name,
        lastName: supabaseUser.user_metadata?.last_name,
        company: supabaseUser.user_metadata?.company,
        hasCompletedOnboarding: true,
      });
      setIsAuthenticated(true);
    }
  };

  // Authentication handlers
  const handleLogin = (supabaseUser: any) => {
    loadUserData(supabaseUser);
  };

  const handleSignUp = async (data: SignUpData) => {
    try {
      // Wait a moment for Supabase Auth to process the signup
      // The user should be available from the signup response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the current user (should be authenticated after signup)
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !supabaseUser) {
        console.error('Error getting user after signup:', userError);
        // Fallback - user metadata will be created by trigger, but we'll set basic user data
        setUser({
          id: '',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          companyName: data.company,
          hasCompletedOnboarding: false,
        });
        setShowWelcome(true);
        setIsAuthenticated(true);
        return;
      }

      // Create or update user metadata with company name
      // Note: The trigger should have already created user_metadata, but we update company_name
      await createOrUpdateUserMetadata(
        supabaseUser.id,
        data.email,
        data.company
      );

      // Load full user data (which will fetch from user_metadata table)
      await loadUserData(supabaseUser);
      
      setShowWelcome(true); // Show welcome screen for new users
    } catch (error) {
      console.error('Error during signup:', error);
      // Fallback
      setUser({
        id: '',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        hasCompletedOnboarding: false,
      });
      setShowWelcome(true);
      setIsAuthenticated(true);
    }
  };

  const handleResetPassword = (email: string) => {
    // In a real app, this would send a reset email
    console.log('Password reset requested for:', email);
  };

  const handleResetComplete = () => {
    // After password reset, go back to login
    setAuthView('login');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setCurrentView('dashboard');
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

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
        userName={user && user.firstName ? user.firstName : (user && user.email ? user.email.split('@')[0] : 'there')}
        company={user && user.company ? user.company : undefined}
        onGetStarted={() => setShowWelcome(false)}
      />
    );
  }

  // Show onboarding flow for new users
  if (isAuthenticated && user && !user.hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        userName={user && user.firstName ? user.firstName : (user && user.email ? user.email.split('@')[0] : 'there')}
        company={user && user.company ? user.company : undefined}
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
          
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
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
                  {user && user.firstName ? user.firstName : (user && user.email ? user.email.split('@')[0] : 'User')}
                </p>
                <p className="text-xs text-slate-500 truncate">{user && user.email ? user.email : ''}</p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm text-slate-900">
                    {user && user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : (user && user.email ? user.email : '')}
                  </p>
                  {user && user.company && (
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
            <p className="mt-1">US Importers</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
        {currentView === 'classify' && <UnifiedClassification />}
        {currentView === 'profile' && <ProductProfile />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}
