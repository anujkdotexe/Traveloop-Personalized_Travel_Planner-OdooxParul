import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EyeIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const CalIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function derivedStatus(trip) {
  if (trip.status && trip.status !== 'Planned') return trip.status.toLowerCase();
  const now = new Date(); const start = new Date(trip.start_date); const end = new Date(trip.end_date);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}
function statusBadgeClass(s) {
  if (s === 'ongoing') return 'badge-ongoing';
  if (s === 'completed') return 'badge-completed';
  return 'badge-upcoming';
}

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { token } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    if (!token) return;
    fetch('/api/trips', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setTrips(d.data); })
      .catch(() => showToast('Could not load trips.', 'error'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setTrips(prev => prev.filter(t => t.id !== id));
      showToast('Trip deleted.', 'success');
    } catch {
      showToast('Failed to delete trip.', 'error');
    }
  };

  const TABS = ['all', 'ongoing', 'upcoming', 'completed'];

  let filtered = trips
    .map(t => ({ ...t, _status: derivedStatus(t) }))
    .filter(t => activeTab === 'all' || t._status === activeTab)
    .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));

  if (sortBy === 'newest')    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (sortBy === 'name')      filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === 'start')     filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex justify-between items-center mb-lg">
          <div><h1>My Trips</h1><p>All your travel plans in one place.</p></div>
          <Link to="/dashboard" className="btn btn-primary"><PlusIcon /> Plan New Trip</Link>
        </div>

        <div className="toolbar">
          <div className="toolbar-search-wrap">
            <div className="input-icon-wrap">
              <span className="input-icon"><SearchIcon /></span>
              <input className="input-field" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <select className="input-field" style={{ width: 'auto', minWidth: 120 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest</option>
            <option value="name">Sort: Name</option>
            <option value="start">Sort: Start Date</option>
          </select>
          <select className="input-field" style={{ width: 'auto', minWidth: 120 }}>
            <option>Group by: None</option>
            <option>Group by: Status</option>
            <option>Group by: Month</option>
          </select>
        </div>

        <div className="tabs">
          {TABS.map(tab => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span style={{ marginLeft: 6, fontWeight: 700, fontSize: '0.75rem', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)' }}>
                  ({trips.filter(t => derivedStatus(t) === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.length === 0 && (
              <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                <p>No trips found. Start planning your next adventure!</p>
              </div>
            )}
            {filtered.map(trip => (
              <div key={trip.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>
                  {trip.title?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 6 }}>
                    <h4>{trip.title}</h4>
                    <span className={`badge ${statusBadgeClass(trip._status)}`}>{trip._status}</span>
                  </div>
                  <div className="flex items-center gap-lg" style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                    <span className="flex items-center gap-xs"><CalIcon /> {formatDate(trip.start_date)} &mdash; {formatDate(trip.end_date)}</span>
                    <span className="flex items-center gap-xs"><PinIcon /> {trip.stop_count || 0} stops</span>
                  </div>
                  {trip.description && <p style={{ marginTop: 4, fontSize: '0.82rem' }}>{trip.description}</p>}
                </div>
                <div className="flex gap-sm">
                  <Link to={`/itinerary/${trip.id}`} className="btn btn-primary btn-sm"><EyeIcon /> View</Link>
                  <Link to={`/budget/${trip.id}`} className="btn btn-outline btn-sm">Budget</Link>
                  <Link to={`/invoice/${trip.id}`} className="btn btn-outline btn-sm">Invoice</Link>
                  <Link to={`/checklist/${trip.id}`} className="btn btn-outline btn-sm">Checklist</Link>
                  <Link to={`/notes/${trip.id}`} className="btn btn-outline btn-sm">Notes</Link>
                  <button className="btn btn-danger btn-icon-sm" onClick={() => handleDelete(trip.id)}><TrashIcon /></button>
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
