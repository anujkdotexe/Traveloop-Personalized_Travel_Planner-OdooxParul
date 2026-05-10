import { Link } from 'react-router-dom';
import { useToast, ToastContainer } from '../components/Toast';

export default function ForgotPassword() {
  const { toasts, showToast, dismissToast } = useToast();
  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('If an account with that email exists, a reset link has been sent.', 'success');
  };
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <h2>Reset Password</h2>
          <p style={{ marginTop: 6 }}>Enter your email to receive a secure reset link</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="reset-email">Email Address</label>
            <input id="reset-email" type="email" className="input-field" placeholder="name@example.com" required />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>Send Reset Link</button>
        </form>
        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to Login</Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
