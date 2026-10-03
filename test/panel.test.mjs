import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

test('plugin requests the Codex home path for its local stdio server', async () => {
  const manifest = JSON.parse(await readFile('plugins/codex-performance-profiler/mcp.json', 'utf8'));
  assert.deepEqual(manifest.mcpServers['panel-probe'].env_vars, ['CODEX_HOME']);
});

test('stdio MCP App advertises global and thread entrypoints and serves a static fullscreen view', async () => {
  const client = new Client({ name: 'p0-panel-test', version: '1.0.0' });
  const serverPath = process.env.PANEL_SERVER_PATH ?? 'plugins/codex-performance-profiler/dist/server.mjs';
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.equal(tools.length, 2);
    const opener = tools.find((tool) => tool.name === 'profiler.open');
    assert.ok(opener);
    assert.ok(tools.some((tool) => tool.name === 'profiler.sourceProbe'));
    assert.deepEqual(opener._meta?.['openai/ui']?.entrypoints, [{ type: 'global' }, { type: 'thread' }]);
    const result = await client.callTool({ name: 'profiler.open', arguments: {} });
    assert.equal(result.isError, undefined);
    const source = await client.callTool({ name: 'profiler.sourceProbe', arguments: {} });
    assert.deepEqual(source.structuredContent, {
      probe_version: 2, thread_context: 'unavailable', rollout_match: 'unavailable',
    });
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

test('bundled inline script parses without HTML replacement expansion', async () => {
  const html = await readFile('plugins/codex-performance-profiler/dist/panel.html', 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.equal(html.match(/<!doctype html>/gi)?.length, 1);
  assert.doesNotThrow(() => new vm.Script(script));
});

test('stdio MCP tool receives threadId metadata and returns only a sanitized matching summary', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'profiler-mcp-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const threadId = 'abcdef12-3456-7890-abcd-ef1234567890';
  const day = join(home, 'sessions', '2026', '10', '02');
  await mkdir(day, { recursive: true });
  await writeFile(join(day, `rollout-${threadId}.jsonl`), [
    { type: 'session_meta', payload: { id: threadId, cwd: 'PRIVATE_PATH' } },
    { type: 'event_msg', payload: { type: 'task_started', turn_id: 'PRIVATE_TURN', started_at: 1_700_000_000 } },
    { type: 'event_msg', payload: { type: 'task_complete', turn_id: 'PRIVATE_TURN', completed_at: 1_700_000_001 } },
  ].map((row) => JSON.stringify(row)).join('\n'));
  const client = new Client({ name: 'p0-context-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['plugins/codex-performance-profiler/dist/server.mjs'],
    env: { ...process.env, CODEX_HOME: home },
  });
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: 'profiler.sourceProbe', arguments: {}, _meta: { threadId } });
    assert.equal(result.structuredContent?.rollout_match, 'verified');
    assert.equal(result.structuredContent?.summary?.turn?.wall_duration_ms?.value, 1_000);
    for (const forbidden of [threadId, 'PRIVATE_']) {
      assert.ok(!JSON.stringify(result).includes(forbidden));
    }
  } finally {
    await client.close();
  }
});
