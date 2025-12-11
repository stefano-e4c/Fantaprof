import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Trophy, Users, Crown, Medal, Plus, LogOut, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getLeague, leaveLeague, deleteLeague } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LeagueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLeague = async () => {
    try {
      const res = await getLeague(id);
      setLeague(res.data);
    } catch (error) {
      toast.error('Lega non trovata');
      navigate('/leagues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeague();

    if (socket) {
      socket.emit('join-league', id);
      socket.on('professor-score-changed', loadLeague);
      socket.on('team-created', loadLeague);
      socket.on('member-joined', loadLeague);
      return () => {
        socket.off('professor-score-changed', loadLeague);
        socket.off('team-created', loadLeague);
        socket.off('member-joined', loadLeague);
      };
    }
  }, [id, socket]);

  const copyCode = () => {
    navigator.clipboard.writeText(league.code);
    toast.success('Codice copiato!');
  };

  const handleLeave = async () => {
    if (!confirm('Sei sicuro di voler abbandonare questa lega?')) return;

    try {
      await leaveLeague(id);
      toast.success('Hai abbandonato la lega');
      navigate('/leagues');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa lega? Questa azione è irreversibile!')) return;

    try {
      await deleteLeague(id);
      toast.success('Lega eliminata');
      navigate('/leagues');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore');
    }
  };

  const getPositionStyle = (position) => {
    if (position === 1) return 'position-1';
    if (position === 2) return 'position-2';
    if (position === 3) return 'position-3';
    return 'position-other';
  };

  const getPositionIcon = (position) => {
    if (position === 1) return <Crown size={16} />;
    if (position === 2) return <Medal size={16} />;
    if (position === 3) return <Medal size={16} />;
    return position;
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!league) return null;

  const isCreator = league.creator_id === user?.id;
  const userTeam = league.leaderboard.find(entry => entry.user_id === user?.id);
  const userPosition = userTeam ? league.leaderboard.findIndex(e => e.user_id === user?.id) + 1 : null;

  return (
    <div className="page">
      <Header title={league.name} />

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

        {/* League Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: '24px',
            marginBottom: '24px',
            background: 'var(--gradient-glow), var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{league.name}</h2>
              {league.description && (
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{league.description}</p>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '16px'
              }}>
                <span className="badge badge-primary">
                  <Users size={12} />
                  {league.member_count} membri
                </span>
                <span className="badge badge-warning">
                  {league.is_public ? '🌍 Pubblica' : '🔒 Privata'}
                </span>
              </div>
            </div>

            <button
              onClick={copyCode}
              className="btn btn-outline"
              style={{ padding: '12px 16px' }}
            >
              <Copy size={16} />
              {league.code}
            </button>
          </div>

          {/* User's position */}
          {userPosition && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`position-badge ${getPositionStyle(userPosition)}`}>
                  {getPositionIcon(userPosition)}
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>La tua posizione</p>
                  <p style={{ fontWeight: '600' }}>{userTeam.team_name}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                  {userTeam.total_score}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>punti</p>
              </div>
            </div>
          )}

          {/* Create team button if no team */}
          {league.isMember && !userTeam && (
            <Link
              to={`/create-team?league=${league.id}`}
              className="btn btn-primary"
              style={{ marginTop: '20px', width: '100%' }}
            >
              <Plus size={18} />
              Crea Squadra per questa Lega
            </Link>
          )}
        </motion.div>

        {/* Leaderboard */}
        <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>
          <Trophy size={20} style={{ display: 'inline', marginRight: '8px', color: 'var(--warning)' }} />
          Classifica Lega
        </h3>

        {league.leaderboard.length === 0 ? (
          <div className="card empty-state">
            <div className="emoji">🏆</div>
            <h3>Nessuna squadra</h3>
            <p>Sii il primo a creare una squadra in questa lega!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {league.leaderboard.map((entry, i) => {
              const position = i + 1;
              const isCurrentUser = entry.user_id === user?.id;

              return (
                <motion.div
                  key={entry.team_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                    <div className={`position-badge ${getPositionStyle(position)}`} style={{ width: '36px', height: '36px', fontSize: '14px' }}>
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
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isCreator && league.isMember && (
            <button
              onClick={handleLeave}
              className="btn"
              style={{
                width: '100%',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <LogOut size={18} />
              Abbandona Lega
            </button>
          )}

          {isCreator && (
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
              Elimina Lega
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LeagueDetail;
