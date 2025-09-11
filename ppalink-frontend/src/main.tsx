import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster here
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.css';
import AppRouter from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
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
      </SkeletonTheme>
  </React.StrictMode>
);