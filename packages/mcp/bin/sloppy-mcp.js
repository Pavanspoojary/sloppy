#!/usr/bin/env node
import { runServer, createSloppyServer } from '../dist/server.js';

const legacyTools = process.argv.includes('--legacy-tools') || process.env.SLOPPY_LEGACY_TOOLS === '1';

if (process.argv.includes('--test')) {
  try {
    const server = createSloppyServer({ legacyTools });
    if (server) {
      console.log('Sloppy MCP server initialized successfully.');
      process.exit(0);
    }
  } catch (err) {
    console.error('Sloppy MCP test failed:', err);
    process.exit(1);
  }
} else {
  runServer({ legacyTools }).catch((error) => {
    console.error('Fatal error in Sloppy MCP server:', error);
    process.exit(1);
  });
}
