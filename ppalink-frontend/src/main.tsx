import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
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
      gutter={8}
      toastOptions={{
        style: {
          background: '#ffffff', // White background
          color: '#1e293b',      // Dark text (slate-800)
          border: '1px solid #e2e8f0', // Light border (slate-200)
          borderRadius: '8px',   // Slightly rounded corners
          fontSize: '14px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Subtle shadow
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }}
    />
      <AppRouter />
      </SkeletonTheme>
  </React.StrictMode>
);