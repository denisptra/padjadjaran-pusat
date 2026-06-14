# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies needed for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

RUN npm run build
# Compile the seed file so it can be run in production without ts-node
RUN npx tsc prisma/seed.ts --target es2020 --module commonjs --moduleResolution node --outDir dist/prisma

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy generated Prisma Client and built application
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/prisma ./dist/prisma

EXPOSE 5001

# Run migrations/db push first, then start the server
CMD ["sh", "-c", "npx prisma db push && node dist/main"]
