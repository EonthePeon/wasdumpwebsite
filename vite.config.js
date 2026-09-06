import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
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

// Dev-only: lets the Videos admin page pull recent uploads server-side, so the
// YouTube API key (from .env.local) never reaches the browser. Also saves the
// curated selection to public/videos.json.
function youtubePlugin(apiKey) {
  return {
    name: 'youtube-admin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'GET' && req.url.startsWith('/api/youtube-recent')) {
          if (!apiKey) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false, error: 'YOUTUBE_API_KEY not set — see YOUTUBE_SETUP.md' }))
            return
          }
          try {
            const channelRes = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=@WASDump&key=${apiKey}`
            )
            const channelData = await channelRes.json()
            const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
            if (!uploadsPlaylistId) {
              throw new Error(channelData.error?.message || 'Could not find @WASDump uploads playlist')
            }

            const videosRes = await fetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${uploadsPlaylistId}&key=${apiKey}`
            )
            const videosData = await videosRes.json()
            if (videosData.error) throw new Error(videosData.error.message)

            const videos = (videosData.items || []).map((item) => ({
              videoId: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              date: item.snippet.publishedAt,
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            }))
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, videos }))
          } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false, error: e.message }))
          }
          return
        }

        if (req.method === 'POST' && req.url === '/api/save-videos') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              fs.writeFileSync(path.resolve(__dirname, 'public/videos.json'), JSON.stringify(data, null, 2))
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: false, error: e.message }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// Dev-only: lets the Race Admin page replace the competition timer's background image.
function timerImagePlugin() {
  return {
    name: 'timer-image-upload',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/upload-timer-image') {
          const chunks = []
          req.on('data', chunk => chunks.push(chunk))
          req.on('end', () => {
            try {
              const savePath = path.resolve(__dirname, 'public/assets/images/game.jpg')
              fs.writeFileSync(savePath, Buffer.concat(chunks))
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  return {
    plugins: [
      vue(),
      vueDevTools(),
      bg3SavePlugin(),
      gameDataSavePlugin(),
      youtubePlugin(env.YOUTUBE_API_KEY),
      timerImagePlugin(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
