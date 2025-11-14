import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-dark-bg dark:to-indigo-900/30 p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
                IdeaBox
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Your Voice. Your Impact.</p>
        </div>
        <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-xl border border-light-border dark:border-dark-border rounded-2xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
