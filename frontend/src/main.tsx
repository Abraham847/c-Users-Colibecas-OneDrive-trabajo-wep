import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(108,99,255,0.2)' },
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
