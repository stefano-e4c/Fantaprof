import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// In production, use relative URLs (same origin)
// In development, use localhost:3001
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Initialize socket connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(SOCKET_URL);
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-user-room', user.id);
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const updateAvatar = async (avatar) => {
    const res = await axios.put(`${API_URL}/auth/avatar`, { avatar });
    setUser({ ...user, avatar });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      socket,
      login,
      register,
      logout,
      updateAvatar,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
