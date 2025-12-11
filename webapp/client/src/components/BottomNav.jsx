import { NavLink } from 'react-router-dom';
import { Home, Trophy, Users, Award, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { isAdmin } = useAuth();

  const iconSize = 22;

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={iconSize} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/leaderboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Trophy size={iconSize} />
        <span>Classifica</span>
      </NavLink>

      <NavLink to="/leagues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={iconSize} />
        <span>Leghe</span>
      </NavLink>

      <NavLink to="/achievements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Award size={iconSize} />
        <span>Badge</span>
      </NavLink>

      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={iconSize} />
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
