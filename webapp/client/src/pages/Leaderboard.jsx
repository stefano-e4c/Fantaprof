import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getGlobalLeaderboard } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user, socket } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      const res = await getGlobalLeaderboard();
      setLeaderboard(res.data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();

    if (socket) {
      socket.on('professor-score-changed', loadLeaderboard);
      return () => socket.off('professor-score-changed', loadLeaderboard);
    }
  }, [socket]);

  const getPositionStyle = (position) => {
    if (position === 1) return 'position-1';
    if (position === 2) return 'position-2';
    if (position === 3) return 'position-3';
    return 'position-other';
  };

  const getPositionIcon = (position) => {
    if (position === 1) return <Crown size={18} />;
    if (position === 2) return <Medal size={18} />;
    if (position === 3) return <Medal size={18} />;
    return position;
  };

  return (
    <div className="page">
      <Header title="Classifica" />

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <Trophy size={48} style={{ color: 'var(--warning)' }} className="animate-float" />
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginTop: '16px',
            background: 'var(--gradient-rainbow)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'rainbow 3s ease infinite'
          }}>
            Classifica Globale
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Le migliori squadre di FantaProf
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '32px'
            }}
          >
            {/* 2nd Place */}
            <div style={{ textAlign: 'center', flex: 1, maxWidth: '120px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8)',
                borderRadius: '16px 16px 0 0',
                padding: '16px',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <span style={{ fontSize: '28px' }}>{leaderboard[1]?.avatar || '🎓'}</span>
              </div>
              <div className="card" style={{
                borderRadius: '0 0 16px 16px',
                padding: '12px',
                borderTop: 'none'
              }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>2</p>
                <p style={{ fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {leaderboard[1]?.team_name}
                </p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)' }}>
                  {leaderboard[1]?.total_score}
                </p>
              </div>
            </div>

            {/* 1st Place */}
            <div style={{ textAlign: 'center', flex: 1, maxWidth: '140px' }}>
              <Crown size={24} style={{ color: '#ffd700', marginBottom: '8px' }} className="animate-bounce" />
              <div style={{
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                borderRadius: '16px 16px 0 0',
                padding: '20px',
                height: '130px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <span style={{ fontSize: '36px' }}>{leaderboard[0]?.avatar || '🎓'}</span>
              </div>
              <div className="card" style={{
                borderRadius: '0 0 16px 16px',
                padding: '12px',
                borderTop: 'none'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffd700' }}>1</p>
                <p style={{ fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {leaderboard[0]?.team_name}
                </p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success)' }}>
                  {leaderboard[0]?.total_score}
                </p>
              </div>
            </div>

            {/* 3rd Place */}
            <div style={{ textAlign: 'center', flex: 1, maxWidth: '120px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #cd7f32, #e6a65d)',
                borderRadius: '16px 16px 0 0',
                padding: '16px',
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <span style={{ fontSize: '24px' }}>{leaderboard[2]?.avatar || '🎓'}</span>
              </div>
              <div className="card" style={{
                borderRadius: '0 0 16px 16px',
                padding: '12px',
                borderTop: 'none'
              }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#cd7f32' }}>3</p>
                <p style={{ fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {leaderboard[2]?.team_name}
                </p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)' }}>
                  {leaderboard[2]?.total_score}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              Caricamento...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="card empty-state">
              <div className="emoji">🏆</div>
              <h3>Nessuna squadra</h3>
              <p>Sii il primo a creare una squadra!</p>
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const position = i + 1;
              const isCurrentUser = entry.user_id === user?.id;

              return (
                <motion.div
                  key={entry.team_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/team/${entry.team_id}`}
                    className="card"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: isCurrentUser ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isCurrentUser ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)'
                    }}
                  >
                    <div className={`position-badge ${getPositionStyle(position)}`}>
                      {getPositionIcon(position)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '24px' }}>{entry.avatar || '🎓'}</span>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {entry.team_name}
                        </h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          @{entry.username}
                          {entry.league_name && ` • ${entry.league_name}`}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: entry.total_score >= 0 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {entry.total_score}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
