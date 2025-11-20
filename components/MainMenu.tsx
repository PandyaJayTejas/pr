import React from 'react';
import { Crosshair, Play, ShieldAlert, Cpu } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  isLoading: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, isLoading }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-slate-900/90 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl relative overflow-hidden group">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transition-all group-hover:bg-emerald-500/20"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transition-all group-hover:bg-blue-500/20"></div>

        <div className="text-center space-y-2 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-700 shadow-inner">
              <Crosshair className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white font-['Orbitron'] tracking-wider">
            TASK FORCE: <span className="text-emerald-400">ECHO</span>
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">Tactical Combat Simulator</p>
        </div>

        <div className="space-y-4 relative z-10">
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all transform hover:scale-[1.02] ${
              isLoading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-900/50'
            }`}
          >
            {isLoading ? (
              <>
                <Cpu className="w-5 h-5 animate-spin" />
                Initializing Intel...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Deploy Operation
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 text-center font-mono">
            <div className="p-2 border border-slate-700/50 rounded bg-slate-900/50">
              <span className="block text-slate-300 mb-1">WASD</span>
              MOVEMENT
            </div>
            <div className="p-2 border border-slate-700/50 rounded bg-slate-900/50">
              <span className="block text-slate-300 mb-1">MOUSE</span>
              AIM & FIRE
            </div>
            <div className="p-2 border border-slate-700/50 rounded bg-slate-900/50">
              <span className="block text-slate-300 mb-1">R</span>
              RELOAD
            </div>
             <div className="p-2 border border-slate-700/50 rounded bg-slate-900/50">
              <span className="block text-slate-300 mb-1">SPACE</span>
              MELEE
            </div>
          </div>
        </div>
        
        <div className="text-center text-[10px] text-slate-600 pt-4 border-t border-slate-700/50">
           POWERED BY GOOGLE GEMINI
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
