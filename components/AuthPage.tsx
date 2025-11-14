import React, { useState } from 'react';
import type { AuthView } from '../types';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import AuthLayout from './common/AuthLayout';

const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('LOGIN');

  return (
    <AuthLayout>
      {view === 'LOGIN' ? (
        <LoginPage onSwitchToSignUp={() => setView('SIGNUP')} />
      ) : (
        <SignUpPage onSwitchToLogin={() => setView('LOGIN')} />
      )}
    </AuthLayout>
  );
};

export default AuthPage;
