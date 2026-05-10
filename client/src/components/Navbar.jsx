import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MapIcon = () => <svg className="icon" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const BriefcaseIcon = () => <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const GlobeIcon = () => <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const UsersIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const UserIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogOutIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const BellIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="nav-logo">
        <div className="nav-logo-icon"><MapIcon /></div>
        <span className="nav-logo-text">Traveloop</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <MapIcon /> Dashboard
        </NavLink>
        <NavLink to="/trips" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <BriefcaseIcon /> My Trips
        </NavLink>
        <NavLink to="/community" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <GlobeIcon /> Community
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <UsersIcon /> Admin
          </NavLink>
        )}
      </div>

      <div className="flex items-center gap-sm">
        {/* Role badge */}
        {user && (
          <span className={`badge ${isAdmin ? 'badge-upcoming' : 'badge-ongoing'}`} style={{ marginRight: 4 }}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
        )}
        <button className="btn btn-ghost btn-icon"><BellIcon /></button>
        <NavLink to="/profile" className="btn btn-ghost btn-icon"><UserIcon /></NavLink>
        <button className="btn btn-ghost btn-icon" onClick={() => { logout(); navigate('/login'); }} title="Logout">
          <LogOutIcon />
        </button>
      </div>
    </nav>
  );
}
