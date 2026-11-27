#!/usr/bin/env node
/**
 * Deterministic motion interaction audit.
 *
 * Source scanning can prove a rule exists; it cannot prove a transition lands,
 * retargets, or leaves the layout at rest. This module runs declared interactions
 * against a served page, samples frames and boxes, and reports only failures it
 * observed. It never reports a pass when the browser or the spec is unavailable.
 *
 * Spec shape:
 * {
 *   "interactions": [
 *     { "name": "menu", "trigger": "#open", "target": "#menu", "anchor": "header",
 *       "closeTrigger": "#close", "kind": "click", "waitMs": 600,
 *       "openKey": "Enter", "closeKey": "Escape",
 *       "precondition": [{ "click": "#tab-orders" }] }
 *   ]
 * }
 */

import { tryLaunch } from './browser.mjs';

const SETTLE_MS = 250;
const HANDOFF_TOLERANCE = 0.5;
const LONG_FRAME_MS = 32;
const BAD_FRAME_MS = 60;
const REDUCED_TRAVEL_TOLERANCE = 8;

const round = (value) => Math.round(value * 100) / 100;

function boxDelta(a, b) {
  if (!a || !b) return null;
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.width - b.width),
    Math.abs(a.height - b.height)
  );
}

export function auditMotionInteractionSamples(samples = [], options = {}) {
  const findings = [];
  const push = (rule, message, sample, extra = {}) => {
    findings.push({
      rule,
      message,
      severity: extra.severity || 'medium',
      confidence: extra.confidence || 'medium',
      objective: extra.objective !== false,
      evidence: {
        kind: 'interaction',
        description: message,
        selector: sample?.target || sample?.selector,
        viewport: options.viewport,
        criterion: extra.criterion
      }
    });
  };

  for (const sample of samples) {
    if (!sample) continue;

    const shift = boxDelta(sample.settled, sample.later);
    if (shift !== null && shift > HANDOFF_TOLERANCE) {
      push('motion.handoffShift', `${sample.name}: the element moves ${round(shift)}px after its transition has settled; motion must end on its resting box.`, sample, {
        severity: 'medium',
        confidence: 'high'
      });
    }

    const anchorDrift = boxDelta(sample.before?.anchor, sample.after?.anchor);
    if (anchorDrift !== null && anchorDrift > HANDOFF_TOLERANCE) {
      push('motion.anchorDrift', `${sample.name}: the anchor moves ${round(anchorDrift)}px while the target changes; keep surrounding geometry steady.`, sample, {
        severity: 'medium',
        confidence: 'high'
      });
    }

    const running = sample.runningAfterSettle || [];
    if (running.length) {
      const names = running.slice(0, 3).join(', ');
      push('motion.stuckTransition', `${sample.name}: ${running.length} finite animation(s) still running after the settle window (${names}); the state change never comes to rest.`, sample, {
        severity: 'medium',
        confidence: 'high'
      });
    }

    if (sample.openedByKeyboard && sample.after?.target && !sample.after.target.visible) {
      push('motion.keyboardOpenIgnored', `${sample.name}: the trigger does not open the surface from the keyboard; mouse-only activation is not a path.`, sample, {
        severity: 'high',
        confidence: 'high',
        criterion: 'WCAG 2.1.1 Keyboard'
      });
    }

    if (sample.keyboardCloseChecked && sample.keyboardClosed === false) {
      push('motion.keyboardCloseIgnored', `${sample.name}: the surface does not close when its key is pressed; every opened menu needs a keyboard exit.`, sample, {
        severity: 'high',
        confidence: 'high',
        criterion: 'WCAG 2.1.1 Keyboard'
      });
    }

    if (sample.interrupted && sample.interruptRecovered === false) {
      push('motion.interruptNotRecovered', `${sample.name}: a reversed interaction is left in a half-open state after settling.`, sample, {
        severity: 'high',
        confidence: 'medium'
      });
    }

    const reduced = sample.reduced;
    if (reduced) {
      // shortcut: travel is only measurable when the target is visible before and after;
      // a hidden element's entrance is instead checked for the state change surviving.
      if (reduced.visibleBefore && reduced.visibleAfter) {
        const travel = Math.max(
          Math.abs(reduced.after.x - reduced.before.x),
          Math.abs(reduced.after.y - reduced.before.y)
        );
        if (travel > REDUCED_TRAVEL_TOLERANCE) {
          push('motion.reducedMotionTravel', `${sample.name}: the target still travels ${round(travel)}px under prefers-reduced-motion: reduce; keep the state change, drop the movement.`, sample, {
            severity: 'medium',
            confidence: 'high',
            criterion: 'WCAG 2.3.3'
          });
        }
      }
      if (sample.after?.target?.visible && reduced.after && !reduced.after.visible) {
        push('motion.reducedMotionHidesContent', `${sample.name}: the result is missing under reduced motion; reduced motion may simplify a state change, never delete it.`, sample, {
          severity: 'high',
          confidence: 'high',
          criterion: 'WCAG 2.3.3'
        });
      }
      if (reduced.runningInfinite?.length) {
        push('motion.reducedMotionKeepsLoop', `${sample.name}: ${reduced.runningInfinite.length} infinite animation(s) keep running under reduced motion (${reduced.runningInfinite.slice(0, 3).join(', ')}).`, sample, {
          severity: 'medium',
          confidence: 'high',
          criterion: 'WCAG 2.3.3'
        });
      }
    }

    if (typeof sample.layoutShift === 'number' && sample.layoutShift > 0.005) {
      push('motion.layoutShift', `${sample.name}: layout moved during the interaction (shift score ${round(sample.layoutShift)}); reserve space or animate a transform so neighbors stay put.`, sample, {
        severity: 'medium',
        confidence: 'medium',
        objective: false
      });
    }

    if (sample.focusChecked && sample.focusReturned === false) {
      push('motion.focusLoss', `${sample.name}: closing the surface does not return focus to its trigger; keyboard users are left without a position.`, sample, {
        severity: 'high',
        confidence: 'medium',
        criterion: 'WCAG 2.4.3 Focus Order'
      });
    }

    const frames = Array.isArray(sample.frames) ? sample.frames : [];
    if (frames.length >= 5) {
      const long = frames.filter((ms) => ms > LONG_FRAME_MS).length;
      const ratio = long / frames.length;
      const worst = Math.max(...frames);
      if (ratio >= 0.25 || worst > BAD_FRAME_MS) {
        push('motion.frameBudget', `${sample.name}: ${Math.round(ratio * 100)}% of sampled frames exceeded ${LONG_FRAME_MS}ms (worst ${Math.round(worst)}ms); the interaction drops frames on this machine.`, sample, {
          severity: 'medium',
          confidence: 'low',
          objective: false
        });
      }
    }
  }

  return findings;
}

function unavailableReason(target, spec) {
  if (!/^https?:\/\//i.test(String(target))) return 'Motion interaction evidence needs a served http(s) URL.';
  if (!spec || !Array.isArray(spec.interactions) || spec.interactions.length === 0) return 'No interactions were declared in the motion spec.';
  for (const interaction of spec.interactions) {
    if (!interaction?.trigger || !interaction?.target) return 'Every interaction needs a trigger and a target selector.';
    if (interaction.openKey !== undefined && typeof interaction.openKey !== 'string') return 'openKey must be a key name such as "Enter".';
    if (interaction.closeKey !== undefined && typeof interaction.closeKey !== 'string') return 'closeKey must be a key name such as "Escape".';
    if (interaction.precondition !== undefined) {
      if (!Array.isArray(interaction.precondition)) return 'precondition must be an array of click, hover, or press steps.';
      for (const step of interaction.precondition) {
        if (!step || (!step.click && !step.hover && !step.press)) return 'Every precondition step needs a click, hover, or press selector.';
      }
    }
  }
  return null;
}

async function applyPrecondition(page, steps = []) {
  for (const step of steps) {
    if (step.click) await page.click(step.click);
    else if (step.hover) await page.hover(step.hover);
    else await page.keyboard.press(step.press);
  }
}

async function openInteraction(page, interaction) {
  if (interaction.openKey) {
    await page.focus(interaction.trigger);
    await page.keyboard.press(interaction.openKey);
  } else if (interaction.kind === 'hover') {
    await page.hover(interaction.trigger);
  } else {
    await page.click(interaction.trigger);
  }
}

export async function runMotionInteractionAudit(target, options = {}) {
  const spec = options.spec;
  const reason = unavailableReason(target, spec);
  if (reason) {
    return { target, ok: false, mode: 'unavailable', findings: [], checked: [], summary: reason, unavailable: reason };
  }

  const ownsBrowser = !options.browser;
  const launch = options.browser ? { browser: options.browser } : await tryLaunch();
  if (!launch.browser) {
    return {
      target,
      ok: false,
      mode: 'unavailable',
      findings: [],
      checked: spec.interactions.map((interaction) => interaction.name || interaction.trigger),
      summary: 'Motion interaction evidence requires a browser.',
      unavailable: launch.reason || 'No browser available.'
    };
  }

  const browser = launch.browser;
  const viewport = { width: options.width || 1280, height: options.height || 800 };
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => {
    window.__sloppyBoxOf = (selector) => {
      if (!selector) return null;
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const opacity = Number.parseFloat(style.opacity || '1');
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        visible: style.display !== 'none' && style.visibility !== 'hidden' && opacity > 0.05
      };
    };
    window.__sloppyInfiniteAnimations = () => (document.getAnimations?.() || [])
      .filter((animation) => {
        if (animation.playState !== 'running') return false;
        return animation.effect?.getTiming?.()?.iterations === Infinity;
      })
      .map((animation) => animation.animationName || animation.transitionProperty || 'animation');
    window.__sloppyLayoutShifts = [];
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__sloppyLayoutShifts.push(entry.value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });
  const samples = [];
  try {
    for (const interaction of spec.interactions) {
      const waitMs = Number.isFinite(interaction.waitMs) ? interaction.waitMs : 600;
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 12000 });
      await page.waitForTimeout(200);
      await applyPrecondition(page, interaction.precondition);

      const sample = {
        name: interaction.name || interaction.trigger,
        target: interaction.target,
        selector: interaction.target,
        openedByKeyboard: Boolean(interaction.openKey),
        interrupted: Boolean(interaction.closeTrigger)
      };

      const boxes = await page.evaluate(({ trigger, targetSelector, anchorSelector }) => ({
        target: window.__sloppyBoxOf(targetSelector),
        anchor: window.__sloppyBoxOf(anchorSelector),
        trigger: window.__sloppyBoxOf(trigger),
        targetFound: Boolean(document.querySelector(targetSelector)),
        triggerFound: Boolean(document.querySelector(trigger))
      }), { trigger: interaction.trigger, targetSelector: interaction.target, anchorSelector: interaction.anchor });

      if (!boxes.targetFound || !boxes.triggerFound) {
        sample.before = { anchor: boxes.anchor };
        samples.push(sample);
        continue;
      }

      sample.before = { target: boxes.target, anchor: boxes.anchor };
      await page.evaluate(() => {
        window.__sloppyMotionFrames = [];
        window.__sloppyLayoutShifts = [];
        window.__sloppyMotionSampling = true;
        let last = performance.now();
        const tick = (now) => {
          window.__sloppyMotionFrames.push(now - last);
          last = now;
          if (window.__sloppyMotionSampling) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      await openInteraction(page, interaction);

      await page.waitForTimeout(waitMs);

      const after = await page.evaluate(({ targetSelector, anchorSelector }) => {
        const running = (document.getAnimations?.() || [])
          .filter((animation) => {
            if (animation.playState !== 'running') return false;
            const timing = animation.effect?.getTiming?.();
            return timing && timing.iterations !== Infinity;
          })
          .map((animation) => animation.animationName || animation.transitionProperty || 'animation');
        return {
          target: window.__sloppyBoxOf(targetSelector),
          anchor: window.__sloppyBoxOf(anchorSelector),
          running
        };
      }, { targetSelector: interaction.target, anchorSelector: interaction.anchor });

      sample.after = { target: after.target, anchor: after.anchor };
      sample.settled = after.target;
      sample.runningAfterSettle = after.running;

      const frames = await page.evaluate(() => {
        window.__sloppyMotionSampling = false;
        return (window.__sloppyMotionFrames || []).slice(1);
      });
      sample.frames = frames;

      await page.waitForTimeout(SETTLE_MS);
      const settled = await page.evaluate((targetSelector) => ({
        box: window.__sloppyBoxOf(targetSelector),
        layoutShift: (window.__sloppyLayoutShifts || []).reduce((total, value) => total + value, 0)
      }), interaction.target);
      sample.later = settled.box;
      sample.layoutShift = settled.layoutShift;

      if (interaction.closeKey) {
        await page.keyboard.press(interaction.closeKey);
        await page.waitForTimeout(waitMs);
        sample.keyboardCloseChecked = true;
        sample.keyboardClosed = await page.evaluate((targetSelector) => {
          const el = document.querySelector(targetSelector);
          if (!el) return true;
          const style = getComputedStyle(el);
          return style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity || '1') <= 0.05;
        }, interaction.target);
      }

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 12000 });
      await page.waitForTimeout(200);
      await applyPrecondition(page, interaction.precondition);
      const reducedBefore = await page.evaluate(({ targetSelector }) => ({
        target: window.__sloppyBoxOf(targetSelector),
        found: Boolean(document.querySelector(targetSelector))
      }), { targetSelector: interaction.target });
      if (reducedBefore.found) {
        await openInteraction(page, interaction);
        await page.waitForTimeout(waitMs);
        const reducedAfter = await page.evaluate(({ targetSelector }) => ({
          target: window.__sloppyBoxOf(targetSelector),
          runningInfinite: window.__sloppyInfiniteAnimations()
        }), { targetSelector: interaction.target });
        sample.reduced = {
          before: reducedBefore.target,
          after: reducedAfter.target,
          visibleBefore: Boolean(reducedBefore.target?.visible),
          visibleAfter: Boolean(reducedAfter.target?.visible),
          runningInfinite: reducedAfter.runningInfinite
        };
      }
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      if (interaction.closeTrigger) {
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 12000 });
        await page.waitForTimeout(150);
        await applyPrecondition(page, interaction.precondition);
        await openInteraction(page, interaction);
        await page.waitForTimeout(80);
        await page.click(interaction.closeTrigger);
        await page.waitForTimeout(waitMs);
        sample.focusChecked = true;
        sample.focusReturned = await page.evaluate(({ targetSelector, triggerSelector }) => {
          const trigger = document.querySelector(triggerSelector);
          const active = document.activeElement;
          if (!trigger || !active) return false;
          return active === trigger || trigger.contains(active);
        }, { targetSelector: interaction.target, triggerSelector: interaction.trigger });
        sample.interruptRecovered = await page.evaluate((targetSelector) => {
          const el = document.querySelector(targetSelector);
          if (!el) return true;
          const running = (document.getAnimations?.() || []).some((animation) => {
            if (animation.playState !== 'running') return false;
            const timing = animation.effect?.getTiming?.();
            return timing && timing.iterations !== Infinity;
          });
          const style = getComputedStyle(el);
          const closed = style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity || '1') <= 0.05;
          const open = Number.parseFloat(style.opacity || '1') >= 0.99;
          return !running && (closed || open);
        }, interaction.target);
      }

      samples.push(sample);
    }
  } finally {
    await page.close().catch(() => {});
    if (ownsBrowser) await browser.close().catch(() => {});
  }

  const findings = auditMotionInteractionSamples(samples, { viewport });
  return {
    target,
    ok: findings.length === 0,
    mode: 'browser',
    findings,
    checked: spec.interactions.map((interaction) => interaction.name || interaction.trigger),
    summary: findings.length
      ? `Found ${findings.length} motion interaction issue(s) across ${spec.interactions.length} declared interaction(s).`
      : `${spec.interactions.length} declared interaction(s) settled, held their anchors, and came to rest.`
  };
}
