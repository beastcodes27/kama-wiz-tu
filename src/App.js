import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import { getMe } from './api';
import './App.css';

function AdminRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }
    getMe().then(({ data }) => setUser(data)).catch(() => {
      localStorage.removeItem('admin_token');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#666', textAlign: 'center', marginTop: 80 }}>Loading...</div>;
  if (!user) return <AdminLogin onLogin={setUser} />;
  return <Admin user={user} onLogout={() => setUser(null)} />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/beast" element={<AdminRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
