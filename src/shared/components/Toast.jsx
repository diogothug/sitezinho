import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle className="toast-icon text-emerald-400" size={20} />,
    error: <AlertCircle className="toast-icon text-rose-400" size={20} />,
    info: <Info className="toast-icon text-amber-400" size={20} />
  };

  return (
    <div className={`toast toast-${type} slide-up`}>
      {icons[type] || icons.success}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}
