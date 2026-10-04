import { App } from '@modelcontextprotocol/ext-apps';

const status = document.getElementById('host-status');
const sourceStatus = document.getElementById('source-status');
const sourceButton = document.getElementById('source-probe');
const app = new App({ name: 'Profiler Panel Probe', version: '0.2.8' });
let refreshTimer;

function usageText(usage) {
  return `${usage?.input_tokens ?? 'unavailable'} / ${usage?.output_tokens ?? 'unavailable'} (${usage?.quality ?? 'unavailable'})`;
}

function showProbe(probe) {
  if (!probe || typeof probe !== 'object' || probe.probe_version !== 3) {
    sourceStatus.textContent = 'The host did not return a source summary.';
    return;
  }
  if (probe.rollout_match === 'not_found') {
    sourceStatus.textContent = 'This view is not linked to a saved Codex chat. Open the profiler from the chat you want to inspect.';
    return;
  }
  if (probe.rollout_match === 'source_changed') {
    sourceStatus.textContent = 'The saved chat file changed. Refresh to check it again.';
    return;
  }
  const lines = [
    `Thread context: ${probe.thread_context ?? 'unavailable'}`,
    `Rollout match: ${probe.rollout_match ?? 'unavailable'}`,
  ];
  if (probe.rollout_match === 'verified') {
    const completed = probe.progress?.latest_completed_turn;
    const active = probe.progress?.active_turn;
    if (completed) {
      lines.push(`Latest completed turn: ${completed.wall_duration_ms?.value ?? 'unavailable'} ms (${completed.wall_duration_ms?.quality ?? 'unavailable'})`);
      lines.push(`Tracked tool completions: ${completed.completed_tool_calls?.value ?? 'unavailable'} (${completed.completed_tool_calls?.quality ?? 'unavailable'})`);
      lines.push(`Input/output tokens: ${usageText(completed.usage)}`);
    }
    lines.push(active ? 'Latest observed turn: running' : 'Latest observed turn: none running');
    if (active) {
      lines.push(`Tracked tool completions in running turn: ${active.completed_tool_calls?.value ?? 'unavailable'} (${active.completed_tool_calls?.quality ?? 'unavailable'})`);
      lines.push(`Running turn input/output tokens: ${usageText(active.usage)}`);
    }
    if (probe.update?.catching_up) lines.push('Reading earlier records; refresh to continue.');
    if (probe.progress?.skipped_records) lines.push('Some records could not be parsed; counts may be incomplete.');
  }
  sourceStatus.textContent = lines.join('\n');
  if (probe.rollout_match === 'verified' && !refreshTimer) {
    refreshTimer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshProgress();
    }, 5000);
  }
}

async function refreshProgress() {
  if (sourceButton.disabled) return;
  sourceButton.disabled = true;
  try {
    const result = await app.callServerTool({ name: 'profiler.progressProbe', arguments: {} });
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
}

sourceButton.addEventListener('click', refreshProgress);

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
