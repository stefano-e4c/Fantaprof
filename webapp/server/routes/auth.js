const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username deve essere tra 3 e 20 caratteri'),
  body('email').isEmail().withMessage('Email non valida'),
  body('password').isLength({ min: 6 }).withMessage('Password deve essere almeno 6 caratteri')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username o email già in uso' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if this is the first user (make them admin)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const role = userCount.count === 0 ? 'admin' : 'user';

    // Create user
    const result = db.prepare(`
      INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)
    `).run(username, email, hashedPassword, role);

    const user = { id: result.lastInsertRowid, username, role };
    const token = generateToken(user);

    // Check for early bird achievement
    if (result.lastInsertRowid <= 10) {
      const achievement = db.prepare('SELECT id FROM achievements WHERE code = ?').get('early_bird');
      if (achievement) {
        db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(user.id, achievement.id);
      }
    }

    res.json({ token, user: { id: user.id, username, email, role, avatar: '🎓' } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

// Login
router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = req.app.get('db');
  const { username, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const user = db.prepare('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Errore nel recupero utente' });
  }
});

// Update avatar
router.put('/avatar', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const { avatar } = req.body;

  try {
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.user.id);
    res.json({ success: true, avatar });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Errore aggiornamento avatar' });
  }
});

module.exports = router;
