import React, { useContext } from 'react';
import { View } from '../types';
import type { View as ViewType } from '../types';
import { HomeIcon, ListIcon, ChartIcon, TrophyIcon, ShieldIcon } from '../constants';
import { AppContext } from '../App';

interface NavItem {
    view: ViewType;
    label: string;
    icon: React.FC<{className?: string}>;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { view: View.DASHBOARD, label: 'Dashboard', icon: HomeIcon },
  { view: View.SUGGESTIONS, label: 'Suggestions', icon: ListIcon },
  { view: View.LEADERBOARD, label: 'Leaderboard', icon: TrophyIcon },
  { view: View.ANALYTICS, label: 'Analytics', icon: ChartIcon },
  { view: View.MODERATION, label: 'Moderation', icon: ShieldIcon, adminOnly: true },
];

const BottomNavBar: React.FC<{ currentView: ViewType; setCurrentView: (view: ViewType) => void; }> = ({ currentView, setCurrentView }) => {
  const { isAdmin } = useContext(AppContext)!;
  const availableNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg border-t border-light-border dark:border-dark-border z-40">
      <div className="container mx-auto px-4 flex justify-around items-center h-16">
        {availableNavItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`flex flex-col items-center justify-center w-24 h-full text-xs sm:text-sm transition-colors duration-200 rounded-lg ${
              currentView === view
                ? 'text-purple-600 dark:text-purple-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
