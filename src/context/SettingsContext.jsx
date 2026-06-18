import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [largeText, setLargeText] = useState(localStorage.getItem('largeText') === 'true');

  useEffect(() => {
    localStorage.setItem('largeText', largeText);
    if (largeText) {
      document.documentElement.classList.add('large-text');
      document.body.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
      document.body.classList.remove('large-text');
    }
  }, [largeText]);

  return (
    <SettingsContext.Provider value={{ largeText, setLargeText }}>
      {children}
    </SettingsContext.Provider>
  );
};
