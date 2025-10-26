import React, { useState } from 'react';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const LoginPage: React.FC<{ onSwitchToSignUp: () => void }> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error || 'An unknown error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6 border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white">{t('login.title')}</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder={t('login.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition"
            required
          />
          <input
            type="password"
            placeholder={t('login.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition"
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full !py-3">{t('login.login_button')}</Button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          {t('login.no_account')}{' '}
          <button onClick={onSwitchToSignUp} className="font-medium text-primary-600 hover:underline">
            {t('login.signup_link')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;