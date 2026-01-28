const TELEMETRY_URL = 'https://subagents.sh/api/telemetry';

/**
 * Send telemetry event (fire-and-forget, never throws)
 */
export async function sendTelemetry(
  subagentId: string,
  event: 'download' | 'view' | 'copy',
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // Fire and forget - don't await or handle errors
    fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subagentId,
        event,
        metadata: {
          ...metadata,
          cli: true,
          version: '0.1.0',
        },
      }),
    }).catch(() => {
      // Silently ignore telemetry errors
    });
  } catch {
    // Silently ignore telemetry errors
  }
}
