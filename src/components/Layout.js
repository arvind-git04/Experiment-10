import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_USER = [
  { to: '/movies',   icon: '🎬', label: 'Movies' },
  { to: '/shows',    icon: '📅', label: 'Shows' },
  { to: '/bookings', icon: '🎟️', label: 'My Bookings' },
];

const NAV_ADMIN = [
  { to: '/dashboard',     icon: '📊', label: 'Dashboard' },
  { to: '/manage-movies', icon: '🎬', label: 'Manage Movies' },
  { to: '/manage-shows',  icon: '📅', label: 'Manage Shows' },
  { to: '/bookings',      icon: '🎟️', label: 'All Bookings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? NAV_ADMIN : NAV_USER;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text)', padding: '8px 12px', borderRadius: 8,
          cursor: 'pointer', display: 'none',
        }}
        className="mobile-toggle"
      >☰</button>

      <aside className="sidebar" style={open ? { transform: 'translateX(0)' } : {}}>
        <div className="sidebar-logo">
          <h2>🎥 Cine<span>Book</span></h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {isAdmin ? 'Admin Panel' : 'Movie Ticketing'}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">{isAdmin ? 'Management' : 'Browse'}</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content" onClick={() => setOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
}
