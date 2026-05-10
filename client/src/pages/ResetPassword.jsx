import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useToast, ToastContainer } from '../components/Toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showToast(data.message || 'Something went wrong.', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <h2>Set New Password</h2>
          <p style={{ marginTop: 6 }}>Create a secure new password for your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="new-password">New Password</label>
            <input 
              id="new-password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="confirm-password">Confirm Password</label>
            <input 
              id="confirm-password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
        </form>
        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to Login</Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
