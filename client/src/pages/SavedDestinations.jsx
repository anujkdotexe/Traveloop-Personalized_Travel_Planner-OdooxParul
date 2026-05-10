import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast, ToastContainer } from '../components/Toast';

const HeartIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const MapPinIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const TrashIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export default function SavedDestinations() {
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();
  const [saved, setSaved] = useState([
    { id: 1, name: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d8a?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Rome', country: 'Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' }
  ]);

  const remove = (id) => {
    setSaved(prev => prev.filter(s => s.id !== id));
    showToast('Removed from saved destinations.', 'success');
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="mb-lg">
          <h1>Saved Destinations</h1>
          <p>Places you're dreaming of visiting.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
          {saved.map(d => (
            <div key={d.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 180, backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => remove(d.id)} className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><TrashIcon /></button>
                </div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div className="flex items-center gap-xs" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>
                  <MapPinIcon /> {d.country}
                </div>
                <h3 style={{ marginBottom: '1rem' }}>{d.name}</h3>
                <button className="btn btn-primary w-full btn-sm" onClick={() => navigate('/create-trip')}>Plan a Trip</button>
              </div>
            </div>
          ))}
          {saved.length === 0 && (
            <div className="card text-center" style={{ gridColumn: '1/-1', padding: '4rem' }}>
              <div style={{ color: 'var(--border)', marginBottom: '1rem' }}><HeartIcon /></div>
              <h3>No saved destinations</h3>
              <p>Explore the community to find inspiration.</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
