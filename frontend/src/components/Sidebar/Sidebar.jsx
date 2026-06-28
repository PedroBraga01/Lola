import { NavLink } from 'react-router-dom';
import { MessageCircle, LayoutDashboard, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ user, onLogout, isOpen, onClose, onClearChat }) {
  const navItems = [
    { to: '/', icon: <MessageCircle size={20} />, label: 'Chat' },
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Visão' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Rotina' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => (isOpen ? onClose() : null)}
        aria-label="Abrir menu"
        id="sidebar-toggle-btn"
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="main-sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">🐕</div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">Lola</span>
            <span className="sidebar-brand-tagline">Gestor Pessoal</span>
          </div>
        </div>



        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
              end={item.to === '/'}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-user-avatar">
              {user.picture ? (
                <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sair"
              id="logout-btn"
            >
              🚪
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
