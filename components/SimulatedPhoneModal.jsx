import React from 'react';
import { X, Smartphone } from 'lucide-react';
import PlayerController from './PlayerController.jsx';

export default function SimulatedPhoneModal({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 99,
      width: '380px',
      maxHeight: '90vh',
      background: '#FFFFFF',
      border: 'var(--border-thick)',
      boxShadow: '10px 10px 0px #000',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        background: '#000000',
        color: '#FFFFFF',
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={16} />
          <span>DUAL-VIEW PHONE SIMULATOR</span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
        <PlayerController
          roomCode={roomCode}
          player={player}
          gameState={gameState}
          onSendStrokeStart={onSendStrokeStart}
          onSendStrokeMove={onSendStrokeMove}
          onSendStrokeEnd={onSendStrokeEnd}
          onSendClearStrokes={onSendClearStrokes}
          onSendGuess={onSendGuess}
          onSaveAvatar={onSaveAvatar}
        />
      </div>
    </div>
  );
}
