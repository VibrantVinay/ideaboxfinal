import { useState, useEffect, useCallback } from 'react';
import type { Suggestion, Status, ReactionType, Comment, User, Category, Sentiment } from '../types';
import { generateId, generateAvatar, generateAnonymousAvatar } from '../utils';
import { Status as StatusEnum } from '../types';
import { REACTIONS } from '../constants';


export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    try {
      const storedSuggestions = localStorage.getItem('suggestions');
      if (storedSuggestions) {
        setSuggestions(JSON.parse(storedSuggestions));
      }
    } catch (error) {
      console.error("Failed to load suggestions from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('suggestions', JSON.stringify(suggestions));
    } catch (error) {
      console.error("Failed to save suggestions to localStorage", error);
    }
  }, [suggestions]);

  const addSuggestion = useCallback((
    suggestion: Omit<Suggestion, 'id' | 'upvotes' | 'downvotes' | 'comments' | 'reactions' | 'createdAt' | 'avatar' | 'status' | 'sentiment' | 'isAnonymous' | 'author' | 'isPrivate' | 'statusUpdatedAt'>,
    analysis: { category: Category, tags: string[], sentiment: Sentiment },
    isAnonymous: boolean,
    isPrivate: boolean,
    user: User | null
  ) => {
    const id = generateId();
    const now = Date.now();
    const newSuggestion: Suggestion = {
      ...suggestion,
      id,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      reactions: REACTIONS.map(type => ({ type, count: 0 })),
      createdAt: now,
      statusUpdatedAt: now,
      avatar: isAnonymous || !user ? generateAnonymousAvatar() : generateAvatar(user.name),
      status: StatusEnum.PENDING,
      category: analysis.category,
      tags: analysis.tags,
      sentiment: analysis.sentiment,
      isAnonymous,
      isPrivate,
      author: isAnonymous || !user ? undefined : { id: user.id, name: user.name },
      isReported: false,
    };
    setSuggestions(prev => [newSuggestion, ...prev]);
  }, []);

  const updateSuggestionStatus = useCallback((id: string, status: Status) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status, statusUpdatedAt: Date.now() } : s));
  }, []);

  const vote = useCallback((id: string, type: 'up' | 'down') => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        return type === 'up' ? { ...s, upvotes: s.upvotes + 1 } : { ...s, downvotes: s.downvotes + 1 };
      }
      return s;
    }));
  }, []);

  const addReaction = useCallback((id: string, type: ReactionType) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        const reactions = s.reactions.map(r => r.type === type ? { ...r, count: r.count + 1 } : r);
        return { ...s, reactions };
      }
      return s;
    }));
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    const newComment: Comment = {
      id: generateId(),
      text,
      timestamp: Date.now(),
    };
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, comments: [...s.comments, newComment] } : s));
  }, []);
  
  const reportSuggestion = useCallback((id: string, reason: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, isReported: true, reportReason: reason } : s
    ));
  }, []);

  const removeSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const dismissReport = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, isReported: false, reportReason: undefined } : s
    ));
  }, []);

  return { suggestions, addSuggestion, updateSuggestionStatus, vote, addReaction, addComment, reportSuggestion, removeSuggestion, dismissReport };
};