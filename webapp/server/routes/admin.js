const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const achievementRoutes = require('./achievements');

const router = express.Router();

// Scoring events
const SCORING_EVENTS = {
  // BONUS (positive)
  'assenza': { name: 'Assenza', points: 20, emoji: '🏖️' },
  'area_relax': { name: 'Area Relax', points: 30, emoji: '😴' },
  'parolaccia': { name: 'Parolaccia', points: 30, emoji: '🤬' },
  'gergo_giovanile': { name: 'Gergo Giovanile', points: 15, emoji: '🗣️' },
  'lavagna': { name: 'Scrive alla Lavagna', points: 5, emoji: '📝' },
  'correzione_immediata': { name: 'Correzione Immediata', points: 5, emoji: '✅' },
  'malore': { name: 'Malore in Classe', points: 200, emoji: '🏥' },
  'complimento': { name: 'Complimento', points: 10, emoji: '💕' },
  'pc_sabotato': { name: 'PC Sabotato', points: 5, emoji: '💻' },
  'inciampa': { name: 'Inciampa o Cade', points: 20, emoji: '🤸' },
  'video': { name: 'Fa Vedere un Video', points: 15, emoji: '🎬' },
  'risata': { name: 'Risata', points: 10, emoji: '😂' },
  'esercitazione': { name: 'Esercitazione', points: 20, emoji: '📚' },
  'monocromo': { name: 'Veste Monocromo', points: 10, emoji: '👔' },
  'litiga_prof': { name: 'Litiga con un Prof', points: 100, emoji: '🥊' },
  'litiga_alunno': { name: 'Litiga con un Alunno', points: 50, emoji: '😤' },
  'meme': { name: 'Meme', points: 10, emoji: '🐸' },
  'divulgatore': { name: 'Divulgatore d\'Oro', points: 20, emoji: '🎓' },
  'influencer': { name: 'Prof Influencer', points: 5, emoji: '📱' },
  'empatia': { name: 'Empatia', points: 20, emoji: '🤗' },
  'esce_verifica': { name: 'Esce Durante Verifica', points: 15, emoji: '🚪' },
  'nota_merito': { name: 'Nota di Merito', points: 35, emoji: '🌟' },
  'capriola': { name: 'Capriola', points: 150, emoji: '🤸‍♂️' },
  'dimentica_verifiche': { name: 'Dimentica Verifiche', points: 30, emoji: '🤷' },
  'caccia_nota': { name: 'Caccia Nota', points: 25, emoji: '📜' },
  'mette_10': { name: 'Mette 10', points: 50, emoji: '💯' },

  // MALUS (negative)
  'sbaglia': { name: 'Sbaglia', points: -10, emoji: '❌' },
  'arriva_tardi': { name: 'Arriva Tardi', points: -10, emoji: '⏰' },
  'verifica_giorno_dopo': { name: 'Verifica Giorno Dopo', points: -15, emoji: '😱' },
  'battuta_boomer': { name: 'Battuta Boomer', points: -15, emoji: '🧓' },
  'mette_nota': { name: 'Mette Nota', points: -30, emoji: '📋' },
  'dimentica_verifiche_malus': { name: 'Dimentica Verifiche (con panico)', points: -20, emoji: '😰' },
  'pois': { name: 'Vestiti a Pois', points: -5, emoji: '🔴' },
  'assenza_supplente': { name: 'Assenza con Supplente', points: -10, emoji: '👤' },
  'insulta': { name: 'Insulta', points: -10, emoji: '😠' },
  'mette_ritardo': { name: 'Mette Ritardo', points: -5, emoji: '⌛' },
  'ritardo_pochi_min': { name: 'Ritardo di Pochi Minuti', points: -20, emoji: '⏱️' },
  'fuoriclasse': { name: 'Fuoriclasse', points: -5, emoji: '🚶' },
  'bagno_abolito': { name: 'Bagno Abolito', points: -15, emoji: '🚽' },
  'nota_ingiusta': { name: 'Nota Ingiusta', points: -30, emoji: '😡' },
  'memoria': { name: 'Se la Memoria non mi Inganna', points: -5, emoji: '🧠' },
  'total_black': { name: 'Total Black', points: -10, emoji: '🖤' },
  'ritira_tel': { name: 'Ritira Telefono', points: -15, emoji: '📵' },
  'rompe': { name: 'Rompe Qualcosa', points: -20, emoji: '💥' },
  'non_mette_nota': { name: 'Non Mette Nota a ZIC', points: -100, emoji: '🤐' },
};

// Get scoring events
router.get('/events', authenticateToken, requireAdmin, (req, res) => {
  const events = Object.entries(SCORING_EVENTS).map(([code, event]) => ({
    code,
    ...event
  }));

  const bonus = events.filter(e => e.points > 0).sort((a, b) => b.points - a.points);
  const malus = events.filter(e => e.points < 0).sort((a, b) => a.points - b.points);

  res.json({ bonus, malus });
});

// Add professor
router.post('/professors', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Nome deve essere tra 2 e 50 caratteri'),
  body('subject').optional().trim().isLength({ max: 50 }),
  body('cost').isInt({ min: 1, max: 50 }).withMessage('Costo deve essere tra 1 e 50'),
  body('avatar').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const io = req.app.get('io');
  const { name, subject, cost, avatar } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM professors WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Professore con questo nome già esistente' });
    }

    const result = db.prepare(`
      INSERT INTO professors (name, subject, cost, avatar) VALUES (?, ?, ?, ?)
    `).run(name, subject || '', cost, avatar || '👨‍🏫');

    const professor = db.prepare('SELECT * FROM professors WHERE id = ?').get(result.lastInsertRowid);

    io.emit('professor-added', professor);
    res.json(professor);
  } catch (error) {
    console.error('Add professor error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiunta professore' });
  }
});

// Update professor score with event
router.post('/professors/:id/score', authenticateToken, requireAdmin, [
  body('eventCode').notEmpty().withMessage('Evento richiesto')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const io = req.app.get('io');
  const { eventCode } = req.body;
  const profId = req.params.id;

  try {
    const event = SCORING_EVENTS[eventCode];
    if (!event) {
      return res.status(400).json({ error: 'Evento non valido' });
    }

    const professor = db.prepare('SELECT * FROM professors WHERE id = ?').get(profId);
    if (!professor) {
      return res.status(404).json({ error: 'Professore non trovato' });
    }

    // Update score
    const newScore = professor.score + event.points;
    db.prepare('UPDATE professors SET score = ? WHERE id = ?').run(newScore, profId);

    // Log event
    db.prepare(`
      INSERT INTO score_events (professor_id, event_name, points, admin_id)
      VALUES (?, ?, ?, ?)
    `).run(profId, event.name, event.points, req.user.id);

    // Find all teams with this professor and notify
    const teams = db.prepare(`
      SELECT t.user_id, tp.is_captain, t.name as team_name, t.league_id
      FROM team_professors tp
      JOIN teams t ON tp.team_id = t.id
      WHERE tp.professor_id = ?
    `).all(profId);

    // Notify each team owner
    for (const team of teams) {
      const pointsEarned = team.is_captain ? event.points * 2 : event.points;

      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'score', ?, ?, ?)
      `).run(
        team.user_id,
        event.points > 0 ? '📈 Punti Guadagnati!' : '📉 Punti Persi!',
        `${professor.name} ha fatto "${event.name}" (${pointsEarned > 0 ? '+' : ''}${pointsEarned} punti${team.is_captain ? ' x2 capitano!' : ''})`,
        JSON.stringify({ profId, eventCode, points: pointsEarned })
      );

      io.to(`user-${team.user_id}`).emit('score-update', {
        profId,
        profName: professor.name,
        event: event.name,
        points: pointsEarned,
        isCaptain: team.is_captain
      });

      // Check achievements for score thresholds
      achievementRoutes.checkAchievements(db, io, team.user_id);
    }

    // Broadcast global update
    io.emit('professor-score-changed', {
      profId,
      profName: professor.name,
      newScore,
      event: event.name,
      points: event.points
    });

    res.json({
      professor: { ...professor, score: newScore },
      event: { ...event, code: eventCode }
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento punteggio' });
  }
});

// Delete professor
router.delete('/professors/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = req.app.get('db');
  const io = req.app.get('io');

  try {
    const professor = db.prepare('SELECT * FROM professors WHERE id = ?').get(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: 'Professore non trovato' });
    }

    // Check if professor is in any team
    const inTeams = db.prepare('SELECT COUNT(*) as count FROM team_professors WHERE professor_id = ?').get(req.params.id);
    if (inTeams.count > 0) {
      return res.status(400).json({ error: 'Impossibile eliminare: professore presente in squadre attive' });
    }

    db.prepare('DELETE FROM professors WHERE id = ?').run(req.params.id);

    io.emit('professor-deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete professor error:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione professore' });
  }
});

// Update professor details
router.put('/professors/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('subject').optional().trim().isLength({ max: 50 }),
  body('cost').optional().isInt({ min: 1, max: 50 }),
  body('avatar').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const io = req.app.get('io');
  const { name, subject, cost, avatar } = req.body;

  try {
    const professor = db.prepare('SELECT * FROM professors WHERE id = ?').get(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: 'Professore non trovato' });
    }

    db.prepare(`
      UPDATE professors SET
        name = COALESCE(?, name),
        subject = COALESCE(?, subject),
        cost = COALESCE(?, cost),
        avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(name || null, subject || null, cost || null, avatar || null, req.params.id);

    const updated = db.prepare('SELECT * FROM professors WHERE id = ?').get(req.params.id);

    io.emit('professor-updated', updated);
    res.json(updated);
  } catch (error) {
    console.error('Update professor error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento professore' });
  }
});

// Get all users (admin)
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  const db = req.app.get('db');

  try {
    const users = db.prepare(`
      SELECT id, username, email, role, avatar, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Errore nel recupero utenti' });
  }
});

// Make user admin
router.put('/users/:id/role', authenticateToken, requireAdmin, [
  body('role').isIn(['user', 'admin']).withMessage('Ruolo non valido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const { role } = req.body;

  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento ruolo' });
  }
});

// Get global leaderboard
router.get('/leaderboard', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const leaderboard = db.prepare(`
      SELECT t.id as team_id, t.name as team_name, u.id as user_id, u.username, u.avatar,
        l.name as league_name,
        (
          SELECT COALESCE(SUM(
            CASE WHEN tp.is_captain = 1 THEN p.score * 2 ELSE p.score END
          ), 0)
          FROM team_professors tp
          JOIN professors p ON tp.professor_id = p.id
          WHERE tp.team_id = t.id
        ) as total_score
      FROM teams t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN leagues l ON t.league_id = l.id
      ORDER BY total_score DESC
      LIMIT 100
    `).all();

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Errore nel recupero classifica' });
  }
});

module.exports = router;
