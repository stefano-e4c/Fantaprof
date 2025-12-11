import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateTeam from './pages/CreateTeam';
import TeamDetail from './pages/TeamDetail';
import Leaderboard from './pages/Leaderboard';
import Leagues from './pages/Leagues';
import LeagueDetail from './pages/LeagueDetail';
import Achievements from './pages/Achievements';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block' }} className="animate-float">🎓</span>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block' }} className="animate-float">🎓</span>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />

      <Route path="/create-team" element={
        <ProtectedRoute>
          <CreateTeam />
        </ProtectedRoute>
      } />

      <Route path="/team/:id" element={
        <ProtectedRoute>
          <TeamDetail />
        </ProtectedRoute>
      } />

      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />

      <Route path="/leagues" element={
        <ProtectedRoute>
          <Leagues />
        </ProtectedRoute>
      } />

      <Route path="/league/:id" element={
        <ProtectedRoute>
          <LeagueDetail />
        </ProtectedRoute>
      } />

      <Route path="/achievements" element={
        <ProtectedRoute>
          <Achievements />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <Admin />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
