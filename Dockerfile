ARG NODE_VERSION=22.12.0-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Env file is a BuildKit secret (not a layer, not pushed). Next loads
# .env.production for this build only. BuildKit does not include secret
# contents in its cache key, so BUILD_ENV_SHA must change when the env changes.
ARG BUILD_ENV_SHA=local
RUN --mount=type=secret,id=web_env,target=/run/secrets/web_env \
    test -n "${BUILD_ENV_SHA}" \
    && cp /run/secrets/web_env .env.production \
    && npm run build \
    && rm -f .env .env.local .env.production .env.development \
      .env.development.local .env.production.local \
    && find .next -name '.env*' -delete

FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
