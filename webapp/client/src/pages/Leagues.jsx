import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Globe, Lock, Copy, X } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getMyLeagues, getPublicLeagues, createLeague, joinLeague } from '../utils/api';
import toast from 'react-hot-toast';

const Leagues = () => {
  const navigate = useNavigate();
  const [myLeagues, setMyLeagues] = useState([]);
  const [publicLeagues, setPublicLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Create league form
  const [leagueName, setLeagueName] = useState('');
  const [leagueDesc, setLeagueDesc] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      const [myRes, publicRes] = await Promise.all([
        getMyLeagues(),
        getPublicLeagues()
      ]);
      setMyLeagues(myRes.data);
      setPublicLeagues(publicRes.data);
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    if (!leagueName.trim()) {
      toast.error('Inserisci un nome per la lega');
      return;
    }

    setCreating(true);
    try {
      const res = await createLeague({
        name: leagueName,
        description: leagueDesc,
        isPublic
      });
      toast.success('Lega creata!');
      setShowCreateModal(false);
      setLeagueName('');
      setLeagueDesc('');
      setIsPublic(false);
      loadData();
      navigate(`/league/${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore nella creazione');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Inserisci il codice della lega');
      return;
    }

    try {
      const res = await joinLeague(joinCode);
      toast.success('Ti sei unito alla lega!');
      setShowJoinModal(false);
      setJoinCode('');
      loadData();
      navigate(`/league/${res.data.league.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Codice non valido');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Codice copiato!');
  };

  return (
    <div className="page">
      <Header title="Leghe" />

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Header Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <Plus size={18} />
            Crea Lega
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            <Search size={18} />
            Unisciti
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveTab('my')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'my' ? 'var(--gradient-primary)' : 'transparent',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Le Mie Leghe ({myLeagues.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'public' ? 'var(--gradient-primary)' : 'transparent',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Pubbliche ({publicLeagues.length})
          </button>
        </div>

        {/* Leagues List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              Caricamento...
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'my' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'my' ? 20 : -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {(activeTab === 'my' ? myLeagues : publicLeagues).length === 0 ? (
                <div className="card empty-state">
                  <div className="emoji">{activeTab === 'my' ? '👥' : '🌍'}</div>
                  <h3>{activeTab === 'my' ? 'Nessuna lega' : 'Nessuna lega pubblica'}</h3>
                  <p>
                    {activeTab === 'my'
                      ? 'Crea una lega o unisciti a una esistente!'
                      : 'Non ci sono leghe pubbliche al momento'}
                  </p>
                </div>
              ) : (
                (activeTab === 'my' ? myLeagues : publicLeagues).map((league, i) => (
                  <motion.div
                    key={league.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/league/${league.id}`}
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: league.is_public ? 'var(--gradient-accent)' : 'var(--gradient-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {league.is_public ? <Globe size={24} /> : <Lock size={24} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontWeight: '600', fontSize: '15px' }}>{league.name}</h4>
                        {league.description && (
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {league.description}
                          </p>
                        )}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px'
                        }}>
                          <Users size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {league.member_count} membri
                          </span>
                          {activeTab === 'my' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                copyCode(league.code);
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                color: 'var(--primary-light)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Copy size={10} />
                              {league.code}
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <motion.div
            className="modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h2 style={{ fontSize: '18px' }}>Crea Nuova Lega</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLeague}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Nome Lega
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={leagueName}
                    onChange={e => setLeagueName(e.target.value)}
                    placeholder="Es: La Lega dei Prof"
                    maxLength={50}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Descrizione (opzionale)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={leagueDesc}
                    onChange={e => setLeagueDesc(e.target.value)}
                    placeholder="Descrivi la tua lega..."
                    maxLength={200}
                  />
                </div>

                <div
                  onClick={() => setIsPublic(!isPublic)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                    <div>
                      <p style={{ fontWeight: '600' }}>{isPublic ? 'Pubblica' : 'Privata'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {isPublic ? 'Chiunque può vederla' : 'Solo con codice invito'}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '14px',
                    background: isPublic ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                    padding: '2px',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      background: 'white',
                      transform: isPublic ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'all 0.3s'
                    }} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                  Annulla
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? 'Creazione...' : 'Crea Lega'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Join League Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <motion.div
            className="modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h2 style={{ fontSize: '18px' }}>Unisciti a una Lega</h2>
              <button onClick={() => setShowJoinModal(false)} className="btn btn-ghost" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleJoinLeague}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Codice Invito
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Es: ABC12345"
                    maxLength={8}
                    style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontSize: '20px' }}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                    Chiedi il codice al creatore della lega
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-ghost">
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Unisciti
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Leagues;
