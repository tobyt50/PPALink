import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster here
import './index.css';
import AppRouter from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Place the Toaster component here, as a sibling to the Router */}
    <Toaster 
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3500, // Slightly longer duration
        style: {
          background: '#1e293b', // bg-slate-800
          color: '#fff',
        },
      }}
    />
    <AppRouter />
  </React.StrictMode>
);