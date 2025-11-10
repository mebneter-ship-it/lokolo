FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDUejND_sXsE449elOEu67DmYHv9P8CY2o
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lokolo-platform.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=lokolo-platform
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lokolo-platform.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=86009822188
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:86009822188:web:dc701cc0a17f65fe551ec9
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBQtT6_hjIQK_0RP6HkWsSyGQEmen1DcFk

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
