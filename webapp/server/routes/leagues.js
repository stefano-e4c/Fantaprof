const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate a short league code
const generateLeagueCode = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Get public leagues
router.get('/public', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const leagues = db.prepare(`
      SELECT l.*, u.username as creator_name,
        (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
      FROM leagues l
      JOIN users u ON l.creator_id = u.id
      WHERE l.is_public = 1
      ORDER BY member_count DESC
    `).all();
    res.json(leagues);
  } catch (error) {
    console.error('Get public leagues error:', error);
    res.status(500).json({ error: 'Errore nel recupero leghe' });
  }
});

// Get user's leagues
router.get('/my', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const leagues = db.prepare(`
      SELECT l.*, u.username as creator_name,
        (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count,
        lm.joined_at
      FROM league_members lm
      JOIN leagues l ON lm.league_id = l.id
      JOIN users u ON l.creator_id = u.id
      WHERE lm.user_id = ?
      ORDER BY lm.joined_at DESC
    `).all(req.user.id);
    res.json(leagues);
  } catch (error) {
    console.error('Get my leagues error:', error);
    res.status(500).json({ error: 'Errore nel recupero leghe' });
  }
});

// Get league by id with leaderboard
router.get('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const league = db.prepare(`
      SELECT l.*, u.username as creator_name,
        (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
      FROM leagues l
      JOIN users u ON l.creator_id = u.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!league) {
      return res.status(404).json({ error: 'Lega non trovata' });
    }

    // Get leaderboard
    const leaderboard = db.prepare(`
      SELECT t.id as team_id, t.name as team_name, u.id as user_id, u.username, u.avatar,
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
      WHERE t.league_id = ?
      ORDER BY total_score DESC
    `).all(req.params.id);

    // Check if user is member
    const isMember = db.prepare('SELECT 1 FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.id, req.user.id);

    res.json({ ...league, leaderboard, isMember: !!isMember });
  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({ error: 'Errore nel recupero lega' });
  }
});

// Join league by code
router.post('/join', authenticateToken, [
  body('code').trim().isLength({ min: 8, max: 8 }).withMessage('Codice lega non valido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const io = req.app.get('io');
  const { code } = req.body;

  try {
    const league = db.prepare('SELECT * FROM leagues WHERE code = ?').get(code.toUpperCase());
    if (!league) {
      return res.status(404).json({ error: 'Lega non trovata con questo codice' });
    }

    // Check if already member
    const existing = db.prepare('SELECT 1 FROM league_members WHERE league_id = ? AND user_id = ?').get(league.id, req.user.id);
    if (existing) {
      return res.status(400).json({ error: 'Sei già membro di questa lega' });
    }

    // Check max members
    const memberCount = db.prepare('SELECT COUNT(*) as count FROM league_members WHERE league_id = ?').get(league.id);
    if (memberCount.count >= league.max_members) {
      return res.status(400).json({ error: 'Lega piena!' });
    }

    // Join league
    db.prepare('INSERT INTO league_members (league_id, user_id) VALUES (?, ?)').run(league.id, req.user.id);

    // Check for join_league achievement
    const leaguesJoined = db.prepare('SELECT COUNT(*) as count FROM league_members WHERE user_id = ?').get(req.user.id);

    if (leaguesJoined.count === 1) {
      const achievement = db.prepare('SELECT id FROM achievements WHERE code = ?').get('join_league');
      if (achievement) {
        db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(req.user.id, achievement.id);
        io.to(`user-${req.user.id}`).emit('achievement', { code: 'join_league' });
      }
    }

    if (leaguesJoined.count === 5) {
      const achievement = db.prepare('SELECT id FROM achievements WHERE code = ?').get('social_butterfly');
      if (achievement) {
        db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(req.user.id, achievement.id);
        io.to(`user-${req.user.id}`).emit('achievement', { code: 'social_butterfly' });
      }
    }

    // Notify league
    io.to(`league-${league.id}`).emit('member-joined', { userId: req.user.id, username: req.user.username });

    res.json({ league });
  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({ error: 'Errore nel join della lega' });
  }
});

// Create league
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Nome lega deve essere tra 3 e 50 caratteri'),
  body('description').optional().trim().isLength({ max: 200 }),
  body('isPublic').optional().isBoolean()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const io = req.app.get('io');
  const { name, description, isPublic } = req.body;

  try {
    const code = generateLeagueCode();

    const result = db.prepare(`
      INSERT INTO leagues (name, code, description, creator_id, is_public)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, code, description || '', req.user.id, isPublic ? 1 : 0);

    const leagueId = result.lastInsertRowid;

    // Auto-join creator
    db.prepare('INSERT INTO league_members (league_id, user_id) VALUES (?, ?)').run(leagueId, req.user.id);

    // Check for create_league achievement
    const leaguesCreated = db.prepare('SELECT COUNT(*) as count FROM leagues WHERE creator_id = ?').get(req.user.id);
    if (leaguesCreated.count === 1) {
      const achievement = db.prepare('SELECT id FROM achievements WHERE code = ?').get('create_league');
      if (achievement) {
        db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(req.user.id, achievement.id);
        io.to(`user-${req.user.id}`).emit('achievement', { code: 'create_league' });
      }
    }

    const league = db.prepare('SELECT * FROM leagues WHERE id = ?').get(leagueId);
    res.json(league);
  } catch (error) {
    console.error('Create league error:', error);
    res.status(500).json({ error: 'Errore nella creazione lega' });
  }
});

// Leave league
router.delete('/:id/leave', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const league = db.prepare('SELECT * FROM leagues WHERE id = ?').get(req.params.id);
    if (!league) {
      return res.status(404).json({ error: 'Lega non trovata' });
    }

    // Can't leave if you're the creator
    if (league.creator_id === req.user.id) {
      return res.status(400).json({ error: 'Il creatore non può abbandonare la lega. Eliminala invece.' });
    }

    db.prepare('DELETE FROM league_members WHERE league_id = ? AND user_id = ?').run(req.params.id, req.user.id);

    // Also remove user's teams from this league
    db.prepare('UPDATE teams SET league_id = NULL WHERE league_id = ? AND user_id = ?').run(req.params.id, req.user.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Leave league error:', error);
    res.status(500).json({ error: 'Errore nell\'abbandono della lega' });
  }
});

// Delete league (creator only)
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const league = db.prepare('SELECT * FROM leagues WHERE id = ? AND creator_id = ?').get(req.params.id, req.user.id);
    if (!league) {
      return res.status(404).json({ error: 'Lega non trovata o non autorizzato' });
    }

    db.prepare('DELETE FROM leagues WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete league error:', error);
    res.status(500).json({ error: 'Errore eliminazione lega' });
  }
});

module.exports = router;
