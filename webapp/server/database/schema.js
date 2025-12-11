const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fantaprof.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '🎓',
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Professors table
  CREATE TABLE IF NOT EXISTS professors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    subject TEXT,
    cost INTEGER NOT NULL DEFAULT 10,
    score INTEGER NOT NULL DEFAULT 0,
    avatar TEXT DEFAULT '👨‍🏫',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Leagues table
  CREATE TABLE IF NOT EXISTS leagues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL,
    max_members INTEGER DEFAULT 50,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );

  -- League members table
  CREATE TABLE IF NOT EXISTS league_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    league_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(league_id, user_id)
  );

  -- Teams table
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    league_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL
  );

  -- Team professors (squad composition)
  CREATE TABLE IF NOT EXISTS team_professors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    professor_id INTEGER NOT NULL,
    is_captain INTEGER DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id),
    UNIQUE(team_id, professor_id)
  );

  -- Score events (log of all scoring actions)
  CREATE TABLE IF NOT EXISTS score_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    professor_id INTEGER NOT NULL,
    event_name TEXT NOT NULL,
    points INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professors(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
  );

  -- Achievements definitions
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    condition_type TEXT NOT NULL,
    condition_value INTEGER NOT NULL
  );

  -- User achievements
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
  );

  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Insert default achievements
const defaultAchievements = [
  { code: 'first_team', name: 'Primo Passo', description: 'Crea la tua prima squadra', icon: '🏆', points: 10, condition_type: 'teams_created', condition_value: 1 },
  { code: 'join_league', name: 'Giocatore Social', description: 'Unisciti alla tua prima lega', icon: '🤝', points: 15, condition_type: 'leagues_joined', condition_value: 1 },
  { code: 'create_league', name: 'Leader Nato', description: 'Crea la tua prima lega', icon: '👑', points: 20, condition_type: 'leagues_created', condition_value: 1 },
  { code: 'score_100', name: 'Centista', description: 'Raggiungi 100 punti totali', icon: '💯', points: 25, condition_type: 'total_score', condition_value: 100 },
  { code: 'score_500', name: 'Mezza Potenza', description: 'Raggiungi 500 punti totali', icon: '🔥', points: 50, condition_type: 'total_score', condition_value: 500 },
  { code: 'score_1000', name: 'Mille e Non Più Mille', description: 'Raggiungi 1000 punti totali', icon: '⭐', points: 100, condition_type: 'total_score', condition_value: 1000 },
  { code: 'top_3', name: 'Sul Podio', description: 'Raggiungi il podio in una lega', icon: '🥇', points: 30, condition_type: 'podium_finish', condition_value: 1 },
  { code: 'captain_bonus', name: 'Scelta Azzeccata', description: 'Il tuo capitano fa +50 punti in un giorno', icon: '🎯', points: 20, condition_type: 'captain_daily_score', condition_value: 50 },
  { code: 'perfect_week', name: 'Settimana Perfetta', description: 'Tutti i tuoi prof segnano in una settimana', icon: '✨', points: 40, condition_type: 'all_profs_scored', condition_value: 1 },
  { code: 'early_bird', name: 'Early Adopter', description: 'Tra i primi 10 iscritti', icon: '🐦', points: 50, condition_type: 'user_id', condition_value: 10 },
  { code: 'social_butterfly', name: 'Farfalla Sociale', description: 'Unisciti a 5 leghe diverse', icon: '🦋', points: 35, condition_type: 'leagues_joined', condition_value: 5 },
  { code: 'collector', name: 'Collezionista', description: 'Sblocca 5 achievements', icon: '🎖️', points: 30, condition_type: 'achievements_unlocked', condition_value: 5 },
];

const insertAchievement = db.prepare(`
  INSERT OR IGNORE INTO achievements (code, name, description, icon, points, condition_type, condition_value)
  VALUES (@code, @name, @description, @icon, @points, @condition_type, @condition_value)
`);

for (const achievement of defaultAchievements) {
  insertAchievement.run(achievement);
}

// Insert some default professors if none exist
const profCount = db.prepare('SELECT COUNT(*) as count FROM professors').get();
if (profCount.count === 0) {
  const defaultProfs = [
    { name: 'Prof. Rossi', subject: 'Matematica', cost: 25, avatar: '🧮' },
    { name: 'Prof. Bianchi', subject: 'Italiano', cost: 20, avatar: '📚' },
    { name: 'Prof. Verdi', subject: 'Storia', cost: 15, avatar: '🏛️' },
    { name: 'Prof. Neri', subject: 'Fisica', cost: 22, avatar: '⚛️' },
    { name: 'Prof. Gialli', subject: 'Inglese', cost: 18, avatar: '🇬🇧' },
    { name: 'Prof. Blu', subject: 'Educazione Fisica', cost: 12, avatar: '🏃' },
    { name: 'Prof. Rosa', subject: 'Arte', cost: 14, avatar: '🎨' },
    { name: 'Prof. Viola', subject: 'Musica', cost: 13, avatar: '🎵' },
    { name: 'Prof. Arancio', subject: 'Scienze', cost: 19, avatar: '🔬' },
    { name: 'Prof. Marrone', subject: 'Filosofia', cost: 16, avatar: '🤔' },
    { name: 'Prof. Grigio', subject: 'Informatica', cost: 21, avatar: '💻' },
    { name: 'Prof. Turchese', subject: 'Chimica', cost: 20, avatar: '🧪' },
  ];

  const insertProf = db.prepare(`
    INSERT INTO professors (name, subject, cost, avatar) VALUES (@name, @subject, @cost, @avatar)
  `);

  for (const prof of defaultProfs) {
    insertProf.run(prof);
  }
}

module.exports = db;
