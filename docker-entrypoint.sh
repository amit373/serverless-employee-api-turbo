#!/bin/sh
set -e

# Create symlinks for @packages/* in node_modules so they can be resolved
# This is needed because volumes override the build-time symlinks
cd /app
mkdir -p node_modules/@packages
ln -sf ../../packages/constants node_modules/@packages/constants 2>/dev/null || true
ln -sf ../../packages/config node_modules/@packages/config 2>/dev/null || true
ln -sf ../../packages/utils node_modules/@packages/utils 2>/dev/null || true
ln -sf ../../packages/logger node_modules/@packages/logger 2>/dev/null || true
ln -sf ../../packages/errors node_modules/@packages/errors 2>/dev/null || true
ln -sf ../../packages/validators node_modules/@packages/validators 2>/dev/null || true
ln -sf ../../packages/db node_modules/@packages/db 2>/dev/null || true
ln -sf ../../packages/middlewares node_modules/@packages/middlewares 2>/dev/null || true

# Change to app directory before executing command
cd /app/apps/ecommerce-api

# Execute the original command
exec "$@"
