import React, { useState } from 'react';
import { useTacticalStore } from '@/store/tactical-store';

const PRESETS = [
  { name: 'Davy Crockett', yield: 0.02, desc: 'US tactical nuclear weapon (20 t)' },
  { name: 'B-61 Mod 3', yield: 170, desc: 'US tactical/strategic bomb (170 kt)' },
  { name: 'W-76', yield: 100, desc: 'US Trident SLBM warhead (100 kt)' },
  { name: 'W-87', yield: 300, desc: 'US Minuteman III ICBM warhead (300 kt)' },
  { name: 'Topol (SS-25)', yield: 800, desc: 'Russian mobile ICBM (800 kt)' },
  { name: 'Tsar Bomba', yield: 50000, desc: 'Largest USSR bomb tested (50 Mt)' }
];

export function NukeSimPanel() {
  const isSimMode = useTacticalStore(state => state.nukeSimMode);
  const setSimMode = useTacticalStore(state => state.setNukeSimMode);
  const simData = useTacticalStore(state => state.nukeSimData);
  const setSimData = useTacticalStore(state => state.setNukeSimData);
  
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[3]);
  const [isCalculating, setIsCalculating] = useState(false);

  if (!isSimMode) return null;

  const handleCalculate = async () => {
    if (!simData?.target) return;
    setIsCalculating(true);
    
    try {
      const res = await fetch(`/api/nukesim?lat=${simData.target.lat}&lng=${simData.target.lng}&yield=${selectedPreset.yield}`);
      const data = await res.json();
      
      setSimData({
        ...simData,
        preset: selectedPreset,
        radii: data.radii,
        casualties: data.casualties
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  const clearSim = () => {
    setSimData(null);
  };

  return (
    <div className="absolute right-4 top-20 bg-[#0d0e12]/95 border border-red-900/60 p-4 rounded-xl shadow-2xl backdrop-blur-lg w-80 pointer-events-auto z-50">
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl bg-red-600" />
      <div className="flex justify-between items-start mb-4 mt-1">
        <div className="flex items-center gap-2 text-red-500">
          <span className="material-symbols-outlined text-[18px]">radioactive</span>
          <h3 className="font-headline font-bold text-sm tracking-wider uppercase">NUKE SIMULATOR</h3>
        </div>
        <button onClick={() => { setSimMode(false); clearSim(); }} className="text-slate-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="mb-4">
        <span className="text-slate-500 text-[9px] font-mono tracking-widest uppercase block mb-2">TARGET SELECT</span>
        {simData?.target ? (
          <div className="bg-red-900/20 border border-red-500/30 p-2 rounded text-[10px] font-mono text-red-400 flex justify-between items-center">
            <span>{simData.target.lat.toFixed(4)}, {simData.target.lng.toFixed(4)}</span>
            <span className="material-symbols-outlined text-[14px]">my_location</span>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-700 p-2 rounded text-[10px] font-mono text-slate-400 text-center animate-pulse">
            CLICK ON MAP TO SET GROUND ZERO
          </div>
        )}
      </div>

      <div className="mb-4">
        <span className="text-slate-500 text-[9px] font-mono tracking-widest uppercase block mb-2">YIELD PRESET</span>
        <select 
          className="w-full bg-slate-900 border border-slate-700 text-white text-[11px] font-mono p-2 rounded outline-none focus:border-red-500 transition-colors"
          value={selectedPreset.name}
          onChange={(e) => setSelectedPreset(PRESETS.find(p => p.name === e.target.value) || PRESETS[3])}
        >
          {PRESETS.map(p => (
            <option key={p.name} value={p.name}>{p.name} - {p.yield < 1000 ? p.yield + ' kt' : (p.yield/1000) + ' Mt'}</option>
          ))}
        </select>
        <div className="text-[9px] text-slate-500 mt-1 font-mono italic">{selectedPreset.desc}</div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          className="flex-1 bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 text-red-100 text-[10px] font-mono font-bold py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCalculate}
          disabled={!simData?.target || isCalculating}
        >
          {isCalculating ? 'CALCULATING...' : 'DETONATE'}
        </button>
        <button 
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono py-2 px-3 rounded transition-colors"
          onClick={clearSim}
        >
          CLEAR
        </button>
      </div>

      {simData?.radii && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-slate-500 text-[9px] font-mono tracking-widest uppercase block mb-2">EFFECT RADII</span>
          
          <div className="bg-[#1a1b21] p-2 rounded border-l-2 border-[#fff700]">
            <div className="text-[10px] font-mono font-bold text-slate-300">Fireball (Max)</div>
            <div className="text-[11px] font-mono text-white">{simData.radii.fireball.toFixed(2)} km</div>
          </div>
          
          <div className="bg-[#1a1b21] p-2 rounded border-l-2 border-[#ff3300]">
            <div className="text-[10px] font-mono font-bold text-slate-300">Moderate Blast (5 psi)</div>
            <div className="text-[11px] font-mono text-white">{simData.radii.moderateBlast.toFixed(2)} km</div>
          </div>
          
          <div className="bg-[#1a1b21] p-2 rounded border-l-2 border-[#ff9900]">
            <div className="text-[10px] font-mono font-bold text-slate-300">Thermal Radiation (3rd degree burns)</div>
            <div className="text-[11px] font-mono text-white">{simData.radii.thermal.toFixed(2)} km</div>
          </div>
          
          <div className="bg-[#1a1b21] p-2 rounded border-l-2 border-[#aaaaaa]">
            <div className="text-[10px] font-mono font-bold text-slate-300">Light Blast (1 psi)</div>
            <div className="text-[11px] font-mono text-white">{simData.radii.lightBlast.toFixed(2)} km</div>
          </div>
          
          {simData.casualties && (
            <div className="mt-3 p-2 border border-red-900 bg-red-900/10 rounded flex justify-between">
              <div>
                <div className="text-[9px] text-slate-500 font-mono">EST FATALITIES</div>
                <div className="text-red-400 font-mono text-sm font-bold">{simData.casualties.fatalities.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-slate-500 font-mono">EST INJURIES</div>
                <div className="text-orange-400 font-mono text-sm font-bold">{simData.casualties.injuries.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
