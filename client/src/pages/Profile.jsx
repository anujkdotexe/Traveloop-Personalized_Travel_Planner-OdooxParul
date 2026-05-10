import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const CameraIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const ShieldIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const HeartIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const TrashIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const CalIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const EyeIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

export default function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    bio: user?.bio || '', 
    language: user?.language_preference || 'English',
    profileImage: user?.profileImage || ''
  });
  const [errors, setErrors] = useState({});
  const { toasts, showToast, dismissToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const savedDests = ['Tokyo, Japan', 'Rome, Italy', 'New York, USA'];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    // In a real app, you'd upload to S3/Cloudinary. 
    // Here we'll just simulate it and update the local state for demo.
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, profileImage: reader.result }));
      updateUser({ ...user, profileImage: reader.result });
      showToast('Profile photo updated locally.', 'success');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bio: form.bio,
          language_preference: form.language
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.data);
        showToast('Profile updated successfully.', 'success');
      } else {
        showToast(data.message || 'Update failed.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        logout();
        window.location.href = '/login';
      } else {
        showToast('Failed to delete account.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const PREPLANNED = [
    { id: 101, title: 'Greek Islands', dates: 'Aug 10 – Aug 22', stops: 3, color: '#6366f1' },
    { id: 102, title: 'Morocco Adventure', dates: 'Sep 5 – Sep 14', stops: 4, color: '#14b8a6' },
    { id: 103, title: 'Swiss Alps Trek', dates: 'Oct 1 – Oct 8', stops: 2, color: '#8b5cf6' },
  ];
  const PREVIOUS = [
    { id: 201, title: 'Summer in Europe', dates: 'Jun 12 – Jun 25', stops: 2, color: '#f43f5e' },
    { id: 202, title: 'Thailand & Bali', dates: 'Mar 3 – Mar 17', stops: 3, color: '#f59e0b' },
    { id: 203, title: 'New York City', dates: 'Jan 8 – Jan 12', stops: 1, color: '#10b981' },
  ];

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
              <img src={form.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploading ? 0.5 : 1 }} />
            </div>
            <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <CameraIcon />
              <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div><h2 style={{ marginBottom: 4 }}>{form.name}</h2><p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Travel Enthusiast &bull; Member since Jan 2024</p></div>
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
                <button className="btn btn-outline btn-sm" onClick={() => showToast('Two-factor setup is not available yet.', 'info')}>Enable</button>
              </div>
              <div className="flex justify-between items-center" style={{ paddingTop: '1rem' }}>
                <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Change Password</div><p style={{ fontSize: '0.8rem' }}>Last changed 3 months ago</p></div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/forgot-password')}>Update</button>
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
              <button className="btn btn-outline w-full" style={{ marginTop: '1rem' }} onClick={() => navigate('/saved-destinations')}>Add Destination</button>
            </div>
            <div className="card" style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Danger Zone</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Permanently delete your account and all data. This cannot be undone.</p>
              <button className="btn btn-danger w-full" onClick={handleDelete} disabled={isDeleting}>
                <TrashIcon /> {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>

            </div>
          </div>
        </div>

        {/* ── Preplanned Trips (wireframe Screen 7) ─── */}
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <div className="flex justify-between items-center mb-md">
            <h3>Preplanned Trips</h3>
            <Link to="/trips" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>View All</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
            {PREPLANNED.map(trip => (
              <div key={trip.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 100, background: `linear-gradient(135deg,${trip.color},${trip.color}aa)`, display: 'flex', alignItems: 'center', padding: '1.25rem' }}>
                  <div>
                    <h4 style={{ color: '#fff', marginBottom: 4 }}>{trip.title}</h4>
                    <div className="flex items-center gap-sm" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
                      <CalIcon />{trip.dates}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="flex items-center gap-xs" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><PinIcon />{trip.stops} stops</span>
                  <Link to={`/itinerary/${trip.id}`} className="btn btn-primary btn-sm"><EyeIcon /> View</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Previous Trips (wireframe Screen 7) ─── */}
        <section style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          <div className="flex justify-between items-center mb-md">
            <h3>Previous Trips</h3>
            <Link to="/trips" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>View All</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
            {PREVIOUS.map(trip => (
              <div key={trip.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', opacity: 0.9 }}>
                <div style={{ height: 100, background: `linear-gradient(135deg,${trip.color}88,${trip.color}44)`, display: 'flex', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{trip.title}</h4>
                    <div className="flex items-center gap-sm" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <CalIcon />{trip.dates}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="flex items-center gap-xs" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><PinIcon />{trip.stops} stops</span>
                  <Link to={`/itinerary-view/${trip.id}`} className="btn btn-outline btn-sm"><EyeIcon /> View</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
