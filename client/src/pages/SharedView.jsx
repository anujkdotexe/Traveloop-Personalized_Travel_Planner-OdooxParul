import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const CopyIcon = () => <svg className="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const ShareIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const CalIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const STOPS = [
  { city: 'Paris', country: 'France', days: '12 Jun - 18 Jun', activities: ['Eiffel Tower Summit','Louvre Museum','Dinner Cruise on Seine'] },
  { city: 'London', country: 'United Kingdom', days: '18 Jun - 25 Jun', activities: ['British Museum','London Eye','Soho Food Tour'] },
];

export default function SharedView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setTrip(data.data.trip);
          setStops(data.data.stops || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = async () => {
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
        setCopied(true);
        showToast('Trip added to your account!', 'success');
        setTimeout(() => navigate(`/itinerary/${data.data.id}`), 1500);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link copied!', 'success');
  };

  if (loading) return <div className="loading-center">Loading Trip...</div>;
  if (!trip) return <div className="loading-center">Trip not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.9rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-sm">
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <svg className="icon icon-sm" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Traveloop</span>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-outline btn-sm" onClick={handleShare}><ShareIcon /> Share</button>
          <button className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-primary'}`} onClick={handleCopy}><CopyIcon /> {copied ? 'Copied!' : 'Copy This Trip'}</button>
        </div>
      </div>
      <div style={{ height: 420, backgroundImage: `url(https://loremflickr.com/1200/600/city,landscape)`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7),rgba(0,0,0,0.1))' }} />
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '0 2rem' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem' }}>{trip.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem' }}>{stops.length} cities &bull; Shared by Traveloop User</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.25rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
            <span className="flex items-center gap-xs"><CalIcon /> {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-xs"><PinIcon /> {stops.length} Cities</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-xl) 5%' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: '1rem' }}>The Route</h3>
          <div className="flex flex-wrap gap-sm">
            {stops.map(s => (
              <span key={s.id} className="flex items-center gap-xs" style={{ padding: '8px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.9rem', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ color: 'var(--primary)' }}><PinIcon /></span>{s.city_name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '2rem' }}>Full Itinerary</h3>
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '2rem' }}>
            {stops.map(stop => (
              <div key={stop.id} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-2.38rem', top: 4, width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: '0 0 0 2px var(--primary-light)' }} />
                <h4 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{stop.city_name}, {stop.country}</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{new Date(stop.arrival_date).toLocaleDateString()} - {new Date(stop.departure_date).toLocaleDateString()}</p>
                <div className="card">
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {stop.activities?.map(act => (
                      <li key={act.id} className="flex items-center gap-sm" style={{ fontSize: '0.9rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />{act.activity_name}
                      </li>
                    ))}
                    {(!stop.activities || stop.activities.length === 0) && <li style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No activities planned for this stop.</li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer style={{ padding: '3rem 5%', background: 'var(--bg-surface-alt)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.85rem' }}>Created with Traveloop &bull; <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Start planning your own trip</Link></p>
      </footer>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
