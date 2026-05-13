import React, { createContext, useContext, useEffect, useState } from 'react';
import { themeService, ThemeConfig } from '@/services/theme.service';

const ThemeContext = createContext<{
  theme: ThemeConfig | null;
  updateLocalTheme: (config: ThemeConfig) => void;
  refreshTheme: () => Promise<void>;
}>({
  theme: null,
  updateLocalTheme: () => {},
  refreshTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const DynamicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;
    
    // Core Colors
    root.style.setProperty('--primary-hex', config.primaryColor);
    root.style.setProperty('--secondary-hex', config.secondaryColor);
    root.style.setProperty('--background-hex', config.backgroundColor);
    root.style.setProperty('--foreground-hex', config.textColor);
    
    // For components still using the base --primary etc
    root.style.setProperty('--primary', config.primaryColor);
    root.style.setProperty('--secondary', config.secondaryColor);
    root.style.setProperty('--background', config.backgroundColor);
    root.style.setProperty('--foreground', config.textColor);
    
    // Buttons
    root.style.setProperty('--button-bg', config.buttonColor);
    root.style.setProperty('--button-hover', config.buttonHoverColor);
    root.style.setProperty('--button-text', config.buttonTextColor);
    root.style.setProperty('--radius-button', `${config.buttonRadius}px`);
    
    // Cards
    root.style.setProperty('--card', config.cardBgColor);
    root.style.setProperty('--radius-card', `${config.cardRadius}px`);
    root.style.setProperty('--shadow-card', config.cardShadow);
    
    // Borders
    root.style.setProperty('--border', config.borderColor);
    root.style.setProperty('--border-width', `${config.borderWidth}px`);
    
    // Typography
    root.style.setProperty('--font-primary', config.fontFamily);
    root.style.setProperty('--font-heading', config.headingFont);
    root.style.setProperty('--font-body', config.bodyFont);
    root.style.setProperty('--text-base', `${config.fontSizeBase}px`);
    root.style.setProperty('--text-heading', `${config.fontSizeHeading}px`);
    
    // Layout
    root.style.setProperty('--container-width', `${config.containerWidth}px`);
    root.style.setProperty('--spacing-unit', `${config.spacingUnit}px`);

    // Force font family on body
    root.style.fontFamily = config.fontFamily;
  };

  const refreshTheme = async () => {
    try {
      const config = await themeService.get();
      setTheme(config);
      applyTheme(config);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const updateLocalTheme = (config: ThemeConfig) => {
    setTheme(config);
    applyTheme(config);
  };

  useEffect(() => {
    refreshTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateLocalTheme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
