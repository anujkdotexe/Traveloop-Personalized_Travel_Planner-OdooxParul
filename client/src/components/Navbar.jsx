import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dropdown from './Dropdown';

/* ... icons ... */

/* ── Avatar component ───────────────────────────────────────────────────────── */
function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const colors = ['#6366f1','#8b5cf6','#14b8a6','#f43f5e','#f59e0b','#10b981'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: colors[colorIndex], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.35, flexShrink: 0, letterSpacing: '-0.03em', userSelect: 'none' }}>
      {initials}
    </div>
  );
}

/* ── Account dropdown ───────────────────────────────────────────────────────── */
function AccountDropdown({ user, isAdmin, onLogout }) {
  const navigate = useNavigate();

  const menuSections = [
    {
      items: [
        { icon: <UserIcon />,      label: 'My Profile',          path: '/profile' },
        { icon: <BookmarkIcon />,  label: 'Saved Destinations',  path: '/profile' },
        { icon: <BriefcaseIcon />, label: 'My Trips',            path: '/trips' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { icon: <GlobeIcon />,    label: 'Explore Community',  path: '/community' },
        { icon: <PlusIcon />,     label: 'Plan New Trip',      path: '/create-trip' },
      ],
    },
    ...(isAdmin ? [{ label: 'Admin', items: [{ icon: <ShieldIcon />, label: 'Admin Dashboard', path: '/admin' }] }] : []),
    {
      items: [
        { icon: <SettingsIcon />, label: 'Settings',           path: '/profile' },
        { icon: <HelpIcon />,     label: 'Help & Support',     path: '/community' },
      ],
    },
  ];

  return (
    <Dropdown
      width="256px"
      trigger={(open) => (
        <button
          title="Account menu"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: open ? 'var(--primary-light)' : 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Avatar name={user?.name} size={32} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronIcon />
          </span>
        </button>
      )}
    >
      {(close) => (
        <>
          <div style={{ padding: '1.1rem 1.25rem', background: 'linear-gradient(135deg,var(--primary-light),var(--secondary-light))', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-sm">
              <Avatar name={user?.name} size={40} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {menuSections.map((section, si) => (
              <div key={si}>
                {si > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0.35rem 0' }} />}
                {section.label && <div style={{ padding: '0.3rem 1.25rem 0.1rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{section.label}</div>}
                {section.items.map(item => (
                  <button key={item.label} onClick={() => { close(); navigate(item.path); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit', transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-alt)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '0.35rem 0' }} />
            <button onClick={() => { close(); onLogout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <LogOutIcon /> Sign Out
            </button>
          </div>
        </>
      )}
    </Dropdown>
  );
}

/* ── Notification bell with badge ───────────────────────────────────────────── */
function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const { token } = useAuth();

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) fetchNotifs();
    const interval = setInterval(() => { if (token) fetchNotifs(); }, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
      fetchNotifs();
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Dropdown
      width="320px"
      trigger={(open) => (
        <button className={`btn btn-ghost btn-icon${open ? ' active' : ''}`} title="Notifications" style={{ position: 'relative' }}>
          <BellIcon />
          {unreadCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--bg-surface)' }} />}
        </button>
      )}
    >
      {(close) => (
        <>
          <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Notifications</span>
            <span onClick={() => { markAllRead(); close(); }} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>Mark all read</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications yet</div>
            ) : notifications.map((n, i) => (
              <div key={n.id || i} style={{ padding: '0.9rem 1.25rem', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', background: !n.is_read ? 'var(--primary-light)' : 'transparent', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
                onMouseLeave={e => e.currentTarget.style.background = !n.is_read ? 'var(--primary-light)' : 'transparent'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: !n.is_read ? 700 : 500, fontSize: '0.85rem', flex: 1 }}>{n.title}</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.75rem 1.25rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} onClick={close}>View all notifications</span>
          </div>
        </>
      )}
    </Dropdown>
  );
}


/* ── Main Navbar ────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <MapIcon /> },
    { to: '/trips',     label: 'My Trips',  icon: <BriefcaseIcon /> },
    { to: '/community', label: 'Community', icon: <GlobeIcon /> },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: <UsersIcon /> }] : []),
  ];

  return (
    <nav className="navbar">
      {/* Logo */}
      <NavLink to="/dashboard" className="nav-logo">
        <div className="nav-logo-icon"><MapIcon /></div>
        <span className="nav-logo-text">Traveloop</span>
      </NavLink>

      {/* Nav links */}
      <div className="nav-links">
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {link.icon}{link.label}
          </NavLink>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-sm">
        <NotificationBell />
        {user && <AccountDropdown user={user} isAdmin={isAdmin} onLogout={handleLogout} />}
      </div>
    </nav>
  );
}
