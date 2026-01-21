# Multi-stage build for Serverless E-commerce API
FROM node:20-alpine AS base

# Install dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy package.json files for all packages
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# Align npm with repo lockfile to avoid workspace mismatch errors
RUN npm install -g npm@8.19.2

# Install root dependencies (npm ci is too strict with current lockfile)
RUN npm install

# Copy source files
COPY . .

# Avoid workspace name collision checks during build steps
ENV NPM_CONFIG_WORKSPACES=false

# Build packages directly using local TypeScript binary
RUN set -e; \
    cd packages/constants && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../config && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../utils && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../logger && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../errors && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../validators && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../db && node /app/node_modules/typescript/bin/tsc --skipLibCheck; \
    cd ../middlewares && node /app/node_modules/typescript/bin/tsc --skipLibCheck

# Build application using root TypeScript binary
RUN node /app/node_modules/typescript/bin/tsc -p apps/ecommerce-api/tsconfig.json

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy built packages and app
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps ./apps
COPY --from=base /app/node_modules ./node_modules
# Copy root tsconfig.json to fix extends path warnings
COPY --from=base /app/tsconfig.json ./tsconfig.json

# Drop workspace metadata to avoid npm workspace resolution at runtime
RUN node -e "const fs=require('fs');const pkgPath='/app/package.json';const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8'));delete pkg.workspaces;fs.writeFileSync(pkgPath,JSON.stringify(pkg,null,2));"

# Create symlinks for @packages/* in node_modules so they can be resolved
RUN cd /app && \
    mkdir -p node_modules/@packages && \
    ln -sf ../../packages/constants node_modules/@packages/constants && \
    ln -sf ../../packages/config node_modules/@packages/config && \
    ln -sf ../../packages/utils node_modules/@packages/utils && \
    ln -sf ../../packages/logger node_modules/@packages/logger && \
    ln -sf ../../packages/errors node_modules/@packages/errors && \
    ln -sf ../../packages/validators node_modules/@packages/validators && \
    ln -sf ../../packages/db node_modules/@packages/db && \
    ln -sf ../../packages/middlewares node_modules/@packages/middlewares

# Set working directory to app
WORKDIR /app/apps/ecommerce-api

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint to create symlinks at runtime
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Start serverless offline using root-installed binary
CMD ["node", "/app/node_modules/serverless/bin/serverless.js", "offline", "start"]
