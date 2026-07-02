import { useState } from 'react';
import { login } from '../api';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login(username, password);
      localStorage.setItem('admin_token', data.token);
      onLogin(data.user);
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', padding: 40, borderRadius: 8, width: 360, border: '1px solid #333' }}>
        <h1 style={{ color: '#e50914', marginBottom: 24, textAlign: 'center' }}>Admin Login</h1>
        {error && <p style={{ color: '#e50914', marginBottom: 12, fontSize: 13 }}>{error}</p>}
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={inputStyle}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>Sign In</button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: 12,
  background: '#222',
  border: '1px solid #444',
  borderRadius: 4,
  color: '#fff',
  fontSize: 14,
  boxSizing: 'border-box',
};

const btnStyle = {
  width: '100%',
  background: '#e50914',
  color: '#fff',
  border: 'none',
  padding: '12px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 600,
  marginTop: 8,
};
