import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCode, CANONICAL_RULES, RULE_METADATA } from '../packages/core/dist/index.js';

const find = (code, type) => auditCode(code).violations.filter((violation) => violation.type === type);

test('MOT-06 flags transition-all while leaving explicit property lists alone', () => {
  assert.equal(find('<div className="transition-all duration-300">Card</div>', 'TRANSITION_ALL_SLOP').length, 1);
  assert.equal(find('const s = { transition: "all 300ms ease" };', 'TRANSITION_ALL_SLOP').length, 1);
  assert.equal(find('<div className="transition-colors duration-150">Card</div>', 'TRANSITION_ALL_SLOP').length, 0);
});

test('MOT-07 flags slow interaction feedback but not storytelling durations', () => {
  assert.equal(find('<button className="transition-colors duration-700 hover:bg-neutral-800">Save</button>', 'SLOW_INTERACTION_MOTION').length, 1);
  assert.equal(find('<div className="duration-700 animate-[fade_1s]">Story beat</div>', 'SLOW_INTERACTION_MOTION').length, 0);
  assert.equal(find('<button className="transition-colors duration-150">Save</button>', 'SLOW_INTERACTION_MOTION').length, 0);
});

test('MOT-08 flags repeated scroll reveals and accepts a single guarded reveal', () => {
  const repeated = `
    export function Page() {
      const reduce = useReducedMotion();
      return <main>
        <motion.h1 whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} />
        <motion.p whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} />
      </main>;
    }`;
  assert.equal(find(repeated, 'SCROLL_REVEAL_SATURATION').length, 0, 'reduced motion disables the saturation finding');

  const saturated = `
    export function Page() {
      return <main>
        <motion.h1 whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} />
        <motion.p whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} />
      </main>;
    }`;
  assert.equal(find(saturated, 'SCROLL_REVEAL_SATURATION').length, 1);
  assert.equal(find('<div data-aos="fade-up">Hero copy</div>', 'SCROLL_REVEAL_SATURATION').length, 1);
  assert.equal(find('<motion.div whileInView={{ opacity: 1 }} />', 'SCROLL_REVEAL_SATURATION').length, 0);
});

test('MOT-09 requires a pause control for autoplay marquees and looping video', () => {
  assert.equal(find('<div className="animate-marquee">Logo strip</div>', 'AUTOPLAY_MOTION_WITHOUT_CONTROL').length, 1);
  assert.equal(
    find('<div className="animate-marquee">Logo strip</div><button aria-label="Pause logo animation">Pause</button>', 'AUTOPLAY_MOTION_WITHOUT_CONTROL').length,
    0
  );
  assert.equal(find('<video autoPlay loop src="/hero.mp4" />', 'AUTOPLAY_MOTION_WITHOUT_CONTROL').length, 1);
  assert.equal(find('<video autoPlay loop controls src="/hero.mp4" />', 'AUTOPLAY_MOTION_WITHOUT_CONTROL').length, 0);
});

test('MOT-10 flags blink, flash, and strobe animation', () => {
  const css = `@keyframes blink { 0% { opacity: 0 } 50% { opacity: 1 } 100% { opacity: 0 } } .dot { animation: blink 0.2s infinite; }`;
  assert.equal(find(css, 'FLASHING_ANIMATION').length, 1);
  assert.equal(find('const s = { animationName: "pulse" };', 'FLASHING_ANIMATION').length, 0);
});

test('MOT-11 flags entrance from scale(0) and accepts a 0.95 start', () => {
  assert.equal(find('<motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} />', 'SCALE_FROM_ZERO').length, 1);
  assert.equal(find('<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} />', 'SCALE_FROM_ZERO').length, 0);
});

test('MOT-12 flags an unguarded CSS loop and accepts a reduced-motion fallback', () => {
  assert.equal(find('<div className="animate-pulse">Live metric</div>', 'CSS_LOOP_NO_REDUCED_GUARD').length, 1);
  assert.equal(
    find('<div className="animate-pulse motion-reduce:animate-none">Live metric</div>', 'CSS_LOOP_NO_REDUCED_GUARD').length,
    0
  );
  assert.equal(find('<div role="status" className="animate-spin" aria-label="Loading" />', 'CSS_LOOP_NO_REDUCED_GUARD').length, 0);
});

test('MOT-13 flags fixed backgrounds and 3D hover tilt', () => {
  assert.equal(find('<div className="bg-fixed bg-cover">Parallax band</div>', 'VESTIBULAR_RISK_MOTION').length, 1);
  assert.equal(
    find('<div className="perspective-[1000px] transform-3d hover:rotate-y-12">Tilt card</div>', 'VESTIBULAR_RISK_MOTION').length,
    1
  );
  assert.equal(find('<div className="bg-cover">Still band</div>', 'VESTIBULAR_RISK_MOTION').length, 0);
});

test('MOT-14 flags hover lift on static surfaces and spares real controls', () => {
  assert.equal(find('<div className="hover:-translate-y-1 transition">Static card</div>', 'UNEARNED_HOVER_LIFT').length, 1);
  assert.equal(find('<button className="hover:-translate-y-0.5 transition-transform">Open</button>', 'UNEARNED_HOVER_LIFT').length, 0);
  assert.equal(find('<div onClick={open} className="hover:-translate-y-1">Row</div>', 'UNEARNED_HOVER_LIFT').length, 0);
  assert.equal(find('<a href="/pricing" className="hover:-translate-y-1">Pricing</a>', 'UNEARNED_HOVER_LIFT').length, 0);
});

test('new motion rules are detect-only, documented, and cite their evidence', () => {
  for (const type of [
    'TRANSITION_ALL_SLOP',
    'SLOW_INTERACTION_MOTION',
    'SCROLL_REVEAL_SATURATION',
    'AUTOPLAY_MOTION_WITHOUT_CONTROL',
    'FLASHING_ANIMATION',
    'SCALE_FROM_ZERO',
    'CSS_LOOP_NO_REDUCED_GUARD',
    'VESTIBULAR_RISK_MOTION',
    'UNEARNED_HOVER_LIFT'
  ]) {
    const rule = CANONICAL_RULES[type];
    assert.ok(rule, `${type} must be canonical`);
    assert.ok(Number(rule.ruleId.split('-')[1]) >= 6, `${type} must be a new motion rule`);
    assert.equal(rule.mode, 'detect-only', `${type} must not auto-rewrite motion`);
    const meta = RULE_METADATA[type];
    assert.ok(meta.falsePositives.length > 0, `${type} needs false positives`);
    assert.ok(meta.validation.length > 0, `${type} needs a validation step`);
    assert.equal(meta.family, 'motion');
  }
});
