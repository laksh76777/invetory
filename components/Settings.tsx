import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';
import { LogoutIcon, ShopIcon, TrashIcon } from './icons/Icons';
import type { ThemeMode, User } from '../types';
import Modal from './ui/Modal';

interface SettingsProps {
  clearSalesData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ clearSalesData }) => {
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
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

  const handleClearSales = () => {
      clearSalesData();
      setIsConfirmModalOpen(false);
  }
  
  if (!currentUser) {
    return null; // Or a loading spinner
  }

  const currentLogo = logoPreview || (!logoRemoved && currentUser.shopLogo);
  const formInputStyle = "mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition";

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">{t('settings.title')}</h1>

      <form onSubmit={handleSaveChanges} className="max-w-4xl mx-auto space-y-8">
        {/* Shop Profile Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">{t('settings.shop_profile_title')}</h2>
            
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
                        <Button type="button" variant="secondary" className="!bg-slate-200 dark:!bg-slate-600" onClick={handleRemoveLogo}>
                           {t('settings.remove_logo')}
                        </Button>
                    )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                    <label htmlFor="shopName" className="block text-sm font-medium">{t('settings.shop_name')}</label>
                    <input type="text" name="shopName" id="shopName" value={formData.shopName} onChange={handleInputChange} className={formInputStyle} />
                </div>
                <div>
                    <label htmlFor="shopAddress" className="block text-sm font-medium">{t('settings.shop_address')}</label>
                    <textarea name="shopAddress" id="shopAddress" value={formData.shopAddress} onChange={handleInputChange} rows={3} className={formInputStyle}></textarea>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium">{t('settings.phone_number')}</label>
                      <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={formInputStyle} />
                    </div>
                    <div>
                      <label htmlFor="gstNumber" className="block text-sm font-medium">{t('settings.gst_number')}</label>
                      <input type="text" name="gstNumber" id="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className={formInputStyle} />
                    </div>
                 </div>
              </div>
            </div>
        </div>

        {/* User and Tax Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">{t('settings.profile_title')}</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium">{t('settings.your_name')}</label>
                        <input type="text" name="userName" id="userName" value={formData.userName} onChange={handleInputChange} className={formInputStyle} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">{t('settings.email')}</label>
                        <input type="email" name="email" id="email" value={currentUser.email} disabled className="mt-1 w-full p-2 border rounded-lg bg-slate-100 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">{t('settings.tax_config_title')}</h2>
                <div>
                    <label htmlFor="taxRate" className="block text-sm font-medium">{t('settings.tax_rate')}</label>
                    <div className="relative mt-1">
                        <input type="number" name="taxRate" id="taxRate" value={formData.taxRate} onChange={handleInputChange} className={formInputStyle} min="0" step="0.01" />
                        <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400 pointer-events-none">%</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">{t('settings.appearance_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium mb-3">{t('settings.primary_color')}</label>
                    <div className="flex items-center space-x-4">
                        {Object.keys(availableColors).map(colorName => (
                            <button
                                key={colorName}
                                type="button"
                                onClick={() => updateTheme({ color: colorName })}
                                className={`w-8 h-8 rounded-full capitalize ring-2 ring-offset-2 dark:ring-offset-slate-800 transition-transform transform hover:scale-110 ${theme.color === colorName ? 'ring-primary-500' : 'ring-transparent'}`}
                                style={{ backgroundColor: `rgb(${availableColors[colorName]['500']})` }}
                                aria-label={`Set theme color to ${colorName}`}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-3">{t('settings.color_mode')}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => updateTheme({ mode })}
                                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${theme.mode === mode ? 'bg-white dark:bg-primary-900/50 text-primary-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            >
                                {t(`settings.mode_${mode}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end items-center gap-4 pt-4">
            {isSaved && <p className="text-green-600 dark:text-green-400 text-sm animate-pulse">{t('settings.saved_message')}</p>}
            <Button type="submit">{t('common.save_changes')}</Button>
        </div>
      </form>
        
      <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-4">{t('settings.account_actions')}</h2>
          <div className="flex justify-between items-center">
            <p className="text-slate-600 dark:text-slate-300">{t('settings.logout_description')}</p>
            <Button variant="secondary" onClick={logout} className="!bg-red-500 !text-white hover:!bg-red-600 focus:!ring-red-500">
              <LogoutIcon className="mr-2" />
              {t('settings.logout_button')}
            </Button>
          </div>
      </div>
      
      <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-red-500/50 dark:border-red-500/30">
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">{t('settings.data_management.title')}</h2>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <p className="text-slate-600 dark:text-slate-300 max-w-lg">{t('settings.data_management.clear_sales_data_description')}</p>
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(true)} className="!bg-red-500 !text-white hover:!bg-red-600 focus:!ring-red-500 flex-shrink-0">
              <TrashIcon className="mr-2" />
              {t('settings.data_management.clear_sales_data_button')}
            </Button>
          </div>
      </div>

      {isConfirmModalOpen && (
          <Modal
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              title={t('settings.data_management.confirm_modal_title')}
          >
              <div className="text-center">
                  <p className="text-slate-700 dark:text-slate-300 mb-6">{t('settings.data_management.confirm_modal_body')}</p>
                   <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleClearSales} className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500">
                            {t('settings.data_management.confirm_modal_confirm_button')}
                        </Button>
                    </div>
              </div>
          </Modal>
      )}

    </div>
  );
};

export default Settings;