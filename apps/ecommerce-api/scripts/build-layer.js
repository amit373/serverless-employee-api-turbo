#!/usr/bin/env node

/**
 * Build script for Lambda Layer
 * Installs dependencies in the layer/nodejs directory
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const layerPath = path.join(__dirname, '..', 'layer', 'nodejs');
const packageJsonPath = path.join(layerPath, 'package.json');

console.log('Building Lambda Layer...');
console.log(`Layer path: ${layerPath}`);

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: ${packageJsonPath} not found!`);
  process.exit(1);
}

try {
  // Change to layer directory and install dependencies
  console.log('Installing layer dependencies...');
  execSync('npm install --production', {
    cwd: layerPath,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  console.log('✅ Layer built successfully!');
  console.log(`Dependencies installed in: ${layerPath}/node_modules`);
} catch (error) {
  console.error('❌ Error building layer:', error.message);
  process.exit(1);
}
