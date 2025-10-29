import { Analytics } from '@vercel/analytics/react';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import toast, { Toaster, ToastBar, type Toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.css';
import AppRouter from './routes';
import { ThemeProvider } from './context/ThemeProvider';
import { useCurrencyStore } from './context/CurrencyStore';

const AppInitializer = () => {
  useEffect(() => {
    useCurrencyStore.getState().initializeCurrency();
  }, []);
  
  return null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SkeletonTheme baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        toastOptions={{ duration: 4000 }}
      >
        {(t: Toast) => (
          <ToastBar
            toast={t}
            style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
          >
            {({ icon, message }) => (
              <div
  onClick={() => {
    if ((t as any).link && (t as any).navigate) {
      (t as any).navigate((t as any).link);
      toast.dismiss(t.id);
    }
  }}
  className={`${
    t.visible ? 'animate-enter' : 'animate-leave'
  } w-full max-w-sm transform-gpu rounded-2xl bg-white dark:bg-zinc-900 shadow-lg dark:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-zinc-800/70 cursor-pointer`}
>
  <div className="flex items-center p-2">
    {/* Icon */}
    {icon && (
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
          {icon}
        </div>
      </div>
    )}

    {/* Message Only */}
    <div className="ml-3 flex-1">
      <p className="text-sm text-gray-600 dark:text-zinc-300">{message}</p>
    </div>

    {/* Close Button */}
    {t.type !== 'loading' && (
      <div className="ml-3 flex flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          className="inline-flex rounded-full p-1.5 text-gray-400 dark:text-zinc-500 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-600 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    )}
  </div>
</div>

            )}
          </ToastBar>
        )}
      </Toaster>

      <ThemeProvider>
        <AppInitializer />
        <AppRouter />
      </ThemeProvider>
      <Analytics />
    </SkeletonTheme>
  </React.StrictMode>
);
