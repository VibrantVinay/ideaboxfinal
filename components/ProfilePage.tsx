import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { generateAvatar } from '../utils';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, showToast } = useContext(AppContext)!;
  
  const [name, setName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Update avatar preview as user types name
  useEffect(() => {
    if (name) {
      const newAvatar = generateAvatar(name);
      setAvatarPreview(newAvatar);
    }
  }, [name]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({ type: 'error', message: "Name can't be empty." });
      return;
    }
    
    setIsLoading(true);
    try {
      await updateProfile(name);
      showToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-16">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-xl border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Edit Profile</h1>
        
        <div className="flex flex-col items-center mb-8">
          <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full mb-2 shadow-lg" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Avatar updates as you type your name.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              className="w-full bg-gray-200/50 dark:bg-gray-900/50 border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              disabled
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || name === user.name}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;