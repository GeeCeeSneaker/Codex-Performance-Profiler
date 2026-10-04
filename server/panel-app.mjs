import { App } from '@modelcontextprotocol/ext-apps';

const status = document.getElementById('host-status');
const sourceStatus = document.getElementById('source-status');
const sourceButton = document.getElementById('source-probe');
const app = new App({ name: 'Profiler Panel Probe', version: '0.2.5' });

sourceButton.addEventListener('click', async () => {
  sourceButton.disabled = true;
  sourceStatus.textContent = 'Checking the current thread…';
  try {
    const result = await app.callServerTool({ name: 'profiler.sourceProbe', arguments: {} });
    const probe = result.structuredContent;
    if (result.isError || !probe || typeof probe !== 'object') {
      sourceStatus.textContent = 'The host did not return a source summary.';
      return;
    }
    const lines = [
      `Thread context: ${probe.thread_context ?? 'unavailable'}`,
      `Rollout match: ${probe.rollout_match ?? 'unavailable'}`,
    ];
    if (probe.rollout_match === 'verified' && probe.summary?.turn) {
      const turn = probe.summary.turn;
      const duration = turn.wall_duration_ms;
      lines.push(`Latest completed turn: ${duration?.value ?? 'unavailable'} ms (${duration?.quality ?? 'unavailable'})`);
      lines.push(`Tool calls: ${turn.tool_spans?.length ?? 0}`);
      lines.push(`Input/output tokens: ${turn.usage?.input_tokens ?? 'unavailable'} / ${turn.usage?.output_tokens ?? 'unavailable'} (${turn.usage?.quality ?? 'unavailable'})`);
    }
    sourceStatus.textContent = lines.join('\n');
  } catch {
    sourceStatus.textContent = 'The panel could not call the source probe.';
  } finally {
    sourceButton.disabled = false;
  }
});

app.ontoolresult = () => {
  status.textContent = 'MCP App opened by the host';
};

app.connect().then(() => {
  sourceButton.disabled = false;
  if (status.textContent === 'Waiting for MCP App host handshake') {
    status.textContent = 'MCP App host handshake succeeded';
  }
}).catch(() => {
  status.textContent = 'MCP App host handshake unavailable';
});
