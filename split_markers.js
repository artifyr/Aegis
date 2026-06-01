const fs = require('fs');

let content = fs.readFileSync('src/components/TacticalMap.tsx', 'utf-8');

// Ensure React is imported
if (!content.includes("import React")) {
  content = content.replace("import {", "import React, {");
}

// 1. Ports
content = content.replace(
  /<Marker\s+key={`port-\${port\.id \|\| port\.name}`}\s+longitude={port\.lng}\s+latitude={port\.lat}\s+anchor="center"\s+style={{ zIndex: isActive \? 999999 : undefined }}\s*>\s*<div className="relative flex flex-col items-center">([\s\S]*?)<\/div>\s*\{isActive && \(\s*<div\s+className="absolute top-4 left-4([^>]*)>([\s\S]*?)<\/div>\s*\)\}\s*<\/Marker>/g,
  `<React.Fragment key={\`port-\${port.id || port.name}\`}>
            <Marker
              longitude={port.lng}
              latitude={port.lat}
              anchor="center"
              style={{ zIndex: isActive ? 999998 : undefined }}
            >
              <div className="relative flex flex-col items-center">$1</div>
            </Marker>
            {isActive && (
              <Marker
                longitude={port.lng}
                latitude={port.lat}
                anchor="top-left"
                style={{ zIndex: 999999 }}
              >
                <div className="absolute top-2 left-2$2>$3</div>
              </Marker>
            )}
          </React.Fragment>`
);

// 2. Chokepoints
content = content.replace(
  /<Marker\s+key={`chokepoint-\${chokepoint\.name}`}\s+longitude={chokepoint\.lng}\s+latitude={chokepoint\.lat}\s+anchor="center"\s+style={{ zIndex: isActive \? 999999 : undefined }}\s*>\s*<div className="relative flex flex-col items-center">([\s\S]*?)<\/div>\s*\{isActive && \(\s*<div\s+className="absolute top-4 left-4([^>]*)>([\s\S]*?)<\/div>\s*\)\}\s*<\/Marker>/g,
  `<React.Fragment key={\`chokepoint-\${chokepoint.name}\`}>
            <Marker
              longitude={chokepoint.lng}
              latitude={chokepoint.lat}
              anchor="center"
              style={{ zIndex: isActive ? 999998 : undefined }}
            >
              <div className="relative flex flex-col items-center">$1</div>
            </Marker>
            {isActive && (
              <Marker
                longitude={chokepoint.lng}
                latitude={chokepoint.lat}
                anchor="top-left"
                style={{ zIndex: 999999 }}
              >
                <div className="absolute top-2 left-2$2>$3</div>
              </Marker>
            )}
          </React.Fragment>`
);

// 3. Earthquakes
content = content.replace(
  /<Marker key={`eq-\${eq\.id}`}\s+longitude={eq\.lng}\s+latitude={eq\.lat}\s+anchor="center"\s+style={{ zIndex: isActive \? 999999 : 10 }}\s*>\s*<div className="relative flex flex-col items-center">([\s\S]*?)<\/div>\s*\{isActive && \(\s*<div className="absolute top-4 left-4([^>]*)>([\s\S]*?)<\/div>\s*\)\}\s*<\/Marker>/g,
  `<React.Fragment key={\`eq-\${eq.id}\`}>
            <Marker longitude={eq.lng} latitude={eq.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 10 }}>
              <div className="relative flex flex-col items-center">$1</div>
            </Marker>
            {isActive && (
              <Marker longitude={eq.lng} latitude={eq.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2$2>$3</div>
              </Marker>
            )}
          </React.Fragment>`
);

// 4. Incidents
content = content.replace(
  /<Marker key={incident\.id}\s+longitude={incident\.lng}\s+latitude={incident\.lat}\s+anchor="center"\s+style={{ zIndex: isActive \? 999999 : 20 }}\s*>\s*<div className="relative flex flex-col items-center">([\s\S]*?)<\/div>\s*\{isActive && \(\s*<div className="absolute top-6 left-4([^>]*)>([\s\S]*?)<\/div>\s*\)\}\s*<\/Marker>/g,
  `<React.Fragment key={incident.id}>
            <Marker longitude={incident.lng} latitude={incident.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">$1</div>
            </Marker>
            {isActive && (
              <Marker longitude={incident.lng} latitude={incident.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2$2>$3</div>
              </Marker>
            )}
          </React.Fragment>`
);

// 5. Nuclear Facilities
content = content.replace(
  /<Marker key={`nuc-\${nuc\.id}`}\s+longitude={nuc\.lng}\s+latitude={nuc\.lat}\s+anchor="center"\s+style={{ zIndex: isActive \? 999999 : 20 }}\s*>\s*<div className="relative flex flex-col items-center">([\s\S]*?)<\/div>\s*\{isActive && \(\s*<div className="absolute top-6 left-4([^>]*)>([\s\S]*?)<\/div>\s*\)\}\s*<\/Marker>/g,
  `<React.Fragment key={\`nuc-\${nuc.id}\`}>
            <Marker longitude={nuc.lng} latitude={nuc.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">$1</div>
            </Marker>
            {isActive && (
              <Marker longitude={nuc.lng} latitude={nuc.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2$2>$3</div>
              </Marker>
            )}
          </React.Fragment>`
);

// 6. Strategic Bases
content = content.replace(
  /<Marker key={base\.id}\s+longitude={base\.lng}\s+latitude={base\.lat}\s+anchor="center"\s+style={{ zIndex: isActive \? 999999 : 20 }}\s*>\s*<div className="relative flex flex-col items-center">([\s\S]*?)<\/div>\s*\{isActive && \(\s*<div className="absolute top-6 left-4([^>]*)>([\s\S]*?)<\/div>\s*\)\}\s*<\/Marker>/g,
  `<React.Fragment key={base.id}>
            <Marker longitude={base.lng} latitude={base.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">$1</div>
            </Marker>
            {isActive && (
              <Marker longitude={base.lng} latitude={base.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2$2>$3</div>
              </Marker>
            )}
          </React.Fragment>`
);

fs.writeFileSync('src/components/TacticalMap.tsx', content, 'utf-8');
console.log('Split markers successfully');
