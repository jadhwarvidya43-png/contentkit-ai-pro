FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json turbo.json ./
# Copy workspace packages
COPY apps/server ./apps/server/
COPY packages ./packages/

# Install dependencies (only for server scope to optimize)
RUN npm ci

# We don't need to build Next.js here since this container is only for the server.
# If the server had typescript, we would run `npx turbo run build --filter=@contentkit/server...`

FROM node:20-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy dependencies and source from builder
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/apps/server ./apps/server/
COPY --from=builder /app/packages ./packages/

# Set env to production
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
WORKDIR /app/apps/server
CMD ["node", "src/server.js"]
