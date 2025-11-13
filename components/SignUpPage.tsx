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
      if (result.error === 'This email is already registered. Please log in instead.') {
          setError(t('signup.email_exists_error'));
      } else {
          setError(result.error || 'An unknown error occurred during sign-up.');
      }
    }
  };
  
  const formInputStyle = "w-full p-3 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition";

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
              Join thousands of smart retailers streamlining their business.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:py-12 w-full">
        <div className="w-full max-w-md">
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold tracking-tight text-white">
                    Create Your <br />
                     <span className="bg-gradient-to-r from-primary-500 to-primary-300 text-transparent bg-clip-text animate-[background-pan_3s_linear_infinite]" style={{backgroundSize: '200%'}}>
                        Samagra360
                    </span> Account
                </h2>
            </div>
            
            <form onSubmit={handleSignUp} className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-3 -mr-3">
                <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden group transition-all duration-300 hover:border-primary-500">
                            {shopLogo ? (
                                <img src={shopLogo} alt="Shop Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ShopIcon className="w-12 h-12 text-slate-500 transition-colors group-hover:text-primary-500" />
                            )}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
                        <div>
                            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="!bg-slate-800 !text-slate-300 !border-slate-700 hover:!bg-slate-700">
                            {t('signup.upload_logo')}
                            </Button>
                            {shopLogo && (
                                <button type="button" onClick={removeLogo} className="ml-2 text-slate-500 hover:text-red-400 transition p-2">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <fieldset className="space-y-4 p-4 border border-slate-800 rounded-lg">
                        <legend className="text-sm font-semibold px-2 text-slate-400">Shop Details</legend>
                        <input type="text" placeholder={t('signup.shop_name_placeholder')} value={shopName} onChange={(e) => setShopName(e.target.value)} className={formInputStyle} required />
                        <textarea placeholder={t('signup.shop_address_placeholder')} value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className={`${formInputStyle} min-h-[60px]`} rows={2} required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="tel" placeholder={t('signup.phone_number_placeholder')} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={formInputStyle} />
                            <input type="text" placeholder={t('signup.gst_number_placeholder')} value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className={formInputStyle} />
                        </div>
                        <div className="relative">
                            <input type="number" placeholder={t('signup.tax_rate_placeholder')} value={taxRate} onChange={(e) => setTaxRate(e.target.value === '' ? '' : parseFloat(e.target.value))} className={formInputStyle} required min="0" step="0.01" />
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 pointer-events-none">%</span>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-4 p-4 border border-slate-800 rounded-lg">
                        <legend className="text-sm font-semibold px-2 text-slate-400">Your Account</legend>
                        <input type="text" placeholder={t('signup.your_name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} className={formInputStyle} required />
                        <input type="email" placeholder={t('signup.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} className={formInputStyle} required />
                        <input type="password" placeholder={t('signup.password_placeholder')} value={password} onChange={(e) => setPassword(e.target.value)} className={formInputStyle} required />
                    </fieldset>
                    
                    {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-3 rounded-lg">{error}</p>}
                    
                    <Button type="submit" className="w-full !py-3 !text-base !mt-6">{t('signup.signup_button')}</Button>
                </div>

                <div className="text-center text-sm pt-6">
                    <p className="text-slate-400">
                        {t('signup.has_account')}{' '}
                        <button type="button" onClick={onSwitchToLogin} className="font-medium text-primary-400 hover:text-primary-300 focus:outline-none focus:underline">
                            {t('signup.login_link')}
                        </button>
                    </p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;