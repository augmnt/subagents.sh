import { NextRequest, NextResponse } from 'next/server';
import { syncAllSources, syncSpecificSource } from '@/lib/github/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for sync operations

export async function POST(request: NextRequest) {
  try {
    // Verify sync secret
    const authHeader = request.headers.get('authorization');
    const syncSecret = process.env.SYNC_SECRET;

    if (syncSecret && authHeader !== `Bearer ${syncSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { owner, repo } = body as { owner?: string; repo?: string };

    let result;

    if (owner && repo) {
      // Sync specific source
      result = await syncSpecificSource(owner, repo);
      return NextResponse.json({
        success: true,
        source: `${owner}/${repo}`,
        synced: result.synced,
        errors: result.errors,
      });
    } else {
      // Sync all sources
      result = await syncAllSources();
      return NextResponse.json({
        success: true,
        totalSynced: result.totalSynced,
        totalErrors: result.totalErrors,
        sourcesProcessed: result.sourcesProcessed,
      });
    }
  } catch (error) {
    console.error('Error in /api/sync:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for Vercel cron jobs
export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel cron jobs
  const authHeader = request.headers.get('authorization');
  const syncSecret = process.env.SYNC_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  // Accept either sync secret or Vercel cron secret
  const isAuthorized =
    !syncSecret ||
    authHeader === `Bearer ${syncSecret}` ||
    authHeader === `Bearer ${cronSecret}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncAllSources();
    return NextResponse.json({
      success: true,
      totalSynced: result.totalSynced,
      totalErrors: result.totalErrors,
      sourcesProcessed: result.sourcesProcessed,
    });
  } catch (error) {
    console.error('Error in /api/sync (GET):', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
