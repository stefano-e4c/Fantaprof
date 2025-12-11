const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const BUDGET = 100;
const TEAM_SIZE = 5;

// Get user's teams
router.get('/my', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const teams = db.prepare(`
      SELECT t.*, l.name as league_name, l.code as league_code
      FROM teams t
      LEFT JOIN leagues l ON t.league_id = l.id
      WHERE t.user_id = ?
    `).all(req.user.id);

    // Get professors for each team
    const teamsWithProfs = teams.map(team => {
      const professors = db.prepare(`
        SELECT p.*, tp.is_captain
        FROM team_professors tp
        JOIN professors p ON tp.professor_id = p.id
        WHERE tp.team_id = ?
      `).all(team.id);

      const totalScore = professors.reduce((sum, prof) => {
        return sum + (prof.is_captain ? prof.score * 2 : prof.score);
      }, 0);

      return { ...team, professors, totalScore };
    });

    res.json(teamsWithProfs);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Errore nel recupero squadre' });
  }
});

// Get team by id
router.get('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const team = db.prepare(`
      SELECT t.*, l.name as league_name, l.code as league_code, u.username
      FROM teams t
      LEFT JOIN leagues l ON t.league_id = l.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Squadra non trovata' });
    }

    const professors = db.prepare(`
      SELECT p.*, tp.is_captain
      FROM team_professors tp
      JOIN professors p ON tp.professor_id = p.id
      WHERE tp.team_id = ?
    `).all(team.id);

    const totalScore = professors.reduce((sum, prof) => {
      return sum + (prof.is_captain ? prof.score * 2 : prof.score);
    }, 0);

    res.json({ ...team, professors, totalScore });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Errore nel recupero squadra' });
  }
});

// Create team
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Nome squadra deve essere tra 2 e 30 caratteri'),
  body('professorIds').isArray({ min: TEAM_SIZE, max: TEAM_SIZE }).withMessage(`Devi selezionare esattamente ${TEAM_SIZE} professori`),
  body('captainId').isInt().withMessage('Devi selezionare un capitano')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const io = req.app.get('io');
  const { name, professorIds, captainId, leagueId } = req.body;

  try {
    // Verify captain is in the team
    if (!professorIds.includes(captainId)) {
      return res.status(400).json({ error: 'Il capitano deve essere nella squadra' });
    }

    // Get professors and check budget
    const placeholders = professorIds.map(() => '?').join(',');
    const professors = db.prepare(`SELECT * FROM professors WHERE id IN (${placeholders})`).all(...professorIds);

    if (professors.length !== TEAM_SIZE) {
      return res.status(400).json({ error: 'Alcuni professori non esistono' });
    }

    const totalCost = professors.reduce((sum, prof) => sum + prof.cost, 0);
    if (totalCost > BUDGET) {
      return res.status(400).json({ error: `Budget superato! Hai ${BUDGET} crediti, servono ${totalCost}` });
    }

    // Check if user already has a team in this league
    if (leagueId) {
      const existingTeam = db.prepare('SELECT id FROM teams WHERE user_id = ? AND league_id = ?').get(req.user.id, leagueId);
      if (existingTeam) {
        return res.status(400).json({ error: 'Hai già una squadra in questa lega' });
      }
    }

    // Create team
    const result = db.prepare(`
      INSERT INTO teams (name, user_id, league_id) VALUES (?, ?, ?)
    `).run(name, req.user.id, leagueId || null);

    const teamId = result.lastInsertRowid;

    // Add professors to team
    const insertProf = db.prepare('INSERT INTO team_professors (team_id, professor_id, is_captain) VALUES (?, ?, ?)');
    for (const profId of professorIds) {
      insertProf.run(teamId, profId, profId === captainId ? 1 : 0);
    }

    // Check for first_team achievement
    const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams WHERE user_id = ?').get(req.user.id);
    if (teamCount.count === 1) {
      const achievement = db.prepare('SELECT id FROM achievements WHERE code = ?').get('first_team');
      if (achievement) {
        db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(req.user.id, achievement.id);

        // Notify user
        db.prepare(`
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (?, 'achievement', 'Achievement Sbloccato!', 'Hai creato la tua prima squadra!', ?)
        `).run(req.user.id, JSON.stringify({ achievementCode: 'first_team' }));

        io.to(`user-${req.user.id}`).emit('achievement', { code: 'first_team' });
      }
    }

    // Emit event
    if (leagueId) {
      io.to(`league-${leagueId}`).emit('team-created', { teamId, userId: req.user.id });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);
    const totalScore = professors.reduce((sum, prof) => {
      return sum + (prof.id === captainId ? prof.score * 2 : prof.score);
    }, 0);

    res.json({ ...team, professors: professors.map(p => ({ ...p, is_captain: p.id === captainId ? 1 : 0 })), totalScore });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Errore nella creazione squadra' });
  }
});

// Delete team
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const team = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!team) {
      return res.status(404).json({ error: 'Squadra non trovata o non autorizzato' });
    }

    db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Errore eliminazione squadra' });
  }
});

module.exports = router;
