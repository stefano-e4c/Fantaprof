import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getProfessors, getScoringEvents, addProfessor, deleteProfessor, updateProfessorScore } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Admin = () => {
  const { socket } = useAuth();
  const [professors, setProfessors] = useState([]);
  const [events, setEvents] = useState({ bonus: [], malus: [] });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [showEventsFor, setShowEventsFor] = useState(null);

  // Add professor form
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCost, setNewCost] = useState(15);
  const [newAvatar, setNewAvatar] = useState('👨‍🏫');

  const avatars = ['👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍🔬', '👩‍🔬', '🧮', '📚', '🎨', '🎵', '🏃', '💻', '🔬', '🧪', '🏛️', '🌍', '🔢'];

  const loadData = async () => {
    try {
      const [profsRes, eventsRes] = await Promise.all([
        getProfessors(),
        getScoringEvents()
      ]);
      setProfessors(profsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      socket.on('professor-added', loadData);
      socket.on('professor-deleted', loadData);
      socket.on('professor-score-changed', loadData);
      return () => {
        socket.off('professor-added', loadData);
        socket.off('professor-deleted', loadData);
        socket.off('professor-score-changed', loadData);
      };
    }
  }, [socket]);

  const handleAddProfessor = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Inserisci un nome');
      return;
    }

    try {
      await addProfessor({
        name: newName,
        subject: newSubject,
        cost: newCost,
        avatar: newAvatar
      });
      toast.success('Professore aggiunto!');
      setShowAddModal(false);
      setNewName('');
      setNewSubject('');
      setNewCost(15);
      setNewAvatar('👨‍🏫');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore');
    }
  };

  const handleDeleteProfessor = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo professore?')) return;

    try {
      await deleteProfessor(id);
      toast.success('Professore eliminato');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore');
    }
  };

  const handleScoreEvent = async (profId, eventCode) => {
    try {
      const res = await updateProfessorScore(profId, eventCode);
      const event = res.data.event;
      toast.success(
        `${event.emoji} ${event.name}: ${event.points > 0 ? '+' : ''}${event.points} punti!`
      );
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore');
    }
  };

  return (
    <div className="page">
      <Header title="Admin Panel" />

      <div className="container" style={{ paddingTop: '24px' }}>
        {/* Add Professor Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '24px' }}
        >
          <Plus size={20} />
          Aggiungi Professore
        </motion.button>

        {/* Professors List */}
        <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Gestione Professori</h3>

        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            Caricamento...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {professors.map((prof, i) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card"
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{prof.avatar}</span>
                    <div>
                      <h4 style={{ fontWeight: '600' }}>{prof.name}</h4>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span className="badge badge-warning">{prof.cost} crediti</span>
                        <span className={`badge ${prof.score >= 0 ? 'badge-success' : 'badge-danger'}`}>
                          {prof.score} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setShowEventsFor(showEventsFor === prof.id ? null : prof.id)}
                      className="btn btn-ghost"
                      style={{ padding: '10px' }}
                    >
                      {showEventsFor === prof.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button
                      onClick={() => handleDeleteProfessor(prof.id)}
                      className="btn btn-ghost"
                      style={{ padding: '10px', color: '#f87171' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Events Panel */}
                <AnimatePresence>
                  {showEventsFor === prof.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        borderTop: '1px solid var(--border)',
                        padding: '16px',
                        background: 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* Bonus Events */}
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        BONUS
                      </p>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '16px'
                      }}>
                        {events.bonus.map(event => (
                          <button
                            key={event.code}
                            onClick={() => handleScoreEvent(prof.id, event.code)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {event.emoji} {event.name} (+{event.points})
                          </button>
                        ))}
                      </div>

                      {/* Malus Events */}
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        MALUS
                      </p>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        {events.malus.map(event => (
                          <button
                            key={event.code}
                            onClick={() => handleScoreEvent(prof.id, event.code)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {event.emoji} {event.name} ({event.points})
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Professor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div
            className="modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h2 style={{ fontSize: '18px' }}>Aggiungi Professore</h2>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost" style={{ padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProfessor}>
              <div className="modal-body">
                {/* Avatar Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Avatar
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {avatars.map(avatar => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setNewAvatar(avatar)}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          border: newAvatar === avatar ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: newAvatar === avatar ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                          fontSize: '24px',
                          cursor: 'pointer'
                        }}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Nome
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Es: Prof. Rossi"
                    maxLength={50}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Materia
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Es: Matematica"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Costo (crediti)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={newCost}
                    onChange={e => setNewCost(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>5</span>
                    <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--warning)' }}>{newCost}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>35</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost">
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Aggiungi
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

export default Admin;
