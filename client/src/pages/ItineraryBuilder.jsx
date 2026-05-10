import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import CurrencyBadge from '../components/CurrencyBadge';

const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MapPinIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ShareIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const MoreIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
const GripIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>;

const CITY_RESULTS = [
  { name: 'Amsterdam', country: 'Netherlands', costIndex: 'Medium', popularity: 92 },
  { name: 'Barcelona', country: 'Spain', costIndex: 'Medium', popularity: 95 },
  { name: 'Berlin', country: 'Germany', costIndex: 'Low', popularity: 88 },
];
const ACT_RESULTS = [
  { name: 'Boat Tour on Seine', category: 'sightseeing', duration: '2h', cost: 35 },
  { name: 'French Cooking Class', category: 'dining', duration: '3h', cost: 85 },
  { name: 'E-Bike Tour', category: 'adventure', duration: '4h', cost: 55 },
];
const catClass = { sightseeing: 'tag-sightseeing', dining: 'tag-dining', adventure: 'tag-adventure', transport: 'tag-transport' };


export default function ItineraryBuilder() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [activeStopId, setActiveStopId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchModal, setSearchModal] = useState(null);
  const [cityQ, setCityQ] = useState('');
  const [actQ, setActQ] = useState('');

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTrip(data.data.trip);
        setStops(data.data.stops || []);
        if (data.data.stops?.length && !activeStopId) {
          setActiveStopId(data.data.stops[0].id);
        }
      }
    } catch (err) {
      showToast('Failed to load itinerary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchTrip(); }, [tripId, token]);

  const activeStop = stops.find(s => s.id === activeStopId);
  const activities = activeStop?.activities || [];
  const country = activeStop?.country || 'India';


  const moveStop = async (stopId, direction) => {
    const idx = stops.findIndex(s => s.id === stopId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stops.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const stopA = stops[idx];
    const stopB = stops[targetIdx];

    try {
      await Promise.all([
        fetch(`/api/trips/stop/${stopA.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ sequence_order: stopB.sequence_order })
        }),
        fetch(`/api/trips/stop/${stopB.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ sequence_order: stopA.sequence_order })
        })
      ]);
      fetchTrip();
    } catch (err) { showToast('Failed to reorder stops.', 'error'); }
  };

  const handleAddStop = async (city) => {
    try {
      const res = await fetch('/api/trips/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          trip_id: tripId,
          city_name: city.name,
          country: city.country,
          arrival_date: trip.start_date,
          departure_date: trip.end_date,
          sequence_order: stops.length + 1
        })
      });
      if (res.ok) {
        showToast(`Added ${city.name} to trip`, 'success');
        fetchTrip();
        setSearchModal(null);
      }
    } catch (err) {
      showToast('Failed to add stop.', 'error');
    }
  };

  const handleAddActivity = async (act) => {
    try {
      const res = await fetch('/api/trips/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          stop_id: activeStopId,
          activity_name: act.name,
          cost_estimate: act.cost,
          category: act.category,
          scheduled_time: '10:00:00'
        })
      });
      if (res.ok) {
        showToast(`Added ${act.name}`, 'success');
        fetchTrip();
        setSearchModal(null);
      }
    } catch (err) {
      showToast('Failed to add activity.', 'error');
    }
  };

  if (loading) return <div className="loading-center">Loading...</div>;

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 5%' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-md">
            <Link to="/trips" className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
            <div><h4 style={{ fontSize: '1rem', margin: 0 }}>{trip?.title}</h4><p style={{ fontSize: '0.78rem' }}>{new Date(trip?.start_date).toLocaleDateString()} - {new Date(trip?.end_date).toLocaleDateString()}</p></div>
          </div>
          <div className="flex gap-sm">
            <Link to={`/budget/${tripId}`} className="btn btn-outline btn-sm">Budget Summary</Link>
            <Link to={`/itinerary-view/${tripId}`} className="btn btn-outline btn-sm">View Itinerary</Link>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard!', 'success'); }} className="btn btn-primary btn-sm"><ShareIcon /> Share Trip</button>
          </div>

        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 120px)' }}>
        <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: 'var(--space-lg)', overflowY: 'auto' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <span className="input-label" style={{ margin: 0 }}>Trip Stops</span>
            <button className="btn btn-ghost btn-icon-sm" onClick={() => setSearchModal('city')}><PlusIcon /></button>
          </div>
          {stops.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <button onClick={() => setActiveStopId(s.id)} style={{ flex: 1, background: activeStopId === s.id ? 'var(--bg-surface-alt)' : 'transparent', border: `1.5px solid ${activeStopId === s.id ? 'var(--primary)' : 'transparent'}`, borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                <div className="flex items-center gap-sm">
                  <span style={{ color: activeStopId === s.id ? 'var(--primary)' : 'var(--border)' }}><MapPinIcon /></span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.city_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(s.arrival_date).toLocaleDateString()}</div>
                  </div>
                </div>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button className="btn btn-ghost btn-icon-sm" onClick={() => moveStop(s.id, 'up')} style={{ padding: 4 }}><svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></button>
                <button className="btn btn-ghost btn-icon-sm" onClick={() => moveStop(s.id, 'down')} style={{ padding: 4 }}><svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => setSearchModal('city')} style={{ width: '100%', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <PlusIcon /> Quick Add Stop
            </button>
          </div>
        </aside>

        <main style={{ padding: 'var(--space-xl)', overflowY: 'auto', background: 'var(--bg-page)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-lg)' }}>
            <div><h2>{activeStop?.city_name} Itinerary</h2><p>Click to add activities to your day.</p></div>
            <button className="btn btn-primary" onClick={() => setSearchModal('activity')} disabled={!activeStopId}><PlusIcon /> Add Activity</button>
          </div>
          
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            {activities.length > 0 ? activities.map(act => (
              <div key={act.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.25rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <GripIcon />
                <div style={{ minWidth: 90, fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{act.scheduled_time?.slice(0, 5)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{act.activity_name}</div>
                  <span className={`tag ${catClass[act.category] || ''}`}>{act.category}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <CurrencyBadge amount={act.cost_estimate} country={country} size="md" />

                  <button className="btn btn-ghost btn-icon-sm"><MoreIcon /></button>
                </div>
              </div>
            )) : (
              <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                <h4 style={{ marginBottom: 8 }}>No activities yet for {activeStop?.city_name}</h4>
                <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setSearchModal('activity')} disabled={!activeStopId}><PlusIcon /> Add Activity</button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={searchModal === 'city'} onClose={() => setSearchModal(null)} title="Quick Add City" maxWidth="600px">
        <div className="input-icon-wrap" style={{ marginBottom: '1.25rem' }}>
          <span className="input-icon"><SearchIcon /></span>
          <input className="input-field" placeholder="Search for cities..." value={cityQ} onChange={e => setCityQ(e.target.value)} />
        </div>
        {CITY_RESULTS.filter(c => c.name.toLowerCase().includes(cityQ.toLowerCase())).map(city => (
          <div key={city.name} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{city.name}, {city.country}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost: {city.costIndex} &bull; Popularity: {city.popularity}%</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => handleAddStop(city)}>Add to Trip</button>
          </div>
        ))}
      </Modal>

      <Modal isOpen={searchModal === 'activity'} onClose={() => setSearchModal(null)} title="Quick Add Activity" maxWidth="600px">
        <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
          <div className="input-icon-wrap" style={{ flex: 1 }}>
            <span className="input-icon"><SearchIcon /></span>
            <input className="input-field" placeholder="Search activities..." value={actQ} onChange={e => setActQ(e.target.value)} />
          </div>
        </div>
        {ACT_RESULTS.filter(a => a.name.toLowerCase().includes(actQ.toLowerCase())).map(act => (
          <div key={act.name} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{act.name}</div>
              <div className="flex gap-sm">
                <span className={`tag ${catClass[act.category] || ''}`}>{act.category}</span>
                <span className="tag">{act.duration}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <CurrencyBadge amount={act.cost} country={country} size="sm" />

              <button className="btn btn-primary btn-sm" onClick={() => handleAddActivity(act)}>Add</button>
            </div>
          </div>
        ))}
      </Modal>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
