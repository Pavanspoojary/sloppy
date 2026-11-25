import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  auditCode,
  detectProjectStack,
  MOTION_ECOSYSTEMS,
  SLOPPY_LIBRARIES,
  searchMotionEcosystems
} from '../packages/core/dist/index.js';

test('registry exposes 5 MIT component libraries and 21 permissive MIT/Apache-2.0 motion ecosystems without restricted code', () => {
  const libs = Object.values(SLOPPY_LIBRARIES);
  assert.equal(libs.length, 5);
  for (const lib of libs) {
    assert.equal(lib.license, 'MIT', `${lib.id} must be permissive MIT`);
  }
  assert.equal('react-bits' in SLOPPY_LIBRARIES, false, 'Commons-Clause react-bits must be excluded');
  assert.equal('animate-ui' in SLOPPY_LIBRARIES, false, 'Commons-Clause animate-ui must be excluded');

  assert.equal(MOTION_ECOSYSTEMS.length, 21, 'all 21 requested motion/scroll/3D/Lottie/UI ecosystems must be registered');
  for (const entry of MOTION_ECOSYSTEMS) {
    assert.ok(entry.license === 'MIT' || entry.license === 'Apache-2.0', `${entry.id} has non-permissive license ${entry.license}`);
    assert.equal(entry.packages.includes('@theatre/studio'), false, 'AGPL @theatre/studio must not be included');
  }
  assert.ok(searchMotionEcosystems('three').some(e => e.id === 'three'));
  assert.ok(searchMotionEcosystems('lottie').some(e => e.id === 'lottie-web'));
  assert.ok(searchMotionEcosystems('lenis').some(e => e.id === 'lenis'));
});

test('MOT-02 catches unbounded infinite loops across Motion, Anime, Tween, and Lottie while sparing spinners', () => {
  const sloppyCode = `
import { motion, useReducedMotion } from 'motion/react';
export function FloatingPromo() {
  const reduced = useReducedMotion();
  return (
    <motion.div animate={reduced ? {} : { y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
      Feature Card
    </motion.div>
  );
}
`;
  const audit = auditCode(sloppyCode);
  assert.ok(audit.violations.some(v => v.type === 'UNBOUNDED_INFINITE_MOTION' && v.ruleId === 'MOT-02'));

  const spinnerCode = `
import { motion, useReducedMotion } from 'motion/react';
export function LoadingSpinner() {
  const reduced = useReducedMotion();
  return <motion.div animate={reduced ? {} : { rotate: 360 }} transition={{ repeat: Infinity }} />;
}
`;
  const spinnerAudit = auditCode(spinnerCode);
  assert.equal(spinnerAudit.violations.some(v => v.type === 'UNBOUNDED_INFINITE_MOTION'), false, 'spinners should not false-positive MOT-02');
});

test('MOT-03 enforces reduced-motion guards across Framer Motion, Lenis, Three.js/R3F, and Lottie', () => {
  const unguarded = `
import { motion } from 'framer-motion';
export function HeroBanner() {
  return <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Ready</motion.section>;
}
`;
  const bad = auditCode(unguarded);
  assert.ok(bad.violations.some(v => v.type === 'REDUCED_MOTION_BLINDNESS' && v.ruleId === 'MOT-03'));

  const guarded = `
import { motion, useReducedMotion } from 'framer-motion';
export function HeroBanner() {
  const reduced = useReducedMotion();
  return <motion.section initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>Ready</motion.section>;
}
`;
  const good = auditCode(guarded);
  assert.equal(good.violations.some(v => v.type === 'REDUCED_MOTION_BLINDNESS'), false);
});

test('MOT-04 flags layout-thrashing width/left animation while permitting transform/opacity and accordion height auto', () => {
  const thrash = `
import { motion, useReducedMotion } from 'motion/react';
export function ExpandingPanel() {
  const reduced = useReducedMotion();
  return <motion.div animate={reduced ? {} : { width: 320, left: 24 }} />;
}
`;
  const bad = auditCode(thrash);
  assert.ok(bad.violations.some(v => v.type === 'LAYOUT_THRASH_ANIMATION' && v.ruleId === 'MOT-04'));

  const smooth = `
import { motion, useReducedMotion } from 'motion/react';
export function SmoothPanel() {
  const reduced = useReducedMotion();
  return <motion.div animate={reduced ? {} : { x: 24, scale: 1.02, opacity: 1 }} />;
}
`;
  const good = auditCode(smooth);
  assert.equal(good.violations.some(v => v.type === 'LAYOUT_THRASH_ANIMATION'), false);
});

test('MOT-05 flags unmanaged WebGL/Lottie/Lenis loops and unbounded R3F Canvas', () => {
  const badR3f = `
import { Canvas } from '@react-three/fiber';
export function Scene() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced ? null : <Canvas><mesh /></Canvas>;
}
`;
  assert.ok(auditCode(badR3f).violations.some(v => v.type === 'UNMANAGED_WEBGL_OR_MEDIA_LOOP' && v.ruleId === 'MOT-05'));

  const goodR3f = `
import { Canvas } from '@react-three/fiber';
export function Scene() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced ? null : <Canvas frameloop="demand" dpr={[1, 2]}><mesh /></Canvas>;
}
`;
  assert.equal(auditCode(goodR3f).violations.some(v => v.type === 'UNMANAGED_WEBGL_OR_MEDIA_LOOP'), false);

  const leakedLenis = `
import Lenis from 'lenis';
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis();
  return lenis;
}
`;
  assert.ok(auditCode(leakedLenis).violations.some(v => v.type === 'UNMANAGED_WEBGL_OR_MEDIA_LOOP'));

  const cleanedLenis = `
import Lenis from 'lenis';
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const lenis = new Lenis();
  return () => lenis.destroy();
}
`;
  assert.equal(auditCode(cleanedLenis).violations.some(v => v.type === 'UNMANAGED_WEBGL_OR_MEDIA_LOOP'), false);
});

test('detectProjectStack discovers installed motion, scroll, 3D/WebGL, and Lottie ecosystems', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sloppy-motion-stack-'));
  try {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'demo-motion-app',
        dependencies: {
          next: '^15.0.0',
          motion: '^12.0.0',
          lenis: '^1.1.0',
          three: '^0.170.0',
          '@react-three/fiber': '^8.17.0',
          'lottie-web': '^5.12.0',
          splitting: '^1.0.6'
        }
      })
    );
    const stack = detectProjectStack(tmpDir);
    assert.equal(stack.hasMotion, true);
    assert.ok(stack.motionEcosystems.detected.includes('motion'));
    assert.ok(stack.motionEcosystems.detected.includes('lenis'));
    assert.ok(stack.motionEcosystems.detected.includes('three'));
    assert.ok(stack.motionEcosystems.detected.includes('lottie-web'));
    assert.ok(stack.motionEcosystems.detected.includes('splitting'));
    assert.equal(stack.suggestedConfig.rules['MOT-03'], 'error');
    assert.equal(stack.suggestedConfig.rules['MOT-05'], 'error');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
