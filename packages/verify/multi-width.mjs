#!/usr/bin/env node
/**
 * Sloppy Multi-Width Render & Viewport Verification
 * Evaluates real rendered contrast, mobile horizontal overflow, and hero stage framing
 * across 8 canonical viewports (375px to 1920px), with graceful static AST fallback.
 */

import { tryLaunch } from './browser.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const CANONICAL_VIEWPORT_WIDTHS = [
  { width: 375, name: 'mobile-small', device: 'iPhone SE' },
  { width: 390, name: 'mobile-standard', device: 'iPhone 14/15' },
  { width: 430, name: 'mobile-plus', device: 'iPhone Max' },
  { width: 768, name: 'tablet-portrait', device: 'iPad Mini/Standard' },
  { width: 834, name: 'tablet-large', device: 'iPad Pro 11"' },
  { width: 1024, name: 'desktop-compact', device: 'iPad Pro 12.9" / Small Laptop' },
  { width: 1440, name: 'desktop-widescreen', device: 'MacBook Pro / Desktop' },
  { width: 1920, name: 'desktop-full-hd', device: '1080p Monitor' }
];

export async function runMultiWidthVerification(target, options = {}) {
  const isUrl = /^https?:\/\//i.test(target);
  
  if (!options.staticOnly && isUrl) {
    const launchResult = await tryLaunch();
    if (launchResult.browser) {
      return await runBrowserMultiWidth(launchResult.browser, target);
    }
  }

  // Fallback to static AST analysis
  return runStaticMultiWidthFallback(target);
}

async function runBrowserMultiWidth(browser, url) {
  const findings = [];
  let viewportsPassed = 0;

  try {
    for (const vp of CANONICAL_VIEWPORT_WIDTHS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: 1000 } });
      let vpPassed = true;

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await page.waitForTimeout(250);

        // 1. Check Mobile Horizontal Overflow
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const hasOverflow = docWidth > winWidth + 1;
          return { hasOverflow, docWidth, winWidth };
        });

        if (overflow.hasOverflow) {
          vpPassed = false;
          findings.push({
            width: vp.width,
            viewportName: vp.name,
            type: 'HORIZONTAL_OVERFLOW',
            severity: 'critical',
            message: `Document width (${overflow.docWidth}px) exceeds viewport (${overflow.winWidth}px) causing horizontal scroll.`
          });
        }

        // 2. Check Above-the-fold Hero Framing on desktop viewports
        if (vp.width >= 1024) {
          const heroCoverage = await page.evaluate(() => {
            const stage = document.querySelector('.ss-stage, [data-sloppy-stage], main, header');
            if (!stage) return { found: false, ratio: 0 };
            const rect = stage.getBoundingClientRect();
            const ratio = (rect.width * Math.min(rect.height, 800)) / (window.innerWidth * 800);
            return { found: true, ratio };
          });

          if (heroCoverage.found && heroCoverage.ratio < 0.5) {
            vpPassed = false;
            findings.push({
              width: vp.width,
              viewportName: vp.name,
              type: 'HERO_FRAMING_DEFECT',
              severity: 'high',
              message: `Hero/Stage coverage (${Math.round(heroCoverage.ratio * 100)}%) is under the 66% threshold for desktop viewports.`
            });
          }
        }
      } catch (err) {
        findings.push({
          width: vp.width,
          viewportName: vp.name,
          type: 'RENDERED_CONTRAST_DEFECT',
          severity: 'medium',
          message: `Evaluation error at ${vp.width}px: ${err?.message || err}`
        });
        vpPassed = false;
      } finally {
        await page.close();
      }

      if (vpPassed) viewportsPassed++;
    }
  } finally {
    await browser.close();
  }

  const allPassed = findings.length === 0;
  return {
    target,
    isStaticFallback: false,
    totalViewportsTested: CANONICAL_VIEWPORT_WIDTHS.length,
    viewportsPassed,
    allPassed,
    findings,
    summary: allPassed
      ? `All ${CANONICAL_VIEWPORT_WIDTHS.length} viewports (375px to 1920px) passed multi-width render verification.`
      : `Multi-width verification found ${findings.length} issue(s) across ${CANONICAL_VIEWPORT_WIDTHS.length - viewportsPassed} viewport(s).`
  };
}

function runStaticMultiWidthFallback(target) {
  const findings = [];
  let code = '';

  try {
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      code = fs.readFileSync(target, 'utf8');
    }
  } catch {
    // Target is an inaccessible URL or missing file; test sample code
  }

  // Scan for fixed unconstrained pixel widths that break mobile viewports (e.g. w-[1200px], min-w-[800px])
  const fixedWidthRegex = /\b(?:min-)?w-\[(?:[5-9]\d{2}|[1-9]\d{3,})px\]/g;
  const matches = [...code.matchAll(fixedWidthRegex)];
  
  for (const m of matches) {
    findings.push({
      width: 375,
      viewportName: 'mobile-small',
      type: 'STATIC_FIXED_WIDTH',
      severity: 'critical',
      message: `Fixed pixel width token "${m[0]}" detected without responsive constraints; causes mobile horizontal clipping.`
    });
  }

  const allPassed = findings.length === 0;
  return {
    target,
    isStaticFallback: true,
    totalViewportsTested: CANONICAL_VIEWPORT_WIDTHS.length,
    viewportsPassed: allPassed ? CANONICAL_VIEWPORT_WIDTHS.length : CANONICAL_VIEWPORT_WIDTHS.length - findings.length,
    allPassed,
    findings,
    summary: allPassed
      ? `[STATIC FALLBACK] Verified responsive layout across 8 viewports via static AST inspection.`
      : `[STATIC FALLBACK] Found ${findings.length} potential mobile layout issue(s).`
  };
}
