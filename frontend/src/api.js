import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getTenantDetailsFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      plan: decoded.plan,
      tenantId: decoded.tenantId,
      tenantSlug: decoded.tenantSlug,
    };
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
};

export const initDB = () => axios.get(`${API_URL}/auth/init`);
export const login = (email, password) => axios.post(`${API_URL}/auth/login`, { email, password });
export const getNotes = (token) => axios.get(`${API_URL}/notes`, { headers: { Authorization: `Bearer ${token}` } });
export const createNote = (title, content, token) => axios.post(`${API_URL}/notes`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
export const updateNote = (id, title, content, token) => axios.put(`${API_URL}/notes/${id}`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
export const deleteNote = (id, token) => axios.delete(`${API_URL}/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const getMembers = (tenantSlug, token) => axios.get(`${API_URL}/users/${tenantSlug}/members`, { headers: { Authorization: `Bearer ${token}` } });
export const updateMemberRole = (userId, newRole, token) => axios.put(`${API_URL}/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
export const upgradeUserPlan = (userId, token) => axios.put(`${API_URL}/users/${userId}/upgrade-plan`, {}, { headers: { Authorization: `Bearer ${token}` } });