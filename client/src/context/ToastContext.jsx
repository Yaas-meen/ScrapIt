import {
  createContext, useCallback,
  useContext, useState,
} from 'react';
import { ToastContainer } from '../components/ui/Toast';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((type, message, title, duration) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, type, message, title, duration }]);
    return id;
  }, []);

  const api = {
    success: (msg, title) => toast('success', msg, title),
    error:   (msg, title) => toast('error',   msg, title),
    info:    (msg, title) => toast('info',     msg, title),
    warning: (msg, title) => toast('warning',  msg, title),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
export default ToastContext;