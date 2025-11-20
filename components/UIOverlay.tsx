import React from 'react';
import { Target, Zap, Shield, Activity } from 'lucide-react';
import { Player, MissionIntel } from '../types';

interface UIOverlayProps {
  player: Player;
  score: number;
  wave: number;
  mission: MissionIntel;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ player, score, wave, mission }) => {
  // Calculate health percentage
  const healthPercent = Math.max(0, (player.health / player.maxHealth) * 100);
  const ammoPercent = Math.max(0, (player.ammo / player.maxAmmo) * 100);
  const isLowHealth = healthPercent < 30;
  const isLowAmmo = player.ammo < 5;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6">
      
      {/* Top Left: Radar/Mission Info */}
      <div className="flex flex-col gap-2 items-start">
        <div className="bg-slate-900/80 backdrop-blur border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-lg max-w-xs">
          <h3 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">Current Operation</h3>
          <h2 className="text-white font-['Orbitron'] text-lg leading-tight mb-2">{mission.operationName}</h2>
          <p className="text-slate-300 text-xs font-mono leading-snug opacity-80 border-t border-slate-700/50 pt-2">
            "{mission.objective}"
          </p>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur p-2 px-4 rounded text-emerald-400 font-mono text-sm border border-emerald-500/20">
          WAVE: <span className="text-white font-bold">{wave}</span>
        </div>
      </div>

      {/* Top Right: Score */}
      <div className="absolute top-6 right-6">
        <div className="bg-slate-900/80 backdrop-blur px-6 py-2 rounded-lg border border-slate-700 shadow-lg text-right">
           <div className="text-slate-400 text-[10px] tracking-widest uppercase">Score</div>
           <div className="text-2xl font-bold font-['Orbitron'] text-white tabular-nums">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Center: Notifications (Killfeed style handled by canvas usually, but simple alerts here) */}
      {isLowHealth && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
           <div className="text-red-500 font-bold text-2xl animate-pulse tracking-widest border-2 border-red-500 px-4 py-2 rounded bg-red-900/20">
             CRITICAL DAMAGE
           </div>
        </div>
      )}

      {/* Bottom Left: Health */}
      <div className="flex items-end gap-4">
         <div className="bg-slate-900/90 backdrop-blur p-4 rounded-lg border border-slate-700 shadow-lg w-64">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-emerald-400">
                 <Activity className="w-4 h-4" />
                 <span className="text-xs font-bold tracking-wider">VITALS</span>
               </div>
               <span className={`text-lg font-bold font-mono ${isLowHealth ? 'text-red-500' : 'text-white'}`}>
                 {Math.ceil(player.health)}%
               </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isLowHealth ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${healthPercent}%` }}
              />
            </div>
         </div>
      </div>

      {/* Bottom Right: Weapon/Ammo */}
      <div className="flex items-end justify-end gap-4">
        <div className={`bg-slate-900/90 backdrop-blur p-4 rounded-lg border transition-colors shadow-lg w-64 ${isLowAmmo ? 'border-red-500/50' : 'border-slate-700'}`}>
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Target className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wider uppercase">{player.weapon}</span>
              </div>
              <div className={`text-2xl font-bold font-['Orbitron'] tabular-nums ${isLowAmmo ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {player.ammo} <span className="text-xs text-slate-500 font-sans font-normal">/ {player.maxAmmo}</span>
              </div>
           </div>
           <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${isLowAmmo ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${ammoPercent}%` }}
              />
           </div>
           {player.ammo === 0 && (
             <div className="text-center text-red-400 text-xs font-bold mt-2 animate-bounce">
               PRESS 'R' TO RELOAD
             </div>
           )}
        </div>
      </div>
      
      {/* Damage Overlay */}
      {isLowHealth && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(220,38,38,0.5)] z-0 animate-pulse" />
      )}
    </div>
  );
};

export default UIOverlay;
