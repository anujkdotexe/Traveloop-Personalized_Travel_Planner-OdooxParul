import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, showToast, dismissToast };
}

function Toast({ message, type, onClose }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
        <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => <Toast key={t.id} {...t} onClose={() => onDismiss(t.id)} />)}
    </div>
  );
}
