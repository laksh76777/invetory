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
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat animate-[background-pan_15s_ease-in-out_infinite]"
      style={{
        backgroundImage: "linear-gradient(rgba(2, 6, 23, 0.5), rgba(2, 6, 23, 0.7)), url('https://storage.googleapis.com/aistudio-hosting/images/8e612330-d3b5-410a-9957-3f95b3d681f2.png')",
        backgroundSize: '150% 150%',
      }}
    >
      <div className="relative max-w-md w-full bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-primary-500/20 shadow-primary-500/10">
        <div className="text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-300">Samagra360</h1>
            <p className="text-slate-300 mt-2">{t('login.title')}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder={t('login.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-slate-500/50 rounded-lg bg-slate-800/50 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition duration-300"
            required
          />
          <input
            type="password"
            placeholder={t('login.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-slate-500/50 rounded-lg bg-slate-800/50 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition duration-300"
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
                    className="custom-checkbox h-4 w-4 appearance-none rounded border-2 border-primary-500/50 text-primary-500 focus:ring-primary-400 focus:ring-offset-0 bg-transparent transition duration-200 checked:bg-primary-500"
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