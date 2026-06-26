import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const PAGE_TITLES = {
  '/': '💬 Chat',
  '/agenda': '📅 Agenda',
  '/tarefas': '✅ Tarefas',
};

export default function AppLayout({ user, onLogout, onClearChat }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Lola';

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onClearChat={() => {
          onClearChat?.();
          closeSidebar();
        }}
      />

      <main className="app-main">
        <header className="app-header">
          <div className="app-header-title">
            {/* Mobile menu button */}
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Menu"
              style={{ display: 'none' }}
            >
              ☰
            </button>
            {pageTitle}
          </div>
        </header>

        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
