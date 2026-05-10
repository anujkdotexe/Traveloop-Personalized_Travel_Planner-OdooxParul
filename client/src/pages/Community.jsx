import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CopyIcon = () => <svg className="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const HeartIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const CalIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Community() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState({});
  const [copied, setCopied] = useState(null);
  const { showToast, toasts, dismissToast } = useToast();

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips/public/community');
      const data = await res.json();
      if (data.status === 'success') setTrips(data.data);
    } catch (err) {
      console.error('Failed to fetch community trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCopy = async (id) => {
    if (!token) {
      showToast('Log in to copy this trip!', 'info');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    try {
      const res = await fetch(`/api/trips/public/copy/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCopied(id);
        showToast('Trip added to your account!', 'success');
        setTimeout(() => navigate(`/itinerary/${data.data.id}`), 1500);
      } else {
        showToast(data.message || 'Could not copy trip.', 'error');
      }
    } catch {
      showToast('Copy failed. Please try again.', 'error');
    }
  };

  const filtered = trips.filter(t => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.author_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Discovering itineraries...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h1>Community</h1>
            <p>Explore world-class itineraries shared by the Traveloop community.</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-search-wrap">
            <div className="input-icon-wrap">
              <span className="input-icon"><SearchIcon /></span>
              <input className="input-field" placeholder="Search trips, destinations, or travelers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <select className="input-field" style={{ width: 'auto', minWidth: 130 }}><option>Most Recent</option><option>Trending</option><option>Staff Picks</option></select>
          <select className="input-field" style={{ width: 'auto', minWidth: 100 }}><option>All Durations</option><option>Short (1-3 days)</option><option>Long (7+ days)</option></select>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No trips found matching your search.
            </div>
          ) : filtered.map(trip => (
            <div key={trip.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundImage: `url(${trip.cover_photo_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent)' }} />
                <button 
                  onClick={() => setLiked(p => ({ ...p, [trip.id]: !p[trip.id] }))} 
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: liked[trip.id] ? 'var(--accent)' : '#fff' }}
                >
                  <HeartIcon />
                </button>
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: '#fff' }}>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>by {trip.author_name}</p>
                  <h4 style={{ color: '#fff', fontSize: '1rem' }}>{trip.title}</h4>
                </div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div className="flex items-center gap-md" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  <span className="flex items-center gap-xs"><CalIcon /> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                  <span className="flex items-center gap-xs"><PinIcon /> {trip.stop_count || 0} cities</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: liked[trip.id] ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {(trip.likes || 0) + (liked[trip.id] ? 1 : 0)}
                  </span>
                </div>
                <button className={`btn ${copied === trip.id ? 'btn-secondary' : 'btn-primary'} w-full`} onClick={() => handleCopy(trip.id)}>
                  <CopyIcon /> {copied === trip.id ? 'Copied to My Trips!' : 'Copy Trip'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
