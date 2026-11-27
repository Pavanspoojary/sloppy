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
 *       "closeTrigger": "#close", "kind": "click", "waitMs": 600 }
 *   ]
 * }
 */

import { tryLaunch } from './browser.mjs';

const SETTLE_MS = 250;
const HANDOFF_TOLERANCE = 0.5;
const LONG_FRAME_MS = 32;
const BAD_FRAME_MS = 60;

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

    if (sample.interrupted && sample.interruptRecovered === false) {
      push('motion.interruptNotRecovered', `${sample.name}: a reversed interaction is left in a half-open state after settling.`, sample, {
        severity: 'high',
        confidence: 'medium'
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
  }
  return null;
}

export async function runMotionInteractionAudit(target, options = {}) {
  const spec = options.spec;
  const reason = unavailableReason(target, spec);
  if (reason) {
    return { target, ok: false, mode: 'unavailable', findings: [], checked: [], summary: reason, unavailable: reason };
  }

  const launch = await tryLaunch();
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
  const samples = [];
  try {
    for (const interaction of spec.interactions) {
      const waitMs = Number.isFinite(interaction.waitMs) ? interaction.waitMs : 600;
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 12000 });
      await page.waitForTimeout(200);

      const sample = {
        name: interaction.name || interaction.trigger,
        target: interaction.target,
        selector: interaction.target,
        interrupted: Boolean(interaction.closeTrigger)
      };

      const boxes = await page.evaluate(({ trigger, targetSelector, anchorSelector }) => {
        const boxOf = (selector) => {
          if (!selector) return null;
          const el = document.querySelector(selector);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        };
        return {
          target: boxOf(targetSelector),
          anchor: boxOf(anchorSelector),
          trigger: boxOf(trigger),
          targetFound: Boolean(document.querySelector(targetSelector)),
          triggerFound: Boolean(document.querySelector(trigger))
        };
      }, { trigger: interaction.trigger, targetSelector: interaction.target, anchorSelector: interaction.anchor });

      if (!boxes.targetFound || !boxes.triggerFound) {
        sample.before = { anchor: boxes.anchor };
        samples.push(sample);
        continue;
      }

      sample.before = { target: boxes.target, anchor: boxes.anchor };
      await page.evaluate(() => {
        window.__sloppyMotionFrames = [];
        window.__sloppyMotionSampling = true;
        let last = performance.now();
        const tick = (now) => {
          window.__sloppyMotionFrames.push(now - last);
          last = now;
          if (window.__sloppyMotionSampling) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      if (interaction.kind === 'hover') await page.hover(interaction.trigger);
      else await page.click(interaction.trigger);

      await page.waitForTimeout(waitMs);

      const after = await page.evaluate(({ targetSelector, anchorSelector }) => {
        const boxOf = (selector) => {
          if (!selector) return null;
          const el = document.querySelector(selector);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        };
        const running = (document.getAnimations?.() || [])
          .filter((animation) => {
            if (animation.playState !== 'running') return false;
            const timing = animation.effect?.getTiming?.();
            return timing && timing.iterations !== Infinity;
          })
          .map((animation) => animation.animationName || animation.transitionProperty || 'animation');
        return { target: boxOf(targetSelector), anchor: boxOf(anchorSelector), running };
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
      sample.later = await page.evaluate((targetSelector) => {
        const el = document.querySelector(targetSelector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }, interaction.target);

      if (interaction.closeTrigger) {
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 12000 });
        await page.waitForTimeout(150);
        await page.click(interaction.trigger);
        await page.waitForTimeout(80);
        await page.click(interaction.closeTrigger);
        await page.waitForTimeout(waitMs);
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
    await browser.close().catch(() => {});
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
