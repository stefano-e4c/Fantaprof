const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `).get(req.user.id).count;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Errore nel recupero notifiche' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento notifica' });
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento notifiche' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione notifica' });
  }
});

// Clear all notifications
router.delete('/', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Errore nella pulizia notifiche' });
  }
});

module.exports = router;
