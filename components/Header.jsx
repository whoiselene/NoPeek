import React, { useState } from 'react';
import { Volume2, VolumeX, Smartphone, Tv, Home } from 'lucide-react';
import { soundEngine } from '../utils/audio.js';

export default function Header({ currentView, setView, roomCode, showSimulatedPhone, onToggleSimulatedPhone }) {
  const [isMuted, setIsMuted] = useState(soundEngine.muted);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header style={{
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 18px',
      borderBottom: 'var(--border-thick)',
      background: '#FFFFFF',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {roomCode ? (
          <div style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '4px 10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '1px'
          }}>
            ROOM: {roomCode}
          </div>
        ) : (
          <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>
            NOPEEK MOBILE
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="sketch-btn" 
          onClick={handleToggleMute} 
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button 
          className={`sketch-btn ${currentView === 'LANDING' ? 'primary' : ''}`}
          onClick={() => setView('LANDING')}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Home size={14} /> Home
        </button>

        <button 
          className={`sketch-btn ${currentView === 'PLAYER_CONTROLLER' ? 'primary' : ''}`}
          onClick={() => setView('PLAYER_CONTROLLER')}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Smartphone size={14} /> Controller
        </button>

        <button 
          className={`sketch-btn ${currentView === 'HOST_LOBBY' || currentView === 'HOST_ARENA' ? 'primary' : ''}`}
          onClick={() => setView('HOST_LOBBY')}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Tv size={14} /> TV View
        </button>
      </div>
    </header>
  );
}
