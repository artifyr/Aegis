/**
 * ═══════════════════════════════════════════════════════════════
 *  AEGIS — AI Intelligence Engine
 *  Gemini 2.0 Flash integration for real-time intelligence analysis
 *  Designed to correlate multi-domain feeds into actionable briefings
 * ═══════════════════════════════════════════════════════════════
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

/* ─────────────────────────────────────────────────────────────
   Data Interfaces — Zero `any` types
   ───────────────────────────────────────────────────────────── */

export interface EarthquakeEvent {
  id: string;
  magnitude: number;
  location: string;
  latitude: number;
  longitude: number;
  depth: number;
  timestamp: string;
  tsunami: boolean;
  felt: number | null;
  alert: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  published: string;
  source: string;
  risk_score: number;
  coords: [number, number] | null;
  machine_assessment: string | null;
}

export interface ThreatEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  region: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  source: string;
}

export interface CyberAlert {
  id: string;
  name: string;
  vendor: string;
  product: string;
  severity: string;
  date: string;
  due: string;
  source: string;
}

export interface IntelligenceContext {
  earthquakes: EarthquakeEvent[];
  news: NewsItem[];
  threats: ThreatEvent[];
  cyberAlerts: CyberAlert[];
  timestamp: string;
}

export function getThreatSeverity(title: string, description: string = ''): 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW' {
  const text = (title + ' ' + description).toLowerCase();
  
  // Filter out domestic politics / leader mentions
  if (text.includes('trump') || text.includes('biden') || text.includes('election') || text.includes('campaign')) {
    return 'ELEVATED';
  }

  // Critical threats: Red in reference image
  const isCritical = 
      text.includes('ukraine') || text.includes('kyiv') || text.includes('russia') ||
      text.includes('gaza') || text.includes('palestine') || text.includes('israel') || text.includes('hamas') ||
      text.includes('sudan') ||
      text.includes('yemen') || text.includes('houthi') ||
      text.includes('drc') || text.includes('congo') ||
      text.includes('myanmar');

  if (isCritical) {
    return 'CRITICAL';
  }

  // High threats: Orange/Yellow in reference image
  const isHigh = 
      text.includes('syria') ||
      text.includes('red sea') || text.includes('hormuz') ||
      text.includes('sahel') || text.includes('mali') || text.includes('niger') ||
      text.includes('somalia') ||
      text.includes('taiwan') ||
      text.includes('dmz') || (text.includes('korea') && text.includes('border'));

  if (isHigh) {
    return 'HIGH';
  }

  return 'ELEVATED';
}

export function summarizeIncidentName(title: string, description: string = ''): string {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('myanmar')) return 'MYANMAR CONFLICT';
  if (text.includes('hormuz') || text.includes('houthi') || text.includes('red sea') || text.includes('yemen')) {
    if (text.includes('yemen')) return 'YEMEN WAR';
    return 'RED SEA THREAT';
  }
  if (text.includes('palestine') || text.includes('gaza') || text.includes('israel') || text.includes('hamas')) return 'GAZA CONFLICT';
  if (text.includes('russia') || text.includes('ukraine') || text.includes('kyiv')) return 'UKRAINE WAR';
  if (text.includes('sudan') || text.includes('rsf') || text.includes('saf ')) return 'SUDAN CIVIL WAR';
  if (text.includes('syria')) return 'SYRIA';
  if (text.includes('drc') || text.includes('congo')) return 'DRC EASTERN CONFLICT';
  if (text.includes('sahel') || text.includes('mali') || text.includes('niger')) return 'SAHEL INSTABILITY';
  if (text.includes('somalia')) return 'SOMALIA';
  if (text.includes('taiwan')) return 'TAIWAN STRAIT';
  if (text.includes('dmz') || (text.includes('korea') && text.includes('border'))) return 'KOREAN DMZ';
  
  const words = title.split(' ');
  if (words.length > 5) {
    return words.slice(0, 5).join(' ').toUpperCase() + '...';
  }
  return title.toUpperCase();
}

/* ─────────────────────────────────────────────────────────────
   System Prompt — Palantir-grade analyst persona
   ───────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are AEGIS Intelligence Analyst — a senior, elite intelligence analyst embedded within the AEGIS Global Intelligence Platform. You operate at the level of a Palantir Forward Deployed Engineer crossed with a CIA PDB (Presidential Daily Brief) analyst.

## YOUR ROLE
- You correlate data across multiple intelligence feeds: seismic monitoring, OSINT news streams, and global threat events
- You identify non-obvious patterns, emerging threat vectors, and cascading risk scenarios
- You provide ACTIONABLE intelligence — not summaries, but assessments with confidence levels
- You think in terms of second and third-order effects

## YOUR ANALYTICAL FRAMEWORK
1. **PATTERN RECOGNITION**: Cross-reference events across feeds. A severe storm + earthquake + political instability in the same region = elevated compound risk
2. **THREAT ASSESSMENT**: Rate threats on a CRITICAL / HIGH / ELEVATED / LOW scale with reasoning
3. **TEMPORAL ANALYSIS**: Identify acceleration patterns — are events clustering? Is frequency increasing?
4. **GEOSPATIAL CORRELATION**: Events in proximity may be related. Identify geographic hotspots
5. **CONFIDENCE LEVELS**: Always state your confidence (HIGH / MODERATE / LOW) and cite which data points support your assessment

## OUTPUT FORMAT
- Use military-style brevity when appropriate
- Structure responses with clear headers using markdown
- Lead with the most critical finding (inverted pyramid)
- Include "BOTTOM LINE UP FRONT (BLUF)" for complex analyses
- Use tactical notation: DTG (Date-Time Group), AOR (Area of Responsibility), COA (Course of Action)
- End with "ASSESSMENT CONFIDENCE" and "RECOMMENDED ACTIONS" sections when appropriate

## CONSTRAINTS
- Never fabricate data points — only analyze what is provided in the context
- If data is insufficient for a confident assessment, state so explicitly
- Distinguish between correlation and causation
- Flag when events may be connected vs. coincidental
- You are an analyst, not a policymaker — present options, not directives

You have access to the live intelligence context of the AEGIS platform. Analyze it with precision.`;

const BRIEFING_PROMPT = `Generate a comprehensive AEGIS Daily Intelligence Briefing based on the current operational data. Structure it as follows:

## AEGIS INTELLIGENCE BRIEFING
**Classification:** OPEN SOURCE INTELLIGENCE (OSINT)
**DTG:** [Current timestamp]

### I. EXECUTIVE SUMMARY
2-3 sentence overview of the current global threat landscape based on available data.

### II. PRIORITY INTELLIGENCE REQUIREMENTS (PIRs)
Identify the top 3-5 most significant developments from the data feeds, ranked by assessed impact.

### III. SEISMIC & NATURAL HAZARD ASSESSMENT
Analyze earthquake data for patterns — clustering, tectonic corridor activity, tsunami risk.

### IV. GEOPOLITICAL & CONFLICT INTELLIGENCE
Synthesize news feeds for conflict escalation patterns, diplomatic shifts, or emerging crises.

### V. COMPOUND RISK SCENARIOS
Identify where multiple threat vectors intersect (e.g., earthquake near a conflict zone, severe storm during political instability).

### VI. FORECAST & WATCHLIST
- **Next 24 Hours**: Most likely developments
- **Next 72 Hours**: Emerging situations to monitor
- **Strategic Horizon**: Longer-term trend assessment

### VII. ASSESSMENT CONFIDENCE
State overall confidence level and key analytical gaps.

Analyze the provided data thoroughly. Be specific — reference actual events, magnitudes, and locations from the context.`;

/* ─────────────────────────────────────────────────────────────
   Client Factory
   ───────────────────────────────────────────────────────────── */

export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

/* ─────────────────────────────────────────────────────────────
   API Key Rotation — Round-robin through available keys
   ───────────────────────────────────────────────────────────── */

let _keyIndex = 0;

export function rotateApiKey(keys: string[]): string {
  if (keys.length === 0) {
    throw new Error('No API keys available');
  }
  const key = keys[_keyIndex % keys.length];
  _keyIndex = (_keyIndex + 1) % keys.length;
  return key;
}

const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-3.0-flash', 'gemini-3.5-flash', 'gemini-2.0-flash-lite'];

export async function generateWithFallback(client: GoogleGenerativeAI, prompt: string, systemInstruction?: string): Promise<string> {
  let lastError: any = null;
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      console.warn(`[AEGIS AI] Model ${modelName} failed: ${err.message}. Switching to next model...`);
      lastError = err;
    }
  }
  throw lastError;
}

export async function fallbackTranslate(text: string): Promise<string> {
  if (!text) return text;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    if (!res.ok) return text;
    const data = await res.json();
    return data[0].map((s: any) => s[0]).join('');
  } catch (e) {
    console.error("[AEGIS AI] Auto-translation fallback failed:", e);
    return text;
  }
}

/* ─────────────────────────────────────────────────────────────
   Context Serializer — Compact representation for token efficiency
   ───────────────────────────────────────────────────────────── */

function serializeContext(context: IntelligenceContext): string {
  const sections: string[] = [];

  sections.push(`[TIMESTAMP] ${context.timestamp}`);

  if (context.earthquakes.length > 0) {
    sections.push(`\n[SEISMIC DATA — ${context.earthquakes.length} events]`);
    for (const eq of context.earthquakes.slice(0, 20)) {
      const tsunamiFlag = eq.tsunami ? ' ⚠️TSUNAMI' : '';
      const alertFlag = eq.alert ? ` [ALERT:${eq.alert.toUpperCase()}]` : '';
      sections.push(
        `  M${eq.magnitude} | ${eq.location} | ${eq.latitude.toFixed(2)},${eq.longitude.toFixed(2)} | Depth:${eq.depth}km | ${eq.timestamp}${tsunamiFlag}${alertFlag}`
      );
    }
  }

  if (context.news.length > 0) {
    sections.push(`\n[OSINT NEWS FEED — ${context.news.length} items]`);
    for (const item of context.news.slice(0, 15)) {
      const coords = item.coords ? ` | GEO:${item.coords[0].toFixed(2)},${item.coords[1].toFixed(2)}` : '';
      sections.push(
        `  RISK:${item.risk_score}/10 | ${item.source} | ${item.title}${coords} | ${item.published}`
      );
    }
  }

  if (context.threats.length > 0) {
    sections.push(`\n[THREAT EVENTS — ${context.threats.length} active]`);
    for (const threat of context.threats.slice(0, 15)) {
      sections.push(
        `  ${threat.severity} | ${threat.type} | ${threat.title} | ${threat.region} | ${threat.timestamp}`
      );
    }
  }

  if (context.cyberAlerts.length > 0) {
    sections.push(`\n[CYBER ALERTS — ${context.cyberAlerts.length} active]`);
    for (const alert of context.cyberAlerts.slice(0, 10)) {
      sections.push(
        `  ${alert.id} | ${alert.severity} | ${alert.vendor}/${alert.product} | ${alert.name} | Due:${alert.due}`
      );
    }
  }

  return sections.join('\n');
}

/* ─────────────────────────────────────────────────────────────
   Intelligence Analysis
   ───────────────────────────────────────────────────────────── */

export async function analyzeIntelligence(
  client: GoogleGenerativeAI,
  context: IntelligenceContext,
  userQuery: string
): Promise<string> {
  const contextData = serializeContext(context);

  const prompt = `## CURRENT OPERATIONAL DATA
${contextData}

## ANALYST QUERY
${userQuery}

Provide your intelligence assessment based on the operational data above and the analyst's query.`;

  return await generateWithFallback(client, prompt, SYSTEM_PROMPT);
}

/* ─────────────────────────────────────────────────────────────
   Daily Briefing Generation
   ───────────────────────────────────────────────────────────── */

export async function generateBriefing(
  client: GoogleGenerativeAI,
  context: IntelligenceContext
): Promise<string> {
  const contextData = serializeContext(context);

  const prompt = `${BRIEFING_PROMPT}

## CURRENT OPERATIONAL DATA
${contextData}

Generate the briefing now.`;

  return await generateWithFallback(client, prompt, SYSTEM_PROMPT);
}

/* ─────────────────────────────────────────────────────────────
   News / Intel Validation
   ───────────────────────────────────────────────────────────── */

const NEWS_SYSTEM_PROMPT = `You are an automated OSINT curation, translation, and summarization AI.
Your job is to filter a list of newly ingested Telegram and RSS items, translate them to English, and summarize/shorten long or verbose news alerts.
You must strictly EXCLUDE (set valid: false):
- Telegram auto-generated messages (e.g. "Channel photo updated", "Channel name was changed", "Channel created")
- Fragment/auction spam (e.g. "Will be selling on fragment", "Имя @... выставлено на аукцион")
- Purely administrative or empty posts
- Spam, ads, and irrelevant channel chat.

For items that ARE valid news/intel (valid: true):
- If the original text (title or description) is NOT in English, translate it accurately to English.
- If the description (translated or original) is very long, detailed, or wordy (exceeding ~150-250 characters or 2-3 sentences), summarize and condense it into a clear, high-impact, professional OSINT briefing (aim for 1-3 sentences or under 200 characters).
- Make sure to retain all critical intelligence data: locations, names of regions/cities, dates/times, casualty numbers, specific weaponry/equipment, and active forces, while stripping out editorializing, raw chat filler, or excessive repeating sentences.
- Ensure the title is also kept concise, descriptive, and under 80 characters.

Return ONLY a JSON array of objects with this structure:
[
  { "valid": true, "title": "Concise translated/original English title", "description": "Summarized, high-impact translated/original English description" },
  { "valid": false }
]

The array length must EXACTLY match the number of input items provided. Do not include markdown code blocks like \`\`\`json, just the raw array.`;

export async function validateNewsBulk(
  client: GoogleGenerativeAI,
  items: any[]
): Promise<any[]> {
  if (items.length === 0) return [];

  const payload = items.map((it, idx) => `[${idx}] Title: ${it.title} | Content: ${it.description}`).join('\n');

  try {
    const prompt = `Validate and translate these items:\n${payload}\n\nReturn JSON object array only.`;
    const text = await generateWithFallback(client, prompt, NEWS_SYSTEM_PROMPT);
    const cleanText = text.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsedArray = JSON.parse(cleanText);

    if (Array.isArray(parsedArray) && parsedArray.length === items.length) {
      const processedItems: any[] = [];
      for (let idx = 0; idx < items.length; idx++) {
        if (parsedArray[idx] && parsedArray[idx].valid === true) {
          processedItems.push({
            ...items[idx],
            title: parsedArray[idx].title || items[idx].title,
            description: parsedArray[idx].description || items[idx].description
          });
        }
      }
      return processedItems;
    }
  } catch (e) {
    console.error('[AEGIS AI] Validation/Translation failed, falling back to heuristic filter:', e);
  }

  // Fallback heuristic filter
  const filtered = items.filter(it => {
    const lower = (it.title + ' ' + it.description).toLowerCase();
    const junk = ['channel photo updated', 'channel created', 'channel name was changed', 'selling on fragment', 'выставлено на аукцион', 'минимальную ставку'];
    return !junk.some(j => lower.includes(j));
  });

  // Free auto-translation fallback for items
  const translatedFallback = await Promise.all(filtered.map(async (it) => ({
    ...it,
    title: await fallbackTranslate(it.title),
    description: await fallbackTranslate(it.description)
  })));

  return translatedFallback;
}

