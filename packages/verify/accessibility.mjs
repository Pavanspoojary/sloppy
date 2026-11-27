#!/usr/bin/env node
/**
 * DOM-backed accessibility verification.
 *
 * The browser collector is deliberately separate from the pure audit function so
 * the checks can be tested with a synthetic role/name/rect snapshot without a
 * browser. This module never claims a pass when the browser is unavailable.
 */

import { tryLaunch } from './browser.mjs';

const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'switch', 'checkbox', 'radio', 'option', 'slider', 'spinbutton', 'combobox'
]);

const FORM_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

function overlapsAnotherTarget(item, snapshot) {
  const { x = 0, y = 0, width = 0, height = 0 } = item.rect;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const box = { left: cx - 12, right: cx + 12, top: cy - 12, bottom: cy + 12 };
  return snapshot.some((other) => {
    if (!other || other === item || other.hidden || other.disabled || !other.rect) return false;
    const rect = other.rect;
    if (!Number.isFinite(rect.x) || !Number.isFinite(rect.y)) return false;
    if (!['BUTTON', 'A', 'SUMMARY', 'INPUT', 'SELECT', 'TEXTAREA'].includes(other.tag) && !other.role) return false;
    return rect.x < box.right && rect.x + rect.width > box.left && rect.y < box.bottom && rect.y + rect.height > box.top;
  });
}

export function analyzeFocusOrder(stops) {
  const jumps = [];
  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const current = stops[index];
    if (!previous || !current || current.selector === stops[0]?.selector) continue;
    if (previous.positiveTabindex || current.positiveTabindex) continue;
    const verticalDelta = previous.docTop - current.docTop;
    const horizontalDelta = (previous.docLeft ?? 0) - (current.docLeft ?? 0);
    const verticalJump = verticalDelta > 24;
    const horizontalJump = Math.abs(previous.docTop - current.docTop) <= 8 && horizontalDelta > 50;
    if (verticalJump || horizontalJump) {
      jumps.push({ from: previous.selector, to: current.selector, delta: verticalJump ? verticalDelta : horizontalDelta });
    }
  }
  return jumps;
}

export function auditA11ySnapshot(snapshot, options = {}) {
  const findings = [];
  const push = (rule, message, item, extra = {}) => {
    findings.push({
      rule,
      message,
      severity: extra.severity || 'medium',
      confidence: extra.confidence || 'high',
      objective: extra.objective !== false,
      evidence: {
        kind: extra.kind || 'dom',
        description: message,
        selector: item?.selector,
        viewport: options.viewport,
        criterion: extra.criterion
      }
    });
  };

  for (const item of snapshot) {
    if (!item || item.hidden || item.disabled) continue;
    const role = String(item.role || '').toLowerCase();
    const isInteractive = INTERACTIVE_ROLES.has(role) || ['BUTTON', 'A', 'SUMMARY'].includes(item.tag);
    const isForm = FORM_TAGS.has(item.tag) && String(item.type || '').toLowerCase() !== 'hidden';
    const hasName = Boolean(String(item.name || '').trim());

    if ((isInteractive || isForm) && !hasName) {
      const isFormControl = isForm && !['button', 'submit', 'reset'].includes(String(item.type || '').toLowerCase());
      if (isFormControl) {
        push('a11y.inputUnlabeled', `Form control <${item.tag.toLowerCase()}> has no label, aria-label, or labelledby reference.`, item, {
          severity: 'high',
          criterion: 'WCAG 3.3.2 Labels or Instructions / 4.1.2 Name, Role, Value'
        });
      } else {
        push('a11y.nameMissing', `Interactive <${item.tag.toLowerCase()}> has no accessible name.`, item, {
          severity: 'high',
          criterion: 'WCAG 4.1.2 Name, Role, Value'
        });
      }
    }

    if (item.focusVisible === false && Number(item.tabIndex) >= 0) {
      push('a11y.focusInvisible', `Focused <${item.tag.toLowerCase()}> has no visible outline or focus shadow.`, item, {
        severity: 'medium',
        confidence: 'medium',
        criterion: 'WCAG 2.4.7 Focus Visible'
      });
    }

    if (isInteractive && item.rect && !item.inlineLink) {
      const { width = 0, height = 0, x, y } = item.rect;
      const undersized = width > 0 && height > 0 && (width < 24 || height < 24);
      const spacingExempt = undersized && Number.isFinite(x) && Number.isFinite(y) && !overlapsAnotherTarget(item, snapshot);
      if (undersized && !spacingExempt) {
        push('a11y.targetTooSmall', `Interactive target is ${Math.round(width)}x${Math.round(height)}px; WCAG 2.2 AA requires at least 24x24 CSS px.`, item, {
          severity: 'medium',
          confidence: 'medium',
          criterion: 'WCAG 2.5.8 Target Size (Minimum)'
        });
      }
    }

    if (Number(item.explicitTabIndex) > 0) {
      push('a11y.positiveTabindex', `Explicit tabindex="${item.explicitTabIndex}" overrides the natural focus order.`, item, {
        severity: 'medium',
        objective: false,
        criterion: 'WCAG 2.4.3 Focus Order'
      });
    }

    if (item.ariaExpanded !== undefined && item.ariaExpanded !== null && !item.ariaControls) {
      push('a11y.stateUnwired', `Element exposes aria-expanded="${item.ariaExpanded}" without aria-controls naming the region it expands.`, item, {
        severity: 'medium',
        confidence: 'medium',
        objective: false,
        criterion: 'WCAG 4.1.2 Name, Role, Value'
      });
    }
  }

  for (const duplicate of options.duplicateIds || []) {
    push('a11y.duplicateId', `Duplicate id "${duplicate}" makes labels and aria references ambiguous.`, { selector: `#${duplicate}` }, {
      severity: 'low',
      confidence: 'high',
      objective: false
    });
  }

  for (const broken of options.brokenReferences || []) {
    push('a11y.brokenReference', `${broken.attribute} references missing id "${broken.id}".`, { selector: broken.selector }, {
      severity: 'high',
      criterion: 'WCAG 4.1.2 Name, Role, Value'
    });
  }

  for (const jump of options.focusOrderJumps || []) {
    push('a11y.focusOrderJump', `Tab order moves from "${jump.from}" to "${jump.to}" (${Math.round(Math.abs(jump.delta))}px backwards); confirm the focus sequence follows the visual reading order.`, { selector: jump.to }, {
      severity: 'low',
      confidence: 'low',
      objective: false,
      kind: 'interaction',
      criterion: 'WCAG 2.4.3 Focus Order'
    });
  }

  if (options.reflowOverflow) {
    push('a11y.reflowOverflow', `At 320 CSS px the page scrolls horizontally (${options.reflowOverflow.scrollWidth}px content in ${options.reflowOverflow.clientWidth}px viewport).`, { selector: 'document' }, {
      severity: 'high',
      criterion: 'WCAG 1.4.10 Reflow'
    });
  }

  for (const clipped of options.textResizeClipped || []) {
    push('a11y.textResizeClipped', `At 200% text size, text is clipped inside a fixed-height element (${clipped.scrollHeight}px content in ${clipped.clientHeight}px box).`, { selector: clipped.selector }, {
      severity: 'medium',
      confidence: 'medium',
      kind: 'computed-style',
      criterion: 'WCAG 1.4.4 Resize Text'
    });
  }

  if (options.reducedMotionIgnored) {
    push('a11y.reducedMotionIgnored', 'Infinite animation keeps running under prefers-reduced-motion: reduce.', { selector: 'document' }, {
      severity: 'low',
      confidence: 'low',
      objective: false,
      kind: 'computed-style'
    });
  }

  for (const item of options.autoplayWithoutControl || []) {
    push('motion.autoplayWithoutControl', `Automatically running motion has no visible pause control (${item.animationName || 'infinite animation'} on ${item.selector}).`, { selector: item.selector }, {
      severity: 'high',
      confidence: 'medium',
      kind: 'computed-style',
      criterion: 'WCAG 2.2.2 Pause, Stop, Hide'
    });
  }

  for (const item of options.slowFeedback || []) {
    push('motion.slowFeedback', `Interactive feedback takes ${Math.round(item.ms)}ms to transition (${item.selector}); keep hover, press, and focus responses inside roughly 300ms.`, { selector: item.selector }, {
      severity: 'low',
      confidence: 'medium',
      objective: false,
      kind: 'computed-style'
    });
  }

  return findings;
}

export async function runAccessibilityAudit(target, options = {}) {
  if (!/^https?:\/\//i.test(String(target))) {
    return {
      target,
      ok: false,
      mode: 'static',
      isStaticFallback: true,
      findings: [],
      summary: 'Accessibility audit requires a served http(s) URL; no DOM snapshot was collected.',
      unavailable: 'Accessibility evidence requires a browser and a served URL.'
    };
  }

  const launchResult = await tryLaunch();
  if (!launchResult.browser) {
    return {
      target,
      ok: false,
      mode: 'browser',
      isStaticFallback: false,
      findings: [],
      summary: `Accessibility audit unavailable: ${launchResult.reason}`,
      unavailable: launchResult.reason
    };
  }

  const browser = launchResult.browser;
  const page = await browser.newPage({ viewport: { width: options.width || 1440, height: options.height || 900 } });
  try {
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 8000 });
    await page.waitForTimeout(options.settleMs ?? 250);

    const snapshot = await page.evaluate(() => {
      const nameOf = (el) => {
        const aria = el.getAttribute('aria-label')?.trim();
        if (aria) return aria;
        const labelledby = el.getAttribute('aria-labelledby');
        if (labelledby) {
          const text = labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim();
          if (text) return text;
        }
        if (el.tagName === 'IMG') return (el.getAttribute('alt') || '').trim();
        if (el.labels && el.labels.length) {
          const text = [...el.labels].map((label) => (label.innerText || label.textContent || '').trim()).filter(Boolean).join(' ').trim();
          if (text) return text;
        }
        if (el.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes((el.type || '').toLowerCase())) return el.value || '';
        return (el.innerText || el.textContent || '').trim() || (el.getAttribute('title') || '').trim();
      };
      const roleOf = (el) => {
        const explicit = el.getAttribute('role');
        if (explicit) return explicit;
        if (el.tagName === 'BUTTON' || el.tagName === 'SUMMARY') return 'button';
        if (el.tagName === 'A' && el.hasAttribute('href')) return 'link';
        if (el.tagName === 'INPUT') {
          return ({ checkbox: 'checkbox', radio: 'radio', range: 'slider', number: 'spinbutton' })[(el.type || '').toLowerCase()] || 'textbox';
        }
        if (el.tagName === 'SELECT') return 'combobox';
        if (el.tagName === 'TEXTAREA') return 'textbox';
        return '';
      };
      const selectorOf = (el) => {
        if (el.id) return `#${el.id}`;
        const cls = [...el.classList].filter((value) => /^[A-Za-z0-9_-]+$/.test(value)).slice(0, 2);
        return `${el.tagName.toLowerCase()}${cls.map((value) => `.${value}`).join('')}`;
      };
      const items = [];
      const previousFocus = document.activeElement;
      const all = [...document.querySelectorAll('body *')];
      for (const el of all) {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const tag = el.tagName;
        const role = roleOf(el);
        const interactive = ['BUTTON', 'A', 'SUMMARY', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tag) || Boolean(el.getAttribute('role'));
        if (!interactive && !el.hasAttribute('aria-expanded')) continue;
        const type = (el.getAttribute('type') || (tag === 'INPUT' ? 'text' : '') || '').toLowerCase();
        if (tag === 'INPUT' && type === 'hidden') continue;
        const labels = el.labels ? [...el.labels] : [];
        const hasLabel = labels.length > 0 || Boolean(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title'));
        const focusable = el.tabIndex >= 0 && !el.disabled;
        let focusVisible;
        if (focusable) {
          try { el.focus({ preventScroll: true }); } catch {}
          const focusedStyle = getComputedStyle(el);
          focusVisible = (focusedStyle.outlineStyle !== 'none' && focusedStyle.outlineWidth !== '0px') || focusedStyle.boxShadow !== 'none';
        }
        items.push({
          tag,
          role,
          name: nameOf(el),
          id: el.id || undefined,
          selector: selectorOf(el),
          type,
          hidden: false,
          disabled: Boolean(el.disabled),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          tabIndex: el.tabIndex,
          explicitTabIndex: el.getAttribute('tabindex'),
          inlineLink: tag === 'A' && style.display === 'inline',
          hasLabel,
          focusVisible,
          ariaExpanded: el.getAttribute('aria-expanded'),
          ariaControls: el.getAttribute('aria-controls') || undefined
        });
      }

      if (previousFocus && previousFocus !== document.body && typeof previousFocus.focus === 'function') {
        try { previousFocus.focus({ preventScroll: true }); } catch {}
      }

      const ids = new Map();
      for (const el of document.querySelectorAll('[id]')) ids.set(el.id, (ids.get(el.id) || 0) + 1);
      const duplicateIds = [...ids.entries()].filter(([, count]) => count > 1).map(([id]) => id);

      const brokenReferences = [];
      for (const el of document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], [aria-owns]')) {
        for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns']) {
          const value = el.getAttribute(attribute);
          if (!value) continue;
          for (const id of value.split(/\s+/).filter(Boolean)) {
            if (!document.getElementById(id)) brokenReferences.push({ attribute, id, selector: selectorOf(el) });
          }
        }
      }

      return { items, duplicateIds, brokenReferences };
    });

    let focusOrderJumps = [];
    if (options.checkFocusOrder !== false) {
      await page.evaluate(() => window.scrollTo(0, 0));
      const stops = [];
      for (let index = 0; index < 30; index += 1) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body || el === document.documentElement) return null;
          const rect = el.getBoundingClientRect();
          const label = el.getAttribute('aria-label') || (el.innerText || el.textContent || el.tagName).trim().slice(0, 40);
          return {
            selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${label ? `[${label}]` : ''}`,
            docTop: rect.top + window.scrollY,
            docLeft: rect.left,
            positiveTabindex: Number(el.getAttribute('tabindex')) > 0
          };
        });
        if (stop) stops.push(stop);
        if (stops.length > 2 && stop?.selector === stops[0]?.selector) break;
      }
      focusOrderJumps = analyzeFocusOrder(stops);
    }

    const viewport = page.viewportSize();
    let autoplayWithoutControl = [];
    let slowFeedback = [];
    if (options.checkMotionBudget !== false) {
      try {
        const motion = await page.evaluate(() => {
          const label = (el) => {
            const cls = [...(el.classList || [])].filter((value) => /^[A-Za-z0-9_-]+$/.test(value)).slice(0, 2);
            return el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${cls.map((value) => `.${value}`).join('')}`;
          };
          const pauseControl = [...document.querySelectorAll('button, [role="button"], a')]
            .some((el) => /pause|stop playback|stop animation/i.test(`${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.textContent || ''}`));
          const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
          const autoplay = [];
          for (const animation of document.getAnimations?.() || []) {
            const timing = animation.effect?.getTiming?.();
            if (!timing || timing.iterations !== Infinity || animation.playState !== 'running') continue;
            if (pauseControl) continue;
            const el = animation.effect?.target;
            if (!el || el.nodeType !== 1) continue;
            const rect = el.getBoundingClientRect();
            const area = Math.max(0, rect.width) * Math.max(0, rect.height);
            const name = `${animation.animationName || ''} ${el.className || ''} ${el.id || ''}`.toLowerCase();
            const named = /marquee|ticker|carousel|autoplay|logo-scroll/.test(name);
            if (!named && area < viewportArea * 0.25) continue;
            autoplay.push({ selector: label(el), animationName: animation.animationName || 'infinite animation' });
            if (autoplay.length >= 5) break;
          }
          const slow = [];
          for (const el of document.querySelectorAll('a, button, input, select, textarea, summary, [role="button"]')) {
            const style = getComputedStyle(el);
            if (style.transitionProperty === 'none') continue;
            const durations = style.transitionDuration.split(',').map((value) => {
              const trimmed = value.trim();
              const number = Number.parseFloat(trimmed);
              if (!Number.isFinite(number)) return 0;
              return /ms$/.test(trimmed) ? number : number * 1000;
            });
            const ms = Math.max(0, ...durations);
            if (ms < 600) continue;
            slow.push({ selector: label(el), ms });
            if (slow.length >= 5) break;
          }
          return { autoplay, slow };
        });
        autoplayWithoutControl = motion.autoplay;
        slowFeedback = motion.slow;
      } catch {}
    }

    let reflowOverflow = null;
    let textResizeClipped = [];
    try {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.waitForTimeout(120);
      const reflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      if (reflow.scrollWidth > reflow.clientWidth + 1) reflowOverflow = reflow;

      await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
      await page.waitForTimeout(120);
      textResizeClipped = await page.evaluate(() => {
        const clipped = [];
        for (const el of document.querySelectorAll('body *')) {
          const style = getComputedStyle(el);
          if (style.overflow !== 'hidden' && style.overflowY !== 'hidden') continue;
          const text = (el.innerText || el.textContent || '').trim();
          if (!text || el.children.length > 0) continue;
          if (el.scrollHeight > el.clientHeight + 2) {
            const cls = [...el.classList].filter((value) => /^[A-Za-z0-9_-]+$/.test(value)).slice(0, 2);
            clipped.push({ selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${cls.map((value) => `.${value}`).join('')}`, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight });
          }
          if (clipped.length >= 5) break;
        }
        return clipped;
      });
      await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    } finally {
      if (viewport) await page.setViewportSize(viewport);
    }

    let reducedMotionIgnored = false;
    if (options.checkReducedMotion !== false) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'domcontentloaded', timeout: options.timeoutMs || 8000 });
      await page.waitForTimeout(150);
      reducedMotionIgnored = await page.evaluate(() => (document.getAnimations?.() || []).some((animation) => {
        const timing = animation.effect?.getTiming?.();
        return animation.playState === 'running' && timing && timing.iterations === Infinity;
      }));
    }

    const findings = auditA11ySnapshot(snapshot.items, {
      duplicateIds: snapshot.duplicateIds,
      brokenReferences: snapshot.brokenReferences,
      focusOrderJumps,
      reflowOverflow,
      textResizeClipped,
      reducedMotionIgnored,
      autoplayWithoutControl,
      slowFeedback,
      viewport: { width: options.width || 1440, height: options.height || 900 }
    });

    return {
      target,
      ok: findings.length === 0,
      mode: 'browser',
      isStaticFallback: false,
      findings,
      summary: findings.length
        ? `Found ${findings.length} accessibility issue(s) in the rendered DOM.`
        : 'Rendered DOM passes the name, label, focus, target-size, reference, reflow, text-resize, reduced-motion, and motion-budget checks.',
      checked: ['accessible name', 'form labels', 'focus visibility', 'focus order', 'target size 24x24', 'aria references', 'reflow at 320px', '200% text resize', 'reduced motion', 'autoplay pause control', 'interaction transition duration']
    };
  } catch (error) {
    const reason = String(error?.message || error).split('\n')[0];
    return {
      target,
      ok: false,
      mode: 'browser',
      isStaticFallback: false,
      findings: [],
      summary: `Accessibility audit failed: ${reason}`,
      unavailable: reason
    };
  } finally {
    await page.close();
    await browser.close();
  }
}
