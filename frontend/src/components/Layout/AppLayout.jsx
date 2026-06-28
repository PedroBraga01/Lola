import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import BottomNav from './BottomNav';
import './Layout.css';

const PAGE_TITLES = {
  '/': '💬 Chat',
  '/dashboard': '📊 Visão',
  '/settings': '⚙️ Rotina',
};

export default function AppLayout({ user, onLogout, onClearChat }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Lola';

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <Sidebar
          user={user}
          onLogout={onLogout}
          isOpen={true} // Sempre aberto no desktop
          onClose={() => {}}
          onClearChat={onClearChat}
        />
      </div>

      <main className="app-main">
        <header className="app-header">
          <div className="app-header-title">
            {pageTitle}
          </div>
        </header>

        <div className="app-content">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </main>
    </div>
  );
}
