import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MapPinIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ShareIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const MoreIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
const GripIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>;

const STOPS = [
  { id: 1, city: 'Paris', country: 'France', arrival: '12 Jun', departure: '18 Jun' },
  { id: 2, city: 'London', country: 'UK', arrival: '18 Jun', departure: '25 Jun' },
];
const ACTIVITIES = {
  1: [
    { id: 1, day: 1, date: 'Wed, Jun 12', time: '09:00 AM', name: 'Eiffel Tower Summit', category: 'sightseeing', cost: 45 },
    { id: 2, day: 1, date: 'Wed, Jun 12', time: '01:00 PM', name: 'Lunch at Le Meurice', category: 'dining', cost: 120 },
    { id: 3, day: 2, date: 'Thu, Jun 13', time: '10:00 AM', name: 'Louvre Museum', category: 'sightseeing', cost: 20 },
  ],
};
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
  const [activeStop, setActiveStop] = useState(1);
  const [searchModal, setSearchModal] = useState(null);
  const [cityQ, setCityQ] = useState('');
  const [actQ, setActQ] = useState('');
  const acts = ACTIVITIES[activeStop] || [];
  const days = [...new Set(acts.map(a => a.day))];

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 5%' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-md">
            <Link to="/trips" className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
            <div><h4 style={{ fontSize: '1rem', margin: 0 }}>Summer in Europe</h4><p style={{ fontSize: '0.78rem' }}>12 Jun - 25 Jun 2024</p></div>
          </div>
          <div className="flex gap-sm">
            <Link to="/budget/1" className="btn btn-outline btn-sm">Budget Summary</Link>
            <Link to="/shared/1" className="btn btn-primary btn-sm"><ShareIcon /> Share Trip</Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 120px)' }}>
        <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: 'var(--space-lg)', overflowY: 'auto' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <span className="input-label" style={{ margin: 0 }}>Trip Stops</span>
            <button className="btn btn-ghost btn-icon-sm" onClick={() => setSearchModal('city')}><PlusIcon /></button>
          </div>
          {STOPS.map(s => (
            <button key={s.id} onClick={() => setActiveStop(s.id)} style={{ width: '100%', background: activeStop === s.id ? 'var(--bg-surface-alt)' : 'transparent', border: `1.5px solid ${activeStop === s.id ? 'var(--primary)' : 'transparent'}`, borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div className="flex items-center gap-sm">
                <span style={{ color: activeStop === s.id ? 'var(--primary)' : 'var(--border)' }}><MapPinIcon /></span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.city}, {s.country}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.arrival} &mdash; {s.departure}</div>
                </div>
              </div>
            </button>
          ))}
          <button onClick={() => setSearchModal('city')} style={{ width: '100%', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <PlusIcon /> Add Another Stop
          </button>
        </aside>

        <main style={{ padding: 'var(--space-xl)', overflowY: 'auto', background: 'var(--bg-page)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-lg)' }}>
            <div><h2>{STOPS.find(s => s.id === activeStop)?.city} Itinerary</h2><p>Drag to reorder. Click to edit.</p></div>
            <button className="btn btn-primary" onClick={() => setSearchModal('activity')}><PlusIcon /> Add Activity</button>
          </div>
          {days.map(day => (
            <div key={day} style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="day-divider">
                <div className="day-divider-line" /><span className="day-divider-label">Day {day} &mdash; {acts.find(a => a.day === day)?.date}</span><div className="day-divider-line" />
              </div>
              {acts.filter(a => a.day === day).map(act => (
                <div key={act.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.25rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'grab' }}>
                  <GripIcon />
                  <div style={{ minWidth: 90, fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{act.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{act.name}</div>
                    <span className={`tag ${catClass[act.category] || ''}`}>{act.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>${act.cost}</div>
                    <button className="btn btn-ghost btn-icon-sm"><MoreIcon /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => setSearchModal('activity')} style={{ width: '100%', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>+ Add activity for this day</button>
            </div>
          ))}
          {days.length === 0 && (
            <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
              <h4 style={{ marginBottom: 8 }}>No activities yet</h4>
              <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setSearchModal('activity')}><PlusIcon /> Add Activity</button>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={searchModal === 'city'} onClose={() => setSearchModal(null)} title="Search City" maxWidth="600px">
        <div className="input-icon-wrap" style={{ marginBottom: '1.25rem' }}>
          <span className="input-icon"><SearchIcon /></span>
          <input className="input-field" placeholder="Search for cities..." value={cityQ} onChange={e => setCityQ(e.target.value)} />
        </div>
        <div className="input-group">
          <select className="input-field"><option>Filter by Region</option><option>Europe</option><option>Asia</option><option>Americas</option></select>
        </div>
        {CITY_RESULTS.filter(c => c.name.toLowerCase().includes(cityQ.toLowerCase())).map(city => (
          <div key={city.name} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{city.name}, {city.country}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost: {city.costIndex} &bull; Popularity: {city.popularity}%</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setSearchModal(null)}>Add to Trip</button>
          </div>
        ))}
      </Modal>

      <Modal isOpen={searchModal === 'activity'} onClose={() => setSearchModal(null)} title="Search Activity" maxWidth="600px">
        <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
          <div className="input-icon-wrap" style={{ flex: 1 }}>
            <span className="input-icon"><SearchIcon /></span>
            <input className="input-field" placeholder="Search activities..." value={actQ} onChange={e => setActQ(e.target.value)} />
          </div>
          <select className="input-field" style={{ width: 'auto' }}><option>All Types</option><option>Sightseeing</option><option>Dining</option><option>Adventure</option></select>
        </div>
        {ACT_RESULTS.filter(a => a.name.toLowerCase().includes(actQ.toLowerCase())).map(act => (
          <div key={act.name} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{act.name}</div>
              <div className="flex gap-sm">
                <span className={`tag ${catClass[act.category] || ''}`}>{act.category}</span>
                <span className="tag">{act.duration}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${act.cost}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setSearchModal(null)}>Add</button>
          </div>
        ))}
      </Modal>
    </>
  );
}
