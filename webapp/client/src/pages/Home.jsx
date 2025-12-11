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

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: '24px',
            background: 'var(--gradient-glow), var(--bg-card)',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '48px' }}>{user?.avatar || '🎓'}</span>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Bentornato,</p>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{user?.username}!</h2>
            </div>
          </div>

          {teams.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Punteggio Totale</p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {totalScore}
                </p>
              </div>
              <Sparkles size={40} style={{ color: 'var(--primary-light)', opacity: 0.5 }} />
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
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <button
            onClick={() => navigate('/create-team')}
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              border: '2px dashed var(--primary)',
              background: 'rgba(139, 92, 246, 0.1)',
              cursor: 'pointer'
            }}
          >
            <Plus size={28} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Crea Squadra</span>
          </button>

          <button
            onClick={() => navigate('/leagues')}
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              border: '2px dashed var(--secondary)',
              background: 'rgba(236, 72, 153, 0.1)',
              cursor: 'pointer'
            }}
          >
            <Users size={28} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>Unisciti a Lega</span>
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
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Le Mie Squadre</h3>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        ⚽
                      </div>
                      <div>
                        <h4 style={{ fontWeight: '600' }}>{team.name}</h4>
                        {team.league_name && (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {team.league_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: team.totalScore >= 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {team.totalScore}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>punti</p>
                      </div>
                      <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
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
            style={{ marginTop: '32px' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Le Mie Leghe</h3>
              <Link to="/leagues" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px' }}>
                Vedi tutte
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {leagues.slice(0, 3).map((league, i) => (
                <Link
                  key={league.id}
                  to={`/league/${league.id}`}
                  className="card"
                  style={{
                    minWidth: '200px',
                    padding: '16px',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={18} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{league.name}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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
