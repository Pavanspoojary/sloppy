#!/usr/bin/env node
import { runServer, createSloppyServer } from '../dist/server.js';

if (process.argv.includes('--test')) {
  try {
    const server = createSloppyServer();
    if (server) {
      console.log('Sloppy MCP server initialized successfully.');
      process.exit(0);
    }
  } catch (err) {
    console.error('Sloppy MCP test failed:', err);
    process.exit(1);
  }
} else {
  runServer().catch((error) => {
    console.error('Fatal error in Sloppy MCP server:', error);
    process.exit(1);
  });
}
