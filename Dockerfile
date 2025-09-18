# Build stage
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl openssl-dev python3 make g++
WORKDIR /app

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies (this will run prisma generate)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client explicitly
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install runtime dependencies including OpenSSL 3.0
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package.json to install dependencies including Prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Install ALL dependencies (including Prisma CLI) for production
# This ensures prisma command is available
RUN npm ci && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma client with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Generate Prisma client in production stage with correct ownership
RUN npx prisma generate && chown -R nextjs:nodejs /app/node_modules/.prisma

# Copy entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./docker-entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]