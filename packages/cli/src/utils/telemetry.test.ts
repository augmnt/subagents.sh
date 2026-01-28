import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelemetry } from './telemetry.js';

describe('sendTelemetry', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends correct payload structure', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'download', {
      owner: 'owner',
      repo: 'repo',
      name: 'agent',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://subagents.sh/api/telemetry',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      subagentId: 'owner/repo/agent',
      event: 'download',
      metadata: {
        owner: 'owner',
        repo: 'repo',
        name: 'agent',
        cli: true,
        version: '0.1.0',
      },
    });
  });

  it('sends download event', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'download');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.event).toBe('download');
  });

  it('sends view event', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'view');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.event).toBe('view');
  });

  it('sends copy event', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'copy');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.event).toBe('copy');
  });

  it('includes cli flag and version in metadata', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'download');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.metadata.cli).toBe(true);
    expect(body.metadata.version).toBe('0.1.0');
  });

  it('merges custom metadata with defaults', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'download', {
      customField: 'custom value',
      isUpdate: true,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.metadata.customField).toBe('custom value');
    expect(body.metadata.isUpdate).toBe(true);
    expect(body.metadata.cli).toBe(true);
  });

  it('does not throw on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Should not throw
    await expect(sendTelemetry('owner/repo/agent', 'download')).resolves.toBeUndefined();
  });

  it('does not throw on HTTP error response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    // Should not throw
    await expect(sendTelemetry('owner/repo/agent', 'download')).resolves.toBeUndefined();
  });

  it('fires and forgets (does not wait for response)', async () => {
    // Create a promise that never resolves to simulate slow network
    let resolvePromise: () => void;
    const neverResolves = new Promise<{ ok: boolean }>((resolve) => {
      resolvePromise = () => resolve({ ok: true });
    });
    mockFetch.mockReturnValue(neverResolves);

    // sendTelemetry should return immediately without waiting
    const startTime = Date.now();
    await sendTelemetry('owner/repo/agent', 'download');
    const elapsed = Date.now() - startTime;

    // Should complete very quickly (not waiting for the fetch)
    expect(elapsed).toBeLessThan(100);

    // Clean up the pending promise
    resolvePromise!();
  });

  it('handles undefined metadata', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'download');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.metadata).toBeDefined();
    expect(body.metadata.cli).toBe(true);
  });

  it('calls correct telemetry endpoint', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await sendTelemetry('owner/repo/agent', 'download');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://subagents.sh/api/telemetry',
      expect.any(Object)
    );
  });
});
