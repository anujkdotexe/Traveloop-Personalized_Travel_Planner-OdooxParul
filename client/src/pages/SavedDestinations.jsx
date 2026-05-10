import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';

const HeartIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const MapPinIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const TrashIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export default function SavedDestinations() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ destination_name: '', country: '', image_url: '' });

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/saved-destinations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSaved(d.data); })
      .catch(() => showToast('Failed to load saved destinations.', 'error'))
      .finally(() => setLoading(false));
  }, [token]);

  const addSaved = async (e) => {
    e.preventDefault();
    if (!form.destination_name.trim() || !form.country.trim()) return;
    try {
      const res = await fetch('/api/auth/saved-destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(prev => [data.data, ...prev]);
        setForm({ destination_name: '', country: '', image_url: '' });
        showToast('Destination saved.', 'success');
      } else {
        showToast(data.message || 'Failed to save destination.', 'error');
      }
    } catch {
      showToast('Failed to save destination.', 'error');
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`/api/auth/saved-destinations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSaved(prev => prev.filter(s => s.id !== id));
        showToast('Removed from saved destinations.', 'success');
      }
    } catch {
      showToast('Failed to remove destination.', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="mb-lg">
          <h1>Saved Destinations</h1>
          <p>Places you're dreaming of visiting.</p>
        </div>

        <form className="card" onSubmit={addSaved} style={{ marginBottom: '1.5rem' }}>
          <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 1.2fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Destination</label>
              <input className="input-field" value={form.destination_name} onChange={e => setForm(p => ({ ...p, destination_name: e.target.value }))} placeholder="e.g. Kyoto" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Country</label>
              <input className="input-field" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Japan" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Image URL</label>
              <input className="input-field" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <button className="btn btn-primary" type="submit">Save</button>
          </div>
        </form>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {saved.map(d => (
              <div key={d.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 180, backgroundImage: `url(${d.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => remove(d.id)} className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><TrashIcon /></button>
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div className="flex items-center gap-xs" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>
                    <MapPinIcon /> {d.country}
                  </div>
                  <h3 style={{ marginBottom: '1rem' }}>{d.destination_name}</h3>
                  <button className="btn btn-primary w-full btn-sm" onClick={() => navigate('/create-trip')}>Plan a Trip</button>
                </div>
              </div>
            ))}
            {saved.length === 0 && (
              <div className="card text-center" style={{ gridColumn: '1/-1', padding: '4rem' }}>
                <div style={{ color: 'var(--border)', marginBottom: '1rem' }}><HeartIcon /></div>
                <h3>No saved destinations</h3>
                <p>Add a destination above to start saving places you want to visit.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
