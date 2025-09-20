# Build stage
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl python3 make g++
WORKDIR /app

# Copy package files 
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies - dev dependencies needed for build
RUN npm ci && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install only runtime dependencies (minimal)
RUN apk add --no-cache openssl libc6-compat

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy production dependencies for standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma

# Copy minimal Prisma CLI for database migrations (only essential files)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines ./node_modules/@prisma/engines

# Copy entrypoint with migration support
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