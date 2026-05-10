import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const BellIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CheckIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;

export default function Notifications() {
  const { token } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch {
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('All notifications marked as read.', 'success');
        fetchNotifications();
      }
    } catch {
      showToast('Failed to update notifications.', 'error');
    }
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h1>Notifications</h1>
            <p>{unread} unread notification{unread === 1 ? '' : 's'}</p>
          </div>
          <button className="btn btn-outline" onClick={markAllRead} disabled={!notifications.length}>
            <CheckIcon /> Mark all read
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="card text-center" style={{ padding: '4rem' }}>
            <BellIcon />
            <h3 style={{ marginTop: '1rem' }}>No notifications yet</h3>
            <p>You’ll see trip, admin, and account updates here.</p>
          </div>
        ) : (
          <div className="grid" style={{ gap: '1rem' }}>
            {notifications.map(n => (
              <div key={n.id} className="card" style={{ borderLeft: `4px solid ${n.is_read ? 'var(--border)' : 'var(--primary)'}`, background: n.is_read ? 'var(--bg-surface)' : 'var(--primary-light)' }}>
                <div className="flex justify-between items-start gap-md">
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: 4 }}>{n.title}</h4>
                    <p style={{ marginBottom: 8 }}>{n.message}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <span className="badge" style={{ background: n.is_read ? 'var(--bg-surface-alt)' : 'var(--secondary-light)', color: n.is_read ? 'var(--text-muted)' : 'var(--secondary)' }}>
                    {n.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}