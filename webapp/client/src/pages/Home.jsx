import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trophy, Users, ChevronRight, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { getMyTeams, getMyLeagues } from '../utils/api';

const Home = () => {
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [teamsRes, leaguesRes] = await Promise.all([
        getMyTeams(),
        getMyLeagues()
      ]);
      setTeams(teamsRes.data);
      setLeagues(leaguesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      socket.on('professor-score-changed', loadData);
      return () => socket.off('professor-score-changed', loadData);
    }
  }, [socket]);

  const totalScore = teams.reduce((sum, team) => sum + team.totalScore, 0);

  return (
    <div className="page">
      <Header title="FantaProf" />

      <div className="container" style={{ paddingTop: 'clamp(16px, 4vw, 24px)' }}>
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: 'clamp(16px, 4vw, 24px)',
            background: 'var(--gradient-glow), var(--bg-card)',
            marginBottom: 'clamp(16px, 4vw, 24px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 16px)' }}>
            <span style={{ fontSize: 'clamp(36px, 10vw, 48px)' }}>{user?.avatar || '🎓'}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 3vw, 14px)' }}>Bentornato,</p>
              <h2 style={{
                fontSize: 'clamp(18px, 5vw, 24px)',
                fontWeight: '700',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{user?.username}!</h2>
            </div>
          </div>

          {teams.length > 0 && (
            <div style={{
              marginTop: 'clamp(12px, 3vw, 20px)',
              padding: 'clamp(12px, 3vw, 16px)',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(10px, 2.5vw, 12px)' }}>Punteggio Totale</p>
                <p style={{
                  fontSize: 'clamp(24px, 7vw, 32px)',
                  fontWeight: '700',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {totalScore}
                </p>
              </div>
              <Sparkles size={32} className="hide-mobile" style={{ color: 'var(--primary-light)', opacity: 0.5 }} />
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(8px, 2vw, 12px)',
            marginBottom: 'clamp(16px, 4vw, 24px)'
          }}
        >
          <button
            onClick={() => navigate('/create-team')}
            className="card"
            style={{
              padding: 'clamp(14px, 4vw, 20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(6px, 2vw, 8px)',
              border: '2px dashed var(--primary)',
              background: 'rgba(139, 92, 246, 0.1)',
              cursor: 'pointer',
              minHeight: '80px'
            }}
          >
            <Plus size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: 'clamp(12px, 3vw, 14px)' }}>Crea Squadra</span>
          </button>

          <button
            onClick={() => navigate('/leagues')}
            className="card"
            style={{
              padding: 'clamp(14px, 4vw, 20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(6px, 2vw, 8px)',
              border: '2px dashed var(--secondary)',
              background: 'rgba(236, 72, 153, 0.1)',
              cursor: 'pointer',
              minHeight: '80px'
            }}
          >
            <Users size={24} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontWeight: '600', color: 'var(--secondary)', fontSize: 'clamp(12px, 3vw, 14px)' }}>Unisciti a Lega</span>
          </button>
        </motion.div>

        {/* My Teams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}>
            <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '600' }}>Le Mie Squadre</h3>
            {teams.length > 0 && (
              <span className="badge badge-primary">{teams.length}</span>
            )}
          </div>

          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              Caricamento...
            </div>
          ) : teams.length === 0 ? (
            <div className="card empty-state">
              <div className="emoji">⚽</div>
              <h3>Nessuna squadra</h3>
              <p>Crea la tua prima squadra per iniziare a giocare!</p>
              <button onClick={() => navigate('/create-team')} className="btn btn-primary">
                Crea Squadra
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)' }}>
              {teams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/team/${team.id}`}
                    className="card"
                    style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      color: 'inherit',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 'clamp(40px, 10vw, 48px)',
                        height: 'clamp(40px, 10vw, 48px)',
                        borderRadius: '12px',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(18px, 5vw, 24px)',
                        flexShrink: 0
                      }}>
                        ⚽
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{
                          fontWeight: '600',
                          fontSize: 'clamp(14px, 3.5vw, 16px)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{team.name}</h4>
                        {team.league_name && (
                          <p style={{
                            fontSize: 'clamp(10px, 2.5vw, 12px)',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {team.league_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: 'clamp(16px, 4vw, 20px)',
                          fontWeight: '700',
                          color: team.totalScore >= 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {team.totalScore}
                        </p>
                        <p style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', color: 'var(--text-muted)' }}>punti</p>
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Leagues Preview */}
        {leagues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: 'clamp(20px, 5vw, 32px)' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'clamp(12px, 3vw, 16px)'
            }}>
              <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '600' }}>Le Mie Leghe</h3>
              <Link to="/leagues" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 'clamp(12px, 3vw, 14px)' }}>
                Vedi tutte
              </Link>
            </div>

            <div className="scroll-x-mobile" style={{
              display: 'flex',
              gap: 'clamp(8px, 2vw, 12px)',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginLeft: '-12px',
              marginRight: '-12px',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}>
              {leagues.slice(0, 3).map((league, i) => (
                <Link
                  key={league.id}
                  to={`/league/${league.id}`}
                  className="card"
                  style={{
                    minWidth: 'clamp(160px, 45vw, 200px)',
                    padding: 'clamp(12px, 3vw, 16px)',
                    textDecoration: 'none',
                    color: 'inherit',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={16} style={{ color: 'var(--warning)' }} />
                    <span style={{
                      fontWeight: '600',
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{league.name}</span>
                  </div>
                  <p style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>
                    {league.member_count} membri
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
