#!/usr/bin/env node
import { runCli } from '../dist/index.js';

const args = process.argv.slice(2);
runCli(args).catch((err) => {
  console.error('[FATAL ERROR]', err?.message || err);
  process.exit(2);
});
