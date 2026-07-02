import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

const authHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { 'X-Admin-Token': token } : {};
};

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const logout = () =>
  api.post('/auth/logout', {}, { headers: authHeaders() });

export const getMe = () =>
  api.get('/auth/me', { headers: authHeaders() });

export const getStats = () =>
  api.get('/stats', { headers: authHeaders() });

export const getUsers = () =>
  api.get('/users', { headers: authHeaders() });

export const createUser = (data) =>
  api.post('/users', data, { headers: authHeaders() });

export const deleteUser = (id) =>
  api.delete(`/users/${id}`, { headers: authHeaders() });

export const getSeries = () => api.get('/series');
export const getSeriesById = (id) => api.get(`/series/${id}`);
export const createSeries = (formData) =>
  api.post('/series', formData, { headers: { 'Content-Type': 'multipart/form-data', ...authHeaders() } });
export const deleteSeries = (id) =>
  api.delete(`/series/${id}`, { headers: authHeaders() });

export const getVideos = (seriesId) => api.get(`/series/${seriesId}/videos`);
export const getVideo = (id) => api.get(`/videos/${id}`);
export const uploadVideo = (formData) =>
  api.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data', ...authHeaders() } });
export const deleteVideo = (id) =>
  api.delete(`/videos/${id}`, { headers: authHeaders() });

export const getStreamUrl = (id) => `${API_BASE}/stream/${id}`;

export default api;
