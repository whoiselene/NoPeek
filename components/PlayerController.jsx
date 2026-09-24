import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, EyeOff, Smartphone } from 'lucide-react';
import { normalizePoint, renderStrokesToCanvas } from '../utils/strokeSpline.js';
import { evaluateGuess } from '../utils/fuzzyMatch.js';
import { soundEngine } from '../utils/audio.js';

export default function PlayerController({
  roomCode,
  player,
  gameState,
  onSendStrokeStart,
  onSendStrokeMove,
  onSendStrokeEnd,
  onSendClearStrokes,
  onSendGuess,
  onSaveAvatar
}) {
  const [guessInput, setGuessInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState(null);
  const [showPromptSplash, setShowPromptSplash] = useState(true);
  const [touchPos, setTouchPos] = useState(null);
  const [avatarStrokes, setAvatarStrokes] = useState([]);
  const [isDrawingAvatar, setIsDrawingAvatar] = useState(false);

  const blackoutSurfaceRef = useRef(null);
  const avatarCanvasRef = useRef(null);
  const isDrawer = gameState.drawerId === player.id;

  useEffect(() => {
    if (gameState.phase === 'PLAYING' && isDrawer) {
      setShowPromptSplash(true);
      const timer = setTimeout(() => setShowPromptSplash(false), 3800);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.round, isDrawer]);

  useEffect(() => {
    if (gameState.phase === 'PLAYING' && isDrawer && gameState.timeLeft % 10 === 0 && gameState.timeLeft > 0) {
      if (navigator.vibrate) navigator.vibrate(80);
    }
  }, [gameState.timeLeft, isDrawer, gameState.phase]);

  useEffect(() => {
    if (avatarCanvasRef.current) {
      const canvas = avatarCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      renderStrokesToCanvas(ctx, canvas, avatarStrokes, { lineWidth: 3, color: '#000000' });
    }
  }, [avatarStrokes]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!blackoutSurfaceRef.current) return;
    const rect = blackoutSurfaceRef.current.getBoundingClientRect();
    const pt = normalizePoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    
    setTouchPos(pt);
    onSendStrokeStart(pt);
    soundEngine.playScratch();
  };

  const handlePointerMove = (e) => {
    if (!touchPos || !blackoutSurfaceRef.current) return;
    e.preventDefault();
    const rect = blackoutSurfaceRef.current.getBoundingClientRect();
    const pt = normalizePoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);

    setTouchPos(pt);
    onSendStrokeMove(pt);
    if (Math.random() < 0.25) soundEngine.playScratch();
  };

  const handlePointerUp = () => {
    setTouchPos(null);
    onSendStrokeEnd();
  };

  const handleAvatarDown = (e) => {
    e.preventDefault();
    if (!avatarCanvasRef.current) return;
    const rect = avatarCanvasRef.current.getBoundingClientRect();
    const pt = normalizePoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    setIsDrawingAvatar(true);
    setAvatarStrokes(prev => [...prev, [pt]]);
  };

  const handleAvatarMove = (e) => {
    if (!isDrawingAvatar || !avatarCanvasRef.current) return;
    e.preventDefault();
    const rect = avatarCanvasRef.current.getBoundingClientRect();
    const pt = normalizePoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    setAvatarStrokes(prev => {
      if (prev.length === 0) return prev;
      const last = [...prev[prev.length - 1], pt];
      return [...prev.slice(0, -1), last];
    });
  };

  const handleAvatarUp = () => setIsDrawingAvatar(false);

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    const val = guessInput.trim();
    if (!val) return;

    const evalRes = evaluateGuess(val, gameState.prompt);
    onSendGuess(val, evalRes.result);

    if (evalRes.result === 'EXACT') {
      soundEngine.playSuccess();
      setLastFeedback({ text: 'EXACT MATCH! +300 PTS', status: 'correct' });
    } else if (evalRes.result === 'WARM') {
      soundEngine.playWarm();
      setLastFeedback({ text: "WARM! YOU'RE ON THE TRACK", status: 'warm' });
    } else {
      soundEngine.playThud();
      setLastFeedback({ text: 'WRONG! TRY AGAIN', status: 'wrong' });
    }

    setGuessInput('');
  };

  return (
    <div className="mobile-app-shell">
      <div style={{
        padding: '12px 16px',
        background: '#000000',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 'var(--border-thick)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {player.name}
          </span>
        </div>
        <div style={{ background: '#FFFFFF', color: '#000000', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 800 }}>
          ROOM: {roomCode}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {gameState.phase === 'LOBBY' && (
          <div style={{ padding: '24px 16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 className="font-syne" style={{ fontSize: '1.5rem', marginBottom: '8px', textTransform: 'uppercase' }}>
              DOODLE YOUR AVATAR
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--pencil)', marginBottom: '16px' }}>
              Finger-draw your portrait before entering the TV room!
            </p>

            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 16px',
              background: '#FFFFFF',
              border: 'var(--border-thick)',
              borderRadius: '8px',
              touchAction: 'none',
              overflow: 'hidden'
            }}
            onPointerDown={handleAvatarDown}
            onPointerMove={handleAvatarMove}
            onPointerUp={handleAvatarUp}
            onPointerCancel={handleAvatarUp}
            >
              <canvas ref={avatarCanvasRef} style={{ width: '100%', height: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="sketch-btn" onClick={() => setAvatarStrokes([])} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <RotateCcw size={14} /> Clear
              </button>
              <button 
                className="sketch-btn primary" 
                onClick={() => onSaveAvatar(avatarStrokes)}
                style={{ padding: '8px 18px', fontSize: '0.8rem' }}
              >
                Save & Ready
              </button>
            </div>
          </div>
        )}

        {gameState.phase === 'PLAYING' && isDrawer && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {showPromptSplash && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: '#000000',
                color: '#FFFFFF',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center'
              }}>
                <EyeOff size={48} style={{ marginBottom: '16px' }} />
                <span style={{ fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 700 }}>YOU ARE DRAWING BLIND!</span>
                <h2 className="font-syne" style={{ fontSize: '2.2rem', margin: '14px 0', border: '3px solid #FFF', padding: '10px 18px', background: '#000' }}>
                  {gameState.prompt}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#AAAAAA' }}>
                  Your phone is about to cut pitch black. Draw blind!
                </p>
              </div>
            )}

            <div
              ref={blackoutSurfaceRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                background: '#000000',
                flex: 1,
                position: 'relative',
                touchAction: 'none',
                cursor: 'crosshair',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px 16px',
                color: '#FFFFFF',
                overflow: 'hidden'
              }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px dashed rgba(255,255,255,0.4)',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                pointerEvents: 'none'
              }}>
                SECRET PROMPT:
                <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '1.2rem', marginTop: '4px' }}>
                  {gameState.prompt}
                </strong>
              </div>

              <div style={{ textAlign: 'center', pointerEvents: 'none', opacity: 0.6 }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>[ DRAW BLIND HERE ]</span><br />
                <span style={{ fontSize: '0.8rem' }}>screen is pitch black — zero strokes show</span>
              </div>

              {touchPos && (
                <div
                  className="active-touch-dot"
                  style={{
                    left: `${touchPos.x * 100}%`,
                    top: `${touchPos.y * 100}%`
                  }}
                />
              )}

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="sketch-btn" onClick={onSendClearStrokes} style={{ padding: '8px 12px', fontSize: '0.75rem', background: '#FFF', color: '#000' }}>
                  <RotateCcw size={14} /> Clear All
                </button>

                <div style={{
                  flex: 1,
                  background: '#222222',
                  border: '1px solid #555555',
                  height: '32px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${(gameState.timeLeft / (gameState.maxTime || 45)) * 100}%`,
                    height: '100%',
                    background: '#FFFFFF',
                    transition: 'width 1s linear'
                  }} />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#000000',
                    mixBlendMode: 'difference'
                  }}>
                    {gameState.timeLeft}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState.phase === 'PLAYING' && !isDrawer && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', background: '#FFFFFF' }}>
            <div style={{ textAlign: 'center', margin: '10px 0 16px' }}>
              <span className="font-syne" style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>
                DRAWER: <span className="highlight-mono">{gameState.drawerName}</span>
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--pencil)', marginTop: '4px' }}>
                Look at the TV screen and type your guess below!
              </p>
            </div>

            {lastFeedback && (
              <div style={{
                padding: '10px 14px',
                marginBottom: '16px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textAlign: 'center',
                background: lastFeedback.status === 'correct' ? '#000000' : (lastFeedback.status === 'warm' ? '#EAEAEA' : '#FFFFFF'),
                color: lastFeedback.status === 'correct' ? '#FFFFFF' : '#000000',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow)'
              }}>
                {lastFeedback.text}
              </div>
            )}

            <div style={{ flex: 1 }} />

            <form onSubmit={handleGuessSubmit} style={{ display: 'flex', gap: '8px', paddingBottom: '60px' }}>
              <input
                type="text"
                className="guesser-input"
                placeholder="TYPE YOUR GUESS..."
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                style={{
                  flex: 1,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.9rem',
                  padding: '12px',
                  border: 'var(--border-thick)',
                  background: '#FAFAFA'
                }}
              />
              <button className="sketch-btn primary" type="submit" style={{ padding: '12px 18px' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {(gameState.phase === 'AUTOPSY' || gameState.phase === 'GAMEOVER') && (
          <div style={{ flex: 1, padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="font-syne" style={{ fontSize: '1.5rem', marginBottom: '8px', textTransform: 'uppercase' }}>
              {gameState.phase === 'AUTOPSY' ? 'ROUND COMPLETED' : 'MATCH FINISHED'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--pencil)' }}>
              Check the TV stage screen for replay and final zine breakdown!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
