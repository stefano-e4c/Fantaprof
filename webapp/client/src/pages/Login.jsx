import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
        toast.success('Bentornato! 🎉');
      } else {
        await register(username, email, password);
        toast.success('Account creato! Benvenuto! 🚀');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh', /* Dynamic viewport height for mobile browsers */
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      paddingTop: 'env(safe-area-inset-top, 16px)',
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      overflow: 'auto'
    }}>
      {/* Background decorations - smaller on mobile */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: 'min(500px, 80vw)',
        height: 'min(500px, 80vw)',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-20%',
        left: '-10%',
        width: 'min(500px, 80vw)',
        height: 'min(500px, 80vw)',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: 'auto'
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(24px, 5vh, 40px)'
          }}
        >
          <span style={{ fontSize: 'clamp(56px, 15vw, 80px)', display: 'block' }} className="animate-float">🎓</span>
          <h1 style={{
            fontSize: 'clamp(28px, 8vw, 42px)',
            fontWeight: '700',
            marginTop: '12px',
            background: 'var(--gradient-rainbow)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'rainbow 3s ease infinite'
          }}>
            FantaProf
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: 'clamp(13px, 3.5vw, 16px)' }}>
            Il fantasy game dei professori! 📚
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ padding: 'clamp(20px, 5vw, 32px)' }}
        >
          {/* Tab switch */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: isLogin ? 'var(--gradient-primary)' : 'transparent',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Accedi
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: !isLogin ? 'var(--gradient-primary)' : 'transparent',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                Username
              </label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Il tuo username"
                required
              />
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: '16px' }}
              >
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: 'var(--text-muted)'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="La tua email"
                  required={!isLogin}
                />
              </motion.div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                Password
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="La tua password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '16px' }}
            >
              {loading ? (
                <span>Caricamento...</span>
              ) : isLogin ? (
                <>Accedi 🚀</>
              ) : (
                <>Crea Account ✨</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(8px, 3vw, 24px)',
            marginTop: 'clamp(20px, 4vh, 32px)',
            flexWrap: 'wrap'
          }}
        >
          {['🏆 Classifica', '👥 Leghe', '🎖️ Badge'].map((feature, i) => (
            <span
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 16px)',
                borderRadius: '20px',
                fontSize: 'clamp(11px, 3vw, 13px)',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              {feature}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
