import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const MapIcon = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const MailIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UserIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ShieldIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ChevronDownIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>;

// Demo credentials — shown clearly in UI for hackathon judges
const DEMO_USERS = [
  {
    email: 'demo@traveloop.com',
    password: 'Demo@1234',
    name: 'Demo User',
    role: 'user',
    label: 'Regular User',
    icon: UserIcon,
    badgeClass: 'demo-role-user',
  },
  {
    email: 'admin@traveloop.com',
    password: 'Demo@1234',
    name: 'Admin',
    role: 'admin',
    label: 'Admin',
    icon: ShieldIcon,
    badgeClass: 'demo-role-admin',
  },
];

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!validateEmail(form.email)) errs.email = 'The entered email is invalid.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const doLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await doLogin(form.email, form.password);
  };

  const handleDemoLogin = async (demoUser) => {
    setDemoOpen(false);
    setForm({ email: demoUser.email, password: demoUser.password });
    showToast(`Signing in as ${demoUser.label}...`, 'info');
    await doLogin(demoUser.email, demoUser.password);
  };

  const setF = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1.25rem' }}>
            <MapIcon />
          </div>
          <h2>Welcome back</h2>
          <p style={{ marginTop: 6 }}>Sign in to your Traveloop account</p>
        </div>

        {/* Quick Demo Login — dropdown */}
        <div className="demo-panel">
          <div className="demo-panel-title">Quick Demo Login</div>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="demo-btn"
              onClick={() => setDemoOpen(o => !o)}
              style={{ justifyContent: 'space-between' }}
            >
              <span>Select a demo account</span>
              <ChevronDownIcon />
            </button>
            {demoOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 50, overflow: 'hidden' }}>
                {DEMO_USERS.map(du => {
                  const Icon = du.icon;
                  return (
                    <button
                      key={du.email}
                      type="button"
                      onClick={() => handleDemoLogin(du)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '0.9rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', borderBottom: '1px solid var(--border)', fontFamily: 'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: du.role === 'admin' ? 'var(--primary-light)' : 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: du.role === 'admin' ? 'var(--primary)' : 'var(--secondary)', flexShrink: 0 }}>
                        <Icon />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 2 }}>{du.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{du.email}</div>
                      </div>
                      <span className={`demo-role-badge ${du.badgeClass}`}>{du.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Passwords are bcrypt-encrypted at cost factor 12
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>or sign in manually</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div className="input-icon-wrap">
              <span className="input-icon"><MailIcon /></span>
              <input
                id="email" type="email"
                className={`input-field${errors.email ? ' error' : ''}`}
                placeholder="name@example.com"
                value={form.email}
                onChange={setF('email')}
              />
            </div>
            {errors.email && <p className="input-error-msg">{errors.email}</p>}
          </div>

          <div className="input-group">
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label className="input-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</Link>
            </div>
            <div className="input-icon-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="password" type="password"
                className={`input-field${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={setF('password')}
              />
            </div>
            {errors.password && <p className="input-error-msg">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          No account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create one</Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
