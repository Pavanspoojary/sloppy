import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')
const kitPath = path.resolve(rootDir, 'packages/kit')
const assetsPath = path.resolve(rootDir, 'assets')
const patternsPath = path.resolve(rootDir, 'patterns')

export default defineConfig({
  plugins: [react()],
  build: { target: 'es2022' },
  server: {
    host: '127.0.0.1',
    port: 1355,
    fs: { allow: ['../..'] }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^(\.\.\/)+kit$/, replacement: kitPath },
      { find: /^(\.\.\/)+kit\/(.*)$/, replacement: `${kitPath}/$2` },
      { find: /^(\.\.\/)+assets\/(.*)$/, replacement: `${assetsPath}/$2` },
      { find: /^(\.\.\/)+examples\/(.*)$/, replacement: `${patternsPath}/$2` },
      { find: '@sloppy-ai/kit', replacement: kitPath },
      { find: '@sloppy/kit', replacement: kitPath },
      { find: '@sloppy-ai/core', replacement: path.resolve(rootDir, 'packages/core/dist/index.js') },
      { find: '@sloppy/core', replacement: path.resolve(rootDir, 'packages/core/dist/index.js') }
    ]
  }
})
