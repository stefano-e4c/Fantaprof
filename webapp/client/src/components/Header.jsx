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
        padding: '16px 20px',
        background: 'rgba(15, 15, 26, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {title || 'FantaProf'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowNotifications(true)}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>{user?.avatar || '🎓'}</span>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>{user?.username}</span>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer',
              color: '#f87171'
            }}
          >
            <LogOut size={20} />
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
