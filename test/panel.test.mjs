import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

test('stdio MCP App advertises a thread entrypoint and serves a static fullscreen view', async () => {
  const client = new Client({ name: 'p0-panel-test', version: '1.0.0' });
  const serverPath = process.env.PANEL_SERVER_PATH ?? 'plugins/codex-performance-profiler/dist/server.mjs';
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.equal(tools.length, 1);
    assert.equal(tools[0].name, 'profiler.open');
    assert.deepEqual(tools[0]._meta?.['openai/ui']?.entrypoints, [{ type: 'thread' }]);
    const result = await client.callTool({ name: 'profiler.open', arguments: {} });
    assert.equal(result.isError, undefined);
    const resource = await client.readResource({ uri: 'ui://codex-performance-profiler/p0-panel' });
    assert.equal(resource.contents[0].mimeType, 'text/html;profile=mcp-app');
    assert.deepEqual(resource.contents[0]._meta?.['openai/ui']?.availableDisplayModes, ['fullscreen']);
    assert.match(resource.contents[0].text, /Profiler panel probe/);
    assert.match(resource.contents[0].text, /MCP App host handshake succeeded/);
    assert.doesNotMatch(resource.contents[0].text, /rollout|CODEX_HOME|thread_id/);
  } finally {
    await client.close();
  }
});
