const fs = require('fs');
let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

// 1. Add "STRATEGIC BASE // " to Strategic Bases country
content = content.replace(
  /<span className="text-slate-400 font-mono text-\[9px\] uppercase tracking-widest block mt-0\.5">{base\.country}<\/span>/g,
  `<span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block mt-0.5">STRATEGIC BASE // {base.country}</span>`
);

// 2. Add "NUCLEAR FACILITY // " to Nuclear Facilities city, country
content = content.replace(
  /<span className="text-slate-400 font-mono text-\[9px\] uppercase tracking-widest block mt-0\.5">{nuc\.city}, {nuc\.country}<\/span>/g,
  `<span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block mt-0.5">NUCLEAR FACILITY // {nuc.city}, {nuc.country}</span>`
);

// 3. For Earthquakes, there's no subtitle, but we can add one or just leave it. The user specifically mentioned "base or silo or submarine or whatever it is" which perfectly targets Strategic Bases and Nuclear Facilities.

// 4. Let's also update the map labels so they show the type too, which makes it much clearer on the map.
// Strategic Bases map label:
content = content.replace(
  /<div className={`absolute top-full mt-1\.5 text-\[7px\] font-mono text-slate-300 whitespace-nowrap bg-black\/60 px-1\.5 py-0\.5 rounded transition-opacity duration-300 \${isZoomedIn \? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>\\s*\{base\.callsign\}\\s*<\/div>/g,
  `<div className={\`absolute top-full mt-1.5 text-[7px] font-mono whitespace-nowrap bg-black/80 px-1.5 py-1 border border-white/10 rounded flex flex-col items-center transition-opacity duration-300 \${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}>\n                  <span style={{ color }} className="font-bold">{base.type.replace(/_/g, ' ')}</span>\n                  <span className="text-slate-300">{base.callsign}</span>\n                </div>`
);

// Nuclear Facilities map label:
content = content.replace(
  /<div className={`absolute top-full mt-1\.5 text-\[7px\] font-mono text-slate-300 whitespace-nowrap bg-black\/60 px-1\.5 py-0\.5 rounded transition-opacity duration-300 \${isZoomedIn \? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>\\s*\{nuc\.name\}\\s*<\/div>/g,
  `<div className={\`absolute top-full mt-1.5 text-[7px] font-mono whitespace-nowrap bg-black/80 px-1.5 py-1 border border-white/10 rounded flex flex-col items-center transition-opacity duration-300 \${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}>\n                  <span style={{ color }} className="font-bold">NUCLEAR FACILITY</span>\n                  <span className="text-slate-300">{nuc.name}</span>\n                </div>`
);

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Labels updated');
