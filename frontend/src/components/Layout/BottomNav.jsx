import { NavLink } from 'react-router-dom';
import { MessageCircle, LayoutDashboard } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        title="Chat"
      >
        <MessageCircle className="nav-icon" />
        <span className="nav-label">Chat</span>
      </NavLink>
      
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        title="Dashboard"
      >
        <LayoutDashboard className="nav-icon" />
        <span className="nav-label">Visão</span>
      </NavLink>
    </nav>
  );
}
