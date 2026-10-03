import { App } from '@modelcontextprotocol/ext-apps';

const status = document.getElementById('host-status');
const app = new App({ name: 'Profiler Panel Probe', version: '0.2.3' });

app.ontoolresult = () => {
  status.textContent = 'MCP App opened by the host';
};

app.connect().then(() => {
  if (status.textContent === 'Waiting for MCP App host handshake') {
    status.textContent = 'MCP App host handshake succeeded';
  }
}).catch(() => {
  status.textContent = 'MCP App host handshake unavailable';
});
