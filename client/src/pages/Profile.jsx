import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useToast, ToastContainer } from '../components/Toast';

const CameraIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const ShieldIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const HeartIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const TrashIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export default function Profile() {
  const [form, setForm] = useState({ name: 'Anuj Kondawar', email: 'anuj@example.com', bio: 'Exploring the world one itinerary at a time.', language: 'English' });
  const [errors, setErrors] = useState({});
  const { toasts, showToast, dismissToast } = useToast();
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const savedDests = ['Tokyo, Japan', 'Rome, Italy', 'New York, USA'];
  const handleSave = (e) => { e.preventDefault(); const errs = {}; if (!form.name.trim()) errs.name = 'Name is required.'; if (!form.email.trim()) errs.email = 'Email is required.'; if (Object.keys(errs).length) { setErrors(errs); return; } showToast('Profile updated successfully.', 'success'); };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex justify-between items-center mb-lg">
          <div><h1>Profile and Settings</h1><p>Manage your personal information and preferences.</p></div>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
        <div className="card flex items-center gap-xl" style={{ marginBottom: 'var(--space-xl)', padding: '2rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--bg-surface-alt)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <button style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CameraIcon /></button>
          </div>
          <div><h2 style={{ marginBottom: 4 }}>{form.name}</h2><p style={{ fontSize: '0.9rem' }}>Travel Enthusiast &bull; Member since Jan 2024</p></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
          <div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
              <form onSubmit={handleSave} noValidate>
                {[['full-name', 'name', 'Full Name', 'text'], ['email', 'email', 'Email Address', 'email']].map(([id, field, label, type]) => (
                  <div key={id} className="input-group">
                    <label className="input-label" htmlFor={id}>{label}</label>
                    <input id={id} type={type} className={`input-field${errors[field] ? ' error' : ''}`} value={form[field]} onChange={set(field)} />
                    {errors[field] && <p className="input-error-msg">{errors[field]}</p>}
                  </div>
                ))}
                <div className="input-group">
                  <label className="input-label" htmlFor="bio">Bio</label>
                  <textarea id="bio" className="input-field" rows={3} style={{ resize: 'none' }} value={form.bio} onChange={set('bio')} />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="language">Language Preference</label>
                  <select id="language" className="input-field" value={form.language} onChange={set('language')}>
                    <option>English</option><option>Hindi</option><option>French</option><option>Spanish</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Security</h3>
              <div className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-md">
                  <span style={{ color: 'var(--primary)' }}><ShieldIcon /></span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Two-Factor Authentication</div>
                    <p style={{ fontSize: '0.8rem' }}>Add an extra layer of account security</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">Enable</button>
              </div>
              <div className="flex justify-between items-center" style={{ paddingTop: '1rem' }}>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Change Password</div><p style={{ fontSize: '0.8rem' }}>Last changed 3 months ago</p></div>
                <button className="btn btn-outline btn-sm">Update</button>
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Saved Destinations</h3>
              {savedDests.map(dest => (
                <div key={dest} className="flex justify-between items-center" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-sm"><span style={{ color: 'var(--accent)' }}><HeartIcon /></span><span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{dest}</span></div>
                  <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--text-muted)' }}><TrashIcon /></button>
                </div>
              ))}
              <button className="btn btn-outline w-full" style={{ marginTop: '1rem' }}>Add Destination</button>
            </div>
            <div className="card" style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Danger Zone</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Permanently delete your account and all data. This cannot be undone.</p>
              <button className="btn btn-danger w-full"><TrashIcon /> Delete Account</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
