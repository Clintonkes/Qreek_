import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--surface-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-body)',
        },
        success: { iconTheme: { primary: 'var(--teal)', secondary: 'var(--text-inv)' } },
        error:   { iconTheme: { primary: 'var(--red)',  secondary: 'var(--text-inv)' } },
      }}
    />
  </React.StrictMode>
);
