import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import Header from './components/Header';
import SuggestionDashboard from './components/SuggestionDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Leaderboard from './components/Leaderboard';
import { useSuggestions } from './hooks/useSuggestions';
import { useAuth } from './hooks/useAuth';
import { useModeration } from './hooks/useModeration';
import type { ToastMessage, User, View as ViewType, Suggestion, Status, ReactionType, Comment, Category, Sentiment, ModerationLog, ModerationAction } from './types';
import { View } from './types';
import Toast from './components/common/Toast';
import SplashScreen from './components/SplashScreen';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import Modal from './components/common/Modal';
import BottomNavBar from './components/BottomNavBar';
import ModerationDashboard from './components/ModerationDashboard';
import { ShieldIcon } from './constants';

interface IAppContext {
  isAdmin: boolean;
  toggleAdmin: () => void;
  showToast: (message: ToastMessage) => void;
  user: User | null;
  logout: () => void;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  suggestions: Suggestion[];
  addSuggestion: (
      suggestion: Omit<Suggestion, 'id' | 'upvotes' | 'downvotes' | 'comments' | 'reactions' | 'createdAt' | 'avatar' | 'status' | 'sentiment' | 'isAnonymous' | 'author' | 'isPrivate' | 'statusUpdatedAt'>, 
      analysis: { category: Category, tags: string[], sentiment: Sentiment },
      isAnonymous: boolean,
      isPrivate: boolean,
      user: User | null
  ) => void;
  updateSuggestionStatus: (id: string, status: Status) => void;
  vote: (id: string, type: 'up' | 'down') => void;
  addReaction: (id: string, type: ReactionType) => void;
  addComment: (id: string, text: string) => void;
  reportSuggestion: (id: string, reason: string) => void;
  removeSuggestion: (id: string) => void;
  dismissReport: (id: string) => void;
  moderationLogs: ModerationLog[];
  logAction: (action: ModerationAction, suggestion: Suggestion) => void;
}

export const AppContext = createContext<IAppContext | null>(null);

const MainApp: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [currentView, setCurrentView] = useState<ViewType>(View.DASHBOARD);
    const { suggestions, isAdmin } = useContext(AppContext)!;

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const renderView = () => {
        switch (currentView) {
            case View.ANALYTICS:
                return <AnalyticsDashboard suggestions={suggestions} theme={theme} />;
            case View.LEADERBOARD:
                return <Leaderboard suggestions={suggestions} />;
            case View.PROFILE:
                return <ProfilePage />;
            case View.MODERATION:
                return isAdmin ? <ModerationDashboard /> : <SuggestionDashboard currentView={View.DASHBOARD} />;
            case View.DASHBOARD:
            case View.SUGGESTIONS:
            default:
                return <SuggestionDashboard currentView={currentView} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-500">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                setCurrentView={setCurrentView}
            />
            <main className="container mx-auto px-4 py-8 pb-24">
                {renderView()}
            </main>
            <BottomNavBar currentView={currentView} setCurrentView={setCurrentView} />
        </div>
    );
}

const PasswordPromptModal: React.FC<{onClose: () => void, onSubmit: (password: string) => boolean}> = ({ onClose, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onSubmit(password);
        if (!success) {
            setError('Incorrect password. Please try again.');
            setPassword('');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500); // Duration of shake animation
        }
    };

    return (
        <Modal title="Admin Access Required" onClose={onClose}>
            <div className={isShaking ? 'animate-shake' : ''}>
                <form onSubmit={handleSubmit}>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Please enter the administrator password to enable admin mode.
                    </p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError(null);
                        }}
                        className={`w-full bg-gray-200/50 dark:bg-gray-900/50 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition ${
                            error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-light-border dark:border-dark-border focus:ring-purple-500'
                        }`}
                        placeholder="Password"
                        autoFocus
                    />
                    {error && <p className="mt-2 text-sm text-red-500 animate-fade-in-fast">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes shake {
                  10%, 90% { transform: translate3d(-1px, 0, 0); }
                  20%, 80% { transform: translate3d(2px, 0, 0); }
                  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                  40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes fade-in-fast {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
            `}</style>
        </Modal>
    );
};

const AdminAnimation = () => (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none animate-fade-out-delay p-4">
        <div className="text-white animate-zoom-in-out text-center">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-teal-300">
                Admin Mode Activated
            </h2>
        </div>
        <style>{`
            @keyframes zoom-in-out {
                0% { transform: scale(0.8); opacity: 0; }
                20%, 80% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.8); opacity: 0; }
            }
            .animate-zoom-in-out { animation: zoom-in-out 2.5s ease-in-out forwards; }

            @keyframes fade-out-delay {
                0%, 80% { opacity: 1; }
                100% { opacity: 0; }
            }
            .animate-fade-out-delay { animation: fade-out-delay 2.5s ease-in-out forwards; }
        `}</style>
    </div>
);


const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const auth = useAuth();
    const suggestionsState = useSuggestions();
    const moderationState = useModeration();
    const [isAdmin, setIsAdmin] = useState(false);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [showAdminAnimation, setShowAdminAnimation] = useState(false);


    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 3000);
        return () => clearTimeout(timer);
    }, []);
    
    const showToast = useCallback((message: ToastMessage) => {
        setToast(message);
    }, []);

    const toggleAdmin = () => {
        if (!auth.user) {
            showToast({ type: 'error', message: 'You must be logged in to use admin features.' });
            return;
        }
        if (isAdmin) {
            setIsAdmin(false);
            showToast({ type: 'info', message: 'Admin mode disabled' });
        } else {
            setShowPasswordPrompt(true);
        }
    };

    const handleAdminLogin = (password: string): boolean => {
        if (password === 'vml001') {
            setIsAdmin(true);
            setShowPasswordPrompt(false);
            setShowAdminAnimation(true);
            setTimeout(() => setShowAdminAnimation(false), 2500); // Animation duration
            return true;
        } else {
            return false;
        }
    };

    const appContextValue: IAppContext = {
        isAdmin,
        toggleAdmin,
        showToast,
        user: auth.user,
        logout: auth.logout,
        login: auth.login,
        signup: auth.signup,
        updateProfile: auth.updateProfile,
        ...suggestionsState,
        ...moderationState,
        logAction: (action, suggestion) => {
            if (auth.user) {
                moderationState.logAction(action, suggestion, auth.user);
            }
        },
    };

    const renderContent = () => {
        if (showSplash || auth.isLoading) {
            return <SplashScreen />;
        }
        if (!auth.user) {
            return <AuthPage />;
        }
        return <MainApp />;
    }

    return (
        <AppContext.Provider value={appContextValue}>
            {renderContent()}
            {showAdminAnimation && <AdminAnimation />}
            {showPasswordPrompt && <PasswordPromptModal onClose={() => setShowPasswordPrompt(false)} onSubmit={handleAdminLogin} />}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AppContext.Provider>
    );
};

export default App;