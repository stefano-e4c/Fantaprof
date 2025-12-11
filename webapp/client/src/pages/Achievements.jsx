import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AchievementPopup from '../components/AchievementPopup';
import { getMyAchievements } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Achievements = () => {
  const { socket } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(null);

  const loadAchievements = async () => {
    try {
      const res = await getMyAchievements();
      setData(res.data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();

    if (socket) {
      socket.on('achievement', (achievement) => {
        setShowPopup(achievement);
        loadAchievements();
      });
      return () => socket.off('achievement');
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  const unlockedCodes = data?.unlocked.map(a => a.code) || [];

  return (
    <div className="page">
      <Header title="Achievements" />

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <Award size={48} style={{ color: 'var(--warning)' }} className="animate-float" />
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
            Achievements
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Sblocca badge e guadagna punti extra!
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
          style={{
            padding: '24px',
            marginBottom: '24px',
            background: 'var(--gradient-glow), var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Progressi</p>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {data?.progress.unlocked} / {data?.progress.total}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Punti Badge</p>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--warning)'
              }}>
                +{data?.totalPoints}
              </p>
            </div>
          </div>

          <div style={{
            height: '12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(data?.progress.unlocked / data?.progress.total) * 100}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                height: '100%',
                background: 'var(--gradient-success)',
                borderRadius: '6px'
              }}
            />
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px'
        }}>
          {data?.all.map((achievement, i) => {
            const isUnlocked = unlockedCodes.includes(achievement.code);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.5,
                  border: isUnlocked ? '2px solid var(--success)' : '1px solid var(--border)',
                  background: isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                  position: 'relative'
                }}
              >
                {isUnlocked ? (
                  <CheckCircle
                    size={20}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      color: 'var(--success)'
                    }}
                  />
                ) : (
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      color: 'var(--text-muted)'
                    }}
                  />
                )}

                <span style={{
                  fontSize: '48px',
                  display: 'block',
                  filter: isUnlocked ? 'none' : 'grayscale(1)'
                }}>
                  {achievement.icon}
                </span>

                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '12px'
                }}>
                  {achievement.name}
                </h4>

                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  minHeight: '32px'
                }}>
                  {achievement.description}
                </p>

                <span className={`badge ${isUnlocked ? 'badge-success' : 'badge-primary'}`} style={{ marginTop: '12px' }}>
                  +{achievement.points} pts
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Recently Unlocked */}
        {data?.unlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '32px' }}
          >
            <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Sbloccati di Recente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.unlocked.slice(0, 5).map((achievement, i) => (
                <div
                  key={achievement.id}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{achievement.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '600', fontSize: '14px' }}>{achievement.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(achievement.unlocked_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <span className="badge badge-success">+{achievement.points}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />

      {showPopup && (
        <AchievementPopup
          achievement={showPopup}
          onClose={() => setShowPopup(null)}
        />
      )}
    </div>
  );
};

export default Achievements;
