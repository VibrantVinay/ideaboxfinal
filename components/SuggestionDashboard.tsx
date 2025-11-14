import React, { useState, useMemo, useContext } from 'react';
import type { Suggestion, Category, SortOption, Status, ReactionType, View as ViewType } from '../types';
import { CATEGORIES, SORT_OPTIONS, categoryColors, statusColors, sentimentColors } from '../constants';
import { exportToJson, exportToCsv } from '../utils';
import { UpvoteIcon, DownvoteIcon, CommentIcon, FlagIcon, LockClosedIcon, ArrowRightIcon } from '../constants';
import SuggestionForm from './SuggestionForm';
import Modal from './common/Modal';
import { AppContext } from '../App';
import { Status as StatusEnum } from '../types';

const ReportModal: React.FC<{ suggestion: Suggestion, onClose: () => void, onSubmit: (reason: string) => void }> = ({ suggestion, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onSubmit(reason);
        }
    };
    
    return (
        <Modal title={`Report "${suggestion.title}"`} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Please provide a reason for reporting this suggestion. Your feedback helps our moderators maintain a constructive environment.
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-gray-200/50 dark:bg-gray-900/50 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition border-light-border dark:border-dark-border focus:ring-purple-500"
                    placeholder="e.g., Inappropriate content, spam, duplicate idea..."
                    rows={4}
                    autoFocus
                    required
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400" disabled={!reason.trim()}>
                        Submit Report
                    </button>
                </div>
            </form>
        </Modal>
    );
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  onSelect: (suggestion: Suggestion) => void;
  onReport: (suggestion: Suggestion) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onSelect, onReport }) => {
    const { isAdmin, showToast, vote, addReaction, updateSuggestionStatus } = useContext(AppContext)!;

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSuggestionStatus(suggestion.id, e.target.value as Status);
        showToast({ type: 'info', message: `Status updated for #${suggestion.id}` });
    };

    const stopPropagation = (e: React.MouseEvent | React.ChangeEvent) => e.stopPropagation();

    return (
        <div 
            className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:border-purple-500/50 hover:-translate-y-1 group cursor-pointer"
            onClick={() => onSelect(suggestion)}
        >
            <div className="flex items-start space-x-4">
                <img src={suggestion.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div className="text-left pr-2 flex items-center gap-2">
                             {isAdmin && suggestion.isPrivate && <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" title="Private Suggestion" />}
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{suggestion.title}</h3>
                        </div>
                        <div className={`${statusColors[suggestion.status]} text-xs font-semibold px-2 py-1 rounded-full h-fit flex-shrink-0`}>{suggestion.status}</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {suggestion.isAnonymous
                            ? `Anonymous Submission`
                            : <>By <span className="font-semibold text-gray-700 dark:text-gray-300">{suggestion.author?.name || 'User'}</span></>
                        }
                        &nbsp;&bull;&nbsp; {new Date(suggestion.createdAt).toLocaleDateString()}
                    </p>


                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {suggestion.description.substring(0, 200)}{suggestion.description.length > 200 && '...'}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 text-xs">
                        <span className={`${categoryColors[suggestion.category]} px-2 py-1 rounded-full`}>{suggestion.category}</span>
                        {suggestion.tags.map(tag => <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">#{tag}</span>)}
                        <span className={`${sentimentColors[suggestion.sentiment]} px-2 py-1 rounded-full font-semibold`}>{suggestion.sentiment}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button onClick={(e) => { stopPropagation(e); vote(suggestion.id, 'up'); }} className="p-1.5 rounded-full hover:bg-green-500/20 transition-all duration-200 transform hover:scale-110"><UpvoteIcon className="w-5 h-5 text-green-500" /></button>
                        <span className="font-bold text-sm min-w-[20px] text-center text-gray-700 dark:text-gray-300">{suggestion.upvotes - suggestion.downvotes}</span>
                        <button onClick={(e) => { stopPropagation(e); vote(suggestion.id, 'down'); }} className="p-1.5 rounded-full hover:bg-red-500/20 transition-all duration-200 transform hover:scale-110"><DownvoteIcon className="w-5 h-5 text-red-500" /></button>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <CommentIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{suggestion.comments.length}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                        {suggestion.reactions.map(({ type, count }) => (
                            <button key={type} onClick={(e) => { stopPropagation(e); addReaction(suggestion.id, type); }} className="px-2 py-1 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 flex items-center space-x-1">
                                <span>{type}</span>
                                <span className={`font-mono text-xs ${count > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{count}</span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={(e) => { stopPropagation(e); onReport(suggestion); }}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors duration-200"
                        aria-label="Report suggestion"
                        title="Report suggestion"
                    >
                        <FlagIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {isAdmin && (
                <div className="mt-4 pt-4 border-t border-dashed border-light-border dark:border-dark-border" onClick={stopPropagation}>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Admin: Change Status</label>
                    <select value={suggestion.status} onChange={handleStatusChange} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                        {Object.values(StatusEnum).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
};

interface DashboardProps {
  currentView: ViewType;
}

const SuggestionDashboard: React.FC<DashboardProps> = ({ currentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [reportingSuggestion, setReportingSuggestion] = useState<Suggestion | null>(null);
  const [showMySuggestions, setShowMySuggestions] = useState(false);
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);

  const { 
    suggestions,
    addSuggestion,
    reportSuggestion,
    addComment,
    showToast,
    user,
    isAdmin,
    toggleAdmin
  } = useContext(AppContext)!;
  
  const filteredSuggestions = useMemo(() => {
    let suggestionsToFilter = suggestions;
    
    if (isAdmin) {
      if (showPrivateOnly) {
        suggestionsToFilter = suggestions.filter(s => s.isPrivate);
      }
    } else {
      suggestionsToFilter = suggestions.filter(s => !s.isPrivate);
    }

    return suggestionsToFilter
      .filter(s => !showMySuggestions || (user && !s.isAnonymous && s.author?.id === user.id))
      .filter(s => activeCategory === 'All' || s.category === activeCategory)
      .filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [suggestions, searchTerm, activeCategory, showMySuggestions, user, isAdmin, showPrivateOnly]);

  const sortedSuggestions = useMemo(() => {
    const sorted = [...filteredSuggestions];
    switch (sortOption) {
      case 'Most Popular': return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'Random': return sorted.sort(() => Math.random() - 0.5);
      case 'Newest': default: return sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [filteredSuggestions, sortOption]);

  const featuredSuggestion = useMemo(() => {
    const publicSuggestions = suggestions.filter(s => !s.isPrivate);
    if (publicSuggestions.length === 0) return null;
    return [...publicSuggestions].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))[0];
  }, [suggestions]);

  const recentlyImplemented = useMemo(() => {
    return suggestions
      .filter(s => s.status === StatusEnum.IMPLEMENTED && !s.isPrivate)
      .sort((a, b) => (b.statusUpdatedAt || b.createdAt) - (a.statusUpdatedAt || a.createdAt))
      .slice(0, 1);
  }, [suggestions]);

  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim() && selectedSuggestion) {
      addComment(selectedSuggestion.id, commentText);
      setCommentText('');
      // Optimistically update the selected suggestion to show the new comment
      setSelectedSuggestion(prev => prev ? { ...prev, comments: [...prev.comments, { id: 'temp', text: commentText, timestamp: Date.now() }] } : null);
    }
  };

  const handleReportClick = (suggestion: Suggestion) => {
    setReportingSuggestion(suggestion);
  };
  
  const handleConfirmReport = (reason: string) => {
    if (!reportingSuggestion) return;
    reportSuggestion(reportingSuggestion.id, reason);
    showToast({ type: 'info', message: 'Suggestion reported. Our moderators will review it shortly.' });
    setReportingSuggestion(null);
  };

  const renderDashboard = () => (
    <>
      <style>{`
        @keyframes professional-arrow-glow {
          0%, 100% {
            transform: translateX(0);
            opacity: 0.7;
          }
          50% {
            transform: translateX(4px);
            opacity: 1;
          }
        }
        .animate-professional-arrow {
          animation: professional-arrow-glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="flex justify-end mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
              <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={toggleAdmin}
                  className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Admin Mode</span>
          </label>
      </div>
      <SuggestionForm addSuggestion={addSuggestion} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Recently Implemented</h2>
          {recentlyImplemented.length > 0 ? (
            <div className="space-y-4">
              {recentlyImplemented.map(s => (
                <div 
                  key={s.id} 
                  className="bg-light-card/50 dark:bg-dark-card/50 p-4 rounded-lg border border-light-border dark:border-dark-border group cursor-pointer transition-all hover:border-purple-500/50 hover:shadow-md"
                  onClick={() => setSelectedSuggestion(s)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-green-600 dark:text-green-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{s.title}</h3>
                    <ArrowRightIcon className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors animate-professional-arrow" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Implemented on {new Date(s.statusUpdatedAt || s.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500">No suggestions have been implemented yet.</p>}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Featured Suggestion</h2>
          {featuredSuggestion ? (
             <SuggestionCard 
                suggestion={featuredSuggestion} 
                onSelect={setSelectedSuggestion}
                onReport={handleReportClick}
             />
          ) : <p className="text-gray-500">No suggestions available to feature.</p>}
        </div>
      </div>
    </>
  );

  const renderSuggestionsPage = () => (
    <>
      <div className="my-8 p-4 bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input 
                type="text" 
                placeholder="Search suggestions..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="col-span-1 md:col-span-1 bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <div className="col-span-1 md:col-span-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setActiveCategory('All')} className={`px-3 py-1 text-sm rounded-full ${activeCategory === 'All' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>All</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-sm rounded-full ${activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{cat}</button>
                    ))}
                </div>
                 <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-end">
                    {user && (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={showMySuggestions} onChange={() => setShowMySuggestions(prev => !prev)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">My Suggestions</span>
                        </label>
                    )}
                    {isAdmin && (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={showPrivateOnly} onChange={() => setShowPrivateOnly(prev => !prev)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Private Only</span>
                        </label>
                    )}
                    <select value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} className="bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                        {SORT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => exportToJson(suggestions)} className="mr-2 px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-md hover:bg-blue-500/40">Export JSON</button>
          <button onClick={() => exportToCsv(suggestions)} className="px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-md hover:bg-green-500/40">Export CSV</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {sortedSuggestions.map(s => (
          <SuggestionCard 
            key={s.id} 
            suggestion={s} 
            onSelect={setSelectedSuggestion}
            onReport={handleReportClick}
          />
        ))}
      </div>
      {sortedSuggestions.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-xl">No suggestions found.</p>
          <p>Try adjusting your filters.</p>
        </div>
      )}
    </>
  );

  return (
    <div>
        {currentView === 'Dashboard' ? renderDashboard() : renderSuggestionsPage()}

        {selectedSuggestion && (
            <Modal title={selectedSuggestion.title} onClose={() => setSelectedSuggestion(null)}>
                <div className="flex items-center space-x-3 mb-4">
                    <img src={selectedSuggestion.avatar} alt="Author Avatar" className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {selectedSuggestion.isAnonymous ? 'Anonymous' : selectedSuggestion.author?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(selectedSuggestion.createdAt).toLocaleString()} &bull; ID: {selectedSuggestion.id}
                        </p>
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">{selectedSuggestion.description}</p>
                <div className="flex flex-wrap gap-2 text-xs mb-6">
                    <span className={`${categoryColors[selectedSuggestion.category]} px-2 py-1 rounded-full`}>{selectedSuggestion.category}</span>
                    {selectedSuggestion.tags.map(tag => <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">#{tag}</span>)}
                    <span className={`${statusColors[selectedSuggestion.status]} px-2 py-1 rounded-full`}>{selectedSuggestion.status}</span>
                    <span className={`${sentimentColors[selectedSuggestion.sentiment]} px-2 py-1 rounded-full font-semibold`}>{selectedSuggestion.sentiment}</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Comments ({selectedSuggestion.comments.length})</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                    {selectedSuggestion.comments.length > 0 ? selectedSuggestion.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm">{comment.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{new Date(comment.timestamp).toLocaleString()}</p>
                        </div>
                    )) : <p className="text-sm text-gray-500">No comments yet.</p>}
                </div>
                <div className="mt-4">
                    <textarea 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment..." 
                        className="w-full bg-gray-100 dark:bg-gray-900 border border-light-border dark:border-dark-border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                    />
                    <button onClick={handleAddComment} className="mt-2 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={!commentText.trim()}>Post Comment</button>
                </div>
                <div className="mt-6 text-center border-t border-light-border dark:border-dark-border pt-4">
                    <button 
                        onClick={() => handleReportClick(selectedSuggestion)}
                        className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                    >
                        <FlagIcon className="w-4 h-4" /> Report this suggestion for review
                    </button>
                </div>
            </Modal>
        )}
        {reportingSuggestion && (
          <ReportModal 
            suggestion={reportingSuggestion} 
            onClose={() => setReportingSuggestion(null)} 
            onSubmit={handleConfirmReport} 
          />
        )}
    </div>
  );
};

export default SuggestionDashboard;