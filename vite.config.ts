import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vercel from 'vite-plugin-vercel'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import fs from 'fs'
import type { IncomingMessage, ClientRequest } from 'http'

function copyRobotsPlugin() {
  return {
    name: 'copy-robots',
    writeBundle() {
      try {
        const robotsTxt = fs.readFileSync('public/robots.txt', 'utf-8')
        fs.writeFileSync('dist/robots.txt', robotsTxt)
      } catch (error) {
        console.error('Error copying robots.txt:', error)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const sentryDsn = env.VITE_SENTRY_DSN || 'https://dummy@sentry.io/dummy'
  const [host, projectId] = sentryDsn.split('@')[1].split('/')

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      vercel(),
      copyRobotsPlugin(),
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: 'uaproject',
        project: 'frontend',
        telemetry: false,
      }),
    ],
    vercel: {},
    optimizeDeps: {
      include: ['marked', '@octokit/rest', 'vue'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        vue: 'vue/dist/vue.esm-bundler.js',
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.md', '.mdx'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/aphrodite': {
          target: env.VITE_APHRODITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/aphrodite/, ''),
        },
        '/plan': {
          target: env.VITE_PLAN_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/plan/, ''),
        },
        '/anaya': {
          target: env.VITE_ANAYA_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/anaya/, ''),
        },
        '/sentry': {
          target: `https://${host}`,
          changeOrigin: true,
          secure: true,
          ws: true,
          xfwd: true,
          rewrite: (path) => {
            path = path.replace(/^\/sentry/, `/api/${projectId}/envelope/`)
            return path
          },
          onProxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
            console.log('Proxy request to Sentry:', req.url)
            console.log('Request headers:', req.headers)

            Object.keys(req.headers).forEach((key) => {
              const headerValue = req.headers[key]
              if (headerValue) {
                proxyReq.setHeader(key, headerValue)
              }
            })

            if (!proxyReq.getHeader('origin')) {
              proxyReq.setHeader('origin', 'http://localhost:8100')
            }
          },
          onProxyRes: (proxyRes: IncomingMessage) => {
            console.log('Proxy response from Sentry:', proxyRes.statusCode)
            console.log('Response headers:', proxyRes.headers)

            Object.assign(proxyRes.headers, {
              'Access-Control-Allow-Origin': 'http://localhost:8100',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Credentials': 'true',
            })
          },
        },
        '/catwalk': {
          target: 'https://catwalk.uaproject.net',
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/catwalk/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              if (req.url && !req.url.includes('/stats/')) {
                const token = process.env.VITE_CATWALK_TOKEN || loadEnv(mode, process.cwd(), '').VITE_CATWALK_TOKEN;
                if (token) {
                  proxyReq.setHeader('Authorization', `Bearer ${token}`);
                }
              }
            });
          },
        },
      },
      hmr: {
        protocol: 'ws',
        host: '0.0.0.0',
        port: 8100,
      },
      cors: {
        origin: ['http://localhost:8100', 'https://discord.com', env.VITE_SENTRY_DSN],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      },
      allowedHosts: ['api.uaproject.net'],
    },
    build: {
      sourcemap: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor'
              }
              if (id.includes('echarts')) {
                return 'charts'
              }
              if (id.includes('@sentry')) {
                return 'sentry'
              }
              if (id.includes('marked') || id.includes('@octokit')) {
                return 'markdown'
              }
              return 'deps'
            }
            if (id.includes('src/views/')) {
              return 'views'
            }
            if (id.includes('src/components/home/')) {
              return 'home'
            }
            if (id.includes('src/components/ui/')) {
              return 'home'
            }
          },
        },
      },
      chunkSizeWarningLimit: 500,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
        },
        format: {
          comments: false,
        },
        mangle: {
          safari10: true,
        },
      },
      reportCompressedSize: false,
    },
    css: {
      postcss: {
        plugins: [],
      },
    },
    configureServer(server: { middlewares: { use: (arg0: string, arg1: (req: unknown, res: { statusCode: number; end: (data: string) => void }) => void) => void } }) {
      server.middlewares.use('/__open-in-editor', (req, res) => {
        res.statusCode = 403
        res.end('Editor access is disabled')
      })
    }
  }
})
