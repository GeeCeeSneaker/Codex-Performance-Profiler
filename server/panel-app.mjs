import { App } from '@modelcontextprotocol/ext-apps';

const status = document.getElementById('host-status');
const sourceStatus = document.getElementById('source-status');
const sourceButton = document.getElementById('source-probe');
const app = new App({ name: 'Profiler Panel Probe', version: '0.2.6' });

function showProbe(probe) {
  if (!probe || typeof probe !== 'object' || probe.probe_version !== 2) {
    sourceStatus.textContent = 'The host did not return a source summary.';
    return;
  }
  if (probe.rollout_match === 'not_found') {
    sourceStatus.textContent = 'This view is not linked to a saved Codex chat. Open the profiler from the chat you want to inspect.';
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
}

sourceButton.addEventListener('click', async () => {
  sourceButton.disabled = true;
  sourceStatus.textContent = 'Checking the current thread…';
  try {
    const result = await app.callServerTool({ name: 'profiler.sourceProbe', arguments: {} });
    if (result.isError) {
      sourceStatus.textContent = 'The host did not return a source summary.';
      return;
    }
    showProbe(result.structuredContent);
  } catch {
    sourceStatus.textContent = 'The panel could not call the source probe.';
  } finally {
    sourceButton.disabled = false;
  }
});

app.ontoolresult = (result) => {
  status.textContent = 'MCP App opened by the host';
  if (!result.isError) showProbe(result.structuredContent);
};

app.connect().then(() => {
  sourceButton.disabled = false;
  if (status.textContent === 'Waiting for MCP App host handshake') {
    status.textContent = 'MCP App host handshake succeeded';
  }
}).catch(() => {
  status.textContent = 'MCP App host handshake unavailable';
});
