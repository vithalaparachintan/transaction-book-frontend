import React, { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("transactionbook_darkmode");
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode on mount
  useEffect(() => {
    localStorage.setItem("transactionbook_darkmode", JSON.stringify(isDarkMode));
    const root = document.documentElement;
    const body = document.body;
    const appRoot = document.getElementById('root');
    
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      if (appRoot) appRoot.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      if (appRoot) appRoot.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}