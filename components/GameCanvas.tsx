import React, { useEffect, useRef, useState } from 'react';
import { 
  Player, Enemy, Bullet, Particle, Obstacle, Ally,
  GameState, Position, Vector, Entity 
} from '../types';
import { 
  SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, 
  PLAYER_SPEED, PLAYER_RADIUS, BULLET_SPEED, 
  ENEMY_SPAWN_RATE, ENEMY_BASE_SPEED, BULLET_RADIUS,
  FIRE_RATE, PLAYER_MAX_AMMO, RELOAD_TIME, PLAYER_MAX_HEALTH,
  BULLET_DAMAGE, ALLY_SPEED, ALLY_RADIUS, ALLY_MAX_HEALTH,
  JOYSTICK_MAX_RADIUS
} from '../constants';
import { RotateCcw } from 'lucide-react';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (player: Player) => void;
  onWaveUpdate: (wave: number) => void;
  onGameOver: () => void;
}

interface Joystick {
  id: number | null; // Touch ID
  origin: Position | null;
  current: Position | null;
  active: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, onScoreUpdate, onHealthUpdate, onWaveUpdate, onGameOver 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Game State Refs (Mutable for performance)
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    radius: PLAYER_RADIUS,
    color: COLORS.PLAYER,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    ammo: PLAYER_MAX_AMMO,
    maxAmmo: PLAYER_MAX_AMMO,
    score: 0,
    active: true,
    weapon: 'ASSAULT RIFLE',
    lastFired: 0
  });

  const alliesRef = useRef<Ally[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  
  // Input State
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef<Position>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);
  
  // Mobile Input State
  const leftStickRef = useRef<Joystick>({ id: null, origin: null, current: null, active: false });
  const rightStickRef = useRef<Joystick>({ id: null, origin: null, current: null, active: false });
  
  const lastEnemySpawnRef = useRef<number>(0);
  const isReloadingRef = useRef<boolean>(false);
  const waveRef = useRef<number>(1);

  // --- Initialization & Mobile Detection ---
  useEffect(() => {
    // Simple mobile detection
    const checkMobile = () => {
      const ua = navigator.userAgent;
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || navigator.maxTouchPoints > 0;
    };
    setIsMobile(checkMobile());

    // Generate random obstacles
    const obs: Obstacle[] = [];
    for (let i = 0; i < 8; i++) {
      obs.push({
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        width: 60 + Math.random() * 120,
        height: 60 + Math.random() * 120
      });
    }
    obstaclesRef.current = obs;
    
    // Spawn Squad (Allies)
    alliesRef.current = [
      {
        id: 'ally-1',
        pos: { x: playerRef.current.pos.x - 50, y: playerRef.current.pos.y - 50 },
        velocity: { x: 0, y: 0 },
        radius: ALLY_RADIUS,
        color: COLORS.ALLY,
        active: true,
        angle: 0,
        health: ALLY_MAX_HEALTH,
        maxHealth: ALLY_MAX_HEALTH,
        state: 'IDLE',
        lastFired: 0
      },
      {
        id: 'ally-2',
        pos: { x: playerRef.current.pos.x + 50, y: playerRef.current.pos.y - 50 },
        velocity: { x: 0, y: 0 },
        radius: ALLY_RADIUS,
        color: COLORS.ALLY,
        active: true,
        angle: 0,
        health: ALLY_MAX_HEALTH,
        maxHealth: ALLY_MAX_HEALTH,
        state: 'IDLE',
        lastFired: 0
      }
    ];

    // Safety check to prevent spawn in obstacles
    [playerRef.current, ...alliesRef.current].forEach(entity => {
       obstaclesRef.current = obstaclesRef.current.filter(o => {
          const dx = (o.x + o.width/2) - entity.pos.x;
          const dy = (o.y + o.height/2) - entity.pos.y;
          return Math.sqrt(dx*dx + dy*dy) > 200;
      });
    });

  }, []);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyR') reload();
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.code] = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseDown = () => { if(!isMobile) isMouseDownRef.current = true; };
    const handleMouseUp = () => { if(!isMobile) isMouseDownRef.current = false; };
    
    const handleResize = () => {
        if(canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    }

    // --- Touch Handling for Mobile ---
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const x = t.clientX;
        const y = t.clientY;

        // Left half = Movement
        if (x < window.innerWidth / 2 && !leftStickRef.current.active) {
          leftStickRef.current = {
            id: t.identifier,
            origin: { x, y },
            current: { x, y },
            active: true
          };
        }
        // Right half = Aim/Fire
        else if (x >= window.innerWidth / 2 && !rightStickRef.current.active) {
           rightStickRef.current = {
            id: t.identifier,
            origin: { x, y },
            current: { x, y },
            active: true
          };
          // Start firing immediately when aiming on mobile
          isMouseDownRef.current = true;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (leftStickRef.current.active && leftStickRef.current.id === t.identifier) {
          leftStickRef.current.current = { x: t.clientX, y: t.clientY };
        }
        if (rightStickRef.current.active && rightStickRef.current.id === t.identifier) {
          rightStickRef.current.current = { x: t.clientX, y: t.clientY };
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (leftStickRef.current.id === t.identifier) {
          leftStickRef.current.active = false;
          leftStickRef.current.origin = null;
          leftStickRef.current.current = null;
        }
        if (rightStickRef.current.id === t.identifier) {
          rightStickRef.current.active = false;
          rightStickRef.current.origin = null;
          rightStickRef.current.current = null;
          isMouseDownRef.current = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    
    // Add touch listeners to canvas specifically to allow preventing default
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    handleResize();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
      }
    };
  }, [isMobile]);

  // --- Game Logic Helpers ---
  const spawnEnemy = () => {
    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    const buffer = 50;
    
    switch (edge) {
      case 0: x = Math.random() * window.innerWidth; y = -buffer; break;
      case 1: x = window.innerWidth + buffer; y = Math.random() * window.innerHeight; break;
      case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + buffer; break;
      case 3: x = -buffer; y = Math.random() * window.innerHeight; break;
    }

    const isBrute = Math.random() > 0.8 && waveRef.current > 2;
    const isRunner = Math.random() > 0.7 && waveRef.current > 1;

    enemiesRef.current.push({
      id: `enemy-${Date.now()}-${Math.random()}`,
      pos: { x, y },
      velocity: { x: 0, y: 0 },
      radius: isBrute ? 20 : 12,
      color: isBrute ? COLORS.ENEMY_BRUTE : (isRunner ? COLORS.ENEMY_RUNNER : COLORS.ENEMY_GRUNT),
      health: isBrute ? 100 : (isRunner ? 30 : 50),
      speed: isBrute ? ENEMY_BASE_SPEED * 0.5 : (isRunner ? ENEMY_BASE_SPEED * 1.5 : ENEMY_BASE_SPEED),
      type: isBrute ? 'BRUTE' : (isRunner ? 'RUNNER' : 'GRUNT'),
      active: true
    });
  };

  const fireBullet = (entity: Player | Ally) => {
    const isPlayer = entity.id === 'player';
    
    if (isPlayer) {
      if (playerRef.current.ammo <= 0 || isReloadingRef.current) return;
      onHealthUpdate({ ...playerRef.current });
    }

    const now = Date.now();
    if (now - entity.lastFired < FIRE_RATE) return;

    entity.lastFired = now;
    if (isPlayer) playerRef.current.ammo--;

    const angle = entity.angle;
    const offset = 20;
    const bx = entity.pos.x + Math.cos(angle) * offset;
    const by = entity.pos.y + Math.sin(angle) * offset;

    bulletsRef.current.push({
      id: `bullet-${entity.id}-${now}`,
      pos: { x: bx, y: by },
      velocity: { 
        x: Math.cos(angle) * BULLET_SPEED, 
        y: Math.sin(angle) * BULLET_SPEED 
      },
      angle: angle,
      speed: BULLET_SPEED,
      radius: BULLET_RADIUS,
      color: isPlayer ? COLORS.BULLET : COLORS.BULLET_ALLY,
      active: true,
      damage: BULLET_DAMAGE,
      owner: isPlayer ? 'PLAYER' : 'ALLY'
    });
  };

  const reload = () => {
    if (isReloadingRef.current || playerRef.current.ammo === playerRef.current.maxAmmo) return;
    isReloadingRef.current = true;
    
    setTimeout(() => {
      playerRef.current.ammo = playerRef.current.maxAmmo;
      isReloadingRef.current = false;
      onHealthUpdate({ ...playerRef.current });
    }, RELOAD_TIME);
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3;
      particlesRef.current.push({
        id: `p-${Date.now()}-${Math.random()}`,
        pos: { x, y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        radius: 0,
        size: Math.random() * 3 + 1,
        color: color,
        active: true,
        life: 1.0,
        maxLife: 1.0,
        alpha: 1
      });
    }
  };

  // --- Main Loop ---
  const update = () => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;

    // 1. Player Movement
    let dx = 0;
    let dy = 0;

    if (isMobile && leftStickRef.current.active && leftStickRef.current.current && leftStickRef.current.origin) {
      const deltaX = leftStickRef.current.current.x - leftStickRef.current.origin.x;
      const deltaY = leftStickRef.current.current.y - leftStickRef.current.origin.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDist = JOYSTICK_MAX_RADIUS;
      const normalizedDist = Math.min(dist, maxDist) / maxDist;
      const angle = Math.atan2(deltaY, deltaX);
      
      dx = Math.cos(angle) * PLAYER_SPEED * normalizedDist;
      dy = Math.sin(angle) * PLAYER_SPEED * normalizedDist;
    } else {
      // PC Controls
      if (keysRef.current['KeyW']) dy -= 1;
      if (keysRef.current['KeyS']) dy += 1;
      if (keysRef.current['KeyA']) dx -= 1;
      if (keysRef.current['KeyD']) dx += 1;
      
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/len) * PLAYER_SPEED;
        dy = (dy/len) * PLAYER_SPEED;
      }
    }

    let nextX = player.pos.x + dx;
    let nextY = player.pos.y + dy;

    nextX = Math.max(PLAYER_RADIUS, Math.min(window.innerWidth - PLAYER_RADIUS, nextX));
    nextY = Math.max(PLAYER_RADIUS, Math.min(window.innerHeight - PLAYER_RADIUS, nextY));

    let collided = false;
    obstaclesRef.current.forEach(obs => {
        if (
            nextX + PLAYER_RADIUS > obs.x &&
            nextX - PLAYER_RADIUS < obs.x + obs.width &&
            nextY + PLAYER_RADIUS > obs.y &&
            nextY - PLAYER_RADIUS < obs.y + obs.height
        ) {
            collided = true;
        }
    });

    if (!collided) {
        player.pos.x = nextX;
        player.pos.y = nextY;
    }

    // 2. Player Rotation
    if (isMobile && rightStickRef.current.active && rightStickRef.current.current && rightStickRef.current.origin) {
      const deltaX = rightStickRef.current.current.x - rightStickRef.current.origin.x;
      const deltaY = rightStickRef.current.current.y - rightStickRef.current.origin.y;
      // Only aim if dragged slightly to avoid jitter
      if (Math.sqrt(deltaX*deltaX + deltaY*deltaY) > 5) {
        player.angle = Math.atan2(deltaY, deltaX);
      }
    } else if (!isMobile) {
      player.angle = Math.atan2(
        mouseRef.current.y - player.pos.y,
        mouseRef.current.x - player.pos.x
      );
    }

    // 3. Player Shooting
    if (isMouseDownRef.current) {
      fireBullet(player);
    }

    // 4. Ally AI Logic (Squad Mode)
    alliesRef.current.forEach((ally, index) => {
      if (ally.health <= 0) return;

      // Find nearest enemy
      let nearestEnemy: Enemy | null = null;
      let minDist = 600; // Sight range

      enemiesRef.current.forEach(e => {
        const dist = Math.sqrt(Math.pow(ally.pos.x - e.pos.x, 2) + Math.pow(ally.pos.y - e.pos.y, 2));
        if (dist < minDist) {
          minDist = dist;
          nearestEnemy = e;
        }
      });

      // AI Behavior: Follow player or Shoot
      const distToPlayer = Math.sqrt(Math.pow(player.pos.x - ally.pos.x, 2) + Math.pow(player.pos.y - ally.pos.y, 2));
      const formationOffset = index === 0 ? { x: -60, y: -60 } : { x: 60, y: -60 }; // Formation positions
      
      // Move Logic
      let targetX = player.pos.x + formationOffset.x;
      let targetY = player.pos.y + formationOffset.y;
      
      if (distToPlayer > 300) {
         // Run to player if too far
         ally.state = 'MOVING';
      } else if (nearestEnemy) {
         // Stand ground and shoot
         ally.state = 'SHOOTING';
         targetX = ally.pos.x;
         targetY = ally.pos.y;
      } else {
        ally.state = 'MOVING';
      }

      // Apply movement
      if (ally.state === 'MOVING') {
        const angleToTarget = Math.atan2(targetY - ally.pos.y, targetX - ally.pos.x);
        const distToTarget = Math.sqrt(Math.pow(targetX - ally.pos.x, 2) + Math.pow(targetY - ally.pos.y, 2));
        
        if (distToTarget > 10) {
           ally.velocity.x = Math.cos(angleToTarget) * ALLY_SPEED;
           ally.velocity.y = Math.sin(angleToTarget) * ALLY_SPEED;
           
           // Obstacle avoidance for allies
           let allyNextX = ally.pos.x + ally.velocity.x;
           let allyNextY = ally.pos.y + ally.velocity.y;
           let allyCollided = false;
           obstaclesRef.current.forEach(obs => {
              if (allyNextX + ally.radius > obs.x && allyNextX - ally.radius < obs.x + obs.width &&
                  allyNextY + ally.radius > obs.y && allyNextY - ally.radius < obs.y + obs.height) {
                    allyCollided = true;
              }
           });
           if (!allyCollided) {
             ally.pos.x = allyNextX;
             ally.pos.y = allyNextY;
           }
        }
      }

      // Aim & Fire Logic
      if (nearestEnemy) {
        ally.angle = Math.atan2(nearestEnemy.pos.y - ally.pos.y, nearestEnemy.pos.x - ally.pos.x);
        fireBullet(ally);
      } else {
        // Look at movement direction or player's direction
        if (ally.state === 'MOVING') {
           ally.angle = Math.atan2(player.pos.y - ally.pos.y, player.pos.x - ally.pos.x);
        }
      }
    });

    // 5. Bullets Update
    bulletsRef.current.forEach(b => {
      b.pos.x += b.velocity.x;
      b.pos.y += b.velocity.y;

      if (b.pos.x < 0 || b.pos.x > window.innerWidth || b.pos.y < 0 || b.pos.y > window.innerHeight) {
        b.active = false;
      }

      obstaclesRef.current.forEach(obs => {
        if (
            b.pos.x > obs.x && b.pos.x < obs.x + obs.width &&
            b.pos.y > obs.y && b.pos.y < obs.y + obs.height
        ) {
            b.active = false;
            createParticles(b.pos.x, b.pos.y, '#cbd5e1', 3);
        }
      });
    });
    bulletsRef.current = bulletsRef.current.filter(b => b.active);

    // 6. Enemies Update
    if (Date.now() - lastEnemySpawnRef.current > Math.max(400, ENEMY_SPAWN_RATE - (waveRef.current * 60))) {
      spawnEnemy();
      lastEnemySpawnRef.current = Date.now();
    }

    enemiesRef.current.forEach(e => {
      // Find nearest target (Player or Ally)
      let target: Entity = player;
      let minDist = Math.sqrt(Math.pow(player.pos.x - e.pos.x, 2) + Math.pow(player.pos.y - e.pos.y, 2));
      
      alliesRef.current.forEach(ally => {
        if (ally.health <= 0) return;
        const d = Math.sqrt(Math.pow(ally.pos.x - e.pos.x, 2) + Math.pow(ally.pos.y - e.pos.y, 2));
        if (d < minDist) {
          minDist = d;
          target = ally;
        }
      });

      const angleToTarget = Math.atan2(target.pos.y - e.pos.y, target.pos.x - e.pos.x);
      e.velocity.x = Math.cos(angleToTarget) * e.speed;
      e.velocity.y = Math.sin(angleToTarget) * e.speed;
      
      let eNextX = e.pos.x + e.velocity.x;
      let eNextY = e.pos.y + e.velocity.y;

       let eCollided = false;
        obstaclesRef.current.forEach(obs => {
            if (
                eNextX + e.radius > obs.x && eNextX - e.radius < obs.x + obs.width &&
                eNextY + e.radius > obs.y && eNextY - e.radius < obs.y + obs.height
            ) {
                eCollided = true;
            }
        });

        if (!eCollided) {
             e.pos.x = eNextX;
             e.pos.y = eNextY;
        }

      // Damage Logic (Hit Player)
      const distToPlayer = Math.sqrt(Math.pow(player.pos.x - e.pos.x, 2) + Math.pow(player.pos.y - e.pos.y, 2));
      if (distToPlayer < player.radius + e.radius) {
        player.health -= 0.5;
        createParticles(player.pos.x, player.pos.y, COLORS.BLOOD, 1);
        onHealthUpdate({...player});
        if (player.health <= 0) onGameOver();
      }

      // Damage Logic (Hit Allies)
      alliesRef.current.forEach(ally => {
         if (ally.health <= 0) return;
         const distToAlly = Math.sqrt(Math.pow(ally.pos.x - e.pos.x, 2) + Math.pow(ally.pos.y - e.pos.y, 2));
         if (distToAlly < ally.radius + e.radius) {
           ally.health -= 0.5;
           createParticles(ally.pos.x, ally.pos.y, COLORS.BLOOD, 1);
           if (ally.health <= 0) {
             createParticles(ally.pos.x, ally.pos.y, COLORS.ALLY, 20); // Ally death effect
           }
         }
      });

      // Bullet Collision
      bulletsRef.current.forEach(b => {
        if (!b.active) return;
        // Allies don't hurt player, Player/Ally hurt Enemies
        if (b.owner === 'ENEMY') return; 

        const distToBullet = Math.sqrt(Math.pow(b.pos.x - e.pos.x, 2) + Math.pow(b.pos.y - e.pos.y, 2));
        if (distToBullet < e.radius + b.radius) {
          e.health -= b.damage;
          b.active = false;
          createParticles(b.pos.x, b.pos.y, COLORS.BLOOD, 5);
          
          if (e.health <= 0) {
            e.active = false;
            player.score += 100;
            onScoreUpdate(player.score);
            createParticles(e.pos.x, e.pos.y, COLORS.BLOOD, 15);
            if (player.score % 1000 === 0) {
                waveRef.current++;
                onWaveUpdate(waveRef.current);
            }
          }
        }
      });
    });
    enemiesRef.current = enemiesRef.current.filter(e => e.active);

    // 7. Particles Update
    particlesRef.current.forEach(p => {
      p.pos.x += p.velocity.x;
      p.pos.y += p.velocity.y;
      p.life -= 0.05;
      p.alpha = p.life;
      if (p.life <= 0) p.active = false;
    });
    particlesRef.current = particlesRef.current.filter(p => p.active);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Screen
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Obstacles
    ctx.fillStyle = COLORS.OBSTACLE;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    obstaclesRef.current.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
    ctx.shadowBlur = 0;

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Bullets
    bulletsRef.current.forEach(b => {
      ctx.shadowBlur = 8;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Allies
    alliesRef.current.forEach((ally, i) => {
      if (ally.health <= 0) return;
      ctx.save();
      ctx.translate(ally.pos.x, ally.pos.y);
      ctx.rotate(ally.angle);
      
      // Ally Flashlight
      ctx.globalCompositeOperation = 'overlay';
      const gradient = ctx.createRadialGradient(0, 0, 10, 200, 0, 250);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)'); // Blue tint
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 300, -Math.PI / 6, Math.PI / 6);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.ALLY;
      ctx.fillStyle = COLORS.ALLY;
      ctx.beginPath();
      ctx.arc(0, 0, ally.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // ID Tag
      ctx.rotate(-ally.angle);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(`SQ-${i+1}`, 0, -20);
      
      // Health Bar
      const hp = Math.max(0, ally.health / ally.maxHealth);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-15, -18, 30, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-15, -18, 30 * hp, 3);

      ctx.restore();
    });

    // Enemies
    enemiesRef.current.forEach(e => {
      ctx.save();
      ctx.translate(e.pos.x, e.pos.y);
      // Rotate towards velocity direction or player if still
      ctx.rotate(Math.atan2(e.velocity.y, e.velocity.x));

      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#f00';
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(5, -3, 2, 0, Math.PI * 2);
      ctx.arc(5, 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Player
    const p = playerRef.current;
    ctx.save();
    ctx.translate(p.pos.x, p.pos.y);
    ctx.rotate(p.angle);

    // Player Flashlight
    ctx.globalCompositeOperation = 'overlay';
    const gradient = ctx.createRadialGradient(0, 0, 10, 200, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 400, -Math.PI / 6, Math.PI / 6);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.PLAYER;
    ctx.fillStyle = COLORS.PLAYER;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.fillRect(0, -2, 20, 4);
    ctx.restore();
    ctx.shadowBlur = 0;

    // --- Mobile UI Rendering in Canvas ---
    if (isMobile) {
      const drawJoystick = (stick: Joystick) => {
        if (stick.active && stick.origin && stick.current) {
          ctx.beginPath();
          ctx.fillStyle = COLORS.JOYSTICK_BASE;
          ctx.arc(stick.origin.x, stick.origin.y, JOYSTICK_MAX_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          const deltaX = stick.current.x - stick.origin.x;
          const deltaY = stick.current.y - stick.origin.y;
          const dist = Math.min(Math.sqrt(deltaX*deltaX + deltaY*deltaY), JOYSTICK_MAX_RADIUS);
          const angle = Math.atan2(deltaY, deltaX);
          
          const handleX = stick.origin.x + Math.cos(angle) * dist;
          const handleY = stick.origin.y + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.fillStyle = COLORS.JOYSTICK_HANDLE;
          ctx.arc(handleX, handleY, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      };
      
      drawJoystick(leftStickRef.current);
      drawJoystick(rightStickRef.current);
    }
  };

  const loop = () => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, isMobile]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
       <canvas 
         ref={canvasRef} 
         className="block w-full h-full touch-none" 
         style={{ touchAction: 'none' }}
       />
       
       {/* Mobile Reload Button */}
       {isMobile && (
         <button 
           onClick={reload}
           className="absolute top-24 right-6 w-16 h-16 bg-slate-800/80 border-2 border-slate-600 rounded-full flex items-center justify-center text-white active:bg-slate-700 active:scale-95 transition-all z-50 shadow-lg backdrop-blur"
         >
           <RotateCcw className={`w-8 h-8 ${isReloadingRef.current ? 'animate-spin' : ''}`} />
         </button>
       )}

       {/* Squad Status Indicator */}
       <div className="absolute top-24 left-6 pointer-events-none">
          <div className="text-[10px] text-emerald-500 tracking-widest font-bold animate-pulse">
            SQUAD ONLINE
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
             ALPHA / BRAVO ACTIVE
          </div>
       </div>
    </div>
  );
};

export default GameCanvas;