import React, { useState, useRef } from 'react';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { ShopIcon, TrashIcon } from './icons/Icons';

const SignUpPage: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [taxRate, setTaxRate] = useState<number | ''>(5);
  const [shopLogo, setShopLogo] = useState<string | undefined>();
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setShopLogo(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !shopName || !shopAddress || taxRate === '') {
      setError('Please fill out all required fields.');
      return;
    }
    const result = signup({ email, password, name, shopName, shopAddress, phoneNumber, gstNumber, taxRate, shopLogo });
    if (!result.success) {
      // Use the specific error message from the hook
      if (result.error === 'This email is already registered. Please log in instead.') {
          setError(t('signup.email_exists_error'));
      } else {
          setError(result.error || 'An unknown error occurred during sign-up.');
      }
    }
  };

  const formInputStyle = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">{t('signup.title')}</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-600 overflow-hidden">
                {shopLogo ? (
                    <img src={shopLogo} alt="Shop Logo Preview" className="w-full h-full object-cover" />
                ) : (
                    <ShopIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                )}
            </div>
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
            <div>
                 <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                   {t('signup.upload_logo')}
                </Button>
                {shopLogo && (
                    <button type="button" onClick={removeLogo} className="ml-2 text-slate-500 hover:text-red-500 transition p-2">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
          <input
            type="text"
            placeholder={t('signup.shop_name_placeholder')}
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className={formInputStyle}
            required
          />
          <textarea
            placeholder={t('signup.shop_address_placeholder')}
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            className={formInputStyle}
            rows={2}
            required
          />
           <div className="grid grid-cols-2 gap-4">
             <input
              type="tel"
              placeholder={t('signup.phone_number_placeholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={formInputStyle}
            />
            <input
              type="text"
              placeholder={t('signup.gst_number_placeholder')}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className={formInputStyle}
            />
           </div>
           <div className="relative">
              <input
                type="number"
                placeholder={t('signup.tax_rate_placeholder')}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={formInputStyle}
                required
                min="0"
                step="0.01"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400 pointer-events-none">%</span>
            </div>
          <input
            type="text"
            placeholder={t('signup.your_name_placeholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputStyle}
            required
          />
          <input
            type="email"
            placeholder={t('signup.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={formInputStyle}
            required
          />
          <input
            type="password"
            placeholder={t('signup.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={formInputStyle}
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full mt-2 !py-3">{t('signup.signup_button')}</Button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          {t('signup.has_account')}{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-primary-600 hover:underline">
            {t('signup.login_link')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;