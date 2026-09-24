import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, Tv, RotateCcw } from 'lucide-react';
import { renderStrokesToCanvas, normalizePoint } from '../utils/strokeSpline.js';
import { soundEngine } from '../utils/audio.js';

export default function LandingPage({ onCreateRoom, onJoinRoom, onStartMobileController }) {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [sandboxStrokes, setSandboxStrokes] = useState([]);
  const [isDrawingSandbox, setIsDrawingSandbox] = useState(false);

  const blackoutRef = useRef(null);
  const hostCanvasRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (hostCanvasRef.current) {
        const canvas = hostCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        renderStrokesToCanvas(ctx, canvas, sandboxStrokes, { color: '#000000', lineWidth: 4 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sandboxStrokes]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!blackoutRef.current) return;
    const rect = blackoutRef.current.getBoundingClientRect();
    const pt = normalizePoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    
    setIsDrawingSandbox(true);
    setSandboxStrokes(prev => [...prev, [pt]]);
    soundEngine.playScratch();
  };

  const handlePointerMove = (e) => {
    if (!isDrawingSandbox || !blackoutRef.current) return;
    e.preventDefault();
    const rect = blackoutRef.current.getBoundingClientRect();
    const pt = normalizePoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);

    setSandboxStrokes(prev => {
      if (prev.length === 0) return prev;
      const lastStroke = [...prev[prev.length - 1], pt];
      return [...prev.slice(0, -1), lastStroke];
    });

    if (Math.random() < 0.25) soundEngine.playScratch();
  };

  const handlePointerUp = () => setIsDrawingSandbox(false);

  const clearSandbox = () => setSandboxStrokes([]);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCodeInput.trim()) {
      onJoinRoom(joinCodeInput.trim().toUpperCase());
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="font-syne" style={{
          fontSize: '3rem',
          lineHeight: 1.05,
          marginBottom: '16px',
          textTransform: 'uppercase'
        }}>
          DRAW BLIND.<br />
          <span className="highlight-mono">PANIC LIVE.</span>
        </h1>

        <p style={{
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: 'var(--pencil)',
          maxWidth: '600px',
          margin: '0 auto 28px'
        }}>
          A mobile party scribble game where your phone turns pitch black while you scrawl absurd prompts. Your strokes stream live onto the TV screen while friends guess!
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <button 
            className="sketch-btn primary" 
            style={{ fontSize: '1.1rem', padding: '16px 28px' }}
            onClick={onStartMobileController}
          >
            <Smartphone size={22} /> PLAY ON MOBILE
          </button>

          <button 
            className="sketch-btn" 
            style={{ fontSize: '1.1rem', padding: '16px 24px' }}
            onClick={onCreateRoom}
          >
            <Tv size={22} /> HOST TV ROOM
          </button>
        </div>

        <form onSubmit={handleJoinSubmit} style={{ display: 'inline-flex', gap: '8px', background: '#FFF', padding: '10px', border: 'var(--border-thick)', boxShadow: 'var(--shadow)' }}>
          <input
            type="text"
            placeholder="ROOM CODE"
            maxLength={6}
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '1rem',
              fontWeight: 700,
              padding: '10px 14px',
              border: 'var(--border-thin)',
              background: '#FAFAFA',
              width: '150px',
              textTransform: 'uppercase'
            }}
          />
          <button className="sketch-btn primary" type="submit" style={{ padding: '10px 18px' }}>
            JOIN GAME
          </button>
        </form>
      </div>

      <div className="sketch-card" style={{ marginBottom: '40px' }}>
        <div className="tape-corner"></div>
        <div className="tape-corner-right"></div>
        
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.1rem',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>MOBILE BLIND DRAWING DEMO</span>
          <span style={{ fontSize: '0.75rem', background: '#000', color: '#FFF', padding: '2px 8px' }}>
            BLACK & WHITE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <div
            ref={blackoutRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              background: '#000000',
              border: 'var(--border-thick)',
              height: '220px',
              borderRadius: '8px',
              position: 'relative',
              cursor: 'crosshair',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '14px',
              touchAction: 'none'
            }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px', pointerEvents: 'none' }}>
              PROMPT: "A CAT IN SNEAKERS"
            </span>
            <span style={{ color: '#888888', fontSize: '0.78rem', pointerEvents: 'none' }}>
              DRAG FINGER / MOUSE HERE<br />
              <strong style={{ color: '#FFFFFF' }}>(MOBILE SCREEN IS PITCH BLACK)</strong>
            </span>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: 'var(--border-thick)',
            height: '220px',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <canvas ref={hostCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#000000',
              color: '#FFFFFF',
              padding: '2px 6px',
              fontSize: '0.68rem',
              fontWeight: 700
            }}>
              TV STAGE STREAM
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--pencil)' }}>
          <span>Mobile Phone (Blind)</span>
          <button className="sketch-btn" onClick={clearSandbox} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <RotateCcw size={12} /> Clear Demo
          </button>
          <span>Shared TV Screen</span>
        </div>
      </div>
    </div>
  );
}
