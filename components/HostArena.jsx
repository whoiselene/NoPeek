import React, { useRef, useEffect } from 'react';
import { renderStrokesToCanvas } from '../utils/strokeSpline.js';
import { generateLetterMask } from '../utils/prompts.js';

export default function HostArena({
  gameState,
  strokes,
  guesses,
  onEndRound,
  onSkipPrompt
}) {
  const canvasRef = useRef(null);
  const guessStreamRef = useRef(null);

  useEffect(() => {
    if (guessStreamRef.current) {
      guessStreamRef.current.scrollTop = guessStreamRef.current.scrollHeight;
    }
  }, [guesses]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      renderStrokesToCanvas(ctx, canvas, strokes, { color: '#000000', lineWidth: 4 });
    }
  }, [strokes]);

  const revealedRatio = 1 - (gameState.timeLeft / (gameState.maxTime || 45));
  const letterMask = generateLetterMask(gameState.prompt, Math.max(0.15, revealedRatio * 0.45));

  return (
    <div className="sketch-card" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '14px',
        borderBottom: 'var(--border-thick)',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.95rem',
            fontWeight: 700,
            background: '#000000',
            color: '#FFFFFF',
            padding: '6px 12px',
            border: 'var(--border-thin)'
          }}>
            ROUND {gameState.round} / {gameState.maxRounds}
          </span>
          <span style={{ fontSize: '0.95rem', color: 'var(--pencil)' }}>
            DRAWER: <strong>{gameState.drawerName} (BLIND)</strong>
          </span>
        </div>

        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.8rem',
          fontWeight: 800,
          background: '#000000',
          color: '#FFFFFF',
          padding: '4px 14px',
          borderRadius: '4px'
        }}>
          {gameState.timeLeft}s
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div style={{
          position: 'relative',
          background: '#FFFFFF',
          border: 'var(--border-thick)',
          height: '460px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#000000',
            color: '#FFFFFF',
            padding: '8px 14px',
            fontSize: '1rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow)',
            zIndex: 2,
            letterSpacing: '2px'
          }}>
            MYSTERY PROMPT: <span>{letterMask}</span>
          </div>

          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>

        <div style={{
          border: 'var(--border-thick)',
          background: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          height: '460px'
        }}>
          <div style={{
            padding: '12px 14px',
            fontWeight: 700,
            borderBottom: 'var(--border-thin)',
            background: '#FFFFFF',
            fontSize: '0.9rem'
          }}>
            LIVE GUESS TERMINAL
          </div>

          <div ref={guessStreamRef} style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {guesses.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--pencil)', textAlign: 'center', margin: 'auto' }}>
                Waiting for player guesses...
              </div>
            ) : (
              guesses.map((g, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: g.status === 'EXACT' ? '#000000' : (g.status === 'WARM' ? '#EAEAEA' : '#FFFFFF'),
                    color: g.status === 'EXACT' ? '#FFFFFF' : '#000000',
                    border: 'var(--border-thin)',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    boxShadow: '2px 2px 0px #000000'
                  }}
                >
                  <strong>{g.playerName}:</strong> {g.text}
                  {g.status === 'EXACT' && ' ★ (EXACT MATCH!)'}
                  {g.status === 'WARM' && ' 🔥 (WARM!)'}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button className="sketch-btn" onClick={onSkipPrompt}>
          Next / Skip Prompt
        </button>

        <span style={{ fontSize: '0.82rem', color: 'var(--pencil)' }}>
          High contrast monochrome live vector stream
        </span>

        <button className="sketch-btn primary" onClick={onEndRound}>
          Reveal Prompt & Autopsy
        </button>
      </div>
    </div>
  );
}
