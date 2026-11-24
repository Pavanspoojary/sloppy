// Headless browser loader with graceful static fallback detection.
// playwright-core is optional: when unavailable, Sloppy gracefully falls back
// to static source-scan multi-width and contrast simulation.

export async function tryLaunch() {
  let chromium;
  try {
    ;({ chromium } = await import('playwright-core'));
  } catch (err) {
    return { browser: null, reason: 'playwright-core not installed' };
  }

  const path = process.env.CHROME_PATH;
  try {
    const browser = await chromium.launch(path ? { executablePath: path } : { channel: 'chrome', headless: true });
    return { browser, reason: null };
  } catch (err) {
    return { browser: null, reason: `Chrome launch failed: ${err?.message || err}` };
  }
}

export async function launch() {
  const result = await tryLaunch();
  if (!result.browser) {
    console.error(`[BROWSER LAUNCH FAILED] ${result.reason}`);
    console.error('Install Google Chrome or install playwright-core: `npm i -D playwright-core`');
    process.exit(2);
  }
  return result.browser;
}
