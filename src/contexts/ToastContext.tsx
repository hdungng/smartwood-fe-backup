import { createContext, ReactNode, useContext } from 'react';
import { enqueueSnackbar } from 'notistack';

export type ToastContextType = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const handleShowSuccess = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
      anchorOrigin: { horizontal: 'right', vertical: 'top' }
    });
  };

  const handleShowError = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 3000,
      anchorOrigin: { horizontal: 'right', vertical: 'top' }
    });
  };

  return (
    <ToastContext.Provider
      value={{
        success: handleShowSuccess,
        error: handleShowError
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
