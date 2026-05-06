import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ElderProvider } from './context/ElderContext';
import { HelpProvider } from './context/HelpContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ElderProvider>
        <HelpProvider>
          <App />
        </HelpProvider>
      </ElderProvider>
    </AuthProvider>
  </React.StrictMode>
);
