import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import UIOverlay from './components/UIOverlay';
import AfterActionReport from './components/AfterActionReport';
import { GameState, Player, MissionIntel } from './types';
import { generateMissionIntel } from './services/geminiService';
import { PLAYER_MAX_HEALTH, PLAYER_MAX_AMMO, DEFAULT_MISSION, COLORS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [mission, setMission] = useState<MissionIntel>(DEFAULT_MISSION);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Player state for UI synchronization
  const [playerState, setPlayerState] = useState<Player>({
    id: 'player',
    pos: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    radius: 0,
    color: COLORS.PLAYER,
    active: true,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    ammo: PLAYER_MAX_AMMO,
    maxAmmo: PLAYER_MAX_AMMO,
    score: 0,
    weapon: 'ASSAULT RIFLE',
    lastFired: 0
  });

  const startGame = async () => {
    setLoading(true);
    try {
      const intel = await generateMissionIntel();
      setMission(intel);
    } catch (e) {
      console.error("Using default intel");
      setMission(DEFAULT_MISSION);
    }
    setLoading(false);
    setScore(0);
    setWave(1);
    setGameState(GameState.PLAYING);
    
    // Reset player state
    setPlayerState(prev => ({
        ...prev,
        health: PLAYER_MAX_HEALTH,
        ammo: PLAYER_MAX_AMMO
    }));
  };

  const handleGameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);
  }, []);

  const handleRestart = () => {
    setGameState(GameState.MENU);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      
      {/* Game Engine Render Layer */}
      <GameCanvas 
        gameState={gameState}
        onScoreUpdate={setScore}
        onHealthUpdate={setPlayerState}
        onWaveUpdate={setWave}
        onGameOver={handleGameOver}
      />

      {/* UI Layers */}
      {gameState === GameState.MENU && (
        <MainMenu onStart={startGame} isLoading={loading} />
      )}

      {gameState === GameState.PLAYING && (
        <UIOverlay 
          player={playerState} 
          score={score} 
          wave={wave}
          mission={mission}
        />
      )}

      {gameState === GameState.GAME_OVER && (
        <AfterActionReport 
          score={score}
          wave={wave}
          mission={mission}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;
