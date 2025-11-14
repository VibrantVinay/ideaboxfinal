import React, { useState, useContext } from 'react';
import { AppContext } from '../App';

interface LoginPageProps {
  onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, showToast } = useContext(AppContext)!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showToast({ type: 'success', message: 'Logged in successfully!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast({ type: 'error', message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Welcome Back</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
        </div>
        <div className="text-right">
          <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Forgot Password?</a>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignUp} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          Sign Up
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LoginPage;
