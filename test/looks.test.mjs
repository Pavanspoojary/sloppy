import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOKS, getLook } from '../packages/core/dist/index.js';

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function contrast(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

const COLOR = /^(#[0-9a-f]{6}|rgba?\()/i;

function parseColor(value) {
  if (typeof value !== 'string') return value;
  if (value.startsWith('#')) {
    const [r, g, b] = [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
    return { r, g, b, a: 1 };
  }
  const [r, g, b, a = 1] = value.replace(/rgba?\(|\)/g, '').split(',').map((part) => Number(part.trim()));
  return { r, g, b, a };
}

function composite(foreground, backdrop) {
  const f = parseColor(foreground);
  const b = parseColor(backdrop);
  const mix = (front, back) => Math.round(front * f.a + back * (1 - f.a));
  return {
    r: mix(f.r, b.r),
    g: mix(f.g, b.g),
    b: mix(f.b, b.b),
    a: 1
  };
}

function relativeLuminance(color) {
  const value = typeof color === 'string' ? parseColor(color) : color;
  return 0.2126 * channel(value.r) + 0.7152 * channel(value.g) + 0.0722 * channel(value.b);
}

function contrastOver(foreground, surface, canvas) {
  const effectiveSurface = surface.startsWith('rgba') ? composite(surface, canvas) : parseColor(surface);
  const effectiveForeground = foreground.startsWith('rgba') ? composite(foreground, effectiveSurface) : parseColor(foreground);
  return contrast(effectiveForeground, effectiveSurface);
}

test('every look defines a complete, self-consistent token set', () => {
  for (const [key, look] of Object.entries(LOOKS)) {
    assert.equal(look.name, key, `${key} must report its registry name`);
    assert.ok(['light', 'dark'].includes(look.theme), `${key} must declare a theme`);
    assert.ok(look.description.length > 20, `${key} needs a meaningful description`);

    for (const token of ['accent', 'background', 'surface1', 'surface2', 'surface3', 'border', 'text', 'textMuted']) {
      assert.ok(look[token], `${key}.${token} is missing`);
    }
    for (const token of ['accent', 'background', 'surface1', 'surface2', 'surface3', 'text', 'textMuted']) {
      assert.match(look[token], COLOR, `${key}.${token} must be a hex or rgb color`);
    }

    assert.deepEqual(
      look.cssVariables,
      {
        '--ss-bg': look.background,
        '--ss-surface-1': look.surface1,
        '--ss-surface-2': look.surface2,
        '--ss-surface-3': look.surface3,
        '--ss-border': look.border,
        '--ss-text': look.text,
        '--ss-text-muted': look.textMuted,
        '--ss-accent': look.accent
      },
      `${key} CSS variables must mirror the token object`
    );
  }
});

test('look surfaces stay distinct so depth never collapses into one tone', () => {
  for (const [key, look] of Object.entries(LOOKS)) {
    const surfaces = [look.background, look.surface1, look.surface2, look.surface3];
    assert.equal(new Set(surfaces).size, surfaces.length, `${key} reuses a surface tone`);
    assert.notEqual(look.accent, look.background, `${key} accent must not equal the canvas`);
  }
});

test('body and muted copy remain readable on every surface', () => {
  for (const [key, look] of Object.entries(LOOKS)) {
    const surfaces = [look.background, look.surface1, look.surface2, look.surface3];
    for (const surface of surfaces) {
      assert.ok(
        contrastOver(look.text, surface, look.background) >= 7,
        `${key} body text on ${surface} is below AAA contrast (${contrastOver(look.text, surface, look.background).toFixed(2)})`
      );
      assert.ok(
        contrastOver(look.textMuted, surface, look.background) >= 4.5,
        `${key} muted text on ${surface} is below AA contrast (${contrastOver(look.textMuted, surface, look.background).toFixed(2)})`
      );
    }
  }
});

test('Refero-sourced looks carry verifiable provenance', () => {
  const sourced = Object.values(LOOKS).filter((look) => look.source);
  assert.ok(sourced.length >= 8, `expected at least 8 Refero looks, found ${sourced.length}`);

  for (const look of sourced) {
    assert.equal(look.source.provider, 'refero');
    assert.match(look.source.url, /^https:\/\//, `${look.name} source URL must be https`);
    assert.match(
      look.source.styleId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      `${look.name} must reference a Refero style id`
    );
    assert.ok(look.fontSans, `${look.name} must document its type family`);
  }
});

test('unknown look names fall back to a valid curated look', () => {
  const fallback = getLook('does-not-exist');
  assert.equal(fallback.name, 'linear');
  assert.ok(LOOKS[getLook('NUXT').name], 'look lookup is case-insensitive');
});
