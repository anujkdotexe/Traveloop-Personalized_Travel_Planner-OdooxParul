import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import { formatCurrency } from '../utils/currency';

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const ShareIcon       = () => <svg className="icon" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
const PinIcon         = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon       = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const DollarIcon      = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const CATEGORY_COLORS = { Hotel: 'var(--primary)', Travel: 'var(--secondary)', Food: '#f59e0b', Activity: '#8b5cf6' };


export default function ItineraryView() {
  const { id } = useParams();
  const { token } = useAuth();
  const { showToast, toasts, dismissToast } = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStopId, setActiveStopId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
        if (json.data.stops.length > 0) setActiveStopId(json.data.stops[0].id);
      }
    } catch (err) {
      showToast('Failed to load itinerary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchTrip(); }, [id, token]);

  const activeStop = useMemo(() => data?.stops.find(s => s.id === activeStopId), [data, activeStopId]);
  const stopActivities = useMemo(() => activeStop?.activities || [], [activeStop]);
  
  const country = useMemo(() => activeStop?.country || data?.stops[0]?.country || 'India', [activeStop, data]);
  const format = (n) => formatCurrency(n, country);
  
  const totalCost = data?.stops?.reduce((sum, stop) =>
    sum + (stop.activities || []).reduce((s, a) => s + Number(a.cost_estimate || 0), 0), 0) || 0;
  
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copied to clipboard!', 'success'))
        .catch(() => { document.execCommand('copy'); showToast('Link copied!', 'success'); });
    } else {
      try {
        const el = document.createElement('textarea');
        el.value = url; document.body.appendChild(el);
        el.select(); document.execCommand('copy');
        document.body.removeChild(el);
        showToast('Link copied!', 'success');
      } catch { showToast('Could not copy link.', 'error'); }
    }
  };

  if (loading) return <div className="loading-center">Loading Itinerary...</div>;
  if (!data) return <div className="loading-center">Trip not found.</div>;

  return (
    <>
      <Navbar />
      <div className="no-print" style={{ position: 'sticky', top: 68, zIndex: 90, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-sm">
          <Link to="/trips" className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div>
            <h4 style={{ fontSize: '0.95rem' }}>{data.trip.title}</h4>
            <p style={{ fontSize: '0.78rem' }}>{new Date(data.trip.start_date).toLocaleDateString()} &mdash; {new Date(data.trip.end_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <div className="flex items-center gap-xs" style={{ marginRight: 8 }}>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('list')}>List</button>
            <button className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('calendar')}>Calendar</button>
          </div>
          <button onClick={handleShare} className="btn btn-outline btn-sm"><ShareIcon /> Share</button>
          <button onClick={() => window.print()} className="btn btn-outline btn-sm">Download Itinerary (PDF)</button>

          <Link to={`/itinerary/${id}`} className="btn btn-primary btn-sm">Edit Itinerary</Link>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,var(--primary) 0%,#8b5cf6 60%,var(--secondary) 100%)', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: 6 }}>{data.trip.title}</h2>
            <div className="flex items-center gap-md" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
              {data.stops.slice(0, 3).map(s => (
                <span key={s.id} className="flex items-center gap-xs"><PinIcon /> {s.city_name}</span>
              ))}
              {data.stops.length > 3 && <span>+ {data.stops.length - 3} more</span>}
            </div>
          </div>
          <div className="flex gap-md">
            {[
              { label: 'Destinations', val: data.stops.length },
              { label: 'Est. Budget', val: format(totalCost) },
              { label: 'Activities', val: data.stops.reduce((s, stop) => s + (stop.activities?.length || 0), 0) },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>{stat.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 5%', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
        <aside style={{ position: 'sticky', top: 160 }} className="no-print">
          <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Trip Stops</h4>
          {data.stops.map((stop) => (
            <button key={stop.id} onClick={() => setActiveStopId(stop.id)} style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1rem', border: 'none', borderRadius: 'var(--radius-md)', marginBottom: 6, cursor: 'pointer', background: activeStopId === stop.id ? 'var(--primary-light)' : 'transparent', borderLeft: `4px solid ${activeStopId === stop.id ? 'var(--primary)' : 'transparent'}`, transition: 'all 0.15s' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: activeStopId === stop.id ? 'var(--primary)' : 'var(--text-main)' }}>{stop.city_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stop.country}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(stop.arrival_date).toLocaleDateString()} &mdash; {new Date(stop.departure_date).toLocaleDateString()}</div>
            </button>
          ))}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-xs" style={{ marginBottom: 6 }}>
              <DollarIcon /><span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Financials</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{format(totalCost)}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated activities cost.</p>
            <Link to={`/budget/${id}`} className="btn btn-outline w-full" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>Detailed Budget</Link>
          </div>
        </aside>

        <main id="printable-itinerary">
          {viewMode === 'list' ? (
            <>
              <div className="flex items-center gap-sm mb-lg">
                <h3 style={{ margin: 0 }}>{activeStop?.city_name} Plan</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stopActivities.length} activities scheduled</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stopActivities.map((act) => (
                  <div key={act.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${CATEGORY_COLORS[act.category] || 'var(--primary)'}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-sm">
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{act.scheduled_time || 'No Time'}</span>
                          <span style={{ padding: '2px 10px', background: `${CATEGORY_COLORS[act.category] || 'var(--primary)'}22`, color: CATEGORY_COLORS[act.category] || 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700 }}>{act.category || 'General'}</span>
                        </div>
                        <h4 style={{ margin: '6px 0 4px' }}>{act.activity_name}</h4>
                        {act.duration_minutes && (
                          <div className="flex items-center gap-xs" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <ClockIcon /> {act.duration_minutes} mins
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                          {Number(act.cost_estimate) === 0 ? 'FREE' : format(act.cost_estimate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {stopActivities.length === 0 && (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No activities planned for this stop yet.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-sm mb-lg">
                <h3 style={{ margin: 0 }}>Calendar View</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{data.stops.length} stops in this trip</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.stops.map((stop) => (
                  <div key={stop.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${stop.id === activeStopId ? 'var(--primary)' : 'var(--border)'}` }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ marginBottom: 4 }}>{stop.city_name}</h4>
                        <p style={{ fontSize: '0.85rem' }}>{stop.country}</p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div>{new Date(stop.arrival_date).toLocaleDateString()} - {new Date(stop.departure_date).toLocaleDateString()}</div>
                        <div style={{ marginTop: 4 }}>{stop.activities?.length || 0} activities</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(stop.activities || []).map(act => (
                        <div key={act.id} className="flex justify-between items-center" style={{ padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-alt)' }}>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>{act.activity_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{act.scheduled_time || 'No time'} &bull; {act.category || 'General'}</div>
                          </div>
                          <div style={{ fontWeight: 800 }}>{Number(act.cost_estimate) === 0 ? 'FREE' : format(act.cost_estimate)}</div>
                        </div>
                      ))}
                      {(stop.activities || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activities planned for this stop yet.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

