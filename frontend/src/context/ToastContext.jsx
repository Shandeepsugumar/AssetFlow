import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ui/Toast';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      // Auto-dismiss after 4 seconds
      setTimeout(() => dismiss(id), 4000);
      return id;
    },
    [dismiss]
  );

  const value = {
    showToast,
    success: (msg) => showToast(msg, 'success'),
    warning: (msg) => showToast(msg, 'warning'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
