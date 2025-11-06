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

  const formInputStyle = "w-full p-3 border border-slate-500/50 rounded-lg bg-slate-800/50 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition duration-300";

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat animate-[background-pan_15s_ease-in-out_infinite] flex items-center justify-center p-4"
      style={{ 
        backgroundImage: "linear-gradient(rgba(2, 6, 23, 0.5), rgba(2, 6, 23, 0.7)), url('https://storage.googleapis.com/aistudio-hosting/images/8e612330-d3b5-410a-9957-3f95b3d681f2.png')",
        backgroundSize: '150% 150%',
      }}
    >
      <div className="relative max-w-md w-full bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-primary-500/20 shadow-primary-500/10">
        <h1 className="text-3xl font-bold text-center text-white mb-6">{t('signup.title')}</h1>
        <form onSubmit={handleSignUp} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
        <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center ring-2 ring-primary-500/30 overflow-hidden">
                {shopLogo ? (
                    <img src={shopLogo} alt="Shop Logo Preview" className="w-full h-full object-cover" />
                ) : (
                    <ShopIcon className="w-12 h-12 text-slate-400" />
                )}
            </div>
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
            <div>
                 <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                   {t('signup.upload_logo')}
                </Button>
                {shopLogo && (
                    <button type="button" onClick={removeLogo} className="ml-2 text-slate-300 hover:text-red-400 transition p-2">
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
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">%</span>
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
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full mt-2 !py-3">{t('signup.signup_button')}</Button>
        </form>
        <p className="text-center text-sm text-slate-300 mt-6">
          {t('signup.has_account')}{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-primary-400 hover:underline">
            {t('signup.login_link')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;