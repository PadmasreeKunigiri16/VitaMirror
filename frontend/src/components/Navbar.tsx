import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, History, Settings, Eye } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/check', label: 'Wellness Check', icon: <Eye size={16} /> },
    { to: '/history', label: 'History', icon: <History size={16} /> },
    { to: '/privacy', label: 'Privacy', icon: <Settings size={16} /> },
  ];

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 11, 30, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 var(--spacing-xl)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}>
            <Activity size={20} color="white" />
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1.1rem',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            VitaMirror
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
                color: isActive(link.to) ? 'white' : 'var(--color-text-secondary)',
                background: isActive(link.to)
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'transparent',
                border: isActive(link.to)
                  ? '1px solid rgba(99, 102, 241, 0.3)'
                  : '1px solid transparent',
              }}
            >
              {link.icon}
              <span className="hide-mobile">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
