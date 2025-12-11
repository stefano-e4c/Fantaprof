import { useState } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationsPanel from './NotificationsPanel';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: 'clamp(12px, 3vw, 16px) clamp(12px, 3vw, 20px)',
        paddingTop: 'max(clamp(12px, 3vw, 16px), env(safe-area-inset-top))',
        background: 'rgba(15, 15, 26, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', minWidth: 0 }}>
          <span style={{ fontSize: 'clamp(22px, 6vw, 28px)' }}>🎓</span>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: 'clamp(16px, 4.5vw, 20px)',
              fontWeight: '700',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {title || 'FantaProf'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 12px)', flexShrink: 0 }}>
          <button
            onClick={() => setShowNotifications(true)}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '10px',
              padding: 'clamp(8px, 2vw, 10px)',
              cursor: 'pointer',
              color: 'white',
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '9px',
                fontWeight: '700',
                padding: '2px 5px',
                borderRadius: '10px',
                minWidth: '16px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Hide user info on very small screens */}
          <div className="hide-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 10px',
            borderRadius: '10px',
            maxWidth: '150px'
          }}>
            <span style={{ fontSize: '18px' }}>{user?.avatar || '🎓'}</span>
            <span style={{
              fontWeight: '600',
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{user?.username}</span>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: 'clamp(8px, 2vw, 10px)',
              cursor: 'pointer',
              color: '#f87171',
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </>
  );
};

export default Header;
