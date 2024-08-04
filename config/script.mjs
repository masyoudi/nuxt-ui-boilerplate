// @ts-check
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config as loadConfig } from 'dotenv';

/**
 * Add script runner into package.json file
 * @param {string} file - String of path package.json file
 */
const updateScript = (file) => {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const env = fileURLToPath(new URL('.env', import.meta.url));
  const { parsed } = loadConfig({ path: env, override: true });

  typeof parsed === 'undefined' ? console.warn('Failed parse .env in ', env) : void 0;

  const port = parsed?.PORT || 4500;
  const host = parsed?.HOST || '0.0.0.0';
  const start = `NODE_ENV=production PORT=${port} HOST=${host} node index.mjs`;
  const configPath = fileURLToPath(new URL('../.output/server/config', import.meta.url));

  if (!existsSync(configPath)) {
    mkdirSync(configPath);
  }

  writeFileSync(configPath.concat('/.env'), readFileSync(env, 'utf8'));

  data.scripts = { start: start };
  writeFileSync(file, JSON.stringify(data, null, 2));
};

(() => {
  try {
    const pkg = fileURLToPath(new URL('../.output/server/package.json', import.meta.url));
    if (existsSync(pkg)) {
      updateScript(pkg);
      return;
    }

    console.error('Failed to find file: ', pkg);
  } catch {
    console.error('Failed to export script runner');
  }
})();
