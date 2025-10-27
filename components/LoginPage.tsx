import React, { useState } from 'react';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const LoginPage: React.FC<{ onSwitchToSignUp: () => void }> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password, rememberMe);
    if (!result.success && result.error) {
      // Map error codes to translation keys
      const errorKey = `login.${result.error}`;
      setError(t(errorKey));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://storage.googleapis.com/aistudio-hosting/images/8e612330-d3b5-410a-9957-3f95b3d681f2.png')" }}
    >
      <div className="max-w-md w-full bg-black/20 backdrop-blur-lg rounded-xl shadow-2xl p-8 space-y-6 border border-white/20">
        <div className="text-center">
            <h1 className="text-5xl font-bold text-white">Samagra360</h1>
            <p className="text-slate-300 mt-2">{t('login.title')}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder={t('login.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
            required
          />
          <input
            type="password"
            placeholder={t('login.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
            required
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 text-primary-500 focus:ring-primary-400 bg-transparent"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                    {t('login.remember_me')}
                </label>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full !py-3">{t('login.login_button')}</Button>
        </form>
        <p className="text-center text-sm text-slate-300">
          {t('login.no_account')}{' '}
          <button onClick={onSwitchToSignUp} className="font-medium text-primary-400 hover:underline">
            {t('login.signup_link')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
