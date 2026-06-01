const fs = require('fs');
let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

// Modify the dependency array from [] to [activeEntityId]
content = content.replace(
  /    return \(\) => cancelAnimationFrame\(animationId\);\n  }, \[\]\);/g,
  `    return () => cancelAnimationFrame(animationId);\n  }, [activeEntityId]);`
);

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Fixed dependency array');
