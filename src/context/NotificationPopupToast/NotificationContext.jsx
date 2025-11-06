import React, { createContext, useContext, useState } from 'react';
import ToastItem from './NotificationToastItem';
import './NotificationToast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children, isBuyer = true }) => {
  const [toasts, setToasts] = useState([]);

  // Play sound
  const playBeep = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    );
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const addToast = (notification) => {
    const id = `${notification.notificationId}-${Date.now()}`;
    const timeoutId = setTimeout(() => removeToast(id), 3000);

    // playBeep();
    setToasts((prev) => [...prev, { id, notification, timeoutId }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast) clearTimeout(toast.timeoutId);
      return prev.filter((t) => t.id !== id);
    });
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className={`toast-container ${isBuyer ? 'buyer' : 'supplier'}`}>
        {toasts.map(({ id, notification }) => (
          <ToastItem
            key={id}
            notification={notification}
            onClose={() => removeToast(id)}
            isBuyer={isBuyer}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
