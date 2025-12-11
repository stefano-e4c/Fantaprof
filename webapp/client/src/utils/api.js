import axios from 'axios';

// In production, use relative URLs (same origin)
// In development, use localhost:3001
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Professors
export const getProfessors = () => axios.get(`${API_URL}/professors`);
export const getProfessor = (id) => axios.get(`${API_URL}/professors/${id}`);
export const getProfessorHistory = (id) => axios.get(`${API_URL}/professors/${id}/history`);

// Teams
export const getMyTeams = () => axios.get(`${API_URL}/teams/my`);
export const getTeam = (id) => axios.get(`${API_URL}/teams/${id}`);
export const createTeam = (data) => axios.post(`${API_URL}/teams`, data);
export const deleteTeam = (id) => axios.delete(`${API_URL}/teams/${id}`);

// Leagues
export const getPublicLeagues = () => axios.get(`${API_URL}/leagues/public`);
export const getMyLeagues = () => axios.get(`${API_URL}/leagues/my`);
export const getLeague = (id) => axios.get(`${API_URL}/leagues/${id}`);
export const createLeague = (data) => axios.post(`${API_URL}/leagues`, data);
export const joinLeague = (code) => axios.post(`${API_URL}/leagues/join`, { code });
export const leaveLeague = (id) => axios.delete(`${API_URL}/leagues/${id}/leave`);
export const deleteLeague = (id) => axios.delete(`${API_URL}/leagues/${id}`);

// Achievements
export const getAchievements = () => axios.get(`${API_URL}/achievements`);
export const getMyAchievements = () => axios.get(`${API_URL}/achievements/my`);

// Notifications
export const getNotifications = () => axios.get(`${API_URL}/notifications`);
export const markNotificationRead = (id) => axios.put(`${API_URL}/notifications/${id}/read`);
export const markAllNotificationsRead = () => axios.put(`${API_URL}/notifications/read-all`);
export const deleteNotification = (id) => axios.delete(`${API_URL}/notifications/${id}`);
export const clearNotifications = () => axios.delete(`${API_URL}/notifications`);

// Admin
export const getScoringEvents = () => axios.get(`${API_URL}/admin/events`);
export const addProfessor = (data) => axios.post(`${API_URL}/admin/professors`, data);
export const updateProfessorScore = (id, eventCode) => axios.post(`${API_URL}/admin/professors/${id}/score`, { eventCode });
export const deleteProfessor = (id) => axios.delete(`${API_URL}/admin/professors/${id}`);
export const updateProfessor = (id, data) => axios.put(`${API_URL}/admin/professors/${id}`, data);
export const getGlobalLeaderboard = () => axios.get(`${API_URL}/admin/leaderboard`);
export const getUsers = () => axios.get(`${API_URL}/admin/users`);
export const updateUserRole = (id, role) => axios.put(`${API_URL}/admin/users/${id}/role`, { role });
