import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vercel from 'vite-plugin-vercel'
import generateSitemap from 'vite-plugin-sitemap'
import fs from 'fs'

function copyRobotsPlugin() {
  return {
    name: 'copy-robots',
    buildEnd() {
      try {
        if (!fs.existsSync('dist')) {
          fs.mkdirSync('dist', { recursive: true })
        }
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

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      vercel(),
      copyRobotsPlugin(), // Must run before sitemap plugin
      generateSitemap({
        hostname: 'https://mysterria.net',
        robots: [
          {
            userAgent: '*',
            allow: '/',
          }
        ]
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
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/plan': {
          target: env.VITE_PLAN_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/plan/, ''),
        },
        '/catwalk': {
          target: 'https://catwalk.mysterria.net',
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
        origin: ['http://localhost:8100', 'https://discord.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      },
      allowedHosts: ['api.mysterria.net'],
    },
    build: {
      sourcemap: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
        },
        output: {
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
    }
  }
})
