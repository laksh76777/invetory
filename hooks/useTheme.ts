import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { ThemeMode } from '../types';

// Define color palettes (values are R G B strings)
const COLORS: Record<string, Record<string, string>> = {
  indigo: {
    '50': '238 242 255', '100': '224 231 255', '200': '199 210 254', '300': '165 180 252',
    '400': '129 140 248', '500': '99 102 241', '600': '79 70 229', '700': '67 56 202',
    '800': '55 48 163', '900': '49 46 129'
  },
  sky: {
    '50': '240 249 255', '100': '224 242 254', '200': '186 230 253', '300': '125 211 252',
    '400': '59 130 246', '500': '14 165 233', '600': '2 132 199', '700': '3 105 161',
    '800': '7 89 133', '900': '12 74 110'
  },
  emerald: {
    '50': '236 253 245', '100': '209 250 229', '200': '167 243 208', '300': '110 231 183',
    '400': '52 211 153', '500': '16 185 129', '600': '5 150 105', '700': '4 120 87',
    '800': '6 95 70', '900': '6 78 59'
  },
  rose: {
    '50': '255 241 242', '100': '255 228 230', '200': '254 205 211', '300': '253 164 175',
    '400': '251 113 133', '500': '244 63 94', '600': '225 29 72', '700': '190 18 60',
    '800': '159 18 57', '900': '136 19 55'
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
  return { color: 'indigo', mode: 'system' };
};


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Effect to apply color theme
  useEffect(() => {
    const selectedColorPalette = COLORS[theme.color] || COLORS.indigo;
    
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
