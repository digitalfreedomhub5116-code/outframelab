import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import generateAwbHandler from './api/generate-awb.js'
import shiprocketWebhookHandler from './api/shiprocket-webhook.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Expose env vars to serverless handler in local dev
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-generate-awb-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url === '/api/generate-awb' || req.url.startsWith('/api/generate-awb?'))) {
              try {
                await generateAwbHandler(req, res)
              } catch (err) {
                console.error('Error in Vite API middleware:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            } else if (req.url && (req.url === '/api/shiprocket-webhook' || req.url.startsWith('/api/shiprocket-webhook?'))) {
              try {
                await shiprocketWebhookHandler(req, res)
              } catch (err) {
                console.error('Error in Shiprocket webhook middleware:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            } else {
              next()
            }
          })
        },
      },
    ],
  }
})
