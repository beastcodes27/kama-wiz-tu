import { useState, useEffect } from 'react';
import { getStats, getUsers, createUser, deleteUser, getSeries, createSeries, deleteSeries, getVideos, uploadVideo, deleteVideo, logout } from '../api';

export default function Admin({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const tabs = isAdmin ? ['Dashboard', 'Users', 'Series', 'Videos'] : ['Videos'];
  const [activeTab, setActiveTab] = useState(isAdmin ? 'Dashboard' : 'Videos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [videos, setVideos] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'admin' });
  const [newSeries, setNewSeries] = useState({ title: '', description: '', thumbnail: null });
  const [newVideo, setNewVideo] = useState({ title: '', episode_number: '', file: null });

  useEffect(() => { loadStats(); loadUsers(); loadSeries(); }, []);

  const loadStats = async () => {
    try { const { data } = await getStats(); setStats(data); } catch {}
  };
  const loadUsers = async () => {
    try { const { data } = await getUsers(); setUsers(data); } catch {}
  };
  const loadSeries = async () => {
    try { const { data } = await getSeries(); setSeries(data); } catch {}
  };
  const loadVideos = async (id) => {
    setSelectedSeries(id);
    try { const { data } = await getVideos(id); setVideos(data); } catch {}
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setNewUser({ username: '', password: '', role: 'admin' });
      loadUsers();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    loadUsers();
  };

  const handleCreateSeries = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', newSeries.title);
    fd.append('description', newSeries.description);
    if (newSeries.thumbnail) fd.append('thumbnail', newSeries.thumbnail);
    await createSeries(fd);
    setNewSeries({ title: '', description: '', thumbnail: null });
    loadSeries();
    loadStats();
  };

  const handleDeleteSeries = async (id) => {
    if (!window.confirm('Delete this series and all videos?')) return;
    await deleteSeries(id);
    if (selectedSeries === id) { setSelectedSeries(null); setVideos([]); }
    loadSeries();
    loadStats();
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!selectedSeries) return;
    const fd = new FormData();
    fd.append('series_id', selectedSeries);
    fd.append('title', newVideo.title);
    fd.append('episode_number', newVideo.episode_number);
    fd.append('video', newVideo.file);
    await uploadVideo(fd);
    setNewVideo({ title: '', episode_number: '', file: null });
    loadVideos(selectedSeries);
    loadStats();
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    await deleteVideo(id);
    loadVideos(selectedSeries);
    loadStats();
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    localStorage.removeItem('admin_token');
    onLogout();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#fff' }}>
      <header style={{ background: '#1a1a1a', borderBottom: '1px solid #333', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24, padding: 0, lineHeight: 1 }}>
            ☰
          </button>
          <h1 style={{ color: '#e50914', margin: 0, fontSize: 20 }}>Admin Panel</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#999', fontSize: 13 }}>{user?.username}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </header>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: '#151515', borderRight: '1px solid #333', zIndex: 100, paddingTop: 60 }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>✕</button>
          {tabs.map(t => (
            <button key={t} onClick={() => { setActiveTab(t); setMenuOpen(false); }} style={{
              display: 'block', width: '100%', padding: '14px 20px', background: activeTab === t ? '#1a1a1a' : 'transparent',
              border: 'none', color: activeTab === t ? '#e50914' : '#999', cursor: 'pointer', textAlign: 'left',
              fontSize: 14, fontWeight: activeTab === t ? 600 : 400, borderLeft: activeTab === t ? '3px solid #e50914' : '3px solid transparent',
            }}>{t}</button>
          ))}
        </div>
      )}

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />}

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {activeTab === 'Dashboard' && (
          <div>
            <h2 style={{ marginBottom: 20 }}>Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Series', value: stats?.series ?? '...', color: '#e50914' },
                { label: 'Videos', value: stats?.videos ?? '...', color: '#e5a509' },
                { label: 'Users', value: stats?.users ?? '...', color: '#09a5e5' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1a1a1a', borderRadius: 8, padding: 24, border: '1px solid #333', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ color: '#999', marginTop: 8, fontSize: 14 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Users' && (
          <div>
            <h2 style={{ marginBottom: 20 }}>Manage Users</h2>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required style={inputStyle} />
              <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required style={{ ...inputStyle, width: 150 }} />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ ...inputStyle, width: 120 }}>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
              <button type="submit" style={btnStyle}>Add User</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#999', fontSize: 13, textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>ID</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Username</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Role</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Created</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{u.id}</td>
                    <td style={{ padding: '10px 12px' }}>{u.username}</td>
                    <td style={{ padding: '10px 12px', color: u.role === 'admin' ? '#e50914' : '#e5a509', fontSize: 13 }}>{u.role}</td>
                    <td style={{ padding: '10px 12px', color: '#999', fontSize: 13 }}>{u.created_at}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {u.username !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: '1px solid #e50914', color: '#e50914', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Series' && (
          <div>
            <h2 style={{ marginBottom: 20 }}>Manage Series</h2>
            <form onSubmit={handleCreateSeries} style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #333' }}>
              <h3 style={{ marginBottom: 12, fontSize: 15 }}>Create New Series</h3>
              <input placeholder="Title" value={newSeries.title} onChange={e => setNewSeries({ ...newSeries, title: e.target.value })} required style={inputStyle} />
              <textarea placeholder="Description" value={newSeries.description} onChange={e => setNewSeries({ ...newSeries, description: e.target.value })} style={{ ...inputStyle, minHeight: 60 }} />
              <input type="file" accept="image/*" onChange={e => setNewSeries({ ...newSeries, thumbnail: e.target.files[0] })} style={inputStyle} />
              <button type="submit" style={btnStyle}>Create Series</button>
            </form>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {series.map(s => (
                <div key={s.id} style={{ background: '#1a1a1a', borderRadius: 8, padding: 16, border: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ margin: 0, fontSize: 15 }}>{s.title}</h3>
                    <button onClick={() => handleDeleteSeries(s.id)} style={{ background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                  <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Videos' && (
          <div>
            <h2 style={{ marginBottom: 20 }}>Manage Videos</h2>
            <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #333' }}>
              <h3 style={{ marginBottom: 12, fontSize: 15 }}>Upload Video</h3>
              <select value={selectedSeries || ''} onChange={e => loadVideos(Number(e.target.value))} style={inputStyle}>
                <option value="">Select Series</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              {selectedSeries && (
                <form onSubmit={handleUploadVideo}>
                  <input placeholder="Video Title" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} required style={inputStyle} />
                  <input type="number" placeholder="Episode #" value={newVideo.episode_number} onChange={e => setNewVideo({ ...newVideo, episode_number: e.target.value })} style={inputStyle} />
                  <input type="file" accept="video/*" onChange={e => setNewVideo({ ...newVideo, file: e.target.files[0] })} required style={inputStyle} />
                  <button type="submit" style={btnStyle}>Upload</button>
                </form>
              )}
            </div>
            {selectedSeries && (
              <div>
                <h3 style={{ marginBottom: 12, fontSize: 15 }}>Videos in Series</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#999', fontSize: 13, textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Ep</th>
                      <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Title</th>
                      <th style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>{v.episode_number}</td>
                        <td style={{ padding: '10px 12px' }}>{v.title}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => handleDeleteVideo(v.id)} style={{ background: 'none', border: '1px solid #e50914', color: '#e50914', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '8px 12px',
  marginBottom: 8,
  background: '#222',
  border: '1px solid #444',
  borderRadius: 4,
  color: '#fff',
  fontSize: 14,
  boxSizing: 'border-box',
  width: '100%',
};

const btnStyle = {
  background: '#e50914',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
};
