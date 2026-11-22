// Shared reporting and page discovery. Browser functions below are deliberately
// self-contained: Playwright installs their source before application code runs.
export function visibleStages(selector = null) {
  const targets = [...document.querySelectorAll(selector || '.ss-fit, .ss-stage')]
  const stages = new Set()
  for (const target of targets) {
    for (const stage of target.matches('.ss-stage') ? [target] : target.querySelectorAll('.ss-stage')) {
      const r = stage.getBoundingClientRect()
      const cs = getComputedStyle(stage)
      if (r.width && r.height && cs.display !== 'none' && cs.visibility !== 'hidden' && stage.checkVisibility?.({ visibilityProperty: true, opacityProperty: false }) !== false) stages.add(stage)
    }
  }
  return [...stages]
}

export function watchStages({ selector = null } = {}) {
  const keys = new WeakMap()
  let next = 1
  const state = window.__ssVerification = { selector, stages: {}, stopped: false, errors: [] }
  window.__ssStageKey = (stage) => {
    if (!keys.has(stage)) {
      const key = `stage-${next++}`
      keys.set(stage, key)
      stage.setAttribute('data-ss-verification-stage', key)
      state.stages[key] = { label: stage.getAttribute('aria-label') || stage.parentElement?.className || key, startedAt: performance.now(), frames: [] }
      window.__ssRecord(stage, { key })
    }
    return keys.get(stage)
  }
  const discover = () => {
    if (state.stopped) return
    try {
      for (const stage of window.__ssVisibleStages(selector)) window.__ssStageKey(stage)
    } catch (error) {
      state.errors.push(String(error))
      state.stopped = true
      return
    }
    requestAnimationFrame(discover)
  }
  requestAnimationFrame(discover)
}

export function instrumentationSource(record, selector = null) {
  return `window.__ssVisibleStages = ${visibleStages.toString()};\nwindow.__ssRecord = ${record.toString()};\n(${watchStages.toString()})(${JSON.stringify({ selector })});`
}

export function coverage(frames = [], { requestedMs = 0, slow = 1 } = {}) {
  const intervals = frames.slice(1).map((frame, i) => frame.t - frames[i].t)
  const sorted = intervals.filter((ms) => ms > 0 && Number.isFinite(ms)).sort((a, b) => a - b)
  const medianMs = sorted[Math.floor(sorted.length / 2)] || 16.7
  const late = intervals.filter((ms) => ms > medianMs * 1.6)
  const durationMs = frames.length > 1 ? frames.at(-1).t - frames[0].t : 0
  const reasons = []
  if (frames.length < 4) reasons.push(`only ${frames.length} animation frames recorded`)
  if (requestedMs && durationMs + Math.max(100, medianMs * 3) < requestedMs) reasons.push(`recorded ${Math.round(durationMs)}ms of the requested ${Math.round(requestedMs)}ms`)
  if (late.length) reasons.push(`${late.length} sampling gap(s) exceeded ${Math.round(medianMs * 1.6)}ms; motion during those gaps was not judged`)
  if (medianMs > 40) reasons.push(`typical sampling interval was ${Math.round(medianMs)}ms; too sparse to judge short motion`)
  if (intervals.some((ms) => !Number.isFinite(ms) || ms <= 0)) reasons.push('recording contained invalid or non-increasing frame timestamps')
  if (frames.length && !frames.some((frame) => frame.items?.length)) reasons.push('no visible elements were sampled')
  const cameraFrames = frames.filter((frame) => frame.cameraMoving).length
  return { status: reasons.length ? 'inconclusive' : 'complete', frames: frames.length, durationMs: durationMs / slow, medianMs, maxGapMs: Math.max(0, ...intervals), skippedGaps: late.length, cameraFrames, reasons }
}

export function reportResult({ stages = [], errors = [], strict = false, still = false } = {}) {
  const incomplete = errors.length > 0 || stages.length === 0 || stages.some((stage) => stage.coverage?.status !== 'complete')
  const findings = stages.reduce((n, stage) => n + (stage.findings?.length || 0), 0)
  const manual = stages.reduce((n, stage) => n + (stage.manual?.length || 0), 0)
  const status = incomplete ? 'inconclusive' : findings ? 'issues' : 'no-issues-detected'
  return { status, mode: still ? 'still' : 'motion', stages, errors, manualReviewRequired: !still || manual > 0, exitCode: incomplete ? 2 : strict && findings ? 1 : 0 }
}

export function printCoverage(key, sample) {
  console.log(`coverage ${key}: ${sample.frames} frames, ${(sample.durationMs / 1000).toFixed(2)}s, largest gap ${sample.maxGapMs.toFixed(1)}ms (${sample.status})`)
  for (const reason of sample.reasons) console.log(`  incomplete: ${reason}`)
  if (sample.cameraFrames) console.log(`  manual: camera contents excluded during ${sample.cameraFrames} moving-camera frames`)
}

export function motionFindings(motion, slow = 1) {
  if (!motion) return []
  const lines = [...new Set(motion.flagged)]
  const ink = motion.ink.filter((i) => i.at >= motion.start).map((i) => ({ n: i.n, t: (i.at - motion.start) / 1000 / slow }))
  const most = Math.max(0, ...ink.map((i) => i.n))
  const runs = []
  // An initial fade may start with no ink. Judge a loss of established
  // content, not the baseline before the first entrance has appeared.
  const firstContent = ink.findIndex((sample) => sample.n >= most * 0.2 && sample.n > 0)
  for (const sample of firstContent < 0 ? [] : ink.slice(firstContent)) {
    const last = runs.at(-1)
    if (sample.n < most * 0.2 && last && !last.done) { last.end = sample.t; last.min = Math.min(last.min, sample.n) }
    else if (sample.n < most * 0.2) runs.push({ start: sample.t, end: sample.t, min: sample.n })
    else if (last) last.done = true
  }
  const low = runs.filter((r) => r.end - r.start >= 0.12)
  if (most && low.length) lines.push(`near-empty frames: visible content falls to ${Math.min(...low.map((r) => r.min))} of ${most} elements around ${low[0].start.toFixed(1)}s for ${Math.round((low[0].end - low[0].start) * 1000)}ms${low.length > 1 ? ` (${low.length} times)` : ''}; inspect the handoff and overlap the old and new content`)
  return lines
}
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const violation = (rule, message, evidence) => ({ rule, message, ...(evidence ? { evidence } : {}) })

export function parseRgba(colorStr) {
  if (!colorStr) return [0, 0, 0, 1];
  const m = colorStr.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (m) {
    return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] !== undefined ? Number(m[4]) : 1];
  }
  if (colorStr.startsWith('#')) {
    const hex = colorStr.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b] = [0, 1, 2].map(i => parseInt(hex[i] + hex[i], 16));
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      return [r, g, b, a];
    }
    const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  return [0, 0, 0, 1];
}

export function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(fgColor, bgColor) {
  const fg = Array.isArray(fgColor) ? fgColor : parseRgba(fgColor);
  const bg = Array.isArray(bgColor) ? bgColor : parseRgba(bgColor);
  const alpha = fg[3] !== undefined ? fg[3] : 1;
  const blended = [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha))
  ];
  const l1 = relativeLuminance(blended);
  const l2 = relativeLuminance(bg.slice(0, 3));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function staticVerify(target, source) {
  const lines = source.split(/\r?\n/)
  const findings = []
  const report = (rule, message, line) => findings.push(violation(rule, message, line ? `${line.number}: ${line.text.trim()}` : undefined))
  const evidenceAt = (index) => {
    const number = source.slice(0, index).split(/\r?\n/).length
    return { number, text: lines[number - 1] || '' }
  }
  const stages = [...source.matchAll(/<Stage\b[^>]*>/g)]
  const stage = stages.find((match) => {
    const width = /\bwidth\s*=\s*\{?['"]?(\d+)/.exec(match[0])
    const height = /\bheight\s*=\s*\{?['"]?(\d+)/.exec(match[0])
    return width && height && +width[1] >= 320 && +height[1] >= 200
  })
  const root = source.match(/<[A-Za-z][\w.-]*\b[^>]*>/)
  const rootWidth = root && !/^<Stage\b/i.test(root[0]) && /\bwidth\s*=\s*\{?['"]?(\d+)/i.exec(root[0])
  const rootHeight = root && !/^<Stage\b/i.test(root[0]) && /\bheight\s*=\s*\{?['"]?(\d+)/i.exec(root[0])
  const rootSized = rootWidth && rootHeight && +rootWidth[1] >= 320 && +rootHeight[1] >= 200
  if (!stage && !rootSized) report('framing.stage', 'A Stage or root element with explicit width >= 320 and height >= 200 is required.', stages[0] ? evidenceAt(stages[0].index) : root ? evidenceAt(root.index) : undefined)

  const frameNames = ['Window', 'Phone', 'BrowserWindow', 'DeviceFrame']
  const frameRegex = new RegExp(`<(${frameNames.join('|')})\\b([^>]*)>`, 'g')
  const frames = [...source.matchAll(frameRegex)]
  if (!frames.length) report('framing.dominantFrame', 'No Window, Phone, BrowserWindow, or DeviceFrame element was found.', lines.map((text, i) => ({ text, number: i + 1 })).find(({ text }) => /<(?:Stage|[a-z][\w.-]*)\b/.test(text)))
  const bleed = /(?:^|\s)(?:-mx-[\w./-]+|w-full|h-full|absolute|inset(?:-[\w./-]+)?|rounded-t-[\w./-]+|overflow-hidden)(?:\s|$)/
  const margin = /(?:^|\s)m-[4-9](?:\s|$)/
  const floating = frames.find((match) => {
    const classes = /className\s*=\s*['"`]([^'"`]*)/.exec(match[2])?.[1] || ''
    const centeredMargins = /(?:^|\s)mx-auto(?:\s|$)/.test(classes) && /(?:^|\s)my-[4-9](?:\s|$)/.test(classes)
    return (margin.test(classes) || centeredMargins) && !bleed.test(classes)
  })
  if (floating) report('framing.floating', 'A framed element has uniform outer margins and no detectable bleed signal.', lines[0] && { number: source.slice(0, floating.index).split(/\r?\n/).length, text: lines[source.slice(0, floating.index).split(/\r?\n/).length - 1] })

  const purpleHex = (hex) => {
    const value = hex.slice(1)
    const rgb = value.length <= 4 ? [...value].map((part) => parseInt(part + part, 16)) : [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16))
    return rgb[2] > rgb[1] * 1.08 && rgb[0] > rgb[1] * 0.55 && rgb[2] > 75
  }
  const hasPurpleColor = (value) => /\b(?:purple|indigo|violet|fuchsia|magenta)\b/i.test(value) || [...value.matchAll(/#[\da-f]{3,8}\b/gi)].some(([hex]) => purpleHex(hex)) || [...value.matchAll(/rgba?\(([^)]*)\)/gi)].some(([, body]) => {
    const [r, g, b] = body.match(/[\d.]+/g)?.slice(0, 3).map(Number) || []
    return Number.isFinite(b) && b > g * 1.08 && r > g * 0.55 && b > 75
  })
  const purple = /(?:bg-gradient|from|via|to)-(?:purple|indigo|violet|fuchsia)(?:-[\w./]+)?/i
  const purpleLine = lines.map((text, i) => ({ text, number: i + 1 })).find(({ text }) => purple.test(text) || [...text.matchAll(/(?:linear|radial|conic)-gradient\(([^)]*)\)/gi)].some(([, body]) => hasPurpleColor(body)))
  if (purpleLine) report('accent.purpleGradient', 'Purple, indigo, violet, or fuchsia gradient styling was found.', purpleLine)

  const sparkleLine = lines.map((text, i) => ({ text, number: i + 1 })).find(({ text }) => /(?:Sparkles?|MagicWand|WandSparkles|Wand2)\b|icon-(?:sparkles?|magic-wand)|lucide-(?:sparkles?|wand-sparkles|wand-2)/i.test(text))
  if (sparkleLine) report('icon.sparkle', 'Sparkle or magic-wand icon usage was found.', sparkleLine)

  const motionLine = lines.map((text, i) => ({ text, number: i + 1 })).find(({ text }) => {
    if (/animate-(?:bounce|ping)\b/.test(text)) return true
    const loop = /animate-(?:pulse|spin)\b|animate-\[[^\]]*infinite[^\]]*\]|animation\s*:\s*[^;]*\binfinite\b|animation-iteration-count\s*:\s*infinite/i.test(text)
    if (!loop) return false
    return !/(?:progress|loading|busy|role\s*=\s*["']progressbar|aria-valuenow)/i.test(source)
  })
  if (motionLine) report('motion.unearned', 'Unearned looping motion was found without a progress signal.', motionLine)
  return { ok: findings.length === 0, target, mode: 'static', stages: [], violations: findings }
}

async function browserVerify(target, { timeoutMs, selector }) {
  const unavailable = (reason) => ({ ok: false, target, mode: 'browser', unavailable: reason, stages: [], violations: [] })
  let browser
  const task = (async () => {
    let chromium
    try { ({ chromium } = await import('playwright-core')) }
    catch { return unavailable('playwright-core is not installed; install the declared package to enable browser verification.') }
    const executablePath = process.env.CHROME_PATH || chromium.executablePath()
    try {
      const { access } = await import('node:fs/promises')
      await access(executablePath)
    } catch { return unavailable(`No Chromium executable is available at ${executablePath}; install a browser or set CHROME_PATH.`) }
    try { browser = await chromium.launch({ executablePath }) }
    catch (error) { return unavailable(`Chromium could not be launched: ${error?.message || String(error)}`) }
    try {
      const page = await browser.newPage()
      const failedRequests = []
      page.on('response', (response) => {
        if (response.status() >= 400 && response.request().resourceType() !== 'document') {
          failedRequests.push({ url: response.url(), status: response.status() })
        }
      })
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
      const initial = await page.evaluate((requestedSelector) => {
        const selector = requestedSelector || '.ss-stage, .ss-window, [data-stage], [data-window], [class*="Phone"], [class*="BrowserWindow"], [class*="DeviceFrame"]'
        const candidates = [...document.querySelectorAll(selector)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
        const el = candidates.sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0]
        const purple = [...document.querySelectorAll('[class], [style]')].some((node) => {
          const value = `${node.getAttribute('class') || ''} ${node.getAttribute('style') || ''} ${getComputedStyle(node).backgroundImage}`
          if (/(?:from|via|to)-(?:purple|indigo|violet|fuchsia)|(?:purple|indigo|violet|fuchsia)\b/i.test(value) && /gradient/i.test(value)) return true
          if (!/gradient/i.test(value)) return false
          const hexes = [...value.matchAll(/#([\da-f]{3,8})\b/gi)].map(([, hex]) => hex.length <= 4 ? [...hex].map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)))
          const rgbs = [...value.matchAll(/rgba?\(([^)]*)\)/gi)].map(([, body]) => body.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [])
          return [...hexes, ...rgbs].some(([r, g, b]) => Number.isFinite(b) && b > g * 1.08 && r > g * 0.55 && b > 75)
        })
        const sparkle = !!document.querySelector('[class*="sparkle" i], [class*="wand" i], [data-icon*="sparkle" i], [aria-label*="sparkle" i], [aria-label*="magic wand" i]')
        if (!el) return { viewport: { width: innerWidth, height: innerHeight }, frame: null, purple, sparkle }
        const r = el.getBoundingClientRect()
        return { viewport: { width: innerWidth, height: innerHeight }, frame: { x: r.left, y: r.top, width: r.width, height: r.height, label: el.getAttribute('aria-label') || el.getAttribute('class') || el.tagName.toLowerCase() }, purple, sparkle }
      }, selector)

      // Audit UX, accessibility, contrast, and broken assets
      const uxAudit = await page.evaluate(() => {
        const issues = []

        // Broken images check
        const images = [...document.querySelectorAll('img')]
        for (const img of images) {
          if (img.complete && img.naturalWidth === 0 && img.naturalHeight === 0 && !img.src.startsWith('data:image/svg')) {
            issues.push({
              rule: 'asset.brokenImage',
              message: 'Broken image detected on stage.',
              evidence: img.src || img.getAttribute('src') || 'img[src]'
            })
          }
        }

        // WCAG AA contrast computed-style evaluation
        const parseColor = (str) => {
          const m = (str || '').match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i)
          if (!m) return [0, 0, 0, 1]
          return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] !== undefined ? Number(m[4]) : 1]
        }
        const lum = ([r, g, b]) => {
          const [rs, gs, bs] = [r, g, b].map(c => {
            const s = c / 255
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
          })
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
        }
        const getEffectiveBg = (el) => {
          let curr = el
          while (curr && curr !== document.documentElement) {
            const cs = getComputedStyle(curr)
            const [r, g, b, a] = parseColor(cs.backgroundColor)
            if (a > 0.05) return [r, g, b, a]
            curr = curr.parentElement
          }
          return [255, 255, 255, 1]
        }

        const textNodes = [...document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, li, label')]
        for (const el of textNodes) {
          const text = (el.innerText || el.textContent || '').trim()
          if (!text || text.length > 80 || el.children.length > 2) continue
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          const cs = getComputedStyle(el)
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
          const fg = parseColor(cs.color)
          const bg = getEffectiveBg(el)
          const alpha = fg[3]
          const blended = [
            Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
            Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
            Math.round(fg[2] * alpha + bg[2] * (1 - alpha))
          ]
          const l1 = lum(blended)
          const l2 = lum(bg.slice(0, 3))
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
          const isLarge = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && (parseInt(cs.fontWeight) >= 700 || cs.fontWeight === 'bold'))
          const minRatio = isLarge ? 3.0 : 4.5
          if (ratio < minRatio && ratio > 1.01) {
            issues.push({
              rule: 'a11y.contrast',
              message: `Rendered text fails WCAG AA contrast (${ratio.toFixed(2)}:1 vs ${minRatio}:1 minimum).`,
              evidence: `"${text.slice(0, 30)}" (${cs.fontSize}, ${cs.color} on rgb(${bg.slice(0, 3).join(',')}))`
            })
            break
          }
        }

        // Keyboard focus visible
        const interactives = [...document.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"], [role="button"]')]
        for (const el of interactives.slice(0, 10)) {
          const cs = getComputedStyle(el)
          const noOutline = cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0
          const noShadow = !cs.boxShadow || cs.boxShadow === 'none'
          const noBorder = cs.borderStyle === 'none' || parseFloat(cs.borderWidth) === 0
          if (noOutline && noShadow && noBorder && el.getAttribute('tabindex') !== '-1') {
            issues.push({
              rule: 'a11y.focusVisible',
              message: 'Interactive control lacks visible keyboard focus affordance.',
              evidence: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : ''}`
            })
            break
          }
        }

        return issues
      })

      // Test 375px mobile viewport overflow
      await page.setViewportSize({ width: 375, height: 667 })
      const mobileAudit = await page.evaluate(() => {
        const issues = []
        const scrollWidth = document.documentElement.scrollWidth
        if (scrollWidth > 375 + 2) {
          issues.push({
            rule: 'layout.mobileOverflow',
            message: `Horizontal content overflow detected on 375px mobile viewport (${scrollWidth}px vs 375px).`,
            evidence: `scrollWidth ${scrollWidth}px exceeds viewport width 375px`
          })
        }
        return issues
      })

      const frames = await page.evaluate(async (requestedSelector) => {
        const selector = requestedSelector || '.ss-stage, .ss-window, [data-stage], [data-window], [class*="Phone"], [class*="BrowserWindow"], [class*="DeviceFrame"]'
        const pick = () => [...document.querySelectorAll(selector)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0]
        const items = [], end = performance.now() + 1500
        while (performance.now() < end) { const el = pick(); if (el) { const r = el.getBoundingClientRect(); items.push([r.x, r.y, r.width, r.height]) } await new Promise(requestAnimationFrame) }
        return items
      }, selector)
      const violations = []
      const frame = initial.frame, vp = initial.viewport
      if (!frame || Math.max(frame.width / vp.width, frame.height / vp.height) < 0.66) violations.push(violation('framing.coverage', 'No dominant stage or frame reaches 66% of either viewport axis.', frame ? `${frame.width}x${frame.height} in ${vp.width}x${vp.height}` : 'No visible stage or frame was found.'))
      if (frame && frame.x > 1 && frame.y > 1 && vp.width - frame.x - frame.width > 1 && vp.height - frame.y - frame.height > 1) violations.push(violation('framing.floating', 'The dominant frame has positive gaps on all four viewport edges.', `gaps ${frame.x}, ${frame.y}, ${vp.width - frame.x - frame.width}, ${vp.height - frame.y - frame.height}px`))
      if (initial.purple) violations.push(violation('accent.purpleGradient', 'Purple, indigo, violet, or fuchsia gradient styling was found.'))
      if (initial.sparkle) violations.push(violation('icon.sparkle', 'Sparkle or magic-wand icon markup was found.'))
      let maxDelta = 0
      for (let i = 1; i < frames.length; i++) maxDelta = Math.max(maxDelta, ...frames[i].map((n, j) => Math.abs(n - frames[i - 1][j])))
      if (maxDelta > 2) violations.push(violation('motion.layoutJump', `The dominant frame moved or resized by ${maxDelta.toFixed(1)}px between sampled frames.`, `${frames.length} samples over approximately 1.5 seconds`))

      for (const issue of uxAudit) {
        violations.push(violation(issue.rule, issue.message, issue.evidence))
      }
      for (const issue of mobileAudit) {
        violations.push(violation(issue.rule, issue.message, issue.evidence))
      }
      for (const req of failedRequests) {
        violations.push(violation('asset.brokenLink', `Resource failed to load with HTTP ${req.status}.`, req.url))
      }

      return { ok: violations.length === 0, target, mode: 'browser', stages: frame ? [{ label: String(frame.label).slice(0, 100), coverage: Math.max(frame.width / vp.width, frame.height / vp.height), bleeds: [frame.x <= 1 && 'left', frame.y <= 1 && 'top', vp.width - frame.x - frame.width <= 1 && 'right', vp.height - frame.y - frame.height <= 1 && 'bottom'].filter(Boolean) }] : [], violations }
    } catch (error) {
      return unavailable(`Browser verification could not complete: ${error?.message || String(error)}`)
    } finally { await browser?.close().catch(() => {}) }
  })()
  let timer
  const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(unavailable(`Browser verification exceeded timeoutMs=${timeoutMs}.`)), timeoutMs) })
  const result = await Promise.race([task, timeout])
  clearTimeout(timer)
  if (result.unavailable) await browser?.close().catch(() => {})
  return result
}

export async function verifyTarget(target, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 15000
  if (/^https?:\/\//.test(target)) return browserVerify(target, { timeoutMs, selector: options.selector ?? null })
  try { return staticVerify(target, await readFile(resolve(target), 'utf8')) }
  catch (error) { return { ok: false, target, mode: 'static', stages: [], violations: [violation('input.unreadable', `Could not read target file: ${error?.message || String(error)}`)] } }
}

export default verifyTarget
