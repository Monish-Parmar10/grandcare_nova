import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ElderProvider } from './context/ElderContext';
import { HelpProvider } from './context/HelpContext';
import { SettingsProvider } from './context/SettingsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <ElderProvider>
          <HelpProvider>
            <App />
          </HelpProvider>
        </ElderProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
