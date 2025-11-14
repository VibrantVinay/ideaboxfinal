import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Category } from '../types';
import type { Suggestion, Sentiment, User } from '../types';
import { analyzeSuggestion } from '../services/geminiService';
import { AppContext } from '../App';
import { CATEGORIES, EnvelopeIcon, LockClosedIcon } from '../constants';

interface SuggestionFormProps {
    addSuggestion: (
        suggestion: Omit<Suggestion, 'id' | 'upvotes' | 'downvotes' | 'comments' | 'reactions' | 'createdAt' | 'avatar' | 'status' | 'sentiment' | 'isAnonymous' | 'author' | 'isPrivate' | 'statusUpdatedAt'>, 
        analysis: { category: Category, tags: string[], sentiment: Sentiment },
        isAnonymous: boolean,
        isPrivate: boolean,
        user: User | null
    ) => void;
}

const SubmissionAnimation = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="animate-fly-out">
        <EnvelopeIcon className="w-24 h-24 text-indigo-500" />
      </div>
      <style>{`
        @keyframes fly-out {
          0% { transform: translate(0, 0) scale(1.5) rotate(0deg); opacity: 0; }
          20% { transform: translate(0, 0) scale(1) rotate(-5deg); opacity: 1; }
          100% { transform: translate(40vw, -50vh) scale(0) rotate(45deg); opacity: 0; }
        }
        .animate-fly-out { animation: fly-out 1.5s ease-in-out forwards; }
      `}</style>
    </div>
);

const PrivateSubmissionAnimation = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <div className="relative animate-lock-and-fly">
            <EnvelopeIcon className="w-24 h-24 text-indigo-500" />
            <LockClosedIcon className="w-12 h-12 text-yellow-400 absolute -top-2 -right-2 animate-lock-in" />
        </div>
        <style>{`
            @keyframes lock-and-fly {
                0% { transform: scale(1.5) rotate(0deg); opacity: 0; }
                20% { transform: scale(1) rotate(-5deg); opacity: 1; }
                40% { transform: scale(1.1) rotate(5deg); }
                100% { transform: translate(-40vw, -50vh) scale(0) rotate(-45deg); opacity: 0; }
            }
            .animate-lock-and-fly { animation: lock-and-fly 1.5s ease-in-out forwards; }

            @keyframes lock-in {
                0%, 20% { transform: scale(0) translateY(-20px); }
                40% { transform: scale(1) translateY(0); }
                100% { transform: scale(1) translateY(0); }
            }
            .animate-lock-in { animation: lock-in 1.5s ease-out forwards; }
        `}</style>
    </div>
);


const SuggestionForm: React.FC<SuggestionFormProps> = ({ addSuggestion }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
    const [draftExists, setDraftExists] = useState(false);
    const [showAnimation, setShowAnimation] = useState<'public' | 'private' | null>(null);
    const { showToast, user } = useContext(AppContext)!;
    
    const generateCaptcha = useCallback(() => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptcha({ num1, num2, answer: '' });
    }, []);

    useEffect(() => {
        generateCaptcha();
        if (localStorage.getItem('suggestionDraft')) {
            setDraftExists(true);
        }
    }, [generateCaptcha]);

    const handleSaveDraft = () => {
        const draft = { title, description };
        localStorage.setItem('suggestionDraft', JSON.stringify(draft));
        setDraftExists(true);
        showToast({ type: 'info', message: 'Draft saved!' });
    };

    const handleLoadDraft = () => {
        const savedDraft = localStorage.getItem('suggestionDraft');
        if (savedDraft) {
            const { title, description } = JSON.parse(savedDraft);
            setTitle(title);
            setDescription(description);
            showToast({ type: 'info', message: 'Draft loaded!' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (parseInt(captcha.answer) !== captcha.num1 + captcha.num2) {
            showToast({ type: 'error', message: 'Incorrect CAPTCHA answer.' });
            generateCaptcha();
            return;
        }

        if (!title.trim() || !description.trim()) {
            showToast({ type: 'error', message: 'Title and description cannot be empty.' });
            return;
        }

        setIsSubmitting(true);
        try {
            showToast({ type: 'info', message: 'AI is analyzing your idea...' });
            const analysis = await analyzeSuggestion(title, description);
            
            addSuggestion({ title, description, category: analysis.category, tags: analysis.tags }, analysis, isAnonymous, isPrivate, user);
            
            setShowAnimation(isPrivate ? 'private' : 'public');
            setTimeout(() => setShowAnimation(null), 1500);
            showToast({ type: 'success', message: 'Suggestion submitted successfully!' });
            
            setTitle('');
            setDescription('');
            setIsAnonymous(false);
            setIsPrivate(false);
            
            // Clear draft on successful submission
            if (localStorage.getItem('suggestionDraft')) {
                localStorage.removeItem('suggestionDraft');
                setDraftExists(false);
            }
        } catch (error) {
            showToast({ type: 'error', message: 'Failed to submit suggestion.' });
            console.error(error);
        } finally {
            setIsSubmitting(false);
            generateCaptcha();
        }
    };
    
    return (
        <>
            {showAnimation === 'public' && <SubmissionAnimation />}
            {showAnimation === 'private' && <PrivateSubmissionAnimation />}
            <div className="mb-8 p-6 bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Share an Idea</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Suggestion Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        required
                    />
                    <textarea
                        placeholder="Describe your suggestion in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        rows={5}
                        required
                    />
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="captcha" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {`What is ${captcha.num1} + ${captcha.num2}?`}
                            </label>
                            <input
                                type="number"
                                id="captcha"
                                value={captcha.answer}
                                onChange={(e) => setCaptcha(c => ({ ...c, answer: e.target.value }))}
                                className="w-20 bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                required
                            />
                        </div>
                         <div className="flex flex-col items-start gap-y-3">
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(prev => !prev)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Post Anonymously</span>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(prev => !prev)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Send Privately</span>
                            </label>
                         </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 justify-end pt-2">
                        {draftExists && (
                            <button
                                type="button"
                                onClick={handleLoadDraft}
                                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                Load Draft
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={!title.trim() && !description.trim()}
                            className="w-full sm:w-auto border border-indigo-500 text-indigo-500 dark:text-indigo-400 dark:border-indigo-400 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Save Draft
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SuggestionForm;