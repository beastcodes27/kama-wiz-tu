import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSeriesById, getStreamUrl } from '../api';
import VideoPlayer from '../components/VideoPlayer';

export default function Watch() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    getSeriesById(id).then(({ data }) => {
      setSeries(data);
      if (data?.videos?.length > 0) {
        setCurrentVideo(data.videos[0]);
      }
    });
  }, [id]);

  if (!series) return <div style={{ color: '#666', textAlign: 'center', marginTop: 80 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Link to="/" style={{ color: '#999', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 16 }}>← Back to series</Link>

      <h1 style={{ color: '#fff', margin: '0 0 4px' }}>{series.title}</h1>
      <p style={{ color: '#999', margin: '0 0 20px' }}>{series.description}</p>

      {currentVideo && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#e50914', fontSize: 16, marginBottom: 8 }}>
            Ep {currentVideo.episode_number}: {currentVideo.title}
          </h2>
          <VideoPlayer
            src={getStreamUrl(currentVideo.id)}
            title={currentVideo.title}
          />
        </div>
      )}

      {series.videos?.length > 1 && (
        <div>
          <h3 style={{ color: '#fff', marginBottom: 12 }}>Episodes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {series.videos.map(v => (
              <button
                key={v.id}
                onClick={() => setCurrentVideo(v)}
                style={{
                  background: currentVideo?.id === v.id ? '#e50914' : '#222',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Ep {v.episode_number}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
