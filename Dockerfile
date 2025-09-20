# Build stage
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl openssl-dev python3 make g++
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate && npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app and dependencies from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Setup permissions and directories
RUN chmod +x ./docker-entrypoint.sh && \
    mkdir -p /app/data && \
    chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]