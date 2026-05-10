import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ChevronLeftIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const ClockIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PinIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const DollarIcon = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const ListIcon = () => <svg className="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const GridIcon = () => <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const ShareIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;

const STOPS = [
  {
    city: 'Paris', country: 'France', dates: '12 Jun – 18 Jun', color: '#6366f1',
    days: [
      { day: 1, date: 'Wed, 12 Jun', activities: [
        { time: '09:00 AM', name: 'Eiffel Tower Summit', category: 'sightseeing', cost: 45, duration: '2 hrs' },
        { time: '01:00 PM', name: 'Lunch at Le Meurice', category: 'dining', cost: 120, duration: '1.5 hrs' },
        { time: '04:00 PM', name: 'Louvre Museum', category: 'culture', cost: 20, duration: '3 hrs' },
      ]},
      { day: 2, date: 'Thu, 13 Jun', activities: [
        { time: '10:00 AM', name: 'Versailles Palace', category: 'sightseeing', cost: 55, duration: '4 hrs' },
        { time: '07:00 PM', name: 'Seine River Dinner Cruise', category: 'dining', cost: 95, duration: '2 hrs' },
      ]},
    ],
  },
  {
    city: 'London', country: 'United Kingdom', dates: '18 Jun – 25 Jun', color: '#14b8a6',
    days: [
      { day: 1, date: 'Tue, 18 Jun', activities: [
        { time: '09:30 AM', name: 'British Museum', category: 'culture', cost: 0, duration: '3 hrs' },
        { time: '02:00 PM', name: 'Tower of London', category: 'sightseeing', cost: 35, duration: '2 hrs' },
      ]},
    ],
  },
];

const CATEGORY_COLORS = {
  sightseeing: 'var(--primary)',
  dining: 'var(--secondary)',
  culture: '#8b5cf6',
  adventure: '#f43f5e',
  transport: '#f59e0b',
};

export default function ItineraryView() {
  const { id } = useParams();
  const [viewMode, setViewMode] = useState('list');
  const [activeStop, setActiveStop] = useState(0);
  const totalCost = STOPS.flatMap(s => s.days.flatMap(d => d.activities)).reduce((sum, a) => sum + a.cost, 0);
  const totalDays = 14;

  return (
    <>
      <Navbar />
      {/* ── Sub-header ───────────────────────────── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 90, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-sm">
          <Link to={`/itinerary/${id}`} className="btn btn-ghost btn-icon"><ChevronLeftIcon /></Link>
          <div>
            <h4 style={{ fontSize: '0.95rem' }}>Summer in Europe</h4>
            <p style={{ fontSize: '0.78rem' }}>12 Jun – 25 Jun 2024 &bull; {totalDays} days</p>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('list')} style={{ padding: '7px 14px', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.83rem', fontWeight: 600, transition: 'all 0.15s' }}>
              <ListIcon /> List
            </button>
            <button onClick={() => setViewMode('calendar')} style={{ padding: '7px 14px', background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent', color: viewMode === 'calendar' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.83rem', fontWeight: 600, transition: 'all 0.15s' }}>
              <GridIcon /> Calendar
            </button>
          </div>
          <Link to={`/shared/${id}`} className="btn btn-outline btn-sm"><ShareIcon /> Share</Link>
          <Link to={`/itinerary/${id}`} className="btn btn-primary btn-sm">Edit Itinerary</Link>
        </div>
      </div>

      {/* ── Summary Banner ───────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,var(--primary) 0%,#8b5cf6 60%,var(--secondary) 100%)', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: 6 }}>Summer in Europe</h2>
            <div className="flex items-center gap-md" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
              {STOPS.map(s => (
                <span key={s.city} className="flex items-center gap-xs"><PinIcon /> {s.city}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-md">
            {[
              { label: 'Cities', val: STOPS.length },
              { label: 'Days', val: totalDays },
              { label: 'Est. Cost', val: `$${totalCost.toLocaleString()}` },
              { label: 'Activities', val: STOPS.flatMap(s => s.days.flatMap(d => d.activities)).length },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>{stat.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 5%', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
        {/* ── Stop Navigation ──────────────────────── */}
        <aside style={{ position: 'sticky', top: 160 }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Trip Stops</h4>
          {STOPS.map((stop, i) => (
            <button key={stop.city} onClick={() => setActiveStop(i)} style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1rem', border: 'none', borderRadius: 'var(--radius-md)', marginBottom: 6, cursor: 'pointer', background: activeStop === i ? 'var(--primary-light)' : 'transparent', borderLeft: `4px solid ${activeStop === i ? 'var(--primary)' : 'transparent'}`, transition: 'all 0.15s' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: activeStop === i ? 'var(--primary)' : 'var(--text-main)' }}>{stop.city}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stop.country}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{stop.dates}</div>
            </button>
          ))}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center gap-xs" style={{ marginBottom: 6 }}>
              <DollarIcon /><span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Budget Summary</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>${totalCost.toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated total</div>
            <Link to={`/budget/${id}`} className="btn btn-outline w-full" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>Full Breakdown</Link>
          </div>
        </aside>

        {/* ── Main View ────────────────────────────── */}
        <main>
          {viewMode === 'list' && (
            <div>
              {STOPS[activeStop].days.map(day => (
                <div key={day.day} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                      {day.day}
                    </div>
                    <div>
                      <h4 style={{ margin: 0 }}>Day {day.day}</h4>
                      <p style={{ fontSize: '0.8rem', margin: 0 }}>{day.date}</p>
                    </div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1.5rem', marginLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {day.activities.map((act, ai) => (
                      <div key={ai} className="card" style={{ padding: '1rem 1.25rem', borderLeft: `4px solid ${CATEGORY_COLORS[act.category] || 'var(--primary)'}` }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-sm">
                              <span style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--primary)' }}>{act.time}</span>
                              <span style={{ padding: '2px 10px', background: `${CATEGORY_COLORS[act.category]}22`, color: CATEGORY_COLORS[act.category] || 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700 }}>{act.category}</span>
                            </div>
                            <h4 style={{ margin: '4px 0 2px' }}>{act.name}</h4>
                            <div className="flex items-center gap-sm" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-xs"><ClockIcon /> {act.duration}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: act.cost === 0 ? 'var(--secondary)' : 'var(--text-main)' }}>
                              {act.cost === 0 ? 'FREE' : `$${act.cost}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0', textAlign: 'right' }}>
                      Day total: <span style={{ color: 'var(--primary)' }}>${day.activities.reduce((s, a) => s + a.cost, 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="card">
              <h4 style={{ marginBottom: '1.25rem' }}>Calendar View — {STOPS[activeStop].city}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.5rem 0' }}>{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const hasActivity = STOPS[activeStop].days.some(d => d.day === (day % STOPS[activeStop].days.length + 1));
                  return (
                    <div key={day} style={{ aspectRatio: '1', background: hasActivity && day <= STOPS[activeStop].days.length ? 'var(--primary-light)' : 'var(--bg-surface-alt)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: hasActivity && day <= STOPS[activeStop].days.length ? 700 : 400, color: hasActivity && day <= STOPS[activeStop].days.length ? 'var(--primary)' : 'var(--text-muted)', border: `1px solid var(--border)` }}>
                      {day <= 28 ? day : ''}
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>Highlighted days have planned activities.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
