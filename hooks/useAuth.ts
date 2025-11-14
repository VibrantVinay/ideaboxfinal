import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { generateId, generateAvatar } from '../utils';

// MOCK USER DATABASE
const MOCK_USERS: { [email: string]: Omit<User, 'id'|'avatar'> & {password: string} } = {
  'test@example.com': { name: 'Test User', email: 'test@example.com', password: 'password123' }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
    } finally {
        // Simulate network delay for checking session
        setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API call
        const foundUser = Object.values(MOCK_USERS).find(u => u.email === email);
        if (foundUser && foundUser.password === password) {
          const authenticatedUser: User = {
            id: generateId(), // generate a session id
            name: foundUser.name,
            email: foundUser.email,
            avatar: generateAvatar(foundUser.name),
          };
          localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
          setUser(authenticatedUser);
          resolve(authenticatedUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<void> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate API call
            if (MOCK_USERS[email]) {
                return reject(new Error('User with this email already exists.'));
            }
            MOCK_USERS[email] = { name, email, password };
            resolve();
        }, 1000);
     });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authUser');
    setUser(null);
  }, []);
  
  const updateProfile = useCallback(async (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API call
        if (!user) {
          return reject(new Error('No user is logged in.'));
        }
        
        try {
          const newAvatar = generateAvatar(name);
          const updatedUser: User = { ...user, name, avatar: newAvatar };
          
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
          resolve();
        } catch (error) {
          reject(new Error('Failed to update profile.'));
        }
      }, 1000);
    });
  }, [user]);

  return { user, login, signup, logout, isLoading, updateProfile };
};