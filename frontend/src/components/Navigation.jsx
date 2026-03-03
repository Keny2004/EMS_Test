import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Battery, Download, LogOut } from 'lucide-react';

function Navigation({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/battery-status', label: 'Battery Status', icon: Battery },
    { path: '/export', label: 'Data Export', icon: Download },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar Navigation */}
      <nav className="glass" style={{ 
        width: '260px', 
        padding: '32px 24px', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '0',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '48px', padding: '0 12px' }}>
          <h2 className="text-gradient" style={{ margin: 0, fontSize: '24px' }}>EMS System</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s ease',
              })}
              className="nav-link"
            >
              <item.icon size={20} color={window.location.pathname.includes(item.path) ? 'var(--accent-primary)' : 'currentColor'} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <button 
          onClick={handleLogout} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginTop: 'auto'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <LogOut size={20} />
          Logout
        </button>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

export default Navigation;
