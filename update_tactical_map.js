const fs = require('fs');

let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

// 1. Space color
content = content.replace(
  /'space-color': '#0d0e12'/g,
  `'space-color': '#000000'`
);

// 2. Submarine icon
content = content.replace(
  /base\.type === 'NUCLEAR_SUB_BASE' \? 'sailing'/g,
  `base.type === 'NUCLEAR_SUB_BASE' ? 'directions_boat'`
);

// 3. Strategic Bases Pop-up theme updates
// Center the type text
content = content.replace(
  /                  <div className="bg-slate-900\/50 border border-slate-800\/80 rounded p-3 mb-3">\s*<span className="text-slate-500 text-\[8px\] font-mono tracking-widest uppercase block mb-1">TYPE<\/span>\s*<span className="font-mono text-xs font-bold uppercase truncate" style={{ color }}>{base\.type\.replace\(\/_.*?\)}<\/span>\s*<\/div>/g,
  `                  <div className="fui-border bg-black/40 p-3 mb-3 flex flex-col items-center text-center">\n                    <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>\n                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">TYPE</span>\n                    <span className="text-white font-mono text-xs font-bold uppercase truncate">{base.type.replace(/_/g, ' ')}</span>\n                  </div>`
);

// Center the status text
content = content.replace(
  /                  <div className="grid grid-cols-2 gap-2 mb-2">\s*<div className="col-span-2 bg-slate-900\/50 border border-slate-800 rounded p-2 text-center">\s*<span className="text-slate-500 text-\[8px\] font-mono tracking-widest uppercase block mb-1">STATUS<\/span>\s*<span className="text-white font-mono text-xs">{base\.status}<\/span>\s*<\/div>\s*<\/div>/g,
  `                  <div className="grid grid-cols-1 mb-2">\n                    <div className="fui-border bg-black/40 p-3 flex flex-col items-center text-center">\n                      <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>\n                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">STATUS</span>\n                      <span className="text-white font-mono text-xs font-bold">{base.status}</span>\n                    </div>\n                  </div>`
);

// Make the base callsign text white instead of colored
content = content.replace(
  /<h3 className="font-headline font-bold text-sm tracking-wider uppercase truncate max-w-\[200px\]" style={{ color }}>{base\.callsign}<\/h3>/g,
  `<h3 className="text-white font-headline font-bold text-sm tracking-wider uppercase truncate max-w-[200px]">{base.callsign}</h3>`
);

// 4. Modal overall containers

// Ship popup
content = content.replace(
  /className="absolute top-4 left-4 bg-\[#0d0e12\]\/95 border border-slate-800\/60 p-5 rounded-xl shadow-2xl backdrop-blur-lg w-\[320px\] pointer-events-auto cursor-auto transition-all duration-200 z-\[999999\]"/g,
  `className="absolute top-4 left-4 fui-border bg-black/80 p-5 shadow-2xl backdrop-blur-md w-[320px] pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"`
);

// Ports/Chokepoints popup
content = content.replace(
  /className="absolute top-4 left-4 bg-\[#0d0e12\]\/95 border border-slate-800\/60 p-4 rounded-md shadow-2xl backdrop-blur-lg w-80 pointer-events-auto cursor-auto transition-all duration-200 z-\[999999\]"/g,
  `className="absolute top-4 left-4 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-80 pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"`
);

// Earthquakes, Incidents, Nuclear, Bases popups
content = content.replace(
  /className="absolute top-(4|6) left-4 bg-\[#0d0e12\]\/95 border border-slate-800\/60 p-4 rounded-xl shadow-2xl backdrop-blur-lg w-(72|\[300px\]) pointer-events-auto cursor-auto z-\[999999\]"/g,
  `className="absolute top-$1 left-4 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-$2 pointer-events-auto cursor-auto z-[999999]"`
);

// Region Dossier popup
content = content.replace(
  /className="bg-\[#0b0c10\]\/95 border border-\[#1f2937\] rounded-lg shadow-2xl p-5 w-\[500px\] backdrop-blur-md cursor-default pointer-events-auto"/g,
  `className="fui-border bg-black/80 shadow-2xl p-5 w-[500px] backdrop-blur-md cursor-default pointer-events-auto relative"`
);

// Remove inline shadow styles from popups that had them
content = content.replace(
  /style={{ boxShadow: `0 10px 40px rgba\(0,0,0,0\.8\), 0 0 0 1px \${[^}]*}` }}/g,
  ``
);

// Remove the colored top borders of popups
content = content.replace(
  /<div\s+className="absolute top-0 left-0 right-0 h-1(\.5)? rounded-t-(xl|md)"\s+style={{(\s*backgroundColor:\s*[^}]*\s*)?}}\s*\/>/g,
  `<div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>`
);

// Note: For Region Dossier, it doesn't have the rounded-t-xl div, so we must add corners manually.
content = content.replace(
  /<div className="flex justify-between items-center mb-4 pb-3 border-b border-white\/5">/g,
  `<div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>\n              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">`
);

// For Submarine/Ship modals, they also had colored text for the name:
// `<h3 className="..." style={{ color: ... }}>{ship.name}</h3>` -> Make text white
content = content.replace(
  /<h3\s+className="font-headline font-bold tracking-widest text-\[16px\] uppercase"\s+style={{ color: themeColor }}\s*>/g,
  `<h3 className="font-headline font-bold tracking-widest text-[16px] uppercase text-white">`
);

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Update successful');
