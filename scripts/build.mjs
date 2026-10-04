import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const pluginDist = 'plugins/codex-performance-profiler/dist';
await mkdir(pluginDist, { recursive: true });

const app = await build({
  entryPoints: ['server/panel-app.mjs'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2022',
  write: false,
  minify: true,
});
const appCode = app.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = (await readFile('server/panel.html', 'utf8')).replace('<!-- APP_SCRIPT -->', () => `<script>${appCode}</script>`);
await writeFile(`${pluginDist}/panel.html`, html);

await build({
  entryPoints: ['server/panel-server.mjs'],
  outfile: `${pluginDist}/server.mjs`,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  packages: 'bundle',
  minify: true,
});
