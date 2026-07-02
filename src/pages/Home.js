import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSeries } from '../api';

export default function Home() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    getSeries().then(({ data }) => setSeries(data));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#e50914', margin: 0 }}>TamuStream</h1>
      </header>

      {series.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: 80, fontSize: 18 }}>No series available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {series.map(s => (
            <Link key={s.id} to={`/watch/${s.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#1a1a1a',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #333',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = '#e50914'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#333'; }}
              >
                <div style={{
                  height: 160,
                  background: '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555',
                  fontSize: 40,
                }}>
                  {s.thumbnail
                    ? <img src={`http://localhost:8000/uploads/thumbnails/${s.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🎬'}
                </div>
                <div style={{ padding: 12 }}>
                  <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: 16 }}>{s.title}</h3>
                  <p style={{ margin: 0, color: '#999', fontSize: 13 }}>{s.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
