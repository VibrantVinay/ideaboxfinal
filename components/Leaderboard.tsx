import React, { useMemo } from 'react';
import type { Suggestion } from '../types';

interface LeaderboardProps {
  suggestions: Suggestion[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ suggestions }) => {
  const topSuggestions = useMemo(() => {
    return [...suggestions]
      .filter(s => !s.isPrivate) // Exclude private suggestions from leaderboard
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      .slice(0, 10);
  }, [suggestions]);

  const getTrophy = (index: number) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Most Popular Ideas</h1>
        <div className="space-y-4">
          {topSuggestions.map((suggestion, index) => (
            <div key={suggestion.id} className={`bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 flex items-center space-x-4 transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg ${index === 0 ? 'winner-card' : ''}`}>
              <div className={`text-3xl font-bold w-12 text-center transition-transform ${index === 0 ? 'winner-trophy' : ''}`}>{getTrophy(index)}</div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{suggestion.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.description.substring(0, 100)}...</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">{suggestion.upvotes - suggestion.downvotes}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Net Votes</div>
              </div>
            </div>
          ))}
           {topSuggestions.length === 0 && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <p className="text-xl">No suggestions to rank yet.</p>
                  <p>Vote for your favorite ideas to see them here!</p>
              </div>
           )}
        </div>
      </div>
      <style>{`
          @keyframes winner-glow {
              0%, 100% { box-shadow: 0 0 4px rgba(234, 179, 8, 0.5), 0 0 8px rgba(234, 179, 8, 0.5); }
              50% { box-shadow: 0 0 12px rgba(234, 179, 8, 0.8), 0 0 24px rgba(234, 179, 8, 0.8); }
          }
          .winner-card {
              border-color: #eab308; /* yellow-500 */
              animation: winner-glow 2.5s ease-in-out infinite;
          }
          .winner-trophy {
              transform: scale(1.2);
              text-shadow: 0 0 10px #facc15; /* yellow-400 */
          }
      `}</style>
    </>
  );
};

export default Leaderboard;