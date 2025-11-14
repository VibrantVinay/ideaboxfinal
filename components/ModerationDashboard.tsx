import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import type { Suggestion, Status } from '../types';
import { Status as StatusEnum } from '../types';
import { UpvoteIcon, DownvoteIcon, CommentIcon, FlagIcon, LockClosedIcon } from '../constants';
import { categoryColors, statusColors, sentimentColors } from '../constants';

const SuggestionAdminCard: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
    const { isAdmin, showToast, vote, addReaction, updateSuggestionStatus } = useContext(AppContext)!;

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSuggestionStatus(suggestion.id, e.target.value as Status);
        showToast({ type: 'info', message: `Status updated for "${suggestion.title}"` });
    };
    
    const stopPropagation = (e: React.MouseEvent | React.ChangeEvent) => e.stopPropagation();

    return (
        <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-5 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start space-x-4">
                <img src={suggestion.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div className="text-left pr-2 flex items-center gap-2">
                            {suggestion.isPrivate && <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" title="Private Suggestion" />}
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{suggestion.title}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {suggestion.isAnonymous ? `Anonymous` : `By ${suggestion.author?.name || 'User'}`} &bull; {new Date(suggestion.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{suggestion.description}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-light-border dark:border-dark-border" onClick={stopPropagation}>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Change Status</label>
                <select value={suggestion.status} onChange={handleStatusChange} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                    {Object.values(StatusEnum).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
    );
};

const ModerationDashboard: React.FC = () => {
    const { suggestions } = useContext(AppContext)!;
    
    const categorizedSuggestions = useMemo(() => {
        const pending = suggestions.filter(s => s.status === StatusEnum.PENDING);
        const reviewed = suggestions.filter(s => s.status === StatusEnum.REVIEWED);
        const implemented = suggestions.filter(s => s.status === StatusEnum.IMPLEMENTED);
        const rejected = suggestions.filter(s => s.status === StatusEnum.REJECTED);
        return { pending, reviewed, implemented, rejected };
    }, [suggestions]);

    const renderSection = (title: string, data: Suggestion[], colorClass: string) => (
        <section>
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3`}>
                <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                {title} ({data.length})
            </h2>
            {data.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.map(s => <SuggestionAdminCard key={s.id} suggestion={s} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-light-card/50 dark:bg-dark-card/50 rounded-xl">
                    <p>No suggestions in this category.</p>
                </div>
            )}
        </section>
    );

    return (
        <div className="space-y-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moderation Dashboard</h1>
            
            {renderSection('Pending', categorizedSuggestions.pending, 'bg-yellow-500')}
            {renderSection('On Review', categorizedSuggestions.reviewed, 'bg-indigo-500')}
            {renderSection('Implemented', categorizedSuggestions.implemented, 'bg-green-500')}
            {renderSection('Rejected', categorizedSuggestions.rejected, 'bg-red-500')}
        </div>
    );
};

export default ModerationDashboard;