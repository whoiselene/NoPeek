import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import LandingPage from './components/LandingPage.jsx';
import HostLobby from './components/HostLobby.jsx';
import HostArena from './components/HostArena.jsx';
import PlayerController from './components/PlayerController.jsx';
import RoundAutopsy from './components/RoundAutopsy.jsx';
import MuseumOfShame from './components/MuseumOfShame.jsx';
import SimulatedPhoneModal from './components/SimulatedPhoneModal.jsx';
import SvgFilters from './components/SvgFilters.jsx';
import { PROMPT_PACKS } from './utils/prompts.js';

import { roomChannel } from './utils/roomChannel.js';
import { soundEngine } from './utils/audio.js';

export default function App() {
  const [currentView, setCurrentView] = useState('LANDING');
  const [roomCode, setRoomCode] = useState('GRFT');
  const [showSimulatedPhone, setShowSimulatedPhone] = useState(false);

  const [player, setPlayer] = useState({
    id: 'usr_elene',
    name: 'Elene',
    isHost: true,
    score: 0,
    isReady: true,
    avatarIcon: '🎨'
  });

  const [players, setPlayers] = useState([
    { id: 'usr_elene', name: 'Elene', isHost: true, score: 0, isReady: true, avatarIcon: '🎨' },
    { id: 'bot_gio', name: 'Gio', isBot: true, score: 250, isReady: true, avatarIcon: '🦊' },
    { id: 'bot_neka', name: 'Neka', isBot: true, score: 180, isReady: true, avatarIcon: '🐻' },
    { id: 'bot_salome', name: 'Salome', isBot: true, score: 300, isReady: true, avatarIcon: '🐙' }
  ]);

  const [gameSettings, setGameSettings] = useState({
    roundDurationSec: 45,
    maxRounds: 5,
    promptPack: 'CHAOS'
  });

  const [gameState, setGameState] = useState({
    phase: 'LOBBY',
    drawerId: 'usr_elene',
    drawerName: 'Elene',
    prompt: 'AN OCTOPUS PLAYING DRUMS',
    round: 1,
    maxRounds: 5,
    timeLeft: 45,
    maxTime: 45
  });
  

  const [strokes, setStrokes] = useState([]);
  const [guesses, setGuesses] = useState([
    { playerName: 'Gio', text: 'a toaster with legs?', status: 'INCORRECT' },
    { playerName: 'Neka', text: 'octopus playing drums', status: 'EXACT' }
  ]);

  const [shameZine, setShameZine] = useState([]);

  useEffect(() => {
    const unsubscribe = roomChannel.subscribe((msg) => {
      if (!msg) return;

      if (msg.event === 'STROKE_START') {
        setStrokes(prev => [...prev, [msg.point]]);
      } else if (msg.event === 'STROKE_MOVE') {
        setStrokes(prev => {
          if (prev.length === 0) return [[msg.point]];
          const last = [...prev[prev.length - 1], msg.point];
          return [...prev.slice(0, -1), last];
        });
      } else if (msg.event === 'STROKE_CLEAR') {
        setStrokes([]);
      } else if (msg.event === 'SUBMIT_GUESS') {
        setGuesses(prev => [...prev, {
          playerName: msg.playerName,
          text: msg.guess,
          status: msg.status
        }]);

        if (msg.status === 'EXACT') {
          setPlayers(prev => prev.map(p => {
            if (p.id === msg.playerId) return { ...p, score: (p.score || 0) + 300 };
            if (p.id === gameState.drawerId) return { ...p, score: (p.score || 0) + 150 };
            return p;
          }));
          handleTriggerAutopsy();
        }
      } else if (msg.event === 'STATE_SYNC') {
        setGameState(msg.state);
      }
    });

    return unsubscribe;
  }, [gameState.drawerId]);

  useEffect(() => {
    let timer;
    if (gameState.phase === 'PLAYING' && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            handleTriggerAutopsy();
            return { ...prev, timeLeft: 0 };
          }
          if (prev.timeLeft <= 6) soundEngine.playTick();
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.phase, gameState.timeLeft]);

  useEffect(() => {
    let botInterval;
    const currentDrawer = players.find(p => p.id === gameState.drawerId);
    if (gameState.phase === 'PLAYING' && currentDrawer?.isBot) {
      let botStep = 0;
      botInterval = setInterval(() => {
        if (botStep > 40) {
          clearInterval(botInterval);
          return;
        }
        const px = 0.2 + (Math.sin(botStep * 0.4) * 0.3) + Math.random() * 0.1;
        const py = 0.2 + (Math.cos(botStep * 0.3) * 0.3) + Math.random() * 0.1;
        
        roomChannel.broadcast({
          event: botStep % 8 === 0 ? 'STROKE_START' : 'STROKE_MOVE',
          point: { x: Math.max(0.05, Math.min(0.95, px)), y: Math.max(0.05, Math.min(0.95, py)) }
        });

        if (botStep === 15 || botStep === 28) {
          const botGuesses = ["is that a blender?", "angry octopus?", "a flying shoe?", "dancing cat!"];
          const randomBot = players.find(p => p.isBot && p.id !== gameState.drawerId) || players[1];
          const guessText = botGuesses[Math.floor(Math.random() * botGuesses.length)];
          roomChannel.broadcast({
            event: 'SUBMIT_GUESS',
            playerId: randomBot.id,
            playerName: randomBot.name,
            guess: guessText,
            status: 'INCORRECT'
          });
        }

        botStep++;
      }, 250);
    }
    return () => clearInterval(botInterval);
  }, [gameState.phase, gameState.drawerId, players]);

  const handleCreateRoom = () => {
    const code = 'NOPEEK-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(code);
    setCurrentView('HOST_LOBBY');
  };

  const handleJoinRoom = (code) => {
    setRoomCode(code);
    setCurrentView('PLAYER_CONTROLLER');
  };

  const handleAddBot = () => {
    const botNames = ['Gio', 'Neka', 'Salome', 'Luka', 'Sofi'];
    const botIcons = ['🦊', '🐻', '🐙', '🦄', '🤖'];
    const pick = botNames[players.length % botNames.length];
    const icon = botIcons[players.length % botIcons.length];

    const newBot = {
      id: `bot_${Date.now()}`,
      name: `${pick} (AI)`,
      isBot: true,
      score: 0,
      isReady: true,
      avatarIcon: icon
    };

    setPlayers(prev => [...prev, newBot]);
    soundEngine.playSuccess();
  };

  const handleStartGame = () => {
    const pack = PROMPT_PACKS[gameSettings.promptPack] || PROMPT_PACKS.CHAOS;
    const prompt = pack.prompts[Math.floor(Math.random() * pack.prompts.length)];
    const drawer = players[0];

    const newState = {
      phase: 'PLAYING',
      drawerId: drawer.id,
      drawerName: drawer.name,
      prompt,
      round: 1,
      maxRounds: gameSettings.maxRounds,
      timeLeft: gameSettings.roundDurationSec,
      maxTime: gameSettings.roundDurationSec
    };

    setStrokes([]);
    setGuesses([]);
    setGameState(newState);
    setCurrentView('HOST_ARENA');
    roomChannel.broadcast({ event: 'STATE_SYNC', state: newState });
    soundEngine.playSuccess();
  };

  const handleSkipPrompt = () => {
    const pack = PROMPT_PACKS[gameSettings.promptPack] || PROMPT_PACKS.CHAOS;
    const prompt = pack.prompts[Math.floor(Math.random() * pack.prompts.length)];
    setStrokes([]);
    setGameState(prev => ({ ...prev, prompt, timeLeft: prev.maxTime }));
  };

  const handleTriggerAutopsy = () => {
    setShameZine(prev => [
      ...prev,
      {
        prompt: gameState.prompt,
        drawer: gameState.drawerName,
        strokes: [...strokes]
      }
    ]);

    const newState = { ...gameState, phase: 'AUTOPSY' };
    setGameState(newState);
    setCurrentView('ROUND_AUTOPSY');
    roomChannel.broadcast({ event: 'STATE_SYNC', state: newState });
  };

  const handleNextRound = () => {
    if (gameState.round >= gameState.maxRounds) {
      const newState = { ...gameState, phase: 'GAMEOVER' };
      setGameState(newState);
      setCurrentView('MUSEUM_SHAME');
      roomChannel.broadcast({ event: 'STATE_SYNC', state: newState });
    } else {
      const currentIdx = players.findIndex(p => p.id === gameState.drawerId);
      const nextDrawer = players[(currentIdx + 1) % players.length];
      const pack = PROMPT_PACKS[gameSettings.promptPack] || PROMPT_PACKS.CHAOS;
      const prompt = pack.prompts[Math.floor(Math.random() * pack.prompts.length)];

      const newState = {
        ...gameState,
        phase: 'PLAYING',
        drawerId: nextDrawer.id,
        drawerName: nextDrawer.name,
        prompt,
        round: gameState.round + 1,
        timeLeft: gameSettings.roundDurationSec
      };

      setStrokes([]);
      setGuesses([]);
      setGameState(newState);
      setCurrentView('HOST_ARENA');
      roomChannel.broadcast({ event: 'STATE_SYNC', state: newState });
    }
  };

  const handleSendStrokeStart = (pt) => {
    roomChannel.broadcast({ event: 'STROKE_START', point: pt });
  };

  const handleSendStrokeMove = (pt) => {
    roomChannel.broadcast({ event: 'STROKE_MOVE', point: pt });
  };

  const handleSendStrokeEnd = () => {
    roomChannel.broadcast({ event: 'STROKE_END' });
  };

  const handleSendClearStrokes = () => {
    roomChannel.broadcast({ event: 'STROKE_CLEAR' });
  };

  const handleSendGuess = (text, status) => {
    roomChannel.broadcast({
      event: 'SUBMIT_GUESS',
      playerId: player.id,
      playerName: player.name,
      guess: text,
      status
    });
  };

  const handleSaveAvatar = () => {
    setPlayer(prev => ({ ...prev, isReady: true }));
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isReady: true } : p));
    soundEngine.playSuccess();
    alert("Avatar saved!");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SvgFilters />

      <Header
        currentView={currentView}
        setView={setCurrentView}
        roomCode={roomCode}
        showSimulatedPhone={showSimulatedPhone}
        onToggleSimulatedPhone={() => setShowSimulatedPhone(!showSimulatedPhone)}
      />

      <main style={{ flex: 1, padding: '20px 0' }}>
        {currentView === 'LANDING' && (
          <LandingPage
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartMobileController={() => setCurrentView('PLAYER_CONTROLLER')}
          />
        )}

        {currentView === 'HOST_LOBBY' && (
          <HostLobby
            roomCode={roomCode}
            players={players}
            gameSettings={gameSettings}
            onUpdateSettings={(newSettings) => setGameSettings(prev => ({ ...prev, ...newSettings }))}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
            onOpenPhoneController={() => setCurrentView('PLAYER_CONTROLLER')}
          />
        )}

        {currentView === 'HOST_ARENA' && (
          <HostArena
            gameState={gameState}
            strokes={strokes}
            guesses={guesses}
            onEndRound={handleTriggerAutopsy}
            onSkipPrompt={handleSkipPrompt}
          />
        )}

        {currentView === 'PLAYER_CONTROLLER' && (
          <PlayerController
            roomCode={roomCode}
            player={player}
            gameState={gameState}
            onSendStrokeStart={handleSendStrokeStart}
            onSendStrokeMove={handleSendStrokeMove}
            onSendStrokeEnd={handleSendStrokeEnd}
            onSendClearStrokes={handleSendClearStrokes}
            onSendGuess={handleSendGuess}
            onSaveAvatar={handleSaveAvatar}
          />
        )}

        {currentView === 'ROUND_AUTOPSY' && (
          <RoundAutopsy
            gameState={gameState}
            strokes={strokes}
            players={players}
            onNextRound={handleNextRound}
          />
        )}

        {currentView === 'MUSEUM_SHAME' && (
          <MuseumOfShame
            players={players}
            shameZine={shameZine}
            onPlayAgain={() => {
              setGameState(prev => ({ ...prev, phase: 'LOBBY', round: 1 }));
              setCurrentView('HOST_LOBBY');
            }}
          />
        )}
      </main>

      <SimulatedPhoneModal
        isOpen={showSimulatedPhone}
        onClose={() => setShowSimulatedPhone(false)}
        roomCode={roomCode}
        player={player}
        gameState={gameState}
        onSendStrokeStart={handleSendStrokeStart}
        onSendStrokeMove={handleSendStrokeMove}
        onSendStrokeEnd={handleSendStrokeEnd}
        onSendClearStrokes={handleSendClearStrokes}
        onSendGuess={handleSendGuess}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
}
