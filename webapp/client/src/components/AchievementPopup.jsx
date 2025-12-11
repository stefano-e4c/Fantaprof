import { motion, AnimatePresence } from 'framer-motion';

const AchievementPopup = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="achievement-popup"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.6 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="emoji">{achievement.icon}</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginTop: '16px',
            background: 'var(--gradient-rainbow)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'rainbow 3s ease infinite'
          }}>
            Achievement Sbloccato!
          </h2>
          <h3 style={{ fontSize: '20px', marginTop: '12px' }}>{achievement.name}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{achievement.description}</p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(139, 92, 246, 0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            marginTop: '16px'
          }}>
            <span>+{achievement.points}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>punti</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ marginTop: '24px', width: '100%' }}
          >
            Fantastico! 🎉
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementPopup;
