import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Chart from 'chart.js/auto';
import { useAuth } from '../context/AuthContext';

const UsersIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MapIcon      = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const TrendIcon    = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>;
const ActivityIcon = () => <svg className="icon" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const GlobeIcon    = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const ChartIcon    = () => <svg className="icon" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ShieldIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ArrowIcon     = () => <svg className="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const LockIcon      = () => <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const KPI = ({ label, value, delta, icon: Icon, color }) => (
  <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="flex items-center gap-sm" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
      <Icon /><span className="input-label" style={{ margin: 0 }}>{label}</span>
    </div>
    <h2>{value}</h2>
    {delta && <p style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 700, marginTop: 4 }}>{delta}</p>}
  </div>
);

export default function Admin() {
  const { token } = useAuth();
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const lineChart = useRef(null);
  const pieChart = useRef(null);
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const totalUsers = stats?.total_users ?? 0;
  const totalTrips = stats?.total_trips ?? 0;
  const publicTrips = stats?.public_trips ?? 0;
  const totalActivities = stats?.total_activities ?? 0;
  const adminShare = totalUsers ? Math.round(((users.filter(u => u.role === 'admin').length) / totalUsers) * 100) : 0;
  const moderationLoad = totalTrips ? Math.max(0, Math.round((publicTrips / totalTrips) * 100)) : 0;

  const fetchData = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const sData = await sRes.json();
      const uData = await uRes.json();
      
      if (sData.status === 'success') setStats(sData.data);
      if (uData.status === 'success') setUsers(uData.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!stats || !lineRef.current || !pieRef.current) return;

    if (lineChart.current) lineChart.current.destroy();
    if (pieChart.current) pieChart.current.destroy();

    const growthLabels = stats?.user_growth?.map(g => g.month) || [];
    const growthData = stats?.user_growth?.map(g => g.count) || [];
    const catLabels = stats?.categories?.map(c => c.category || 'Other') || [];
    const catData = stats?.categories?.map(c => c.count) || [];

    lineChart.current = new Chart(lineRef.current, {
      type: 'line',
      data: { 
        labels: growthLabels, 
        datasets: [{ 
          label: 'New Users', 
          data: growthData, 
          borderColor: '#6366F1', 
          backgroundColor: 'rgba(99,102,241,0.06)', 
          tension: 0.4, 
          fill: true, 
          pointRadius: 5, 
          pointBackgroundColor: '#fff', 
          pointBorderColor: '#6366F1', 
          pointBorderWidth: 2 
        }] 
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { borderDash: [4,4] } } } },
    });

    pieChart.current = new Chart(pieRef.current, {
      type: 'doughnut',
      data: { 
        labels: catLabels, 
        datasets: [{ 
          data: catData, 
          backgroundColor: ['#6366f1','#14b8a6','#f43f5e','#f59e0b','#8b5cf6','#10b981'], 
          borderWidth: 0, 
          hoverOffset: 10 
        }] 
      },
      options: { plugins: { legend: { position: 'bottom' } }, cutout: '65%', responsive: true },
    });

    return () => {
      if (lineChart.current) lineChart.current.destroy();
      if (pieChart.current) pieChart.current.destroy();
    };
  }, [stats]);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const updateTrip = async (tripId, payload) => {
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setUserTrips(prev => prev.map(t => t.id === tripId ? updated.data : t));
      }
    } catch (err) {
      console.error('Trip moderation failed.', err);
    }
  };

  const removeTrip = async (tripId) => {
    if (!window.confirm('Delete this trip permanently?')) return;
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUserTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (err) {
      console.error('Trip delete failed.', err);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
      }
    } catch (err) { console.error('Update failed.', err); }
  };

  const toggleRole = async (id, current) => {
    const next = current === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: next })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: next } : u));
      }
    } catch (err) { console.error('Update failed.', err); }
  };

  const fetchUserTrips = async (user) => {
    setSelectedUser(user);
    setLoadingTrips(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/trips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setUserTrips(data.data);
    } catch (err) {
      console.error('Failed to fetch user trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 1440 }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #111827 45%, #1d4ed8 100%)', color: '#fff', borderRadius: '28px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 30px 60px rgba(15,23,42,0.25)' }}>
          <div className="flex justify-between items-start" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 760 }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.12)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  <ShieldIcon /> Admin Command Center
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, background: 'rgba(20,184,166,0.18)', color: '#a7f3d0', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Live moderation
                </span>
              </div>
              <h1 style={{ color: '#fff', marginBottom: 10 }}>Admin Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 680, fontSize: '1.02rem' }}>
                Platform control room for moderation, user governance, and travel intelligence. This view is intentionally separate from the regular traveler experience.
              </p>
            </div>
            <div className="card" style={{ minWidth: 300, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: 12 }}><LockIcon /><strong>Admin-only access</strong></div>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', marginBottom: 14 }}>All moderation and role controls are reserved for verified admins.</p>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                <Link to="/trips" className="btn btn-outline btn-sm" style={{ background: '#fff', color: 'var(--text-main)', borderColor: '#fff' }}>Open trips</Link>
                <Link to="/community" className="btn btn-outline btn-sm" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}>Review public feed</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ background: 'linear-gradient(180deg, var(--bg-surface), #f8fbff)', borderLeft: '4px solid var(--primary)' }}>
            <div className="flex items-center gap-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}><UsersIcon /><strong>Users</strong></div>
            <h2>{totalUsers.toLocaleString()}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{users.filter(u => u.role === 'admin').length} admins, {users.filter(u => u.role !== 'admin').length} travelers</p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(180deg, var(--bg-surface), #f8fffe)', borderLeft: '4px solid var(--secondary)' }}>
            <div className="flex items-center gap-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}><MapIcon /><strong>Trips</strong></div>
            <h2>{totalTrips.toLocaleString()}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{publicTrips.toLocaleString()} public, {Math.max(0, totalTrips - publicTrips).toLocaleString()} private</p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(180deg, var(--bg-surface), #fff8f8)', borderLeft: '4px solid var(--accent)' }}>
            <div className="flex items-center gap-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}><ActivityIcon /><strong>Activities</strong></div>
            <h2>{totalActivities.toLocaleString()}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Moderation load: {moderationLoad}% public exposure</p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(180deg, var(--bg-surface), #f8fbff)', borderLeft: '4px solid var(--warning)' }}>
            <div className="flex items-center gap-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}><ShieldIcon /><strong>Admin share</strong></div>
            <h2>{adminShare}%</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verified operators in the account base</p>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.15fr 0.85fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ borderRadius: '22px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: 6 }}>Platform posture</h3>
                <p style={{ fontSize: '0.85rem' }}>Key trends and moderation health at a glance.</p>
              </div>
              <span className="badge badge-ongoing">operational</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.9rem' }}>
              <div style={{ padding: '1rem', borderRadius: '16px', background: 'var(--bg-surface-alt)' }}>
                <div className="flex items-center gap-xs" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}><TrendIcon /> User growth</div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{stats ? `${stats.user_change >= 0 ? '+' : ''}${stats.user_change}%` : '—'}</div>
                <p style={{ fontSize: '0.78rem' }}>vs last month</p>
              </div>
              <div style={{ padding: '1rem', borderRadius: '16px', background: 'var(--bg-surface-alt)' }}>
                <div className="flex items-center gap-xs" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}><ArrowIcon /> Trip growth</div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>{stats ? `${stats.trip_change >= 0 ? '+' : ''}${stats.trip_change}%` : '—'}</div>
                <p style={{ fontSize: '0.78rem' }}>vs last month</p>
              </div>
              <div style={{ padding: '1rem', borderRadius: '16px', background: 'var(--bg-surface-alt)' }}>
                <div className="flex items-center gap-xs" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}><GlobeIcon /> Public reach</div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)' }}>{totalTrips ? `${Math.round((publicTrips / totalTrips) * 100)}%` : '—'}</div>
                <p style={{ fontSize: '0.78rem' }}>of trips visible in the feed</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ borderRadius: '22px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Quick actions</h3>
            <div className="flex" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/community" className="btn btn-outline" style={{ justifyContent: 'space-between' }}><span className="flex items-center gap-sm"><GlobeIcon /> Open community</span><ArrowIcon /></Link>
              <Link to="/trips" className="btn btn-outline" style={{ justifyContent: 'space-between' }}><span className="flex items-center gap-sm"><MapIcon /> Review traveler trips</span><ArrowIcon /></Link>
              <button onClick={() => fetchData()} className="btn btn-primary" style={{ justifyContent: 'space-between' }}><span className="flex items-center gap-sm"><TrendIcon /> Refresh analytics</span><ArrowIcon /></button>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.05fr 1.35fr', gap: '1.5rem' }}>
          <div className="card" style={{ borderRadius: '22px' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>User Growth Trend</h3>
            <div style={{ height: 300 }}><canvas ref={lineRef} /></div>
          </div>
          <div className="card" style={{ borderRadius: '22px' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Activity Categories</h3>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={pieRef} /></div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '0.95fr 1.5fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="card" style={{ borderRadius: '22px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h3>Top Destinations</h3>
              <span className="badge badge-upcoming">{stats?.top_cities?.length || 0} hotspots</span>
            </div>
            {(stats?.top_cities || []).map((city, i) => (
              <div key={i} className="flex justify-between items-center" style={{ padding: '0.95rem 0', borderBottom: i < (stats?.top_cities?.length || 0) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center gap-md">
                  <span style={{ width: 28, height: 28, background: 'var(--bg-surface-alt)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(i+1).padStart(2,'0')}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{city.city_name}, {city.country}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{city.trip_count} trips planned</div>
                  </div>
                </div>
              </div>
            ))}
            {!stats?.top_cities?.length && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No destination analytics yet.</p>}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '22px' }}>
            <div className="flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--bg-surface-alt), #fff)' }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>User Governance</h3>
                <p style={{ fontSize: '0.82rem' }}>Roles, status, and trip access controls.</p>
              </div>
              <span className="badge badge-ongoing">{users.length} accounts</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-surface-alt)' }}>
                  <tr>{['Name','Email','Role','Status','Trips','Joined','Action'].map(h => <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, fontSize: '0.88rem' }}>
                        <span onClick={() => fetchUserTrips(u)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>{u.name}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.email}</td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span onClick={() => toggleRole(u.id, u.role)} style={{ cursor: 'pointer', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: u.role === 'admin' ? 'var(--primary-light)' : 'var(--bg-surface-alt)', color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span onClick={() => toggleStatus(u.id)} style={{ cursor: 'pointer', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: u.is_active ? 'var(--secondary-light)' : 'var(--accent-light)', color: u.is_active ? 'var(--secondary)' : 'var(--accent)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{u.is_active ? 'Active' : 'Banned'}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700 }}>{u.trip_count}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <button onClick={() => deleteUser(u.id)} className="btn btn-danger btn-sm">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`${selectedUser?.name}'s Trips`} maxWidth="700px">
        {loadingTrips ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading trips...</div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-surface-alt)' }}>
                <tr>{['Title', 'Dates', 'Stops', 'Status'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {userTrips.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>{t.title}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.stop_count}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div className="flex items-center gap-xs" style={{ flexWrap: 'wrap' }}>
                        <span className="badge badge-ongoing" style={{ fontSize: '0.65rem' }}>{t.status}</span>
                        <button className="btn btn-outline btn-sm" onClick={() => updateTrip(t.id, { is_public: !t.is_public })}>
                          {t.is_public ? 'Make Private' : 'Make Public'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeTrip(t.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {userTrips.length === 0 && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No trips found for this user.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
