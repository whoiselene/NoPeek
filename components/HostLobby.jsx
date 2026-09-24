import React from 'react';
import { Play, Users, Settings, Smartphone, PlusCircle, Copy } from 'lucide-react';
import { PROMPT_PACKS } from '../utils/prompts.js';
import { soundEngine } from '../utils/audio.js';

export default function HostLobby({
  roomCode,
  players,
  gameSettings,
  onUpdateSettings,
  onStartGame,
  onAddBot,
  onOpenPhoneController
}) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard?.writeText(url);
    soundEngine.playSuccess();
    alert(`Copied Join Link: ${url}`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="sketch-card" style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--pencil)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            TV HOST STAGE LOBBY
          </span>
          <h1 className="font-syne" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            ROOM CODE:
            <span style={{
              background: '#000000',
              color: '#FFFFFF',
              padding: '4px 16px',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow)',
              letterSpacing: '4px'
            }}>
              {roomCode}
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sketch-btn" onClick={handleCopyLink}>
            <Copy size={16} /> COPY LINK
          </button>
          <button className="sketch-btn primary" onClick={onOpenPhoneController}>
            <Smartphone size={16} /> JOIN MOBILE
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="sketch-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="font-syne" style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> PLAYER ROSTER ({players.length})
            </h2>
            <button className="sketch-btn" onClick={onAddBot} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
              <PlusCircle size={14} /> Add AI Player
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px',
            minHeight: '200px'
          }}>
            {players.map((player) => (
              <div 
                key={player.id} 
                style={{
                  background: '#FFFFFF',
                  border: 'var(--border-thin)',
                  padding: '12px',
                  textAlign: 'center',
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  margin: '0 auto 8px',
                  background: '#FAFAFA',
                  border: 'var(--border-thin)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>
                  {player.avatarIcon || '✏️'}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {player.name}
                </div>

                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  border: '1px solid #000',
                  background: player.isHost ? '#000000' : '#EAEAEA',
                  color: player.isHost ? '#FFFFFF' : '#000000',
                  fontWeight: 700
                }}>
                  {player.isHost ? 'HOST' : (player.isBot ? 'AI BOT' : 'READY')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sketch-card">
          <h2 className="font-syne" style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} /> MATCH OPTIONS
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                ROUND TIMER DURATION
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[30, 45, 60].map(sec => (
                  <button
                    key={sec}
                    className={`sketch-btn ${gameSettings.roundDurationSec === sec ? 'primary' : ''}`}
                    onClick={() => onUpdateSettings({ roundDurationSec: sec })}
                    style={{ flex: 1, padding: '8px' }}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                TOTAL MATCH ROUNDS
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[3, 5, 7].map(rounds => (
                  <button
                    key={rounds}
                    className={`sketch-btn ${gameSettings.maxRounds === rounds ? 'primary' : ''}`}
                    onClick={() => onUpdateSettings({ maxRounds: rounds })}
                    style={{ flex: 1, padding: '8px' }}
                  >
                    {rounds} Rounds
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                PROMPT PACK
              </label>
              <select
                value={gameSettings.promptPack}
                onChange={(e) => onUpdateSettings({ promptPack: e.target.value })}
                style={{
                  width: '100%',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '10px',
                  border: 'var(--border-thick)',
                  background: '#FFF'
                }}
              >
                {Object.values(PROMPT_PACKS).map(pack => (
                  <option key={pack.id} value={pack.id}>
                    {pack.title} ({pack.prompts.length} Prompts)
                  </option>
                ))}
              </select>
            </div>

            <button
              className="sketch-btn primary"
              onClick={onStartGame}
              disabled={players.length === 0}
              style={{
                fontSize: '1.2rem',
                padding: '16px',
                marginTop: '8px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <Play size={20} /> START MATCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
