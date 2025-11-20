import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MissionIntel } from '../types';
import { RotateCcw, Shield } from 'lucide-react';

interface AARProps {
  score: number;
  wave: number;
  mission: MissionIntel;
  onRestart: () => void;
}

const AfterActionReport: React.FC<AARProps> = ({ score, wave, mission, onRestart }) => {
  
  // Mock data for visual flair - in a real app you'd track these stats
  const data = [
    { name: 'Accuracy', value: Math.floor(Math.random() * 40) + 40 },
    { name: 'Headshots', value: Math.floor(Math.random() * 20) + 10 },
    { name: 'Mobility', value: Math.floor(Math.random() * 50) + 50 },
    { name: 'Tactics', value: Math.floor(Math.random() * 30) + 60 },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 p-8">
        
        {/* Left Column: Mission Summary */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-5xl font-bold text-white font-['Orbitron'] mb-2 tracking-tighter">MISSION FAILED</h1>
            <div className="h-1 w-32 bg-red-600 mb-6"></div>
            <p className="text-slate-400 font-mono text-sm">UNIT K.I.A. // OPERATION COMPROMISED</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
             <h3 className="text-emerald-500 font-bold tracking-widest uppercase mb-4 text-sm">Mission Debrief</h3>
             <div className="grid grid-cols-2 gap-6">
               <div>
                 <div className="text-slate-500 text-xs uppercase">Operation</div>
                 <div className="text-white font-bold text-lg">{mission.operationName}</div>
               </div>
               <div>
                 <div className="text-slate-500 text-xs uppercase">Difficulty</div>
                 <div className="text-yellow-500 font-bold text-lg">{mission.difficulty}</div>
               </div>
               <div>
                 <div className="text-slate-500 text-xs uppercase">Waves Cleared</div>
                 <div className="text-white font-bold text-3xl">{wave}</div>
               </div>
               <div>
                 <div className="text-slate-500 text-xs uppercase">Total Score</div>
                 <div className="text-emerald-400 font-bold text-3xl">{score.toLocaleString()}</div>
               </div>
             </div>
          </div>

          <button 
            onClick={onRestart}
            className="w-full bg-white hover:bg-slate-200 text-black font-bold py-4 px-6 rounded uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Re-deploy
          </button>
        </div>

        {/* Right Column: Stats Visualization */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 p-6 rounded-lg flex flex-col">
          <h3 className="text-blue-400 font-bold tracking-widest uppercase mb-6 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" /> Performance Analysis
          </h3>
          
          <div className="flex-grow min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" hide />
                <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={80} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="value" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-center">
             <p className="text-xs text-slate-500 font-mono">
               "Efficiency is the key to survival. Improve accuracy and mobility to extend mission duration."
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AfterActionReport;
