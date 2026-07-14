import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vercel from 'vite-plugin-vercel'
import generateSitemap from 'vite-plugin-sitemap'
import fs from 'fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, ViteDevServer } from 'vite'

// Mirrors the production guard in api/catwalk-proxy.ts: the dev server proxies
// /catwalk/* straight to the upstream service (bypassing that Vercel function),
// so the same per-player/full-roster paths need to be blocked here too.
function blockSensitiveCatwalkPathsPlugin() {
  return {
    name: 'block-sensitive-catwalk-paths',
    configureServer(server: ViteDevServer) {
      const middleware: Connect.NextHandleFunction = (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || '';
        if (url.startsWith('/catwalk/pathway/everyone') || url.startsWith('/catwalk/pathway/single/')) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Forbidden', details: 'Use /api/beyonder-stats or /api/beyonder-self instead.' }));
          return;
        }
        if (url.startsWith('/catwalk/balance/')) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Forbidden', details: 'Use /api/balance-report instead.' }));
          return;
        }
        next();
      };
      server.middlewares.use(middleware);
    },
  };
}

// Dev mirror of api/balance-report.ts: /api/* proxies to the main backend in dev,
// which has no such endpoint, so the permission-gated catwalk proxy lives here.
// Registered before the /api proxy (configureServer middlewares run first).
function balanceReportDevEndpointPlugin(env: Record<string, string>) {
  return {
    name: 'dev-balance-report-endpoint',
    configureServer(server: ViteDevServer) {
      const middleware: Connect.NextHandleFunction = (req: IncomingMessage, res: ServerResponse, next) => {
        if (!(req.url || '').startsWith('/api/balance-report')) {
          next();
          return;
        }
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        (async () => {
          const authHeader = req.headers.authorization;
          if (!authHeader) return send(401, { success: false, message: 'Authentication required' });

          const mainApi = env.VITE_API_URL || 'http://localhost:8080';
          const profileResponse = await fetch(`${mainApi}/api/user/profile`, {
            headers: { Authorization: authHeader, Accept: 'application/json' },
          });
          if (!profileResponse.ok) return send(401, { success: false, message: 'Invalid or expired session' });

          const profile = (await profileResponse.json()) as { permissions?: string[] };
          const permissions = (profile.permissions || []).map((p) => p.replace(/^PERM_/, ''));
          if (!permissions.includes('ADMIN') && !permissions.includes('BALANCE:MANAGE')) {
            return send(403, { success: false, message: 'Missing BALANCE:MANAGE permission' });
          }

          const headers: Record<string, string> = { Accept: 'application/json' };
          const token = process.env.CATWALK_API_TOKEN || env.CATWALK_API_TOKEN;
          if (token) headers.Authorization = `Bearer ${token}`;

          const upstream = await fetch('https://catwalk.mysterria.net/balance/report', { headers });
          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(text);
        })().catch((error) => {
          console.error('Error in dev balance-report endpoint:', error);
          send(502, { success: false, message: 'Failed to reach upstream service' });
        });
      };
      server.middlewares.use(middleware);
    },
  };
}

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
      blockSensitiveCatwalkPathsPlugin(),
      balanceReportDevEndpointPlugin(env),
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
                const token = process.env.CATWALK_API_TOKEN || loadEnv(mode, process.cwd(), '').CATWALK_API_TOKEN;
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
