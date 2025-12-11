import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Trash2, Trophy } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getTeam, deleteTeam } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTeam = async () => {
    try {
      const res = await getTeam(id);
      setTeam(res.data);
    } catch (error) {
      toast.error('Squadra non trovata');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();

    if (socket) {
      socket.on('professor-score-changed', loadTeam);
      return () => socket.off('professor-score-changed', loadTeam);
    }
  }, [id, socket]);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa squadra?')) return;

    try {
      await deleteTeam(id);
      toast.success('Squadra eliminata');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore eliminazione');
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!team) return null;

  const isOwner = team.user_id === user?.id;

  return (
    <div className="page">
      <Header title={team.name} />

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={20} />
          Indietro
        </button>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: '32px',
            textAlign: 'center',
            background: 'var(--gradient-glow), var(--bg-card)',
            marginBottom: '24px'
          }}
        >
          <Trophy size={48} style={{ color: 'var(--warning)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Punteggio Totale</p>
          <h2 style={{
            fontSize: '56px',
            fontWeight: '700',
            background: team.totalScore >= 0 ? 'var(--gradient-success)' : 'var(--gradient-secondary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {team.totalScore}
          </h2>

          {team.league_name && (
            <div style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '20px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Lega: <strong style={{ color: 'white' }}>{team.league_name}</strong>
              </span>
            </div>
          )}
        </motion.div>

        {/* Team Composition */}
        <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Formazione</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {team.professors
            .sort((a, b) => b.is_captain - a.is_captain)
            .map((prof, i) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: prof.is_captain ? '2px solid var(--warning)' : '1px solid var(--border)',
                  background: prof.is_captain ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{prof.avatar}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontWeight: '600' }}>{prof.name}</h4>
                      {prof.is_captain && (
                        <Crown size={16} style={{ color: 'var(--warning)' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prof.subject}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: prof.score >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {prof.is_captain ? prof.score * 2 : prof.score}
                  </p>
                  {prof.is_captain && (
                    <p style={{ fontSize: '10px', color: 'var(--warning)' }}>
                      {prof.score} x2
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
        </div>

        {/* Delete Button */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '32px' }}
          >
            <button
              onClick={handleDelete}
              className="btn"
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <Trash2 size={18} />
              Elimina Squadra
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default TeamDetail;
