import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Dev-only plugin that adds a POST endpoint to persist the BG3 save file.
// This plugin produces zero output in production builds.
function bg3SavePlugin() {
  return {
    name: 'bg3-save',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/bg3-save') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const savePath = path.resolve(__dirname, 'public/bg3-save.json')
              fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: false, error: e.message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}

// Dev-only plugin that persists game-competition data to public/game-competition/*.json.
// Same pattern as bg3SavePlugin above — no-op in production builds.
const GAME_DATA_FILES = new Set(['games', 'competitions', 'consoles', 'years'])

function gameDataSavePlugin() {
  return {
    name: 'game-data-save',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.method === 'POST' && req.url.match(/^\/api\/save-data\/([a-z]+)$/)
        const file = match && match[1]
        if (!file || !GAME_DATA_FILES.has(file)) return next()

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            const savePath = path.resolve(__dirname, 'public/game-competition', `${file}.json`)
            fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false, error: e.message }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    bg3SavePlugin(),
    gameDataSavePlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})