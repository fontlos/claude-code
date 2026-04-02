#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';

/**
 * Load environment variables from .env files
 * Priority:
 * 1. Current directory: ./.env
 * 2. User global config: ~/.claude/.env (Linux/Mac) or %USERPROFILE%\.claude\.env (Windows)
 */
function loadEnvFiles() {
  const home = homedir();
  const isWindows = process.platform === 'win32';

  // Define config paths
  const globalEnvPath = isWindows
    ? resolve(home, '.claude', '.env')
    : resolve(home, '.claude', '.env');

  const localEnvPath = resolve(process.cwd(), '.env');

  // Try to load from each location
  const envPaths = [localEnvPath, globalEnvPath];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf8');
        const lines = content.split('\n');

        for (const line of lines) {
          // Simple .env parsing - supports KEY=VALUE
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = match[2] || '';

            // Remove surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }

            // Only set if not already defined (allow system env vars to override)
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
        console.error(`Loaded environment from: ${envPath}`);
        break; // Stop after first found .env file
      } catch (error) {
        console.error(`Error loading .env file at ${envPath}:`, error.message);
      }
    }
  }

  // Check if required environment variables are set
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.error('Warning: Neither ANTHROPIC_API_KEY nor ANTHROPIC_AUTH_TOKEN is set.');
    console.error('Please create a .env file in current directory or ~/.claude/.env');
    console.error('See .env.example for required variables.');
  }
}

/**
 * Get the path to the appropriate TypeScript entry point
 * based on CLAUDE_CODE_FORCE_RECOVERY_CLI environment variable
 */
function getEntryPoint() {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Check if force recovery CLI is requested
  if (process.env.CLAUDE_CODE_FORCE_RECOVERY_CLI === '1') {
    return join(__dirname, '..', 'src', 'localRecoveryCli.ts');
  } else {
    return join(__dirname, '..', 'src', 'entrypoints', 'cli.tsx');
  }
}

/**
 * Get the project root directory (where package.json is located)
 */
function getProjectRoot() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return join(__dirname, '..');
}

/**
 * Main execution
 */
function main() {
  // Load environment variables
  loadEnvFiles();

  // Get the entry point and project root
  const entryPoint = getEntryPoint();
  const projectRoot = getProjectRoot();

  // Prepare arguments
  const args = process.argv.slice(2);

  // Spawn bun to run the TypeScript entry point
  // Use --preload with absolute path to ensure preload.ts is loaded
  const preloadPath = join(projectRoot, 'preload.ts');
  const bunArgs = ['run', '--preload', preloadPath, entryPoint, ...args];

  const child = spawn('bun', bunArgs, {
    stdio: 'inherit',
    windowsHide: true
    // No cwd set - run in current working directory
  });

  child.on('error', (error) => {
    console.error('Failed to start bun:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Run main
main();