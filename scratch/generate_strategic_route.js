const fs = require('fs');

const missileBases = JSON.parse(fs.readFileSync('d:\\\\CODING\\\\WebDev\\\\geosint\\\\tempdocs\\\\misslilebase.json', 'utf8'));
const subBases = JSON.parse(fs.readFileSync('d:\\\\CODING\\\\WebDev\\\\geosint\\\\tempdocs\\\\nukesubbase.json', 'utf8'));

let idCounter = 1;
const combined = [...missileBases, ...subBases].map(b => ({
  id: `strat-${idCounter++}`,
  ...b
}));

const routeContent = `import { NextResponse } from 'next/server';

const STRATEGIC_BASES = ${JSON.stringify(combined, null, 2)};

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    bases: STRATEGIC_BASES
  });
}
`;

fs.mkdirSync('d:\\\\CODING\\\\WebDev\\\\geosint\\\\src\\\\app\\\\api\\\\strategic', { recursive: true });
fs.writeFileSync('d:\\\\CODING\\\\WebDev\\\\geosint\\\\src\\\\app\\\\api\\\\strategic\\\\route.ts', routeContent);
console.log('Route created');
