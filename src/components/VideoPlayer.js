import { useRef, useEffect, useState } from 'react';

export default function VideoPlayer({ src, poster, title }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
    };
    const onLoadedMeta = () => setDuration(el.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMeta);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMeta);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const toggleFullscreen = () => {
    const el = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="video-player"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        background: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        maxWidth: '100%',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        style={{ width: '100%', display: 'block', maxHeight: '70vh', cursor: 'pointer' }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '40px 12px 8px',
        }}
      >
        <div
          onClick={handleSeek}
          style={{
            height: '4px',
            background: '#555',
            borderRadius: '2px',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#e50914',
              borderRadius: '2px',
              transition: 'width 0.1s',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }}>
          <button onClick={togglePlay} style={btnStyle}>
            {isPlaying ? '⏸' : '▶'}
          </button>

          <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                videoRef.current.volume = v;
              }}
              style={{ width: '60px', accentColor: '#e50914' }}
            />
          </div>

          <button onClick={toggleFullscreen} style={btnStyle}>
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
};
