import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { ThemeMode } from '../types';

// Define color palettes (values are R G B strings)
const COLORS: Record<string, Record<string, string>> = {
  violet: {
    '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253',
    '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217',
    '800': '91 33 182', '900': '76 29 149', '950': '59 17 119'
  },
  teal: {
    '50': '240 250 250', '100': '204 243 243', '200': '153 232 232', '300': '82 216 216',
    '400': '45 198 198', '500': '20 184 184', '600': '15 147 147', '700': '17 119 119',
    '800': '19 95 95', '900': '20 78 78', '950': '11 50 50'
  },
  rose: {
    '50': '255 241 242', '100': '255 228 230', '200': '254 205 211', '300': '253 164 175',
    '400': '251 113 133', '500': '244 63 94', '600': '225 29 72', '700': '190 18 60',
    '800': '159 18 57', '900': '136 19 55', '950': '95 7 35'
  },
  amber: {
    '50': '255 251 235', '100': '254 243 199', '200': '253 230 138', '300': '252 211 77',
    '400': '251 191 36', '500': '245 158 11', '600': '217 119 6', '700': '180 83 9',
    '800': '146 64 14', '900': '120 53 15', '950': '77 29 4'
  }
};

interface Theme {
  color: string;
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  availableColors: Record<string, Record<string, string>>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const getInitialTheme = (): Theme => {
  try {
    const storedTheme = localStorage.getItem('app-theme');
    if (storedTheme) {
      return JSON.parse(storedTheme);
    }
  } catch (error) {
    console.error("Failed to parse theme from localStorage", error);
  }
  return { color: 'violet', mode: 'system' };
};


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Effect to apply color theme
  useEffect(() => {
    const selectedColorPalette = COLORS[theme.color] || COLORS.violet;
    
    let cssVariables = '';
    for (const [shade, rgbValue] of Object.entries(selectedColorPalette)) {
      cssVariables += `--color-primary-${shade}: ${rgbValue};\n`;
    }
    
    const styleElementId = 'dynamic-theme-style';
    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement;
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleElementId;
        document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = `:root { ${cssVariables} }`;

  }, [theme.color]);

  // Effect to apply light/dark mode
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme.mode === 'dark' || (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme.mode === 'system') {
            if (mediaQuery.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme(prevTheme => {
        const updatedTheme = { ...prevTheme, ...newTheme };
        localStorage.setItem('app-theme', JSON.stringify(updatedTheme));
        return updatedTheme;
    });
  };

  const value = useMemo(() => ({
    theme,
    updateTheme,
    availableColors: COLORS
  }), [theme]);

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};