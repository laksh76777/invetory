import React from 'react';

const LanguageSwitcher: React.FC = () => {
  const language = 'en'; // Hardcode to English for styling, functionality disconnected.

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  return (
    <div className="flex justify-end">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-1 flex space-x-1 border border-slate-200 dark:border-slate-700">
        {languages.map(lang => (
          <button
            key={lang.code}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              language === lang.code
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
