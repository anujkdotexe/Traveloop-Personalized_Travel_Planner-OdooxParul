import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const MapIcon = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default function Signup() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', country: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const set = (f) => (e) => { setForm(prev => ({ ...prev, [f]: e.target.value })); setErrors(er => ({ ...er, [f]: '' })); };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!validateEmail(form.email)) errs.email = 'The entered email is invalid.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: `${form.firstName} ${form.lastName}`, 
          email: form.email, 
          password: form.password,
          phone: form.phone,
          city: form.city,
          country: form.country
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Account created! Signing you in...', 'success');
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) { login(loginData.user, loginData.token); navigate('/dashboard'); }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type = 'text', placeholder = '') => (
    <div className="input-group">
      <label className="input-label" htmlFor={id}>{label}</label>
      <input id={id} type={type} className={`input-field${errors[id] ? ' error' : ''}`} placeholder={placeholder} value={form[id]} onChange={set(id)} />
      {errors[id] && <p className="input-error-msg">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1.25rem' }}><MapIcon /></div>
          <h2>Create your account</h2>
          <p style={{ marginTop: 6 }}>Start planning your perfect journey today</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-surface-alt)', border: '2px dashed var(--border)', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg className="icon icon-lg" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <p style={{ fontSize: '0.8rem' }}>Upload photo (optional)</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('firstName', 'First Name', 'text', 'John')}
            {field('lastName', 'Last Name', 'text', 'Doe')}
          </div>
          {field('email', 'Email Address', 'email', 'name@example.com')}
          {field('phone', 'Phone Number', 'tel', '+91 00000 00000')}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('city', 'City', 'text', 'Mumbai')}
            {field('country', 'Country', 'text', 'India')}
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="additionalInfo">Additional Information</label>
            <textarea id="additionalInfo" className="input-field" rows={3} placeholder="Tell us something about yourself..." style={{ resize: 'none' }} />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('password', 'Password', 'password', '••••••••')}
            {field('confirm', 'Confirm Password', 'password', '••••••••')}
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Register User'}
          </button>
        </form>
        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
