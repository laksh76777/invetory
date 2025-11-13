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
      const errorKey = `login.${result.error}`;
      setError(t(errorKey));
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-slate-950">
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('https://storage.googleapis.com/aistudio-hosting/images/b6f51c77-0331-4171-88f3-80b3d5b94f6e.png')"}}
        ></div>
        <div className="relative z-10 text-center">
            <h1 className="text-6xl font-bold tracking-tight">
                 <span className="bg-gradient-to-r from-white to-primary-200 text-transparent bg-clip-text">Samagra360</span>
            </h1>
            <p className="mt-4 text-lg text-primary-200 max-w-md">
                Your All-in-One Solution for Smart Retail & Inventory Management.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 w-full">
        <div className="w-full max-w-md space-y-8">
            <div>
                 <h2 className="text-4xl font-bold tracking-tight text-white text-center">
                    Welcome to <br />
                    <span className="bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text animate-[background-pan_3s_linear_infinite]" style={{backgroundSize: '200%'}}>
                        Samagra360
                    </span>
                </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">{t('login.email_placeholder')}</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    required
                />
              </div>
              <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-slate-400 mb-1">{t('login.password_placeholder')}</label>
                <input
                    id="password-login"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="custom-checkbox h-4 w-4 appearance-none rounded border-2 border-slate-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 bg-slate-900 transition duration-200 checked:bg-primary-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                        {t('login.remember_me')}
                    </label>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-3 rounded-lg">{error}</p>}
              
              <Button type="submit" className="w-full !py-3 !text-base">{t('login.login_button')}</Button>

              <div className="text-center text-sm">
                <p className="text-slate-400">
                    {t('login.no_account')}{' '}
                    <button type="button" onClick={onSwitchToSignUp} className="font-medium text-primary-400 hover:text-primary-300 focus:outline-none focus:underline">
                        {t('login.signup_link')}
                    </button>
                </p>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
