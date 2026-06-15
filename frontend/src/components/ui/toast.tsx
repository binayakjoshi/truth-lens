import { useEffect } from 'react';
import { toast, ToastOptions } from 'react-hot-toast';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export const Toast = ({
  variant,
  children,
}: {
  variant: ToastVariant;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const message = typeof children === 'string' ? children : JSON.stringify(children);
    const options: ToastOptions = {
      duration: 4000,
      style: {
        background: 'var(--mui-palette-background-paper)',
        color: 'var(--mui-palette-text-primary)',
        borderRadius: 12,
        border: '1px solid var(--mui-palette-divider)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      },
    };

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
  }, [variant, children]);

  return null;
};

export default Toast;