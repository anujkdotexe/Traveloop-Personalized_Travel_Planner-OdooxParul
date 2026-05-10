import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SearchIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const PlusIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EyeIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const CalIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const mockTrips = [
  { id: 1, name: 'Summer in Europe', dates: 'Jun 12 - Jun 25, 2024', cities: 3, status: 'ongoing', cover: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=120&q=80' },
  { id: 2, name: 'Japan Adventure', dates: 'Sep 10 - Sep 24, 2024', cities: 4, status: 'upcoming', cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=120&q=80' },
  { id: 3, name: 'Winter in Dubai', dates: 'Dec 20 - Dec 28, 2023', cities: 1, status: 'completed', cover: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=120&q=80' },
];

export default function MyTrips() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const tabs = ['all', 'ongoing', 'upcoming', 'completed'];
  const filtered = mockTrips.filter(t => (activeTab === 'all' || t.status === activeTab) && t.name.toLowerCase().includes(search.toLowerCase()));

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
          <select className="input-field" style={{ width: 'auto', minWidth: 130 }}><option>Group by</option><option>Status</option><option>Date</option></select>
          <select className="input-field" style={{ width: 'auto', minWidth: 100 }}><option>Filter</option></select>
          <select className="input-field" style={{ width: 'auto', minWidth: 120 }}><option>Sort by</option><option>Name</option><option>Date</option></select>
        </div>
        <div className="tabs">
          {tabs.map(tab => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.length === 0 && (
            <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
              <p>No trips found. Start planning your next adventure!</p>
            </div>
          )}
          {filtered.map(trip => (
            <div key={trip.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)' }}>
              <img src={trip.cover} alt={trip.name} style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-sm" style={{ marginBottom: 6 }}>
                  <h4>{trip.name}</h4>
                  <span className={`badge badge-${trip.status}`}>{trip.status}</span>
                </div>
                <div className="flex items-center gap-lg" style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                  <span className="flex items-center gap-xs"><CalIcon /> {trip.dates}</span>
                  <span className="flex items-center gap-xs"><PinIcon /> {trip.cities} cities</span>
                </div>
              </div>
              <div className="flex gap-sm">
                <Link to={`/itinerary/${trip.id}`} className="btn btn-primary btn-sm"><EyeIcon /> View</Link>
                <button className="btn btn-outline btn-icon-sm"><EditIcon /></button>
                <button className="btn btn-danger btn-icon-sm"><TrashIcon /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
