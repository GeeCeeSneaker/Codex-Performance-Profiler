import { open } from 'node:fs/promises';

const DEFAULT_READ_BYTES = 256 * 1024;
// The observed Desktop rollout has item_completed records above 2 MiB when a
// tool output is embedded. The raw line is held only until projection, never
// returned or persisted by this plugin.
const DEFAULT_LINE_BYTES = 4 * 1024 * 1024;

export class IncrementalRolloutReader {
  #file;
  #project;
  #maxReadBytes;
  #maxLineBytes;
  #offset = 0;
  #pending = Buffer.alloc(0);
  #skipLine = false;
  #identity;

  constructor(file, project, { maxReadBytes = DEFAULT_READ_BYTES, maxLineBytes = DEFAULT_LINE_BYTES } = {}) {
    if (typeof project !== 'function') throw new TypeError('A record projector is required');
    if (!Number.isSafeInteger(maxReadBytes) || maxReadBytes < 1 ||
        !Number.isSafeInteger(maxLineBytes) || maxLineBytes < 1) {
      throw new RangeError('Reader limits must be positive integers');
    }
    this.#file = file;
    this.#project = project;
    this.#maxReadBytes = maxReadBytes;
    this.#maxLineBytes = maxLineBytes;
  }

  async readNext() {
    const handle = await open(this.#file, 'r');
    let bytes;
    let size;
    let identity;
    try {
      const info = await handle.stat();
      size = info.size;
      identity = `${info.dev}:${info.ino}:${info.birthtimeMs}`;
      if (size < this.#offset || (this.#identity && identity !== this.#identity)) {
        return { status: 'source_changed', bytes_read: 0, has_more: false, records: [], malformed_records: 0, oversized_records: 0 };
      }
      this.#identity = identity;
      const requested = Math.min(size - this.#offset, this.#maxReadBytes);
      if (requested === 0) {
        return { status: 'ok', bytes_read: 0, has_more: false, records: [], malformed_records: 0, oversized_records: 0 };
      }
      const buffer = Buffer.allocUnsafe(requested);
      const result = await handle.read(buffer, 0, requested, this.#offset);
      bytes = buffer.subarray(0, result.bytesRead);
      this.#offset += result.bytesRead;
    } finally {
      await handle.close();
    }

    const records = [];
    let malformed = 0;
    let oversized = 0;
    let start = 0;
    while (start < bytes.length) {
      const newline = bytes.indexOf(10, start);
      const end = newline === -1 ? bytes.length : newline;
      const fragment = bytes.subarray(start, end);
      if (this.#skipLine) {
        if (newline !== -1) {
          this.#skipLine = false;
          oversized++;
        }
      } else if (this.#pending.length + fragment.length > this.#maxLineBytes) {
        this.#pending = Buffer.alloc(0);
        if (newline === -1) this.#skipLine = true;
        else oversized++;
      } else {
        const line = this.#pending.length ? Buffer.concat([this.#pending, fragment]) : fragment;
        if (newline === -1) {
          // A valid final JSON record need not have a trailing newline. An incomplete
          // record is retained until a later append completes it.
          if (this.#offset === size) {
            try {
              const projected = this.#project(JSON.parse(line.toString('utf8')));
              if (projected !== undefined && projected !== null) records.push(projected);
              this.#pending = Buffer.alloc(0);
            } catch {
              this.#pending = Buffer.from(line);
            }
          } else {
            this.#pending = Buffer.from(line);
          }
        } else {
          this.#pending = Buffer.alloc(0);
          if (!line.length) {
            start = newline + 1;
            continue;
          }
          try {
            const projected = this.#project(JSON.parse(line.toString('utf8')));
            if (projected !== undefined && projected !== null) records.push(projected);
          } catch {
            malformed++;
          }
        }
      }
      if (newline === -1) break;
      start = newline + 1;
    }
    return {
      status: 'ok',
      bytes_read: bytes.length,
      has_more: this.#offset < size,
      records,
      malformed_records: malformed,
      oversized_records: oversized,
    };
  }
}
