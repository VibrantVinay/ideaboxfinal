import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AppContext } from '../App';
import { EyeOpenIcon, EyeClosedIcon } from '../constants';

interface SignUpPageProps {
  onSwitchToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, showToast } = useContext(AppContext)!;

  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
    
  const generateCaptcha = useCallback(() => {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptcha({ num1, num2, answer: '' });
  }, []);

  useEffect(() => {
      generateCaptcha();
  }, [generateCaptcha]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
     if (parseInt(captcha.answer) !== captcha.num1 + captcha.num2) {
        showToast({ type: 'error', message: 'Incorrect CAPTCHA answer.' });
        generateCaptcha();
        return;
    }
    setIsLoading(true);
    try {
      await signup(name, email, password);
      showToast({ type: 'success', message: 'Account created! Please log in.' });
      onSwitchToLogin();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast({ type: 'error', message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Create Account</h2>
      <form onSubmit={handleSignUp} className="space-y-4">
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
            {showPassword ? <EyeClosedIcon className="w-5 h-5"/> : <EyeOpenIcon className="w-5 h-5"/>}
          </button>
        </div>
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
        
        <div className="flex items-center space-x-2">
            <label htmlFor="captcha" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {`What is ${captcha.num1} + ${captcha.num2}?`}
            </label>
            <input type="number" id="captcha" value={captcha.answer} onChange={(e) => setCaptcha(c => ({ ...c, answer: e.target.value }))} className="w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" required />
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          Sign In
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

export default SignUpPage;