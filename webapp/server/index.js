require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const db = require('./database/schema');
const authRoutes = require('./routes/auth');
const professorRoutes = require('./routes/professors');
const teamRoutes = require('./routes/teams');
const leagueRoutes = require('./routes/leagues');
const achievementRoutes = require('./routes/achievements');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, process.env.RAILWAY_STATIC_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
  credentials: true
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);
app.set('db', db);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-league', (leagueId) => {
    socket.join(`league-${leagueId}`);
    console.log(`Socket joined league ${leagueId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FantaProf server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
