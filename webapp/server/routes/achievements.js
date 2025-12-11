const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all achievements
router.get('/', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const achievements = db.prepare('SELECT * FROM achievements ORDER BY points ASC').all();
    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Errore nel recupero achievements' });
  }
});

// Get user's achievements
router.get('/my', authenticateToken, (req, res) => {
  const db = req.app.get('db');

  try {
    const unlocked = db.prepare(`
      SELECT a.*, ua.unlocked_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `).all(req.user.id);

    const all = db.prepare('SELECT * FROM achievements ORDER BY points ASC').all();

    const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);

    res.json({
      unlocked,
      all,
      totalPoints,
      progress: {
        unlocked: unlocked.length,
        total: all.length
      }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ error: 'Errore nel recupero achievements' });
  }
});

// Check and award achievements (internal helper)
const checkAchievements = (db, io, userId) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return;

  // Get user stats
  const teamsCount = db.prepare('SELECT COUNT(*) as count FROM teams WHERE user_id = ?').get(userId).count;
  const leaguesJoined = db.prepare('SELECT COUNT(*) as count FROM league_members WHERE user_id = ?').get(userId).count;
  const leaguesCreated = db.prepare('SELECT COUNT(*) as count FROM leagues WHERE creator_id = ?').get(userId).count;
  const achievementsUnlocked = db.prepare('SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?').get(userId).count;

  // Calculate total score across all teams
  const totalScore = db.prepare(`
    SELECT COALESCE(SUM(
      CASE WHEN tp.is_captain = 1 THEN p.score * 2 ELSE p.score END
    ), 0) as total
    FROM teams t
    JOIN team_professors tp ON t.id = tp.team_id
    JOIN professors p ON tp.professor_id = p.id
    WHERE t.user_id = ?
  `).get(userId).total;

  // Get all achievements
  const achievements = db.prepare('SELECT * FROM achievements').all();

  for (const achievement of achievements) {
    // Check if already unlocked
    const existing = db.prepare('SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievement.id);
    if (existing) continue;

    let earned = false;

    switch (achievement.condition_type) {
      case 'teams_created':
        earned = teamsCount >= achievement.condition_value;
        break;
      case 'leagues_joined':
        earned = leaguesJoined >= achievement.condition_value;
        break;
      case 'leagues_created':
        earned = leaguesCreated >= achievement.condition_value;
        break;
      case 'total_score':
        earned = totalScore >= achievement.condition_value;
        break;
      case 'achievements_unlocked':
        earned = achievementsUnlocked >= achievement.condition_value;
        break;
      case 'user_id':
        earned = userId <= achievement.condition_value;
        break;
    }

    if (earned) {
      db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, achievement.id);

      // Create notification
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'achievement', 'Achievement Sbloccato!', ?, ?)
      `).run(userId, `Hai sbloccato "${achievement.name}"!`, JSON.stringify({ achievementCode: achievement.code }));

      // Emit socket event
      io.to(`user-${userId}`).emit('achievement', {
        code: achievement.code,
        name: achievement.name,
        icon: achievement.icon,
        points: achievement.points
      });
    }
  }
};

// Export helper for use in other routes
router.checkAchievements = checkAchievements;

module.exports = router;
