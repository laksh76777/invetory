import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { LogoutIcon, ShopIcon } from './icons/Icons';
import type { ThemeMode, User } from '../types';

interface SettingsProps {
  showRevenueCard: boolean;
  onToggleRevenueCard: () => void;
  clearSalesData: () => void;
  showAiSuggestionBox: boolean;
  onToggleAiSuggestionBox: () => void;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-200 dark:border-slate-800">{title}</h2>
        <div className="p-6">{children}</div>
    </div>
);

const Settings: React.FC<SettingsProps> = ({ showRevenueCard, onToggleRevenueCard, clearSalesData, showAiSuggestionBox, onToggleAiSuggestionBox }) => {
  const { currentUser, updateUser, logout } = useAuth();
  const { t } = useTranslation();
  const { theme, updateTheme, availableColors } = useTheme();
  
  const [formData, setFormData] = useState({
    shopName: '',
    userName: '',
    shopAddress: '',
    phoneNumber: '',
    gstNumber: '',
    taxRate: 0,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        shopName: currentUser.shopName,
        userName: currentUser.name,
        shopAddress: currentUser.shopAddress,
        phoneNumber: currentUser.phoneNumber || '',
        gstNumber: currentUser.gstNumber || '',
        taxRate: currentUser.taxRate,
      });
      setLogoPreview(null);
      setLogoRemoved(false);
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: name === 'taxRate' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setLogoRemoved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoRemoved(true);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updatePayload: Partial<User> = {
      name: formData.userName,
      shopName: formData.shopName,
      shopAddress: formData.shopAddress,
      phoneNumber: formData.phoneNumber,
      gstNumber: formData.gstNumber,
      taxRate: formData.taxRate,
    };
    if (logoPreview) {
      updatePayload.shopLogo = logoPreview;
    } else if (logoRemoved) {
      updatePayload.shopLogo = undefined;
    }
    updateUser(updatePayload);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };
  
  if (!currentUser) {
    return null; // Or a loading spinner
  }

  const currentLogo = logoPreview || (!logoRemoved && currentUser.shopLogo);
  const formInputStyle = "mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50";

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('settings.title')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your shop, profile, and application preferences.</p>

      <div className="max-w-4xl mx-auto space-y-8">
        <form onSubmit={handleSaveChanges} className="space-y-8">
          <SettingsCard title={t('settings.shop_profile_title')}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1 flex flex-col items-center">
                  {currentLogo ? (
                      <img src={currentLogo} alt="Shop Logo" className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-primary-200 dark:ring-primary-800"/>
                  ): (
                      <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4 ring-4 ring-slate-200 dark:ring-slate-600">
                          <ShopIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                      </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
                  <div className="flex items-center gap-2">
                      <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        {t('settings.change_logo')}
                      </Button>
                      {currentLogo && (
                          <Button type="button" variant="secondary" className="!bg-rose-50 dark:!bg-rose-900/30 !text-rose-600 dark:!text-rose-300 !border-rose-200 dark:!border-rose-700/50 hover:!bg-rose-100 dark:hover:!bg-rose-900/50" onClick={handleRemoveLogo}>
                            {t('settings.remove_logo')}
                          </Button>
                      )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                      <label htmlFor="shopName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.shop_name')}</label>
                      <input type="text" name="shopName" id="shopName" value={formData.shopName} onChange={handleInputChange} className={formInputStyle} />
                  </div>
                  <div>
                      <label htmlFor="shopAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.shop_address')}</label>
                      <textarea name="shopAddress" id="shopAddress" value={formData.shopAddress} onChange={handleInputChange} rows={3} className={formInputStyle}></textarea>
                  </div>
                </div>
              </div>
          </SettingsCard>
          
          <SettingsCard title={t('settings.profile_title')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.your_name')}</label>
                    <input type="text" name="userName" id="userName" value={formData.userName} onChange={handleInputChange} className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.email')}</label>
                    <input type="email" name="email" id="email" value={currentUser.email} disabled className="mt-1 w-full p-2 border rounded-lg bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.phone_number')}</label>
                    <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.gst_number')}</label>
                    <input type="text" name="gstNumber" id="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className={formInputStyle} />
                </div>
                 <div>
                      <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.tax_rate')}</label>
                      <div className="relative mt-1">
                          <input type="number" name="taxRate" id="taxRate" value={formData.taxRate} onChange={handleInputChange} className={formInputStyle} min="0" step="0.01" />
                          <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400 pointer-events-none">%</span>
                      </div>
                  </div>
              </div>
          </SettingsCard>
          
          <div className="flex justify-end items-center gap-4 pt-4">
              {isSaved && <p className="text-emerald-600 dark:text-emerald-400 text-sm animate-pulse">{t('settings.saved_message')}</p>}
              <Button type="submit">{t('common.save_changes')}</Button>
          </div>
        </form>
        
        <SettingsCard title={t('settings.appearance_title')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('settings.primary_color')}</label>
                    <div className="flex items-center space-x-4">
                        {Object.keys(availableColors).map(colorName => (
                            <button
                                key={colorName}
                                type="button"
                                onClick={() => updateTheme({ color: colorName })}
                                className={`w-9 h-9 rounded-full capitalize ring-2 ring-offset-2 dark:ring-offset-slate-900 transition-transform transform hover:scale-110 ${theme.color === colorName ? 'ring-primary-500' : 'ring-transparent'}`}
                                style={{ backgroundColor: `rgb(${availableColors[colorName]['500']})` }}
                                aria-label={`Set theme color to ${colorName}`}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('settings.color_mode')}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1 space-x-1 border border-slate-200 dark:border-slate-700">
                        {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => updateTheme({ mode })}
                                className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-md capitalize transition-all duration-200 ${theme.mode === mode ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                            >
                                {t(`settings.mode_${mode}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('settings.dashboard_widgets')}</label>
              <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                      <span className="text-slate-700 dark:text-slate-300">{t('settings.show_revenue_card')}</span>
                      <label htmlFor="toggle-revenue" className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" id="toggle-revenue" className="sr-only peer" checked={showRevenueCard} onChange={onToggleRevenueCard} />
                          <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary-600"></div>
                      </label>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                      <span className="text-slate-700 dark:text-slate-300">{t('settings.show_ai_suggestion_box')}</span>
                      <label htmlFor="toggle-ai-suggestion" className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" id="toggle-ai-suggestion" className="sr-only peer" checked={showAiSuggestionBox} onChange={onToggleAiSuggestionBox} />
                          <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary-600"></div>
                      </label>
                  </div>
              </div>
            </div>
        </SettingsCard>

        <SettingsCard title={t('settings.data_management_title')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="max-w-xl">
                    <p className="font-semibold text-rose-700 dark:text-rose-400">{t('settings.clear_sales_data_button')}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('settings.clear_sales_data_description')}</p>
                </div>
                <Button variant="secondary" onClick={() => setIsConfirmClearOpen(true)} className="!bg-rose-500 !text-white hover:!bg-rose-600 focus-visible:!ring-rose-500 flex-shrink-0">
                    {t('settings.clear_sales_data_button')}
                </Button>
            </div>
        </SettingsCard>

        <SettingsCard title={t('settings.account_actions')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-slate-600 dark:text-slate-400">{t('settings.logout_description')}</p>
              <Button variant="secondary" onClick={logout}>
                <LogoutIcon className="mr-2" />
                {t('settings.logout_button')}
              </Button>
            </div>
        </SettingsCard>
      </div>
      
      {isConfirmClearOpen && (
          <Modal
              isOpen={isConfirmClearOpen}
              onClose={() => setIsConfirmClearOpen(false)}
              title={t('settings.clear_sales_modal.title')}
          >
              <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-300 mb-6">{t('settings.clear_sales_modal.body')}</p>
                      <div className="flex justify-center gap-4">
                      <Button variant="secondary" onClick={() => setIsConfirmClearOpen(false)}>{t('common.cancel')}</Button>
                      <Button onClick={() => { clearSalesData(); setIsConfirmClearOpen(false); }} className="!bg-red-600 hover:!bg-red-700 focus-visible:!ring-red-500">
                          {t('settings.clear_sales_modal.confirm_button')}
                      </Button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default Settings;