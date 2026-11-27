import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCode, CANONICAL_RULES, RULE_METADATA, parseDesignContract } from '../packages/core/dist/index.js';

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

test('MOT-15 flags one identical entrance on four blocks and any mount motion on reading text', () => {
  const entrance = '<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} />';
  assert.equal(find(entrance.repeat(3), 'UNIFORM_ENTRANCE_MOTION').length, 0);
  assert.equal(find(entrance.repeat(4), 'UNIFORM_ENTRANCE_MOTION').length, 1);
  assert.equal(find('<motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>Ledger</motion.h1>', 'UNIFORM_ENTRANCE_MOTION').length, 1);
  assert.equal(find('<motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1 }} />', 'UNIFORM_ENTRANCE_MOTION').length, 0, 'scroll reveals stay MOT-08');
  assert.equal(find('<motion.p initial={{ opacity: 1 }} animate={{ opacity: 1 }}>Copy</motion.p>', 'UNIFORM_ENTRANCE_MOTION').length, 0);
});

test('MOT-16 flags overshoot easing while leaving house ease-out curves alone', () => {
  assert.equal(find('<div className="transition-transform ease-[cubic-bezier(0.34,1.56,0.64,1)]">Card</div>', 'ELASTIC_UI_EASING').length, 1);
  assert.equal(find('.panel { transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1); }', 'ELASTIC_UI_EASING').length, 1);
  assert.equal(find('.panel { transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1); }', 'ELASTIC_UI_EASING').length, 0);
  assert.equal(find('.panel { transition: transform 220ms ease-out; }', 'ELASTIC_UI_EASING').length, 0);
});

test('MOT-17 flags will-change left on across several elements or declarations', () => {
  assert.equal(find('<div className="will-change-transform" />', 'WILL_CHANGE_LEAK').length, 0);
  assert.equal(
    find('<div className="will-change-transform" /><div className="will-change-opacity" /><div className="will-change-transform" />', 'WILL_CHANGE_LEAK').length,
    1
  );
  assert.equal(find('.a { will-change: transform; } .b { will-change: opacity; } .c { willChange: "transform"; }', 'WILL_CHANGE_LEAK').length, 1);
  assert.equal(find('.a { will-change: auto; } .b { will-change: auto; } .c { will-change: auto; }', 'WILL_CHANGE_LEAK').length, 0);
});

test('DESIGN.md motion lock parses durations, curves, and a signature move', () => {
  const contract = parseDesignContract([
    '# DESIGN.md',
    '- motion-fast: 150ms',
    '- motion-base: 250ms',
    '- motion-slow: 400ms',
    '- motion-max-feedback: 300ms',
    '- motion-ease-enter: cubic-bezier(0.16, 1, 0.3, 1)',
    '- motion-ease-exit: cubic-bezier(0.4, 0, 1, 1)',
    '- motion-signature: card lift'
  ].join('\n'));
  assert.equal(contract.motion?.fast, 150);
  assert.equal(contract.motion?.base, 250);
  assert.equal(contract.motion?.slow, 400);
  assert.equal(contract.motion?.maxFeedback, 300);
  assert.equal(contract.motion?.easeEnter, 'cubic-bezier(0.16, 1, 0.3, 1)');
  assert.equal(contract.motion?.easeExit, 'cubic-bezier(0.4, 0, 1, 1)');
  assert.equal(contract.motion?.signature, 'card lift');

  const json = parseDesignContract('```json\n{ "motion": { "fast": "120ms", "slow": "320ms" } }\n```');
  assert.equal(json.motion?.fast, 120);
  assert.equal(json.motion?.slow, 320);
});

test('MOT-07 and MOT-18 compare against the declared motion scale instead of a universal ceiling', () => {
  const parsed = parseDesignContract('- motion-max-feedback: 300ms\n- motion-slow: 400ms');
  const contract = { found: true, lockedTokens: [], ...parsed };
  const withContract = (code) => auditCode(code, { designContract: contract });

  const fastButton = '<button className="transition-colors duration-400">Save</button>';
  assert.equal(find(fastButton, 'SLOW_INTERACTION_MOTION').length, 0, 'the default ceiling permits 400ms');
  const flagged = withContract(fastButton).violations.filter((violation) => violation.type === 'SLOW_INTERACTION_MOTION');
  assert.equal(flagged.length, 1);
  assert.match(flagged[0].message, /declared ceiling is 300ms/);

  assert.equal(withContract('<div className="duration-300 ease-out">Panel</div>').violations.filter((v) => v.type === 'OFF_CONTRACT_MOTION').length, 0);
  assert.equal(withContract('<div className="duration-700 ease-out">Panel</div>').violations.filter((v) => v.type === 'OFF_CONTRACT_MOTION').length, 1);
  assert.equal(find('<div className="duration-700 ease-out">Panel</div>', 'OFF_CONTRACT_MOTION').length, 0, 'no contract means no off-contract judgment');
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
    'UNEARNED_HOVER_LIFT',
    'UNIFORM_ENTRANCE_MOTION',
    'ELASTIC_UI_EASING',
    'WILL_CHANGE_LEAK',
    'OFF_CONTRACT_MOTION'
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
