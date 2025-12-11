import { useState, useEffect } from 'react';
import { X, Check, Trash2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NotificationsPanel = ({ onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useAuth();

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      onUnreadCountChange(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    if (socket) {
      socket.on('score-update', loadNotifications);
      socket.on('achievement', loadNotifications);
      return () => {
        socket.off('score-update', loadNotifications);
        socket.off('achievement', loadNotifications);
      };
    }
  }, [socket]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  const handleClear = async () => {
    await clearNotifications();
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'score': return '📊';
      case 'league': return '👥';
      default: return '🔔';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Ora';
    if (mins < 60) return `${mins}m fa`;
    if (hours < 24) return `${hours}h fa`;
    return `${days}g fa`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
            <Bell size={20} /> Notifiche
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleMarkAllRead} className="btn btn-ghost" style={{ padding: '8px' }}>
              <Check size={18} />
            </button>
            <button onClick={handleClear} className="btn btn-ghost" style={{ padding: '8px' }}>
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Caricamento...
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="emoji">🔔</div>
              <h3>Nessuna notifica</h3>
              <p>Sei al passo con tutto!</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleMarkRead(notif.id)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: notif.read ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '24px' }}>{getNotificationIcon(notif.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{notif.title}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)'
                      }} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationsPanel;
