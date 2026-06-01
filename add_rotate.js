const fs = require('fs');

let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

// 1. Insert auto-rotate useEffect
const useEffectBlock = `
  // Auto-rotate globe
  useEffect(() => {
    let animationId;
    let lastTime = performance.now();
    
    const rotateGlobe = (time) => {
      const delta = time - lastTime;
      lastTime = time;
      
      const map = mapRef.current?.getMap();
      if (map) {
        const zoom = map.getZoom();
        // Only spin if we're zoomed out far enough to see the globe well
        if (zoom < 3.5 && !window.__aegisUserInteracting) {
           const center = map.getCenter();
           center.lng += 0.5 * (delta / 50); // Speed
           if (center.lng > 180) center.lng -= 360;
           map.setCenter(center);
        }
      }
      animationId = requestAnimationFrame(rotateGlobe);
    };
    
    // Slight delay before starting to ensure map is loaded
    setTimeout(() => {
      lastTime = performance.now();
      animationId = requestAnimationFrame(rotateGlobe);
    }, 1000);

    return () => cancelAnimationFrame(animationId);
  }, []);
`;

// Insert the useEffect right before the return statement of TacticalMap
content = content.replace(
  /  return \(\s*<div className="w-full h-full relative bg-black">/g,
  `${useEffectBlock}\n  return (\n    <div className="w-full h-full relative bg-black">`
);

// 2. Add event listeners to Map to detect interaction
content = content.replace(
  /        onMouseMove={onMouseMove}/g,
  `        onDragStart={() => window.__aegisUserInteracting = true}
        onDragEnd={() => window.__aegisUserInteracting = false}
        onMouseDown={() => window.__aegisUserInteracting = true}
        onMouseUp={() => window.__aegisUserInteracting = false}
        onTouchStart={() => window.__aegisUserInteracting = true}
        onTouchEnd={() => window.__aegisUserInteracting = false}
        onWheel={() => {
            window.__aegisUserInteracting = true;
            clearTimeout(window.__aegisWheelTimeout);
            window.__aegisWheelTimeout = setTimeout(() => window.__aegisUserInteracting = false, 1500);
        }}
        onMouseMove={onMouseMove}`
);

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Added auto-rotate to TacticalMap.tsx');
