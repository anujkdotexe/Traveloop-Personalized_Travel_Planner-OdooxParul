import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Chart from 'chart.js/auto';

const UsersIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MapIcon = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const TrendIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>;
const ActivityIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

const KPI = ({ label, value, delta, icon: Icon, color }) => (
  <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="flex items-center gap-sm" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
      <Icon /><span className="input-label" style={{ margin: 0 }}>{label}</span>
    </div>
    <h2>{value}</h2>
    {delta && <p style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 700, marginTop: 4 }}>{delta}</p>}
  </div>
);
const topCities = [
  { name: 'Paris, France', count: 842 },
  { name: 'Tokyo, Japan', count: 715 },
  { name: 'Rome, Italy', count: 642 },
  { name: 'Bangkok, Thailand', count: 524 },
  { name: 'Barcelona, Spain', count: 488 },
];
const users = [
  { name: 'Priya Sharma', email: 'priya@example.com', trips: 8, joined: 'Jan 2024' },
  { name: 'Marco Rossi', email: 'marco@example.com', trips: 5, joined: 'Feb 2024' },
  { name: 'Yuki Tanaka', email: 'yuki@example.com', trips: 12, joined: 'Mar 2024' },
];

export default function Admin() {
  const lineRef = useRef(null);
  const pieRef = useRef(null);

  useEffect(() => {
    const line = new Chart(lineRef.current, {
      type: 'line',
      data: { labels: ['Jan','Feb','Mar','Apr','May','Jun'], datasets: [{ label: 'New Users', data: [1200,1900,3000,3500,4800,5200], borderColor: '#6366F1', backgroundColor: 'rgba(99,102,241,0.06)', tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#fff', pointBorderColor: '#6366F1', pointBorderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { borderDash: [4,4] } } } },
    });
    const pie = new Chart(pieRef.current, {
      type: 'doughnut',
      data: { labels: ['Sightseeing','Dining','Adventure','Transport'], datasets: [{ data: [40,30,20,10], backgroundColor: ['#6366f1','#14b8a6','#f43f5e','#f59e0b'], borderWidth: 0, hoverOffset: 10 }] },
      options: { plugins: { legend: { position: 'bottom' } }, cutout: '65%', responsive: true },
    });
    return () => { line.destroy(); pie.destroy(); };
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="mb-lg"><h1>Admin Dashboard</h1><p>Platform-wide analytics and user management tools.</p></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem', marginBottom: 'var(--space-xl)' }}>
          <KPI label="Total Users" value="12,840" delta="+12% this week" icon={UsersIcon} color="var(--primary)" />
          <KPI label="Active Trips" value="4,215" delta="+8% this week" icon={MapIcon} color="var(--secondary)" />
          <KPI label="Shared Itineraries" value="1,052" delta="Stable" icon={TrendIcon} color="var(--accent)" />
          <KPI label="Activities Logged" value="38,940" delta="+4% this week" icon={ActivityIcon} color="var(--warning)" />
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <div className="card"><h3 style={{ marginBottom: '1.5rem' }}>User Growth Trend</h3><div style={{ height: 300 }}><canvas ref={lineRef} /></div></div>
          <div className="card"><h3 style={{ marginBottom: '1.5rem' }}>Activity Types</h3><div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={pieRef} /></div></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-lg)' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Popular Destinations</h3>
            {topCities.map((city, i) => (
              <div key={city.name} className="flex justify-between items-center" style={{ padding: '0.9rem 0', borderBottom: i < topCities.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center gap-md">
                  <span style={{ width: 28, height: 28, background: 'var(--bg-surface-alt)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{city.count.toLocaleString()} trips</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3>User Management</h3>
              <span className="badge badge-upcoming">{users.length} shown</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-surface-alt)' }}>
                <tr>{['Name','Email','Trips','Joined','Action'].map(h => <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.email}</td>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700 }}>{u.trips}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.joined}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}><button className="btn btn-danger btn-sm">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
