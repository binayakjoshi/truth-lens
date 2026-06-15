import { useCallback } from 'react';
import { toast, ToastOptions } from 'react-hot-toast';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type UseToastReturn = {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

export const useToast = (): UseToastReturn => {
  const baseOptions: ToastOptions = {
    duration: 4000,
      style: {
        background: 'var(--mui-palette-background-paper)',
        color: 'var(--mui-palette-text-primary)',
        borderRadius: 12,
        border: '1px solid var(--mui-palette-divider)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      },
  };

  const toastWithVariant = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const options = { ...baseOptions };

      switch (variant) {
        case 'success':
          toast.success(message, options);
          break;
        case 'error':
          toast.error(message, options);
          break;
        case 'warning':
          toast(message, { ...options, icon: '⚠️' });
          break;
        case 'info':
          toast(message, { ...options, icon: 'ℹ️' });
          break;
      }
    },
    [baseOptions]
  );

  return {
    toast: toastWithVariant,
    success: useCallback((message: string) => toastWithVariant(message, 'success'), [toastWithVariant]),
    error: useCallback((message: string) => toastWithVariant(message, 'error'), [toastWithVariant]),
    warning: useCallback((message: string) => toastWithVariant(message, 'warning'), [toastWithVariant]),
    info: useCallback((message: string) => toastWithVariant(message, 'info'), [toastWithVariant]),
  };
};