export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Position {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Position;
  velocity: Vector;
  radius: number;
  color: string;
  active: boolean;
}

export interface Player extends Entity {
  angle: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  weapon: string;
  lastFired: number;
}

export interface Ally extends Entity {
  angle: number;
  health: number;
  maxHealth: number;
  state: 'IDLE' | 'MOVING' | 'SHOOTING';
  targetEnemyId?: string;
  lastFired: number;
}

export interface Enemy extends Entity {
  health: number;
  speed: number;
  type: 'GRUNT' | 'BRUTE' | 'RUNNER';
}

export interface Bullet extends Entity {
  angle: number;
  speed: number;
  damage: number;
  owner: 'PLAYER' | 'ENEMY' | 'ALLY';
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
  alpha: number;
  size: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MissionIntel {
  operationName: string;
  briefing: string;
  objective: string;
  difficulty: string;
}