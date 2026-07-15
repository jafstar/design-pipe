// Free Brand System Generator — wires the three real, pure pipeline
// modules (ported unmodified from sync-agent-v2's lib/) directly into the
// browser. No API call, no build step, no server: these are deterministic
// functions, so "generate" here is the exact same math the paid Build
// stage runs on, just running client-side for free.

import * as Color from './lib/color_pipeline.mjs';
import * as Type from './lib/typography_pipeline.mjs';
import * as Grid from './lib/grid_pipeline.mjs';

const MOODS = Color.availableMoods(); // same 11-name vocabulary shared by all three modules

let currentMood = MOODS[Math.floor(Math.random() * MOODS.length)];
let current = null; // { color, type, grid }

const moodGrid = document.getElementById('moodGrid');
const swatchGrid = document.getElementById('swatchGrid');
const typePreview = document.getElementById('typePreview');
const gridPreview = document.getElementById('gridPreview');
const resultMood = document.getElementById('resultMood');
const wcagSummary = document.getElementById('wcagSummary');

function renderMoodButtons() {
  moodGrid.innerHTML = '';
  for (const mood of MOODS) {
    const btn = document.createElement('button');
    btn.className = 'mood-btn' + (mood === currentMood ? ' active' : '');
    btn.textContent = mood;
    btn.addEventListener('click', () => {
      currentMood = mood;
      generate();
    });
    moodGrid.appendChild(btn);
  }
}

// Google Fonts: only the curated font_pipeline family names ever get
// requested here, and only the weights a generated system actually uses —
// loads on demand rather than every family up front.
const loadedFontLinks = new Set();
function ensureGoogleFont(family, weights) {
  const key = `${family}:${weights.join(',')}`;
  if (loadedFontLinks.has(key)) return;
  loadedFontLinks.add(key);
  const familyParam = family.replace(/ /g, '+');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${[...new Set(weights)].sort((a, b) => a - b).join(';')}&display=swap`;
  document.head.appendChild(link);
}

function generate() {
  const color = Color.generateFromMood(currentMood);
  const type = Type.generateTypeSystemFromMood(currentMood);
  const grid = Grid.generateGridSystemFromMood(currentMood);
  current = { color, type, grid };
  render();
}

function render() {
  renderMoodButtons();
  resultMood.textContent = `Mood: ${currentMood}`;

  const allPassed = current.color.allPassed && current.type.allPassed && current.grid.allPassed;
  const totalWarnings = current.color.warnings.length + current.type.warnings.length + current.grid.warnings.length;
  wcagSummary.textContent = allPassed
    ? 'All WCAG-adjacent checks pass.'
    : `${totalWarnings} check${totalWarnings === 1 ? '' : 's'} flagged (still shown below, not hidden).`;
  wcagSummary.className = 'wcag-summary ' + (allPassed ? 'all-pass' : 'has-fail');

  renderSwatches(current.color);
  renderTypography(current.type);
  renderGrid(current.grid);
}

function renderSwatches(colorResult) {
  swatchGrid.innerHTML = '';
  for (const role of Color.NAMED_ROLES) {
    const hex = colorResult.palette[role];
    const btn = document.createElement('button');
    btn.className = 'swatch';
    btn.innerHTML = `
      <div class="swatch-color" style="background:${hex}"></div>
      <div class="swatch-info">
        <span class="swatch-role">${role}</span>
        <span class="swatch-hex">${hex}</span>
      </div>
    `;
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(hex);
      btn.classList.add('swatch-copied');
      setTimeout(() => btn.classList.remove('swatch-copied'), 1200);
    });
    swatchGrid.appendChild(btn);
  }
}

function renderTypography(typeResult) {
  typePreview.innerHTML = '';
  const weightsByFamily = {};
  for (const role of Type.NAMED_ROLES) {
    const r = typeResult.roles[role];
    (weightsByFamily[r.family] ||= []).push(r.weight);
  }
  for (const [family, weights] of Object.entries(weightsByFamily)) ensureGoogleFont(family, weights);

  for (const role of Type.NAMED_ROLES) {
    const r = typeResult.roles[role];
    const row = document.createElement('div');
    row.className = 'type-row';
    row.innerHTML = `
      <span class="type-role-label">${role}</span>
      <span class="type-sample" style="font-family:'${r.family}',${r.category};font-size:${r.sizePx}px;font-weight:${r.weight};line-height:${r.lineHeight}">The quick brown fox</span>
      <span class="type-meta">${r.family} · ${r.sizePx}px · ${r.weight} · ${r.lineHeight}× line-height</span>
    `;
    typePreview.appendChild(row);
  }
}

function renderGrid(gridResult) {
  gridPreview.innerHTML = '';
  const tiers = [
    ['Desktop', gridResult.breakpoints.desktop],
    ['Tablet', gridResult.breakpoints.tablet],
    ['Mobile', gridResult.breakpoints.mobile],
  ];
  for (const [label, bp] of tiers) {
    const tier = document.createElement('div');
    tier.className = 'grid-tier';
    const bars = Array.from({ length: bp.columns }, () => '<div class="grid-col"></div>').join('');
    tier.innerHTML = `
      <div class="grid-tier-label">${label} — ${bp.widthPx}px</div>
      <div class="grid-bars">${bars}</div>
      <div class="grid-meta">${bp.columns} column${bp.columns === 1 ? '' : 's'} · ${gridResult.gutterPx}px gutter · ${gridResult.marginPx}px margin</div>
    `;
    gridPreview.appendChild(tier);
  }
  const breaksEl = document.createElement('div');
  breaksEl.className = 'grid-breaks';
  breaksEl.innerHTML = `<strong>${gridResult.gridType} grid, ${gridResult.columnCount}-column, ${gridResult.breakIntensity} breaks.</strong>` +
    (gridResult.breaks.length
      ? '<br>' + gridResult.breaks.map((b) => `${b.type}: ${b.note}`).join('<br>')
      : '');
  gridPreview.appendChild(breaksEl);
}

function copyAsCss() {
  if (!current) return;
  const { color, type, grid } = current;
  const lines = [':root {', '  /* Color — ' + currentMood + ' mood */'];
  for (const role of Color.NAMED_ROLES) lines.push(`  --color-${role}: ${color.palette[role]};`);
  lines.push('', '  /* Typography */');
  lines.push(`  --font-heading: '${type.headingFamily}', ${Type.FONTS[type.headingFamily].category};`);
  lines.push(`  --font-body: '${type.bodyFamily}', ${Type.FONTS[type.bodyFamily].category};`);
  for (const role of Type.NAMED_ROLES) {
    const r = type.roles[role];
    lines.push(`  --text-${role}: ${r.weight} ${r.sizePx}px/${r.lineHeight} var(--font-${['h1','h2','h3','display'].includes(role) ? 'heading' : 'body'});`);
  }
  lines.push('', '  /* Grid */');
  lines.push(`  --grid-columns: ${grid.columnCount};`);
  lines.push(`  --grid-gutter: ${grid.gutterPx}px;`);
  lines.push(`  --grid-margin: ${grid.marginPx}px;`);
  lines.push('}');
  const css = lines.join('\n');
  navigator.clipboard?.writeText(css);
  const btn = document.getElementById('copyCssBtn');
  const original = btn.textContent;
  btn.textContent = 'Copied ✓';
  setTimeout(() => { btn.textContent = original; }, 1500);
}

document.getElementById('regenBtn').addEventListener('click', generate);
document.getElementById('surpriseBtn').addEventListener('click', () => {
  currentMood = MOODS[Math.floor(Math.random() * MOODS.length)];
  generate();
});
document.getElementById('copyCssBtn').addEventListener('click', copyAsCss);

generate();
