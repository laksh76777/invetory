import React from 'react';
import { InstagramIcon, WhatsAppIcon, TwitterIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>&copy; {new Date().getFullYear()} Samagra360. All rights reserved.</span>
        <div className="flex items-center space-x-6">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary-500 transition-colors">
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-primary-500 transition-colors">
            <WhatsAppIcon className="w-5 h-5" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-primary-500 transition-colors">
            <TwitterIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;