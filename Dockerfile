# Debian rather than alpine: the build runs sharp-adjacent native deps and the
# fontawesome subset step, neither of which is worth fighting musl for.
FROM node:22-bookworm-slim AS build
WORKDIR /app

# package-lock.json is gitignored in this repo, so a clone (which is what
# Coolify builds from) has no lockfile while a local build does. The glob keeps
# the COPY from failing when it is absent, and npm ci is used only when there is
# a lockfile to honour. Committing the lockfile would make these builds
# reproducible and noticeably faster - worth doing, but that is a repo decision.
COPY package.json ./
COPY package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

COPY . .

# Baked into the bundle at build time, so it has to be a build arg rather than a
# runtime env var. It is a Discord snowflake, not a secret.
ARG VITE_DISCORD_GUILD_ID=""
ENV VITE_DISCORD_GUILD_ID=$VITE_DISCORD_GUILD_ID

RUN npm run build


FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# api/meta-proxy.ts looks article and service copy up here instead of going out
# through the public origin and being proxied back in. See the comment beside
# apiBase in that file.
ENV META_API_BASE=https://api.mysterria.net

# Only express + tsx, from server/package.json. Installing the root manifest
# here instead would drag in the whole build toolchain even with --omit=dev,
# because this project keeps vite, sentry and echarts in `dependencies`.
COPY server/package.json ./server/package.json
RUN cd server && npm install --no-audit --no-fund && npm cache clean --force

# Not for its dependencies - nothing is installed from it here - but for its
# `"type": "module"`. It is the nearest manifest governing /app/api, and without
# it those files load as CommonJS, so `import handler from '../api/x.js'` binds
# undefined and every rewrite below dies with "h is not a function".
COPY package.json ./package.json

# server/ runs the api/ handlers straight from TypeScript under tsx, so no
# compile step and no chance of the ESM/JSON-require resolution in
# api/meta-proxy.ts breaking in a bundler. That handler require()s thirteen JSON
# files from src/assets/sources via a path relative to itself, so api/ and
# src/assets/sources/ have to keep their layout relative to each other.
COPY server ./server
COPY api ./api
COPY src/assets/sources ./src/assets/sources
COPY --from=build /app/dist ./dist

EXPOSE 3000

# tsx and express resolve from server/node_modules - Node walks up from
# server/index.ts, so nothing needs to be installed at /app. Exec form, to keep
# node as PID 1 and let Docker signals reach it.
CMD ["./server/node_modules/.bin/tsx", "server/index.ts"]
