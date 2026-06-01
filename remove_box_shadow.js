const fs = require('fs');
let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

// Strip out the inline boxShadow styles from the modals entirely.
content = content.replace(/style={{ boxShadow: `0 10px 40px rgba\(0,0,0,0\.8\), 0 0 0 1px \$\{.*?` }}/g, '');
content = content.replace(/style={{\s*boxShadow:[^}]+}}\s*/g, '');

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Fixed box shadows');
