import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import { probeCurrentSource } from './current-source.mjs';

const UI_URI = 'ui://codex-performance-profiler/p0-panel';
const html = await readFile(fileURLToPath(new URL('./panel.html', import.meta.url)), 'utf8');
const server = new McpServer({ name: 'codex-performance-profiler-p0', version: '0.2.2' });

registerAppTool(server, 'profiler.open', {
  title: 'Profiler Panel Probe',
  description: 'Open the P0 Codex Desktop panel capability probe; no telemetry is collected.',
  inputSchema: z.object({}),
  _meta: {
    ui: { resourceUri: UI_URI },
    'openai/ui': { entrypoints: [{ type: 'global' }, { type: 'thread' }] },
  },
}, async () => ({
  content: [{ type: 'text', text: 'Profiler panel probe opened. No telemetry was collected.' }],
}));

registerAppResource(server, 'Profiler P0 Panel', UI_URI, {}, async () => ({
  contents: [{
    uri: UI_URI,
    mimeType: RESOURCE_MIME_TYPE,
    text: html,
    _meta: {
      'openai/ui': {
        preferredDisplayMode: 'fullscreen',
        availableDisplayModes: ['fullscreen'],
      },
    },
  }],
}));

server.registerTool('profiler.sourceProbe', {
  title: 'Probe Current Codex Source',
  description: 'Read the current Codex thread rollout once and return a sanitized P0 capability summary. No raw IDs, paths, prompts, commands, or outputs are returned.',
  inputSchema: z.object({}),
  annotations: { readOnlyHint: true },
}, async (_args, context) => {
  const result = await probeCurrentSource(context.mcpReq._meta);
  return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
});

await server.connect(new StdioServerTransport());
