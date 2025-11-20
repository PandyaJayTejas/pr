export const SCREEN_WIDTH = window.innerWidth;
export const SCREEN_HEIGHT = window.innerHeight;

export const PLAYER_SPEED = 4;
export const PLAYER_RADIUS = 12;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_AMMO = 30;
export const RELOAD_TIME = 1500;
export const FIRE_RATE = 100; // ms

export const ALLY_SPEED = 3.5;
export const ALLY_RADIUS = 12;
export const ALLY_MAX_HEALTH = 150;

export const BULLET_SPEED = 15;
export const BULLET_RADIUS = 2;
export const BULLET_DAMAGE = 25;

export const ENEMY_SPAWN_RATE = 1500; // ms
export const ENEMY_BASE_SPEED = 2;
export const ENEMY_RADIUS = 12;

export const JOYSTICK_MAX_RADIUS = 50;

export const COLORS = {
  PLAYER: '#34d399', // Emerald 400
  ALLY: '#3b82f6', // Blue 500
  ENEMY_GRUNT: '#ef4444', // Red 500
  ENEMY_BRUTE: '#7f1d1d', // Red 900
  ENEMY_RUNNER: '#f87171', // Red 400
  BULLET: '#facc15', // Yellow 400
  BULLET_ALLY: '#60a5fa', // Blue 400
  OBSTACLE: '#334155', // Slate 700
  BACKGROUND: '#0f172a', // Slate 900
  BLOOD: '#991b1b',
  JOYSTICK_BASE: 'rgba(255, 255, 255, 0.1)',
  JOYSTICK_HANDLE: 'rgba(52, 211, 153, 0.5)',
};

export const DEFAULT_MISSION: any = {
  operationName: "Operation: Silent Echo",
  briefing: "Hostiles have occupied the sector. Eliminate all threats. Intelligence suggests heavy resistance.",
  objective: "Survive as long as possible.",
  difficulty: "Standard"
};