// src/components/ui/Toaster.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const Toaster = ({ toasts, removeToast }: { toasts: ToastMessage[]; removeToast: (id: number) => void; }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const toastIcons: { [key in ToastType]: ReactNode } = {
  success: <CheckCircle className="text-green-500" />,
  error: <XCircle className="text-red-500" />,
  warning: <AlertTriangle className="text-yellow-500" />,
};

const Toast = ({ message, type, onClose }: ToastMessage & { onClose: () => void }) => {
  const baseClasses = "flex items-center gap-3 p-4 rounded-lg shadow-lg text-sm font-medium animate-toast-in";
  const typeClasses = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className={cn(baseClasses, typeClasses[type])}>
      {toastIcons[type]}
      <span>{message}</span>
    </div>
  );
};

