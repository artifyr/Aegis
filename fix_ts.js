const fs = require('fs');
let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

content = content.replace(/window\.__aegisUserInteracting/g, '(window as any).__aegisUserInteracting');
content = content.replace(/window\.__aegisWheelTimeout/g, '(window as any).__aegisWheelTimeout');

// Also, the user says "until when clicked or when a marker is open".
// If a marker is open, activeEntityId is not null.
// I can add that to the condition!
// The variable is \`activeEntityId\` which is accessible in the component body.
content = content.replace(
  /if \(zoom < 3\.5 && !\(\(window as any\)\.__aegisUserInteracting\)\) \{/g,
  `if (zoom < 3.5 && !(window as any).__aegisUserInteracting && !activeEntityId) {`
);

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Fixed TS errors and added activeEntityId check');
