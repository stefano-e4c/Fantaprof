const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all professors
router.get('/', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const professors = db.prepare(`
      SELECT * FROM professors ORDER BY cost DESC, name ASC
    `).all();
    res.json(professors);
  } catch (error) {
    console.error('Get professors error:', error);
    res.status(500).json({ error: 'Errore nel recupero professori' });
  }
});

// Get professor by id
router.get('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const professor = db.prepare('SELECT * FROM professors WHERE id = ?').get(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: 'Professore non trovato' });
    }
    res.json(professor);
  } catch (error) {
    console.error('Get professor error:', error);
    res.status(500).json({ error: 'Errore nel recupero professore' });
  }
});

// Get professor score history
router.get('/:id/history', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const history = db.prepare(`
      SELECT se.*, u.username as admin_name
      FROM score_events se
      JOIN users u ON se.admin_id = u.id
      WHERE se.professor_id = ?
      ORDER BY se.created_at DESC
      LIMIT 50
    `).all(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Errore nel recupero storico' });
  }
});

module.exports = router;
