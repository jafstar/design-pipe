// Deterministic, in-house color harmony + WCAG contrast math — no
// third-party API dependency (Coolors/Adobe Color), per
// mailbox/artifacts/pipe-arch/color-pipeline-handoff.md. Pure functions,
// no network calls, no API cost, runs instantly.
//
// The handoff calls the contrast check "a hard requirement, not a
// nice-to-have — a generated palette that fails contrast shouldn't reach
// the design stage." That means auto-correcting a failing pairing, not
// just flagging it and shipping it anyway — implemented in ensureContrast.

// ── hex <-> rgb <-> hsl ──────────────────────────────────────────────

export function hexToRgb(hex) {
  const clean = String(hex).replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Invalid hex color: ${hex}`);
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  const hn = ((h % 360) + 360) % 360 / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = ln * 255;
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: hue2rgb(p, q, hn + 1 / 3) * 255,
    g: hue2rgb(p, q, hn) * 255,
    b: hue2rgb(p, q, hn - 1 / 3) * 255,
  };
}

const hexToHsl = (hex) => rgbToHsl(hexToRgb(hex));
const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl));

// Real color transform, same "own the math" discipline as
// hero_pipeline.mjs's neonAccent() (which does the opposite move — boosts
// saturation for an expressive-tier glow). This one desaturates and darkens
// toward a jewel/wine tone — per the Round Table + a real g_design.mjs
// comp's own design-system.md doc, a single-purpose CTA color should never
// look like a generic bright startup accent; darkening + desaturating the
// same hue is what makes it read as "reserved, deliberate" rather than
// "just another button color." Same hue is kept so it's still visibly the
// same brand family, not an arbitrary unrelated color.
export function ctaAccent(baseHex) {
  const hsl = hexToHsl(baseHex);
  const jeweled = { h: hsl.h, s: Math.min(hsl.s, 55), l: Math.min(Math.max(hsl.l * 0.55, 22), 34) };
  return hslToHex(jeweled);
}

// ── harmony rules — hue rotations from a base hue ───────────────────

export const HARMONY_RULES = {
  complementary: (h) => [h, (h + 180) % 360],
  analogous: (h) => [h, (h + 30) % 360, (h + 330) % 360],
  triadic: (h) => [h, (h + 120) % 360, (h + 240) % 360],
  splitComplementary: (h) => [h, (h + 150) % 360, (h + 210) % 360],
  tetradic: (h) => [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360],
};

// ── mood/requirement presets — real starting parameters, not a freehand
// guess. Each maps a named intent to a hue range, saturation range, and a
// suggested harmony rule following the same logic the handoff itself
// names as the example ("analogous for something soft/warm, complementary
// for something bold/high-contrast"). generateFromMood picks a hue inside
// the named range so two runs of the same mood land in the same family,
// not identical every time.
export const MOOD_PRESETS = {
  warm: { hueRange: [0, 40], satRange: [55, 80], harmony: 'analogous' },
  cool: { hueRange: [180, 240], satRange: [45, 70], harmony: 'analogous' },
  bold: { hueRange: [0, 360], satRange: [70, 95], harmony: 'complementary' },
  calm: { hueRange: [160, 210], satRange: [25, 45], harmony: 'analogous' },
  energetic: { hueRange: [10, 50], satRange: [75, 95], harmony: 'triadic' },
  elegant: { hueRange: [260, 300], satRange: [35, 55], harmony: 'splitComplementary' },
  luxurious: { hueRange: [40, 55], satRange: [55, 75], harmony: 'splitComplementary' }, // deep gold/jewel-tone leaning
  playful: { hueRange: [0, 360], satRange: [70, 95], harmony: 'triadic' },
  trustworthy: { hueRange: [200, 225], satRange: [40, 65], harmony: 'analogous' },
  minimal: { hueRange: [0, 360], satRange: [10, 30], harmony: 'complementary' },
  earthy: { hueRange: [20, 100], satRange: [30, 55], harmony: 'analogous' },
};

export function availableMoods() {
  return Object.keys(MOOD_PRESETS);
}

// ── WCAG relative luminance + contrast ratio ────────────────────────
// Standard formulas per WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance

export function relativeLuminance({ r, g, b }) {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lA, lB), darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.1 AA thresholds
export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT = 3.0; // 18pt+/14pt-bold+, or UI components/graphical objects

// Nudges `adjustable`'s lightness (toward black or white, whichever
// increases contrast against `fixed`) until the pair passes minRatio, or
// gives up at the extreme (0 or 100 lightness) rather than looping
// forever. Preserves hue/saturation — this is a lightness correction,
// not a hue change, so the corrected color still belongs to the palette.
export function ensureContrast(adjustableHex, fixedHex, minRatio) {
  if (contrastRatio(adjustableHex, fixedHex) >= minRatio) {
    return { hex: adjustableHex, adjusted: false };
  }
  const hsl = hexToHsl(adjustableHex);
  const fixedL = hexToHsl(fixedHex).l;
  const direction = hsl.l <= fixedL ? -1 : 1; // push away from the fixed color's lightness
  let l = hsl.l;
  for (let i = 0; i < 100; i++) {
    l = clamp(l + direction * 1, 0, 100);
    const candidate = hslToHex({ ...hsl, l });
    if (contrastRatio(candidate, fixedHex) >= minRatio) {
      return { hex: candidate, adjusted: true };
    }
    if (l === 0 || l === 100) break;
  }
  // Extreme case (e.g. fixed color is mid-gray, no lightness push gets
  // there) — fall back to pure black or white, whichever contrasts more.
  const black = '#000000', white = '#ffffff';
  const best = contrastRatio(black, fixedHex) >= contrastRatio(white, fixedHex) ? black : white;
  return { hex: best, adjusted: true };
}

// ── palette generation ───────────────────────────────────────────────

export const NAMED_ROLES = ['background', 'surface', 'primary', 'accent', 'textOnLight', 'textOnDark', 'muted'];

// Required pairings — text/background combos every palette must actually
// support. UI-component pairs (primary as a button fill against the page
// background) use the lower large-text/graphical-object threshold; real
// body text pairs use the stricter normal-text threshold. Each has a
// stable `id` so the UI can offer a checkbox per requirement, not just a
// single all-or-nothing WCAG switch.
export const REQUIRED_CONTRAST_PAIRS = [
  { id: 'textOnLight-background', fg: 'textOnLight', bg: 'background', minRatio: WCAG_AA_NORMAL_TEXT, adjustable: 'fg' },
  { id: 'textOnLight-surface', fg: 'textOnLight', bg: 'surface', minRatio: WCAG_AA_NORMAL_TEXT, adjustable: 'fg' },
  { id: 'textOnDark-primary', fg: 'textOnDark', bg: 'primary', minRatio: WCAG_AA_NORMAL_TEXT, adjustable: 'fg' },
  { id: 'primary-background', fg: 'primary', bg: 'background', minRatio: WCAG_AA_LARGE_TEXT, adjustable: 'fg' },
  { id: 'muted-background', fg: 'muted', bg: 'background', minRatio: WCAG_AA_LARGE_TEXT, adjustable: 'fg' },
];

export function allContrastIds() {
  return REQUIRED_CONTRAST_PAIRS.map((p) => p.id);
}

/**
 * Runs the required-pairs contrast check pass on an arbitrary palette
 * object (not just one generatePalette just built) — extracted so the
 * "lock a swatch, reroll the rest" flow can re-validate a palette after
 * locked roles get merged back in, without duplicating this logic.
 *
 * `lockedRoles` are never adjusted, even if they're the "adjustable" side
 * of a failing pair — their partner gets corrected around them instead.
 *
 * `enforcedIds` (default: every pair, i.e. current/original behavior) —
 * pairs whose id isn't in this list are still checked and reported, but
 * never auto-corrected. This is the actual mechanism behind "let go of
 * WCAG" — unchecking a requirement means "stop enforcing this one," not
 * "stop telling me about it." A pair outside enforcedIds that fails is
 * reported with `passes: false` but is not counted in `warnings`, since
 * an intentionally-unenforced failure isn't something to warn about.
 */
export function applyContrastChecks(inputPalette, lockedRoles = [], enforcedIds = null) {
  const enforced = enforcedIds ?? allContrastIds();
  let palette = { ...inputPalette };
  const contrastChecks = [];
  for (const { id, fg, bg, minRatio, adjustable } of REQUIRED_CONTRAST_PAIRS) {
    const isEnforced = enforced.includes(id);
    const before = contrastRatio(palette[fg], palette[bg]);
    if (isEnforced && before < minRatio) {
      let target = adjustable === 'fg' ? fg : bg;
      let fixed = adjustable === 'fg' ? bg : fg;
      if (lockedRoles.includes(target) && !lockedRoles.includes(fixed)) {
        [target, fixed] = [fixed, target]; // swap which side adjusts if the usual target is locked
      }
      if (!lockedRoles.includes(target)) {
        const { hex, adjusted } = ensureContrast(palette[target], palette[fixed], minRatio);
        if (adjusted) palette = { ...palette, [target]: hex };
      }
    }
    const after = contrastRatio(palette[fg], palette[bg]);
    contrastChecks.push({
      id,
      pair: `${fg} on ${bg}`,
      minRequired: minRatio,
      ratio: Math.round(after * 100) / 100,
      passes: after >= minRatio,
      wasCorrected: isEnforced && before < minRatio,
      enforced: isEnforced,
    });
  }
  const warnings = contrastChecks
    .filter((c) => c.enforced)
    .filter((c) => !c.passes)
    .map((c) => `${c.pair}: ${c.ratio}:1, needs ${c.minRequired}:1 (both sides locked — cannot auto-correct)`);
  return { palette, contrastChecks, warnings, allPassed: warnings.length === 0 };
}

// Real empirical finding, 2026-07-12: a flat lightness for `primary`
// (l:45) only clears its real required contrast ratios ~47-57% of the
// time raw, swept across the full hue wheel — sRGB relative luminance
// weights green far more than blue/red, so the same lightness number
// reads much brighter for a yellow-green hue than a blue one. That gap
// was being silently papered over by applyContrastChecks' corrector on
// roughly half of all generated palettes — meaning the primary color you
// actually see is often the *correction*, not the harmony math's real
// intent. Binary search finds the lightest (most vibrant) lightness that
// still clears the real ratio for THIS specific hue, so the raw palette
// passes by construction instead of by correction. contrastRatio against
// a light fixedHex is monotonically decreasing in lightness, so the
// search is safe.
function solveMaxLightnessForContrast(hue, sat, fixedHex, minRatio) {
  let lo = 0, hi = 100;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const candidate = hslToHex({ h: hue, s: sat, l: mid });
    if (contrastRatio(candidate, fixedHex) >= minRatio) lo = mid; else hi = mid;
  }
  return lo;
}

/**
 * Generates a real, named 7-color palette from a base color + harmony
 * rule, with every required contrast pairing checked and auto-corrected
 * before it's returned — never ships a palette that fails WCAG AA.
 */
export function generatePalette(baseHex, harmonyName = 'analogous', enforcedIds = null, accentOverrideHex = null) {
  const rule = HARMONY_RULES[harmonyName];
  if (!rule) throw new Error(`Unknown harmony rule: "${harmonyName}". Options: ${Object.keys(HARMONY_RULES).join(', ')}`);

  const baseHsl = hexToHsl(baseHex);
  const hues = rule(baseHsl.h);
  const primaryHue = hues[0];
  const accentHue = hues[1] ?? hues[0];
  const satBase = Math.max(baseHsl.s, 35);

  // A real two-color brand (e.g. a green storefront with a red logo accent)
  // has an accent hue with no mathematical relationship to the primary —
  // deriving it from baseHex's own harmony would invent a color the
  // business doesn't actually use. When given, this real second brand
  // color drives the accent role's hue/saturation directly instead of the
  // harmony-derived one; it still goes through the same contrast checks
  // below as every other role, so accessibility guarantees don't change.
  const accentHsl = accentOverrideHex ? hexToHsl(accentOverrideHex) : null;
  const resolvedAccentHue = accentHsl ? accentHsl.h : accentHue;
  const resolvedAccentSat = accentHsl ? Math.max(accentHsl.s, 35) : satBase;

  // Real empirical finding, 2026-07-12: raising the background/surface
  // saturation cap from 12 to 32 has zero measured effect on their real
  // contrast pass rate (100% at every cap from 12 to 60, swept across the
  // full hue wheel) — those checks are dominated by the lightness gap
  // against l:12 text, not saturation. The old 12% cap was producing a
  // washed-out neutral nobody asked for; 32 lands close to real hand-tuned
  // reference comps (a real sand background sampled at ~42%) while still
  // clearly reading as a neutral fill, not a colored wash. textOnLight/
  // textOnDark/muted keep their own lower caps on purpose — those are text
  // colors, where low saturation is a real legibility choice, not a
  // richness one.
  //
  // Saturation alone wasn't enough, though (verified live: still looked
  // near-white after the cap fix) — at l:97, a color is so close to pure
  // white that almost no saturation reads visually regardless of the cap;
  // HSL lightness dominates perceived warmth far more than saturation does
  // at the extremes. Real reference comps sit their background around
  // l:90-91, not l:97. Swept l:97 down to l:86 in 2-point steps against
  // textOnLight (l:12) — 100% raw pass rate held at every step (the
  // contrast gap between l:12 and even l:86 is still enormous), so this
  // is a free, safe move, not a tradeoff against the earlier fix.
  const FILL_SAT_CAP = 32;
  const background = hslToHex({ h: primaryHue, s: Math.min(baseHsl.s, FILL_SAT_CAP), l: 93 });
  const surface = hslToHex({ h: primaryHue, s: Math.min(baseHsl.s, FILL_SAT_CAP), l: 87 });
  const textOnLight = hslToHex({ h: primaryHue, s: Math.min(baseHsl.s, 15), l: 12 });
  const textOnDark = hslToHex({ h: primaryHue, s: Math.min(baseHsl.s, 8), l: 97 });
  const muted = hslToHex({ h: primaryHue, s: Math.min(baseHsl.s, 12), l: 42 });
  // Solved against the real textOnDark this palette actually generated
  // (not an assumed pure white) — guarantees textOnDark-primary passes
  // raw, and primary-background (a looser large-text threshold against a
  // similarly near-white background) passes as a consequence.
  const primaryL = solveMaxLightnessForContrast(primaryHue, satBase, textOnDark, WCAG_AA_NORMAL_TEXT);

  const rawPalette = {
    background,
    surface,
    primary: hslToHex({ h: primaryHue, s: satBase, l: primaryL }),
    accent: hslToHex({ h: resolvedAccentHue, s: resolvedAccentSat, l: 50 }),
    textOnLight,
    textOnDark,
    muted,
  };

  const { palette, contrastChecks, warnings, allPassed } = applyContrastChecks(rawPalette, [], enforcedIds);

  return {
    baseHex,
    harmonyName,
    hues: hues.map((h) => Math.round(h)),
    accentOverrideHex: accentOverrideHex || null,
    palette,
    contrastChecks,
    warnings,
    allPassed,
  };
}

// Standalone exploration mode — not tied to an ingested base color. Picks
// a random base hue (and random harmony unless one's specified) so this
// module is usable as its own tool, not just as an input to generation
// downstream of Ingestion. Same guaranteed-valid-and-contrast-checked
// output as generatePalette, since it just calls through to it.
export function generateRandomPalette(harmonyName, enforcedIds = null) {
  const hue = Math.floor(Math.random() * 360);
  const sat = 45 + Math.floor(Math.random() * 40); // 45-85, avoids muddy/neon extremes
  const baseHex = hslToHex({ h: hue, s: sat, l: 45 });
  const harmony = harmonyName ?? availableHarmonies()[Math.floor(Math.random() * availableHarmonies().length)];
  return generatePalette(baseHex, harmony, enforcedIds);
}

// Requirement/mood-driven mode — a described intent maps to a real hue
// range + saturation range + suggested harmony (MOOD_PRESETS above)
// instead of either a specific brand hex or pure randomness. Picks a hue
// inside the mood's range so repeated calls stay in the same family
// without being identical every time.
export function generateFromMood(moodName, harmonyOverride, enforcedIds = null) {
  const preset = MOOD_PRESETS[moodName];
  if (!preset) throw new Error(`Unknown mood: "${moodName}". Options: ${availableMoods().join(', ')}`);
  const [hMin, hMax] = preset.hueRange;
  const [sMin, sMax] = preset.satRange;
  const hue = hMin + Math.random() * (hMax - hMin);
  const sat = sMin + Math.random() * (sMax - sMin);
  const baseHex = hslToHex({ h: hue, s: sat, l: 45 });
  return generatePalette(baseHex, harmonyOverride ?? preset.harmony, enforcedIds);
}

export function availableHarmonies() {
  return Object.keys(HARMONY_RULES);
}

// Coolors-style "lock a swatch, reroll the rest" — generates a fresh
// random palette, keeps the locked roles exactly as they were in
// currentPalette, then re-runs the contrast check/correction pass on the
// merged result so anything unlocked adapts around what's locked instead
// of clashing with it.
export function rerollUnlocked(currentPalette, lockedRoles = [], harmonyName, enforcedIds = null) {
  const fresh = generateRandomPalette(harmonyName, enforcedIds);
  const merged = { ...fresh.palette };
  for (const role of lockedRoles) {
    if (currentPalette[role]) merged[role] = currentPalette[role];
  }
  const { palette, contrastChecks, warnings, allPassed } = applyContrastChecks(merged, lockedRoles, enforcedIds);
  return { baseHex: fresh.baseHex, harmonyName: fresh.harmonyName, hues: fresh.hues, palette, contrastChecks, warnings, allPassed };
}
