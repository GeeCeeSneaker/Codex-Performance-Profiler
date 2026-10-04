import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

test('plugin MCP manifest uses only fields accepted by the tested Desktop loader', async () => {
  const manifest = JSON.parse(await readFile('plugins/codex-performance-profiler/mcp.json', 'utf8'));
  assert.deepEqual(Object.keys(manifest.mcpServers['panel-probe']).sort(), ['args', 'command', 'cwd', 'type']);
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
    assert.deepEqual(result.structuredContent, {
      probe_version: 2, thread_context: 'unavailable', rollout_match: 'unavailable',
    });
    const source = await client.callTool({ name: 'profiler.sourceProbe', arguments: {} });
    assert.deepEqual(source.structuredContent, {
      probe_version: 2, thread_context: 'unavailable', rollout_match: 'unavailable',
    });
    const resource = await client.readResource({ uri: 'ui://codex-performance-profiler/p0-panel' });
    assert.equal(resource.contents[0].mimeType, 'text/html;profile=mcp-app');
    assert.deepEqual(resource.contents[0]._meta?.['openai/ui']?.availableDisplayModes, ['fullscreen']);
    assert.match(resource.contents[0].text, /Profiler panel probe/);
    assert.match(resource.contents[0].text, /MCP App host handshake succeeded/);
    assert.match(resource.contents[0].text, /Refresh snapshot/);
    assert.match(resource.contents[0].text, /callServerTool/);
    assert.doesNotMatch(resource.contents[0].text, /CODEX_HOME|thread_id|PRIVATE_/);
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
    const opened = await client.callTool({ name: 'profiler.open', arguments: {}, _meta: { threadId } });
    assert.equal(opened.structuredContent?.rollout_match, 'verified');
    assert.equal(opened.structuredContent?.summary?.turn?.wall_duration_ms?.value, 1_000);
    for (const forbidden of [threadId, 'PRIVATE_']) {
      assert.ok(!JSON.stringify(result).includes(forbidden));
      assert.ok(!JSON.stringify(opened).includes(forbidden));
    }
  } finally {
    await client.close();
  }
});

test('installed bundle locates its Codex home without an inherited CODEX_HOME variable', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'profiler-installed-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  const dist = join(home, 'plugins', 'cache', 'local-marketplace', 'profiler', 'candidate', 'dist');
  const day = join(home, 'sessions', '2026', '10', '03');
  await mkdir(dist, { recursive: true });
  await mkdir(day, { recursive: true });
  await copyFile('plugins/codex-performance-profiler/dist/server.mjs', join(dist, 'server.mjs'));
  await copyFile('plugins/codex-performance-profiler/dist/panel.html', join(dist, 'panel.html'));
  const threadId = 'abcdef12-3456-7890-abcd-ef1234567890';
  await writeFile(join(day, `rollout-${threadId}.jsonl`), [
    { type: 'session_meta', payload: { id: threadId, cwd: 'PRIVATE_PATH' } },
    { type: 'event_msg', payload: { type: 'task_started', turn_id: 'PRIVATE_TURN', started_at: 1_700_000_000 } },
    { type: 'event_msg', payload: { type: 'task_complete', turn_id: 'PRIVATE_TURN', completed_at: 1_700_000_001 } },
  ].map((row) => JSON.stringify(row)).join('\n'));
  const { CODEX_HOME: _unused, ...withoutCodexHome } = process.env;
  const client = new Client({ name: 'p0-installed-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(dist, 'server.mjs')],
    env: withoutCodexHome,
  });
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: 'profiler.sourceProbe', arguments: {}, _meta: { threadId } });
    assert.equal(result.structuredContent?.rollout_match, 'verified');
    assert.equal(result.structuredContent?.summary?.turn?.wall_duration_ms?.value, 1_000);
    assert.ok(!JSON.stringify(result).includes('PRIVATE_'));
  } finally {
    await client.close();
  }
});
