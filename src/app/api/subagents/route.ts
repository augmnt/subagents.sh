import { NextRequest, NextResponse } from 'next/server';
import {
  getSubagentsLeaderboard,
  searchSubagents,
  getSubagent,
  type TimeFilter,
} from '@/lib/supabase/subagents';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const timeFilter = (searchParams.get('filter') || 'all') as TimeFilter;
    const category = searchParams.get('category') || undefined;

    // If owner, repo, and slug are provided, get a specific subagent
    if (owner && repo && slug) {
      const subagent = await getSubagent(owner, repo, slug);

      if (!subagent) {
        return NextResponse.json(
          { error: 'Subagent not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(subagent);
    }

    // If query is provided, search
    if (query) {
      const results = await searchSubagents(query, limit);
      return NextResponse.json({
        data: results,
        query,
        count: results.length,
      });
    }

    // Otherwise, return leaderboard
    const subagents = await getSubagentsLeaderboard(limit, offset, timeFilter, category);

    return NextResponse.json({
      data: subagents,
      limit,
      offset,
      filter: timeFilter,
      category,
      count: subagents.length,
    });
  } catch (error) {
    console.error('Error in /api/subagents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
