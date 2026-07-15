// Deterministic typography system generation — same shape as
// lib/color_pipeline.mjs, per mailbox/artifacts/pipe-arch/
// typography-pipeline-handoff.md. Real modular-scale math, a curated set
// of real, named font pairings (not random combination, not a live
// Google Fonts API call at generation time — "own the layer," same
// zero-network-dependency decision as color), and WCAG size/line-height/
// measure checks with the same enforced-by-default, toggleable-per-
// requirement pattern Color proved out.
//
// Font data below is a deliberately curated subset of real, long-stable
// Google Fonts (SIL Open Font License, free for commercial use, no
// attribution required) — self-host the actual files in production per
// the GDPR/Google-CDN privacy issue discussed live; this module only
// deals in font *names and metadata*, not delivery.
//
// Every entry below is verified against the live Google Fonts Developer
// API (2026-07-11), not asserted from memory — that check caught two real
// errors worth noting: "Source Serif Pro" no longer exists under that
// name (renamed "Source Serif 4"), and several fonts marked italic:false
// actually do have real italic variants live. Same "verify before trusting
// a memory/assumption" discipline as everywhere else in this project.

// ── curated font catalog — real fonts, real category, real weights,
// confirmed against the live Google Fonts API ──

export const FONTS = {
  'Playfair Display': { category: 'serif', weights: [400, 500, 600, 700, 800, 900], italic: true },
  'Fraunces': { category: 'serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Libre Baskerville': { category: 'serif', weights: [400, 500, 600, 700], italic: true },
  'Lora': { category: 'serif', weights: [400, 500, 600, 700], italic: true },
  'Merriweather': { category: 'serif', weights: [300, 400, 500, 600, 700, 800, 900], italic: true },
  'Crimson Text': { category: 'serif', weights: [400, 600, 700], italic: true },
  'Source Serif 4': { category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'PT Serif': { category: 'serif', weights: [400, 700], italic: true },
  'Montserrat': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Poppins': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Space Grotesk': { category: 'sans-serif', weights: [300, 400, 500, 600, 700], italic: false },
  'DM Sans': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Work Sans': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Inter': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Roboto': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true },
  'Open Sans': { category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], italic: true },
  'IBM Plex Sans': { category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700], italic: true },
  'IBM Plex Mono': { category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700], italic: true },
  'Space Mono': { category: 'monospace', weights: [400, 700], italic: true },
  'JetBrains Mono': { category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800], italic: true },
};

export function fontExists(name) {
  return Object.prototype.hasOwnProperty.call(FONTS, name);
}

// ── curated pairing rules — the typography equivalent of color's
// HARMONY_RULES: a fixed, named vocabulary, not infinite combination ──

export const PAIRING_STRATEGIES = {
  classicContrast: [
    { heading: 'Playfair Display', body: 'Inter' },
    { heading: 'Fraunces', body: 'Work Sans' },
    { heading: 'Libre Baskerville', body: 'Source Serif 4' },
    { heading: 'Lora', body: 'Open Sans' },
    { heading: 'Merriweather', body: 'IBM Plex Sans' },
  ],
  sameFamily: [
    { heading: 'Inter', body: 'Inter' },
    { heading: 'Work Sans', body: 'Work Sans' },
    { heading: 'Montserrat', body: 'Montserrat' },
    { heading: 'IBM Plex Sans', body: 'IBM Plex Sans' },
  ],
  displayWorkhorse: [
    { heading: 'Space Grotesk', body: 'Inter' },
    { heading: 'Poppins', body: 'Open Sans' },
    { heading: 'Montserrat', body: 'Roboto' },
    { heading: 'DM Sans', body: 'Work Sans' },
  ],
};

export function availablePairingStrategies() {
  return Object.keys(PAIRING_STRATEGIES);
}

// ── modular scale ratios — real, named, from the same ratio family as
// the color/grid work (per the handoff's own cross-reference) ──

export const SCALE_RATIOS = {
  minorThird: 1.2,
  majorThird: 1.25,
  perfectFourth: 1.333,
  augmentedFourth: 1.414,
  goldenRatio: 1.618,
};

export function availableScaleRatios() {
  return Object.keys(SCALE_RATIOS);
}

// ── mood presets — same 11 names as lib/color_pipeline.mjs's
// MOOD_PRESETS, for a brand's color and type systems to agree with each
// other instead of being picked independently ──

export const MOOD_PRESETS = {
  warm: { strategy: 'classicContrast', ratio: 'minorThird' },
  cool: { strategy: 'displayWorkhorse', ratio: 'majorThird' },
  bold: { strategy: 'displayWorkhorse', ratio: 'perfectFourth' },
  calm: { strategy: 'sameFamily', ratio: 'minorThird' },
  energetic: { strategy: 'displayWorkhorse', ratio: 'goldenRatio' },
  elegant: { strategy: 'classicContrast', ratio: 'majorThird' },
  luxurious: { strategy: 'classicContrast', ratio: 'perfectFourth' },
  playful: { strategy: 'displayWorkhorse', ratio: 'augmentedFourth' },
  trustworthy: { strategy: 'sameFamily', ratio: 'minorThird' },
  minimal: { strategy: 'sameFamily', ratio: 'minorThird' },
  earthy: { strategy: 'classicContrast', ratio: 'minorThird' },
};

export function availableMoods() {
  return Object.keys(MOOD_PRESETS);
}

// ── named roles + their scale steps and typography conventions ──
// Larger text conventionally gets tighter line-height; body/caption get
// looser, more readable line-height — real typographic practice, not
// arbitrary. Step is the exponent applied to the ratio from the base size.

export const NAMED_ROLES = ['caption', 'body', 'h3', 'h2', 'h1', 'display'];
const ROLE_STEPS = { caption: -1, body: 0, h3: 1, h2: 2, h1: 3, display: 4 };
const ROLE_LINE_HEIGHT = { caption: 1.4, body: 1.5, h3: 1.25, h2: 1.2, h1: 1.15, display: 1.1 };
const ROLE_USES_HEADING_FONT = { caption: false, body: false, h3: true, h2: true, h1: true, display: true };

function pickWeight(font, target) {
  const weights = FONTS[font].weights;
  return weights.reduce((best, w) => (Math.abs(w - target) < Math.abs(best - target) ? w : best), weights[0]);
}

// ── WCAG requirements — same enforced-by-default, toggleable-per-id
// pattern as color_pipeline.mjs's applyContrastChecks ──

export const WCAG_MIN_BODY_PX = 16;
export const WCAG_LINE_HEIGHT_RANGE = [1.4, 1.6];
export const WCAG_MEASURE_RANGE_CH = [45, 75];

export const TYPOGRAPHY_REQUIREMENTS = [
  { id: 'body-min-size', label: 'Body text at or above 16px equivalent' },
  { id: 'body-line-height', label: 'Body line-height within 1.4–1.6x' },
  { id: 'body-measure', label: 'Body measure within 45–75 characters' },
];

export function allTypographyRequirementIds() {
  return TYPOGRAPHY_REQUIREMENTS.map((r) => r.id);
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Checks (and, for enforced ids, corrects) the WCAG-relevant properties
 * of a generated type system. Mirrors applyContrastChecks's contract:
 * unenforced requirements are still checked and reported honestly, just
 * never auto-corrected.
 */
export function applyTypographyChecks(system, enforcedIds = null) {
  const enforced = enforcedIds ?? allTypographyRequirementIds();
  const roles = { ...system.roles };
  const checks = [];

  // body-min-size
  {
    const id = 'body-min-size';
    const isEnforced = enforced.includes(id);
    let value = roles.body.sizePx;
    if (isEnforced && value < WCAG_MIN_BODY_PX) {
      roles.body = { ...roles.body, sizePx: WCAG_MIN_BODY_PX };
      value = WCAG_MIN_BODY_PX;
    }
    checks.push({ id, label: 'Body text at or above 16px equivalent', value: `${Math.round(value)}px`, passes: value >= WCAG_MIN_BODY_PX, wasCorrected: isEnforced && roles.body.sizePx !== system.roles.body.sizePx, enforced: isEnforced });
  }

  // body-line-height
  {
    const id = 'body-line-height';
    const isEnforced = enforced.includes(id);
    const [min, max] = WCAG_LINE_HEIGHT_RANGE;
    let value = roles.body.lineHeight;
    if (isEnforced && (value < min || value > max)) {
      roles.body = { ...roles.body, lineHeight: clamp(value, min, max) };
      value = roles.body.lineHeight;
    }
    checks.push({ id, label: `Body line-height within ${min}-${max}x`, value: `${value}x`, passes: value >= min && value <= max, wasCorrected: isEnforced && roles.body.lineHeight !== system.roles.body.lineHeight, enforced: isEnforced });
  }

  // body-measure
  {
    const id = 'body-measure';
    const isEnforced = enforced.includes(id);
    const [min, max] = WCAG_MEASURE_RANGE_CH;
    let value = system.measureCh;
    let measureCh = system.measureCh;
    if (isEnforced && (value < min || value > max)) {
      measureCh = clamp(value, min, max);
      value = measureCh;
    }
    checks.push({ id, label: `Body measure within ${min}-${max} characters`, value: `${value}ch`, passes: value >= min && value <= max, wasCorrected: isEnforced && measureCh !== system.measureCh, enforced: isEnforced });
    system = { ...system, measureCh };
  }

  const warnings = checks.filter((c) => c.enforced && !c.passes).map((c) => `${c.label}: got ${c.value}`);
  return { ...system, roles, checks, warnings, allPassed: warnings.length === 0 };
}

/**
 * Generates a real, named type system (6 roles: caption/body/h3/h2/h1/
 * display) from a pairing strategy + modular scale ratio, with WCAG
 * checks applied before it's returned.
 */
export function generateTypeSystem(strategyName = 'classicContrast', ratioName = 'majorThird', baseSizePx = 16, pairingIndex = null, enforcedIds = null) {
  const pairings = PAIRING_STRATEGIES[strategyName];
  if (!pairings) throw new Error(`Unknown pairing strategy: "${strategyName}". Options: ${availablePairingStrategies().join(', ')}`);
  const ratio = SCALE_RATIOS[ratioName];
  if (!ratio) throw new Error(`Unknown scale ratio: "${ratioName}". Options: ${availableScaleRatios().join(', ')}`);

  const pairing = pairings[pairingIndex ?? Math.floor(Math.random() * pairings.length)];

  const roles = {};
  for (const role of NAMED_ROLES) {
    const sizePx = Math.round(baseSizePx * Math.pow(ratio, ROLE_STEPS[role]));
    const family = ROLE_USES_HEADING_FONT[role] ? pairing.heading : pairing.body;
    const targetWeight = role === 'display' || role === 'h1' ? 700 : role === 'h2' || role === 'h3' ? 600 : 400;
    roles[role] = {
      family,
      category: FONTS[family].category,
      sizePx,
      weight: pickWeight(family, targetWeight),
      lineHeight: ROLE_LINE_HEIGHT[role],
    };
  }

  const rawSystem = {
    strategyName,
    ratioName,
    baseSizePx,
    headingFamily: pairing.heading,
    bodyFamily: pairing.body,
    roles,
    measureCh: 65, // sane default within the WCAG 45-75 range; checked/correctable below like everything else
  };

  return applyTypographyChecks(rawSystem, enforcedIds);
}

export function generateRandomTypeSystem(enforcedIds = null) {
  const strategy = availablePairingStrategies()[Math.floor(Math.random() * availablePairingStrategies().length)];
  const ratio = availableScaleRatios()[Math.floor(Math.random() * availableScaleRatios().length)];
  return generateTypeSystem(strategy, ratio, 16, null, enforcedIds);
}

export function generateTypeSystemFromMood(moodName, enforcedIds = null) {
  const preset = MOOD_PRESETS[moodName];
  if (!preset) throw new Error(`Unknown mood: "${moodName}". Options: ${availableMoods().join(', ')}`);
  return generateTypeSystem(preset.strategy, preset.ratio, 16, null, enforcedIds);
}

// Coolors/color_pipeline-style "lock a role, reroll the rest" — keeps
// locked roles' exact family/size/weight/lineHeight, regenerates
// everything else from a fresh random pairing+ratio, then re-runs the
// WCAG pass on the merged result.
export function rerollUnlockedRoles(currentSystem, lockedRoles = [], enforcedIds = null) {
  const fresh = generateRandomTypeSystem(enforcedIds);
  const roles = { ...fresh.roles };
  for (const role of lockedRoles) {
    if (currentSystem.roles[role]) roles[role] = currentSystem.roles[role];
  }
  const merged = { ...fresh, roles };
  return applyTypographyChecks(merged, enforcedIds);
}
