import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const MapPinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ArrowRightIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;


function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function statusBadgeClass(status) {
  if (!status) return 'badge-upcoming';
  const s = status.toLowerCase();
  if (s === 'ongoing')   return 'badge-ongoing';
  if (s === 'completed') return 'badge-completed';
  return 'badge-upcoming';
}

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', start_date: '', end_date: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();
  // ── Load real trips from API ─────────────────────────────────────────────
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    if (!token) return;
    
    // Load trips
    fetch('/api/trips', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setTrips(d.data); })
      .catch(() => showToast('Could not load trips.', 'error'))
      .finally(() => setTripsLoading(false));

    // Load top destinations
    fetch('/api/trips/public/top-destinations')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setDestinations(d.data); })
      .catch(err => console.error('Destinations load failed:', err));
  }, [token]);

  const setF = (f) => (e) => { setForm(prev => ({ ...prev, [f]: e.target.value })); setFormErrors(er => ({ ...er, [f]: '' })); };

  const validateForm = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Trip name is required.';
    if (!form.start_date) e.start_date = 'Start date is required.';
    if (!form.end_date) e.end_date = 'End date is required.';
    else if (form.end_date < form.start_date) e.end_date = 'End date must be after start date.';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Trip created!', 'success');
      setTrips(prev => [data.data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', start_date: '', end_date: '', description: '' });
      navigate(`/itinerary/${data.data.id}`);
    } catch (err) {
      showToast(err.message || 'Failed to create trip.', 'error');
    }
  };

  const recent = trips
    .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <div className="page-container">
        {/* ── Hero Banner ─────────────────────────────── */}
        <div style={{ height: 280, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'linear-gradient(135deg,var(--primary) 0%,#8b5cf6 50%,var(--secondary) 100%)', position: 'relative', marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: 6 }}>Where to next, {user?.name?.split(' ')[0]}?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Discover destinations, build itineraries, and share your plans.</p>
          </div>
          <div style={{ position: 'relative', maxWidth: 520, width: '90%' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><SearchIcon /></span>
            <input className="input-field" placeholder="Search your trips..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderRadius: 100, paddingLeft: 48, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }} />
          </div>
        </div>

        {/* ── Section Header ───────────────────────── */}
        <div className="flex justify-between items-center mb-md">
          <div><h2>Your Dashboard</h2><p>Manage trips, explore destinations, and stay organized.</p></div>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary"><PlusIcon /> Plan New Trip</button>
        </div>
        <div className="toolbar">
          <div className="toolbar-search-wrap">
            <div className="input-icon-wrap">
              <span className="input-icon"><SearchIcon /></span>
              <input className="input-field" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} style={{ borderColor: 'var(--border)' }} />
            </div>
          </div>
          <select className="input-field" style={{ width: 'auto', minWidth: 130 }}>
            <option>Group by: None</option>
            <option>Group by: Status</option>
            <option>Group by: Destination</option>
          </select>
          <select className="input-field" style={{ width: 'auto', minWidth: 100 }}>
            <option>Filter: All</option>
            <option>Filter: Ongoing</option>
            <option>Filter: Upcoming</option>
          </select>
          <select className="input-field" style={{ width: 'auto', minWidth: 120 }}>
            <option>Sort: Newest</option>
            <option>Sort: Oldest</option>
            <option>Sort: Name</option>
          </select>
        </div>

        {/* ── Recent Trips (live from API) ─────────── */}
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="flex justify-between items-center mb-md">
            <h3>Recent Itineraries</h3>
            <Link to="/trips" className="flex items-center gap-xs" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>View All <ArrowRightIcon /></Link>
          </div>

          {tripsLoading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
              {recent.map(trip => (
                <div key={trip.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 180, backgroundImage: `url(https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                      <span className={`badge ${statusBadgeClass(trip.status)}`} style={{ marginBottom: 4, display: 'block', width: 'fit-content' }}>{trip.status || 'Planned'}</span>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>{trip.title}</h4>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div className="flex items-center gap-md" style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      <span className="flex items-center gap-xs"><CalendarIcon /> {formatDate(trip.start_date)} &mdash; {formatDate(trip.end_date)}</span>
                      <span className="flex items-center gap-xs"><MapPinIcon /> {trip.stop_count || 0} stops</span>
                    </div>
                    <div className="flex gap-sm">
                      <Link to={`/itinerary/${trip.id}`} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Open Planner</Link>
                      <Link to={`/budget/${trip.id}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Budget</Link>
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={() => setShowCreate(true)} className="card flex items-center justify-center" style={{ border: '2px dashed var(--border)', background: 'transparent', cursor: 'pointer', minHeight: 280, textDecoration: 'none' }}>
                <div className="text-center">
                  <div style={{ width: 52, height: 52, background: 'var(--bg-surface-alt)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}><PlusIcon /></div>
                  <h4>Start New Itinerary</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Plan from a blank canvas</p>
                </div>
              </div>
            </div>
          )}

          {!tripsLoading && trips.length === 0 && (
            <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
              <h4 style={{ marginBottom: 8 }}>No trips yet</h4>
              <p>Start planning your first adventure.</p>
              <Link to="/create-trip" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}><PlusIcon /> Create First Trip</Link>
            </div>
          )}
        </section>

        {/* ── Top Destinations ────────────────────────── */}
        <section>
          <div className="flex justify-between items-center mb-md">
            <h3>Top Regional Selections</h3>
            <Link to="/community" className="flex items-center gap-xs" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Explore All <ArrowRightIcon /></Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem' }}>
            {destinations.length === 0 ? (
              [1,2,3,4].map(i => <div key={i} className="card" style={{ height: 180, background: 'var(--bg-surface-alt)', opacity: 0.5 }} />)
            ) : destinations.map(d => (
              <Link to="/community" key={d.name} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 130, backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '0.9rem 1rem' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>{d.name}</h4>
                  <p style={{ fontSize: '0.8rem' }}>{d.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Create Trip Modal ───────────────────────── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Plan New Trip">
        <form onSubmit={handleCreate} noValidate>
          <div className="input-group">
            <label className="input-label" htmlFor="trip-title">Trip Name</label>
            <input id="trip-title" className={`input-field${formErrors.title ? ' error' : ''}`} placeholder="e.g. Summer in Europe" value={form.title} onChange={setF('title')} />
            {formErrors.title && <p className="input-error-msg">{formErrors.title}</p>}
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="start-date">Start Date</label>
              <input id="start-date" type="date" className={`input-field${formErrors.start_date ? ' error' : ''}`} value={form.start_date} onChange={setF('start_date')} />
              {formErrors.start_date && <p className="input-error-msg">{formErrors.start_date}</p>}
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="end-date">End Date</label>
              <input id="end-date" type="date" className={`input-field${formErrors.end_date ? ' error' : ''}`} value={form.end_date} onChange={setF('end_date')} />
              {formErrors.end_date && <p className="input-error-msg">{formErrors.end_date}</p>}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="trip-description">Description</label>
            <textarea id="trip-description" className="input-field" rows={3} style={{ resize: 'none' }} placeholder="What is this trip about?" value={form.description} onChange={setF('description')} />
          </div>
          <div className="flex gap-sm" style={{ marginTop: 'var(--space-md)' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>Create Trip</button>
          </div>
        </form>
      </Modal>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
