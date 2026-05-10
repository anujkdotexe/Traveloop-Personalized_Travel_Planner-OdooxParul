import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const MapIcon = () => <svg className="icon icon-xl" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const CalendarIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ImageIcon = () => <svg className="icon icon-lg" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;

const TRIP_TEMPLATES = [
  { name: 'City Break',  desc: 'Short 3-5 day urban exploration', icon: '🏙', days: 4 },
  { name: 'Beach Holiday', desc: 'Relaxed coastal escape', icon: '🏖', days: 7 },
  { name: 'Backpacking', desc: 'Budget multi-city adventure', icon: '🎒', days: 14 },
  { name: 'Road Trip',  desc: 'Drive-through destinations', icon: '🚗', days: 10 },
];

export default function CreateTrip() {
  const [form, setForm] = useState({ title: '', start_date: '', end_date: '', description: '', is_public: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [f]: val }));
    setErrors(er => ({ ...er, [f]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title = 'Trip name is required.';
    if (!form.start_date)     e.start_date = 'Start date is required.';
    if (!form.end_date)       e.end_date = 'End date is required.';
    else if (form.end_date < form.start_date) e.end_date = 'End date must be after start date.';
    return e;
  };

  const applyTemplate = (tpl) => {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setDate(end.getDate() + tpl.days);
    const fmt = d => d.toISOString().split('T')[0];
    setForm(p => ({ ...p, title: tpl.name + ' Trip', description: tpl.desc, start_date: fmt(start), end_date: fmt(end) }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Trip created! Opening the planner...', 'success');
      setTimeout(() => navigate(`/itinerary/${data.data.id}`), 800);
    } catch (err) {
      showToast(err.message || 'Failed to create trip.', 'error');
      setLoading(false);
    }
  };

  const tripDays = form.start_date && form.end_date
    ? Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1)
    : null;

  return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 860 }}>
        {/* ── Breadcrumb ───────────────────────────── */}
        <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/dashboard" className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div><h1>Create New Trip</h1><p>Fill in the details to start building your itinerary.</p></div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
          {/* ── Main Form ───────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Trip Details</h3>

              {/* Cover Photo */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span className="input-label">Cover Photo (optional)</span>
                <label htmlFor="cover-upload" style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ height: 160, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)', background: coverPreview ? 'none' : 'var(--bg-surface-alt)', backgroundImage: coverPreview ? `url(${coverPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, transition: 'border-color 0.2s' }}>
                    {!coverPreview && <>
                      <ImageIcon />
                      <p style={{ fontSize: '0.85rem' }}>Click to upload a cover photo</p>
                    </>}
                  </div>
                </label>
                <input id="cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="trip-name">Trip Name</label>
                <input id="trip-name" className={`input-field${errors.title ? ' error' : ''}`} placeholder="e.g. Summer in Europe 2024" value={form.title} onChange={set('title')} />
                {errors.title && <p className="input-error-msg">{errors.title}</p>}
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="start-date">Start Date</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><CalendarIcon /></span>
                    <input id="start-date" type="date" className={`input-field${errors.start_date ? ' error' : ''}`} value={form.start_date} onChange={set('start_date')} />
                  </div>
                  {errors.start_date && <p className="input-error-msg">{errors.start_date}</p>}
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="end-date">End Date</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><CalendarIcon /></span>
                    <input id="end-date" type="date" className={`input-field${errors.end_date ? ' error' : ''}`} value={form.end_date} onChange={set('end_date')} min={form.start_date} />
                  </div>
                  {errors.end_date && <p className="input-error-msg">{errors.end_date}</p>}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="trip-description">Description</label>
                <textarea id="trip-description" className="input-field" rows={4} style={{ resize: 'none' }} placeholder="What is this trip about? Add highlights, goals, or who is joining..." value={form.description} onChange={set('description')} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}>
                <input id="is-public" type="checkbox" checked={form.is_public} onChange={set('is_public')} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                <div>
                  <label htmlFor="is-public" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)' }}>Make this trip public</label>
                  <p style={{ fontSize: '0.8rem' }}>Allow anyone with the link to view your itinerary in the Community feed.</p>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '14px' }}>
                {loading ? 'Creating trip...' : 'Create Trip and Open Planner'}
              </button>
            </div>
          </form>

          {/* ── Right Panel ─────────────────────────── */}
          <div>
            {/* Duration Preview */}
            {tripDays && (
              <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="input-label" style={{ margin: 0 }}>Trip Duration</span>
                  <span style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--primary)' }}>{tripDays}</span>
                </div>
                <p style={{ marginTop: 4, fontSize: '0.85rem' }}>day{tripDays > 1 ? 's' : ''} of adventure</p>
              </div>
            )}

            {/* Quick-start Templates */}
            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Quick-start Templates</h4>
              <p style={{ fontSize: '0.83rem', marginBottom: '1rem' }}>Choose a template to pre-fill the form.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TRIP_TEMPLATES.map(tpl => (
                  <button key={tpl.name} type="button" onClick={() => applyTemplate(tpl)} className="flex items-center gap-sm" style={{ padding: '0.75rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s', width: '100%' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{tpl.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tpl.desc} &bull; ~{tpl.days} days</div>
                    </div>
                    <svg className="icon icon-sm" style={{ color: 'var(--primary)' }} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
