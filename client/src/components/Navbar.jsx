import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const MapIcon       = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const BriefcaseIcon = () => <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const GlobeIcon     = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const UsersIcon     = () => <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const UserIcon      = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogOutIcon    = () => <svg className="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const BellIcon      = () => <svg className="icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const BookmarkIcon  = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const SettingsIcon  = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const ShieldIcon    = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const HelpIcon      = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const PlusIcon      = () => <svg className="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronIcon   = () => <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;

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
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path) => { setOpen(false); navigate(path); };

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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Account menu"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: open ? 'var(--primary-light)' : 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s' }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar name={user?.name} size={32} />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name?.split(' ')[0]}
        </span>
        <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 256, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden', animation: 'dropdownIn 0.18s ease' }}>
          {/* Header */}
          <div style={{ padding: '1.1rem 1.25rem', background: 'linear-gradient(135deg,var(--primary-light),var(--secondary-light))', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-sm">
              <Avatar name={user?.name} size={40} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ marginTop: '0.6rem' }}>
              <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, background: isAdmin ? 'var(--primary)' : 'var(--secondary)', color: '#fff', letterSpacing: '0.05em' }}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>

          {/* Menu sections */}
          <div style={{ padding: '0.5rem 0' }}>
            {menuSections.map((section, si) => (
              <div key={si}>
                {si > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0.35rem 0' }} />}
                {section.label && <div style={{ padding: '0.3rem 1.25rem 0.1rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{section.label}</div>}
                {section.items.map(item => (
                  <button key={item.label} onClick={() => go(item.path)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit', transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-alt)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}

            {/* Logout */}
            <div style={{ height: 1, background: 'var(--border)', margin: '0.35rem 0' }} />
            <button onClick={() => { setOpen(false); onLogout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'inherit', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              <LogOutIcon />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Notification bell with badge ───────────────────────────────────────────── */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const NOTIFS = [
    { title: 'Trip reminder', msg: 'Your Paris trip starts in 3 days!', time: '2h ago', unread: true },
    { title: 'Community', msg: 'Someone copied your Japan itinerary.', time: '1d ago', unread: true },
    { title: 'Budget alert', msg: 'You are nearing your budget limit.', time: '2d ago', unread: false },
  ];
  const unreadCount = NOTIFS.filter(n => n.unread).length;
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} className="btn btn-ghost btn-icon" title="Notifications" style={{ position: 'relative' }}>
        <BellIcon />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--bg-surface)' }} />
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 300, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden', animation: 'dropdownIn 0.18s ease' }}>
          <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Notifications</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>Mark all read</span>
          </div>
          {NOTIFS.map((n, i) => (
            <div key={i} style={{ padding: '0.9rem 1.25rem', borderBottom: i < NOTIFS.length - 1 ? '1px solid var(--border)' : 'none', background: n.unread ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
              onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'var(--primary-light)' : 'transparent'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: n.unread ? 700 : 500, fontSize: '0.85rem', flex: 1 }}>{n.title}</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 8 }}>{n.time}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.msg}</div>
            </div>
          ))}
          <div style={{ padding: '0.75rem 1.25rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>View all notifications</span>
          </div>
        </div>
      )}
    </div>
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
