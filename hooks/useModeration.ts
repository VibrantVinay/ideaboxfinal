import { useState, useEffect, useCallback } from 'react';
import type { Suggestion, ModerationLog, ModerationAction, User } from '../types';
import { generateId } from '../utils';

export const useModeration = () => {
    const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);

    useEffect(() => {
        try {
            const storedLogs = localStorage.getItem('moderationLogs');
            if (storedLogs) {
                setModerationLogs(JSON.parse(storedLogs));
            }
        } catch (error) {
            console.error("Failed to load moderation logs from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('moderationLogs', JSON.stringify(moderationLogs));
        } catch (error) {
            console.error("Failed to save moderation logs to localStorage", error);
        }
    }, [moderationLogs]);

    const logAction = useCallback((action: ModerationAction, suggestion: Suggestion, moderator: User) => {
        const newLog: ModerationLog = {
            id: generateId(),
            suggestionId: suggestion.id,
            suggestionTitle: suggestion.title,
            action,
            moderator: {
                id: moderator.id,
                name: moderator.name,
            },
            timestamp: Date.now(),
        };
        setModerationLogs(prev => [newLog, ...prev]);
    }, []);

    return { moderationLogs, logAction };
};
