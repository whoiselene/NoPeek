import React, { useState, useRef, useEffect } from 'react';
import { Play, Award } from 'lucide-react';
import { renderStrokesToCanvas } from '../utils/strokeSpline.js';
import { soundEngine } from '../utils/audio.js';

export default function RoundAutopsy({
  gameState,
  strokes,
  players,
  onNextRound
}) {
  const [replaySpeed, setReplaySpeed] = useState(2);
  const [scrubIndex, setScrubIndex] = useState(100);
  const [isReplaying, setIsReplaying] = useState(false);

  const canvasRef = useRef(null);

  const totalStrokePoints = strokes.reduce((acc, st) => acc + st.length, 0);

  const getScrubbedStrokes = () => {
    if (scrubIndex >= 100) return strokes;

    const targetPoints = Math.floor((scrubIndex / 100) * totalStrokePoints);
    let count = 0;
    const result = [];

    for (const st of strokes) {
      if (count >= targetPoints) break;
      if (count + st.length <= targetPoints) {
        result.push(st);
        count += st.length;
      } else {
        const remaining = targetPoints - count;
        result.push(st.slice(0, remaining));
        count += remaining;
        break;
      }
    }
    return result;
  };

  useEffect(() => {
    if (isReplaying) {
      const interval = setInterval(() => {
        setScrubIndex(prev => {
          if (prev >= 100) {
            setIsReplaying(false);
            return 100;
          }
          return prev + (replaySpeed * 2);
        });
        soundEngine.playScratch();
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isReplaying, replaySpeed]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      renderStrokesToCanvas(ctx, canvas, getScrubbedStrokes(), { color: '#000000', lineWidth: 4 });
    }
  }, [scrubIndex, strokes]);

  const handlePlayReplay = () => {
    setScrubIndex(0);
    setIsReplaying(true);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px' }}>
      <div className="sketch-card" style={{ textAlign: 'center', marginBottom: '24px', background: '#FFFFFF' }}>
        <div className="tape-corner"></div>
        <div className="tape-corner-right"></div>

        <span style={{ fontSize: '0.85rem', color: 'var(--pencil)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ROUND AUTOPSY & CRIME SCENE BREAKDOWN
        </span>

        <div style={{
          display: 'inline-block',
          margin: '16px auto',
          padding: '12px 24px',
          border: '4px solid #000000',
          background: '#000000',
          color: '#FFFFFF',
          fontFamily: "'Syne', sans-serif",
          fontSize: '2.2rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          boxShadow: 'var(--shadow)'
        }}>
          PROMPT: {gameState.prompt}
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--pencil)' }}>
          Blind Artist: <strong>{gameState.drawerName}</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="sketch-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="font-syne" style={{ fontSize: '1.2rem' }}>
              BLIND DISASTER REPLAY
            </h3>
            <span style={{ fontSize: '0.78rem', background: '#000', color: '#FFF', padding: '2px 8px' }}>
              {scrubIndex}% SCRUBBED
            </span>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: 'var(--border-thick)',
            height: '340px',
            position: 'relative',
            marginBottom: '14px'
          }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={scrubIndex}
              onChange={(e) => {
                setIsReplaying(false);
                setScrubIndex(Number(e.target.value));
              }}
              style={{ width: '100%', accentColor: '#000000', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="sketch-btn primary" onClick={handlePlayReplay} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <Play size={14} /> Play Replay ({replaySpeed}x)
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 5].map(spd => (
                  <button
                    key={spd}
                    className={`sketch-btn ${replaySpeed === spd ? 'primary' : ''}`}
                    onClick={() => setReplaySpeed(spd)}
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sketch-card">
          <h3 className="font-syne" style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} /> SCORE TALLY
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {players.map((p, idx) => (
              <div 
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  border: 'var(--border-thin)',
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700 }}>#{idx + 1}</span>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                </div>

                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 800 }}>
                  {p.score || 0} PTS
                </div>
              </div>
            ))}
          </div>

          <button
            className="sketch-btn primary"
            onClick={onNextRound}
            style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
          >
            NEXT ROUND ➔
          </button>
        </div>
      </div>
    </div>
  );
}
