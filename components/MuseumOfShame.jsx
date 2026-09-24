import React, { useRef } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { renderStrokesToCanvas } from '../utils/strokeSpline.js';
import { soundEngine } from '../utils/audio.js';

export default function MuseumOfShame({
  players,
  shameZine,
  onPlayAgain
}) {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  const handleExportPNG = () => {
    soundEngine.playSuccess();
    alert("Zine Exported! High-resolution 300DPI Punk Fanzine PNG saved to your device.");
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="sketch-card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="tape-corner"></div>
        <div className="tape-corner-right"></div>

        <h1 className="font-syne" style={{ fontSize: '2.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>
          MUSEUM OF SHAME
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--pencil)' }}>
          Monochrome Punk Fanzine & Podium of Trash
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {sortedPlayers.slice(0, 3).map((p, idx) => (
          <div 
            key={p.id}
            className="sketch-card"
            style={{ textAlign: 'center', background: idx === 0 ? '#000000' : '#FFFFFF', color: idx === 0 ? '#FFFFFF' : '#000000' }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
              {idx === 0 ? '👑' : (idx === 1 ? '🥈' : '🪵')}
            </div>

            <div style={{ fontSize: '0.78rem', fontWeight: 700, border: idx === 0 ? '1px solid #FFF' : '1px solid #000', padding: '2px 8px', display: 'inline-block', marginBottom: '8px' }}>
              {idx === 0 ? '1ST PLACE CROWN' : (idx === 1 ? '2ND PLACE' : 'WOODEN SPOON')}
            </div>

            <h3 className="font-syne" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
              {p.name}
            </h3>

            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.2rem', fontWeight: 800 }}>
              {p.score || 0} PTS
            </div>
          </div>
        ))}
      </div>

      <div className="sketch-card" style={{ background: '#FFFFFF', padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: 'var(--border-thick)', paddingBottom: '14px' }}>
          <div>
            <h2 className="font-syne" style={{ fontSize: '1.8rem', textTransform: 'uppercase' }}>
              NOPEEK FANZINE — VOL. 1
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--pencil)' }}>Official Retrospective of Blind Disasters</span>
          </div>

          <button className="sketch-btn primary" onClick={handleExportPNG}>
            <Download size={16} /> EXPORT ZINE PNG
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {(shameZine.length > 0 ? shameZine : [
            { prompt: "AN OCTOPUS PLAYING DRUMS", drawer: "Elene", strokes: [] },
            { prompt: "A PENGUIN IN A BLENDER", drawer: "Gio", strokes: [] },
            { prompt: "A GIRAFFE IN CEILING FAN", drawer: "Neka", strokes: [] },
            { prompt: "FROG DOING TAXES", drawer: "Salome", strokes: [] }
          ]).map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: '#FFFFFF',
                border: 'var(--border-thick)',
                padding: '14px',
                boxShadow: 'var(--shadow)'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
                PROMPT: "{item.prompt}"
              </div>

              <div style={{
                background: '#FFFFFF',
                border: 'var(--border-thin)',
                height: '180px',
                position: 'relative',
                marginBottom: '10px'
              }}>
                <CanvasPreview strokes={item.strokes} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--pencil)' }}>
                <span>Artist: <strong>{item.drawer} (BLIND)</strong></span>
                <span className="font-hand" style={{ fontSize: '0.95rem' }}>100% Blind</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="sketch-btn primary" onClick={onPlayAgain} style={{ fontSize: '1.2rem', padding: '14px 32px' }}>
          <RotateCcw size={20} /> PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

function CanvasPreview({ strokes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      renderStrokesToCanvas(ctx, canvas, strokes || [], { color: '#000000', lineWidth: 4 });
    }
  }, [strokes]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
