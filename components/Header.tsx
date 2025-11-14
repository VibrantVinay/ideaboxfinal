import React, { useContext, useState, useEffect, useRef } from 'react';
import { SunIcon, MoonIcon } from '../constants';
import type { View as ViewType } from '../types';
import { View } from '../types';
import { AppContext } from '../App';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  setCurrentView: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, setCurrentView }) => {
    const { user, logout } = useContext(AppContext)!;
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        setCurrentView(View.PROFILE);
        setIsProfileMenuOpen(false);
    };
    
    const handleLogoutClick = () => {
        logout();
        setIsProfileMenuOpen(false);
    };

  return (
    <header className="sticky top-0 z-50 bg-white/30 dark:bg-black/30 backdrop-blur-lg border-b border-light-border dark:border-dark-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            IdeaBox
          </span>
          <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mt-1">Your Voice. Your Impact.</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-700" />}
          </button>
           {user && (
            <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="block w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-purple-500 transition-colors">
                    <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover"/>
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-xl py-1 z-10 animate-fade-in-sm">
                         <div className="px-4 py-2 border-b border-light-border dark:border-dark-border">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <button 
                          onClick={handleProfileClick} 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Profile
                        </button>
                        <button 
                          onClick={handleLogoutClick} 
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors border-t border-light-border dark:border-dark-border"
                        >
                            Logout
                        </button>
                    </div>
                )}
                 <style>{`
                    @keyframes fade-in-sm {
                        0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-fade-in-sm { animation: fade-in-sm 0.15s ease-out forwards; }
                `}</style>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;