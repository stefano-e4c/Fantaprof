import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Crown, Coins, Users } from 'lucide-react';
import Header from '../components/Header';
import { getProfessors, createTeam, getMyLeagues } from '../utils/api';
import toast from 'react-hot-toast';

const BUDGET = 100;
const TEAM_SIZE = 5;

const CreateTeam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [professors, setProfessors] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedProfs, setSelectedProfs] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(searchParams.get('league') || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profsRes, leaguesRes] = await Promise.all([
          getProfessors(),
          getMyLeagues()
        ]);
        setProfessors(profsRes.data);
        setLeagues(leaguesRes.data);
      } catch (error) {
        toast.error('Errore nel caricamento dati');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const usedBudget = selectedProfs.reduce((sum, id) => {
    const prof = professors.find(p => p.id === id);
    return sum + (prof?.cost || 0);
  }, 0);

  const remainingBudget = BUDGET - usedBudget;

  const toggleProfessor = (profId) => {
    if (selectedProfs.includes(profId)) {
      setSelectedProfs(selectedProfs.filter(id => id !== profId));
      if (captain === profId) setCaptain(null);
    } else {
      if (selectedProfs.length >= TEAM_SIZE) {
        toast.error(`Puoi selezionare solo ${TEAM_SIZE} professori!`);
        return;
      }
      const prof = professors.find(p => p.id === profId);
      if (prof.cost > remainingBudget) {
        toast.error('Budget insufficiente!');
        return;
      }
      setSelectedProfs([...selectedProfs, profId]);
    }
  };

  const handleSubmit = async () => {
    if (!teamName.trim()) {
      toast.error('Inserisci un nome per la squadra');
      return;
    }
    if (selectedProfs.length !== TEAM_SIZE) {
      toast.error(`Seleziona esattamente ${TEAM_SIZE} professori`);
      return;
    }
    if (!captain) {
      toast.error('Seleziona un capitano');
      return;
    }

    setSubmitting(true);
    try {
      await createTeam({
        name: teamName,
        professorIds: selectedProfs,
        captainId: captain,
        leagueId: selectedLeague || undefined
      });
      toast.success('Squadra creata! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore nella creazione');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: 'clamp(160px, 25vh, 200px)' }}>
      <Header title="Crea Squadra" />

      <div className="container" style={{ paddingTop: 'clamp(16px, 4vw, 24px)' }}>
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
            marginBottom: 'clamp(16px, 4vw, 24px)',
            padding: '8px 0',
            fontSize: 'clamp(13px, 3.5vw, 14px)'
          }}
        >
          <ArrowLeft size={18} />
          Indietro
        </button>

        {/* Team Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: 'clamp(14px, 4vw, 20px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}
        >
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 14px)' }}>
            Nome Squadra
          </label>
          <input
            type="text"
            className="input"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Es: I Vincitori"
            maxLength={30}
          />
        </motion.div>

        {/* League Selection */}
        {leagues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ padding: 'clamp(14px, 4vw, 20px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}
          >
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 14px)' }}>
              <Users size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Lega (opzionale)
            </label>
            <select
              className="input"
              value={selectedLeague}
              onChange={e => setSelectedLeague(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Nessuna lega</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Budget Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
          style={{
            padding: 'clamp(14px, 4vw, 20px)',
            marginBottom: 'clamp(16px, 4vw, 24px)',
            background: remainingBudget < 10 ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
              <Coins size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Budget Rimanente</p>
                <p style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: '700' }}>{remainingBudget} crediti</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Selezionati</p>
              <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '600' }}>
                <span style={{ color: selectedProfs.length === TEAM_SIZE ? 'var(--success)' : 'inherit' }}>
                  {selectedProfs.length}
                </span>
                /{TEAM_SIZE}
              </p>
            </div>
          </div>

          {/* Budget bar */}
          <div style={{
            marginTop: 'clamp(12px, 3vw, 16px)',
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(usedBudget / BUDGET) * 100}%` }}
              style={{
                height: '100%',
                background: usedBudget > BUDGET ? 'var(--danger)' : 'var(--gradient-primary)',
                borderRadius: '4px'
              }}
            />
          </div>
        </motion.div>

        {/* Professors Grid */}
        <h3 style={{ marginBottom: 'clamp(12px, 3vw, 16px)', fontWeight: '600', fontSize: 'clamp(16px, 4vw, 18px)' }}>Seleziona i Professori</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 45vw), 1fr))',
          gap: 'clamp(8px, 2vw, 12px)'
        }}>
          <AnimatePresence>
            {professors.map((prof, i) => {
              const isSelected = selectedProfs.includes(prof.id);
              const isCaptain = captain === prof.id;
              const canAfford = prof.cost <= remainingBudget || isSelected;

              return (
                <motion.div
                  key={prof.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="card"
                  onClick={() => canAfford && toggleProfessor(prof.id)}
                  style={{
                    padding: 'clamp(10px, 3vw, 16px)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.5,
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-card)',
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'var(--primary)',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} />
                    </div>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 'clamp(28px, 8vw, 36px)', display: 'block' }}>{prof.avatar}</span>
                    <h4 style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: '600',
                      marginTop: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{prof.name}</h4>
                    <p style={{
                      fontSize: 'clamp(9px, 2.5vw, 11px)',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{prof.subject}</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'clamp(4px, 1vw, 8px)',
                      marginTop: '6px',
                      flexWrap: 'wrap'
                    }}>
                      <span className="badge badge-warning" style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', padding: '2px 6px' }}>
                        {prof.cost} cr
                      </span>
                      <span className="badge badge-success" style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', padding: '2px 6px' }}>
                        {prof.score} pts
                      </span>
                    </div>

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCaptain(isCaptain ? null : prof.id);
                        }}
                        style={{
                          marginTop: 'clamp(8px, 2vw, 12px)',
                          padding: 'clamp(6px, 2vw, 8px) clamp(8px, 2vw, 12px)',
                          borderRadius: '8px',
                          border: 'none',
                          background: isCaptain ? 'var(--gradient-secondary)' : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: 'clamp(10px, 2.5vw, 12px)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          justifyContent: 'center',
                          width: '100%'
                        }}
                      >
                        <Crown size={12} />
                        {isCaptain ? 'Capitano!' : 'Fai Capitano'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'clamp(12px, 3vw, 20px)',
        paddingBottom: 'max(clamp(12px, 3vw, 20px), env(safe-area-inset-bottom))',
        background: 'rgba(15, 15, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="container">
          {captain ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: 'clamp(8px, 2vw, 12px)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Crown size={14} style={{ color: 'var(--warning)' }} />
              <span style={{ fontSize: 'clamp(11px, 3vw, 13px)', color: 'var(--text-muted)', textAlign: 'center' }}>
                Capitano: <strong style={{ color: 'white' }}>
                  {professors.find(p => p.id === captain)?.name}
                </strong> (x2!)
              </span>
            </div>
          ) : selectedProfs.length === TEAM_SIZE && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: 'clamp(8px, 2vw, 12px)',
              justifyContent: 'center',
              color: 'var(--warning)',
              flexWrap: 'wrap'
            }}>
              <Crown size={14} />
              <span style={{ fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: '600', textAlign: 'center' }}>
                Clicca "Fai Capitano" su un prof!
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={selectedProfs.length !== TEAM_SIZE || !captain || !teamName.trim() || submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: 'clamp(12px, 3vw, 16px)', fontSize: 'clamp(13px, 3.5vw, 15px)' }}
          >
            {submitting ? 'Creazione...' :
              !teamName.trim() ? 'Inserisci nome squadra' :
              selectedProfs.length !== TEAM_SIZE ? `Seleziona ${TEAM_SIZE - selectedProfs.length} prof` :
              !captain ? 'Seleziona un capitano' :
              'Crea Squadra'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
