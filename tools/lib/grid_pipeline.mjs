// Deterministic grid-system generation — same shape as lib/color_pipeline.mjs
// and lib/typography_pipeline.mjs, per mailbox/artifacts/design-pipe-handoffs/
// 03-grid-pipeline-handoff.md. Real structural math (columns, gutters,
// margins, responsive collapse) for the fully-formalizable part; break
// rules (Samara's scale shift, overlap, asymmetry, optical tension,
// deliberate misalignment) are named and checked where checkable, honestly
// reported as "requires human judgment" where they aren't — same "own the
// layer" instinct, same honesty discipline as everywhere else in the pipe.
//
// Mood vocabulary decision: the handoff's own illustrative moods
// (professional/editorial/minimal/playful/bold) overlap with but don't
// exactly match color/typography's shared 11-name vocabulary. Reusing the
// SAME 11 names here (warm/cool/bold/calm/energetic/elegant/luxurious/
// playful/trustworthy/minimal/earthy) follows the precedent typography
// itself set ("reuses color's 11-mood vocabulary so a brand's color and
// type systems can agree with each other") — one mood now drives all three
// brand-system pipelines in agreement, not three independently-picked
// aesthetics that might clash.

// ── structural vocabulary — Samara's standard systems + grid types ──

export const COLUMN_SYSTEMS = [12, 8, 6];
export const GRID_TYPES = ['standard', 'modular', 'compound'];

export function availableColumnSystems() {
  return [...COLUMN_SYSTEMS];
}
export function availableGridTypes() {
  return [...GRID_TYPES];
}

// Reference viewport widths for the three responsive tiers — standard,
// commonly-used breakpoint widths, not arbitrary picks.
export const BREAKPOINT_WIDTHS = { mobile: 375, tablet: 768, desktop: 1280 };

// Deterministic collapse rule: desktop keeps the full column count, tablet
// drops to a third (matches the handoff's own "12 → 4 → 1" example exactly
// for a 12-column grid), mobile always collapses to 1 — required for
// content to reflow at 320px width without horizontal scroll (WCAG 1.4.10).
function collapseColumns(columnCount) {
  return {
    desktop: columnCount,
    tablet: Math.max(1, Math.floor(columnCount / 3)),
    mobile: 1,
  };
}

// ── break categories — Samara's five named break types. Only scaleShift is
// fully checkable from grid structure alone; the rest are honestly flagged
// as curated rules of thumb requiring human visual judgment. ──

export const BREAK_TYPES = ['scaleShift', 'overlap', 'asymmetry', 'opticalTension', 'deliberateMisalignment'];
export const BREAK_INTENSITY_LEVELS = ['none', 'subtle', 'bold'];
const BREAK_INTENSITY_COUNT = { none: 0, subtle: 1, bold: 2 };

// A compound-grid scale shift needs to be at least this much larger than the
// narrow column to read as a deliberate hierarchy choice, not an accident.
export const MIN_SCALE_SHIFT_DIFFERENTIAL = 1.5;

function pickBreakTypes(count) {
  const pool = [...BREAK_TYPES];
  const picked = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function evaluateBreak(type, columns) {
  if (type === 'scaleShift') {
    const widths = columns.map((c) => c.width);
    const differential = Math.max(...widths) / Math.min(...widths);
    const passes = differential >= MIN_SCALE_SHIFT_DIFFERENTIAL;
    return {
      type,
      checkable: true,
      passes,
      note: passes
        ? `${differential.toFixed(2)}x size differential — reads as a deliberate shift`
        : `${differential.toFixed(2)}x size differential — below the ${MIN_SCALE_SHIFT_DIFFERENTIAL}x minimum to read as deliberate rather than accidental (use a compound grid for real width variation)`,
    };
  }
  if (type === 'overlap') {
    return {
      type,
      checkable: false,
      passes: null,
      note: 'checkable only once paired with real content/color — an overlap crossing text needs the same minimum contrast as WCAG large text (3:1), not decidable from grid structure alone',
    };
  }
  // asymmetry, opticalTension, deliberateMisalignment
  return {
    type,
    checkable: false,
    passes: null,
    note: "curated rule of thumb from the source design theory, not a strict formula — requires human visual judgment",
  };
}

// Golden-ratio split for compound grids — same ratio family already named
// in typography's SCALE_RATIOS.goldenRatio, reused here for a wide/narrow
// column-group split that gives real width variation for hierarchy.
function generateCompoundColumns(columnCount) {
  const wide = Math.max(1, Math.round(columnCount / 1.618));
  const narrow = Math.max(1, columnCount - wide);
  return [{ width: wide }, { width: narrow }];
}

// ── mood presets — same 11 names as color/typography's MOOD_PRESETS ──

export const MOOD_PRESETS = {
  warm: { gridType: 'standard', columnCount: 12, gutterMultiplier: 3, marginMultiplier: 6, breakIntensity: 'subtle' },
  cool: { gridType: 'standard', columnCount: 12, gutterMultiplier: 2, marginMultiplier: 5, breakIntensity: 'none' },
  bold: { gridType: 'compound', columnCount: 12, gutterMultiplier: 2, marginMultiplier: 4, breakIntensity: 'bold' },
  calm: { gridType: 'modular', columnCount: 12, gutterMultiplier: 4, marginMultiplier: 8, breakIntensity: 'none' },
  energetic: { gridType: 'compound', columnCount: 12, gutterMultiplier: 2, marginMultiplier: 4, breakIntensity: 'bold' },
  elegant: { gridType: 'standard', columnCount: 12, gutterMultiplier: 4, marginMultiplier: 10, breakIntensity: 'subtle' },
  luxurious: { gridType: 'modular', columnCount: 8, gutterMultiplier: 5, marginMultiplier: 10, breakIntensity: 'subtle' },
  playful: { gridType: 'compound', columnCount: 8, gutterMultiplier: 3, marginMultiplier: 5, breakIntensity: 'bold' },
  trustworthy: { gridType: 'standard', columnCount: 12, gutterMultiplier: 3, marginMultiplier: 6, breakIntensity: 'none' },
  minimal: { gridType: 'modular', columnCount: 6, gutterMultiplier: 4, marginMultiplier: 8, breakIntensity: 'none' },
  earthy: { gridType: 'standard', columnCount: 8, gutterMultiplier: 3, marginMultiplier: 6, breakIntensity: 'subtle' },
};

export function availableMoods() {
  return Object.keys(MOOD_PRESETS);
}

// ── WCAG-adjacent structural requirements — same enforced-by-default,
// toggleable-per-id pattern as color/typography. Grid choices affect
// reflow and responsive readability, so they feed the same compliance
// report the other two pipelines already do. ──

export const GRID_REQUIREMENTS = [
  { id: 'mobile-columns-single', label: 'Mobile collapses to a single column (Reflow 1.4.10)' },
  { id: 'mobile-min-margin', label: 'Mobile margin at least 16px (reflow readability)' },
  { id: 'gutter-min-target-size', label: 'Gutter at least 8px (supports 24px minimum tap targets, 2.5.5/2.5.8)' },
];

export function allGridRequirementIds() {
  return GRID_REQUIREMENTS.map((r) => r.id);
}

/**
 * Checks (and, for enforced ids, corrects) the WCAG-adjacent structural
 * properties of a generated grid config. Mirrors applyContrastChecks /
 * applyTypographyChecks: unenforced requirements are still checked and
 * reported honestly, just never auto-corrected.
 */
export function applyGridChecks(inputConfig, enforcedIds = null) {
  const enforced = enforcedIds ?? allGridRequirementIds();
  let config = { ...inputConfig, breakpoints: { ...inputConfig.breakpoints } };
  const checks = [];

  // mobile-columns-single
  {
    const id = 'mobile-columns-single';
    const isEnforced = enforced.includes(id);
    let value = config.breakpoints.mobile.columns;
    if (isEnforced && value !== 1) {
      config.breakpoints = { ...config.breakpoints, mobile: { ...config.breakpoints.mobile, columns: 1 } };
      value = 1;
    }
    checks.push({
      id,
      label: 'Mobile collapses to a single column (Reflow 1.4.10)',
      value: `${value} column${value === 1 ? '' : 's'}`,
      passes: value === 1,
      wasCorrected: isEnforced && inputConfig.breakpoints.mobile.columns !== value,
      enforced: isEnforced,
    });
  }

  // mobile-min-margin
  {
    const id = 'mobile-min-margin';
    const isEnforced = enforced.includes(id);
    const MIN_MARGIN_PX = 16;
    let value = config.marginPx;
    if (isEnforced && value < MIN_MARGIN_PX) {
      const marginMultiplier = Math.ceil(MIN_MARGIN_PX / config.baseUnitPx);
      value = config.baseUnitPx * marginMultiplier;
      config = { ...config, marginMultiplier, marginPx: value };
    }
    checks.push({
      id,
      label: 'Mobile margin at least 16px (reflow readability)',
      value: `${value}px`,
      passes: value >= MIN_MARGIN_PX,
      wasCorrected: isEnforced && inputConfig.marginPx !== value,
      enforced: isEnforced,
    });
  }

  // gutter-min-target-size
  {
    const id = 'gutter-min-target-size';
    const isEnforced = enforced.includes(id);
    const MIN_GUTTER_PX = 8;
    let value = config.gutterPx;
    if (isEnforced && value < MIN_GUTTER_PX) {
      const gutterMultiplier = Math.ceil(MIN_GUTTER_PX / config.baseUnitPx);
      value = config.baseUnitPx * gutterMultiplier;
      config = { ...config, gutterMultiplier, gutterPx: value };
    }
    checks.push({
      id,
      label: 'Gutter at least 8px (supports 24px minimum tap targets, 2.5.5/2.5.8)',
      value: `${value}px`,
      passes: value >= MIN_GUTTER_PX,
      wasCorrected: isEnforced && inputConfig.gutterPx !== value,
      enforced: isEnforced,
    });
  }

  const warnings = checks.filter((c) => c.enforced && !c.passes).map((c) => `${c.label}: got ${c.value}`);
  return { ...config, checks, warnings, allPassed: warnings.length === 0 };
}

/**
 * Generates a real, named grid configuration — column system, proportional
 * gutter/margin (tied to a base unit, same relationship type/color have to
 * their own base values), responsive breakpoint collapse, and named breaks
 * evaluated where checkable — with WCAG-adjacent checks applied before
 * it's returned.
 */
export function generateGridSystem(gridType = 'standard', columnCount = 12, gutterMultiplier = 3, marginMultiplier = 6, breakIntensity = 'subtle', baseUnitPx = 8, enforcedIds = null) {
  if (!GRID_TYPES.includes(gridType)) throw new Error(`Unknown grid type: "${gridType}". Options: ${GRID_TYPES.join(', ')}`);
  if (!COLUMN_SYSTEMS.includes(columnCount)) throw new Error(`Unknown column count: ${columnCount}. Options: ${COLUMN_SYSTEMS.join(', ')}`);
  if (!BREAK_INTENSITY_LEVELS.includes(breakIntensity)) throw new Error(`Unknown break intensity: "${breakIntensity}". Options: ${BREAK_INTENSITY_LEVELS.join(', ')}`);

  const gutterPx = baseUnitPx * gutterMultiplier;
  const marginPx = baseUnitPx * marginMultiplier;

  const columns = gridType === 'compound'
    ? generateCompoundColumns(columnCount)
    : Array.from({ length: columnCount }, () => ({ width: 1 }));

  const moduleUnitPx = gridType === 'modular' ? baseUnitPx * 3 : null;

  const collapse = collapseColumns(columnCount);
  const breakpoints = {
    mobile: { widthPx: BREAKPOINT_WIDTHS.mobile, columns: collapse.mobile },
    tablet: { widthPx: BREAKPOINT_WIDTHS.tablet, columns: collapse.tablet },
    desktop: { widthPx: BREAKPOINT_WIDTHS.desktop, columns: collapse.desktop },
  };

  const breakTypes = pickBreakTypes(BREAK_INTENSITY_COUNT[breakIntensity]);
  const breaks = breakTypes.map((type) => evaluateBreak(type, columns));

  const rawConfig = {
    gridType, columnCount, gutterMultiplier, marginMultiplier, baseUnitPx,
    gutterPx, marginPx, columns, moduleUnitPx, breakpoints, breakIntensity, breaks,
  };

  return applyGridChecks(rawConfig, enforcedIds);
}

// Standalone exploration mode, same role as generateRandomPalette /
// generateRandomTypeSystem.
export function generateRandomGridSystem(enforcedIds = null) {
  const gridType = GRID_TYPES[Math.floor(Math.random() * GRID_TYPES.length)];
  const columnCount = COLUMN_SYSTEMS[Math.floor(Math.random() * COLUMN_SYSTEMS.length)];
  const gutterMultiplier = 2 + Math.floor(Math.random() * 4); // 2-5
  const marginMultiplier = 4 + Math.floor(Math.random() * 7); // 4-10
  const breakIntensity = BREAK_INTENSITY_LEVELS[Math.floor(Math.random() * BREAK_INTENSITY_LEVELS.length)];
  return generateGridSystem(gridType, columnCount, gutterMultiplier, marginMultiplier, breakIntensity, 8, enforcedIds);
}

export function generateGridSystemFromMood(moodName, enforcedIds = null) {
  const preset = MOOD_PRESETS[moodName];
  if (!preset) throw new Error(`Unknown mood: "${moodName}". Options: ${availableMoods().join(', ')}`);
  return generateGridSystem(preset.gridType, preset.columnCount, preset.gutterMultiplier, preset.marginMultiplier, preset.breakIntensity, 8, enforcedIds);
}

// ── lock a field, reroll the rest — same spacebar-reroll pattern already
// built for color/typography, per the handoff's own explicit call-out. ──

export const NAMED_FIELDS = ['gridType', 'columnCount', 'gutterMultiplier', 'marginMultiplier', 'breakIntensity'];

export function rerollUnlockedFields(currentConfig, lockedFields = [], enforcedIds = null) {
  const fresh = generateRandomGridSystem(enforcedIds);
  const merged = { ...fresh };
  for (const field of NAMED_FIELDS) {
    if (lockedFields.includes(field)) merged[field] = currentConfig[field];
  }
  const baseUnitPx = currentConfig.baseUnitPx ?? 8;
  return generateGridSystem(merged.gridType, merged.columnCount, merged.gutterMultiplier, merged.marginMultiplier, merged.breakIntensity, baseUnitPx, enforcedIds);
}
