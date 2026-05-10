import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Chart from 'chart.js/auto';
import { useAuth } from '../context/AuthContext';

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
      <div className="page-container">
        <div className="mb-lg">
          <h1>Admin Dashboard</h1>
          <p>Real-time platform analytics and user management.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem', marginBottom: 'var(--space-xl)' }}>
          <KPI label="Total Users" value={stats?.total_users.toLocaleString()} delta={`${stats?.user_change >= 0 ? '+' : ''}${stats?.user_change}% vs last month`} icon={UsersIcon} color="var(--primary)" />
          <KPI label="Active Trips" value={stats?.total_trips.toLocaleString()} delta={`${stats?.trip_change >= 0 ? '+' : ''}${stats?.trip_change}% vs last month`} icon={MapIcon} color="var(--secondary)" />
          <KPI label="Public Itineraries" value={stats?.public_trips.toLocaleString()} icon={GlobeIcon} color="var(--accent)" />
          <KPI label="Planned Activities" value={stats?.total_activities.toLocaleString()} icon={ChartIcon} color="var(--success)" />
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>User Growth Trend</h3>
            <div style={{ height: 300 }}><canvas ref={lineRef} /></div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Activity Categories</h3>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={pieRef} /></div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-lg)' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Top Destinations</h3>
            {stats?.top_cities.map((city, i) => (
              <div key={i} className="flex justify-between items-center" style={{ padding: '0.9rem 0', borderBottom: i < stats.top_cities.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center gap-md">
                  <span style={{ width: 28, height: 28, background: 'var(--bg-surface-alt)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.city_name}, {city.country}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{city.trip_count} trips</span>
              </div>
            ))}
          </div>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3>User Management</h3>
              <span className="badge badge-ongoing">{users.length} total</span>
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
                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-ongoing" style={{ fontSize: '0.65rem' }}>{t.status}</span></td>
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
