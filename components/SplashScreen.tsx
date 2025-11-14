import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-dark-bg dark:to-indigo-900/30 transition-colors duration-500">
      <div className="animate-reveal">
        <div className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
          IdeaBox
        </div>
        <p className="mt-2 text-center text-sm md:text-base text-gray-500 dark:text-gray-400">
          Your Voice. Your Impact.
        </p>
      </div>
      <div className="absolute bottom-16 w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="animate-progress w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600"></div>
      </div>
      <style>{`
        @keyframes reveal {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-reveal { animation: reveal 1s ease-out forwards; }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-progress { animation: progress 3s linear forwards; }
      `}</style>
    </div>
  );
};

export default SplashScreen;
