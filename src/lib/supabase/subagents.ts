import { createServiceClient } from './service';

export interface Subagent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  owner: string;
  repo: string;
  file_path: string;
  tools: string[] | null;
  category: string | null;
  download_count: number;
  view_count: number;
  github_url: string | null;
  content_hash: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  agents_path: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubagentListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner: string;
  repo: string;
  tools: string[] | null;
  category: string | null;
  download_count: number;
  view_count: number;
}

export type TimeFilter = 'all' | '7d' | '24h';

// Get all subagents sorted by downloads (leaderboard)
export async function getSubagentsLeaderboard(
  limit = 50,
  offset = 0,
  timeFilter: TimeFilter = 'all',
  category?: string
): Promise<SubagentListItem[]> {
  const supabase = createServiceClient();

  let query = supabase
    .from('subagents')
    .select(
      'id, name, slug, description, owner, repo, tools, category, download_count, view_count, created_at'
    );

  // Apply category filter
  if (category) {
    query = query.eq('category', category);
  }

  // Apply time filter
  if (timeFilter !== 'all') {
    const now = new Date();
    let cutoff: Date;

    if (timeFilter === '24h') {
      cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeFilter === '7d') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      cutoff = new Date(0); // Beginning of time
    }

    query = query.gte('created_at', cutoff.toISOString());
  }

  const { data, error } = await query
    .order('download_count', { ascending: false })
    .order('id', { ascending: true }) // Secondary sort for stable pagination
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching subagents leaderboard:', error);
    throw error;
  }

  return data || [];
}

// Search subagents
export async function searchSubagents(
  query: string,
  limit = 20
): Promise<SubagentListItem[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('search_subagents', {
    search_query: query,
    max_results: limit,
  });

  if (error) {
    console.error('Error searching subagents:', error);
    throw error;
  }

  return data || [];
}

// Get a single subagent by owner, repo, and slug
export async function getSubagent(
  owner: string,
  repo: string,
  slug: string
): Promise<Subagent | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('subagents')
    .select('*')
    .eq('owner', owner)
    .eq('repo', repo)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching subagent:', error);
    throw error;
  }

  return data;
}

// Get a single subagent by ID
export async function getSubagentById(id: string): Promise<Subagent | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('subagents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching subagent by ID:', error);
    throw error;
  }

  return data;
}

// Increment download count
export async function incrementDownloadCount(subagentId: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.rpc('increment_download_count', {
    subagent_uuid: subagentId,
  });

  if (error) {
    console.error('Error incrementing download count:', error);
    throw error;
  }
}

// Increment view count
export async function incrementViewCount(subagentId: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.rpc('increment_view_count', {
    subagent_uuid: subagentId,
  });

  if (error) {
    console.error('Error incrementing view count:', error);
    throw error;
  }
}

// Record telemetry event
export async function recordTelemetry(
  subagentId: string,
  eventType: 'download' | 'view' | 'copy',
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from('telemetry').insert({
    subagent_id: subagentId,
    event_type: eventType,
    metadata,
  });

  if (error) {
    console.error('Error recording telemetry:', error);
    // Don't throw - telemetry failures shouldn't break the app
  }
}

// Get platform stats
export async function getPlatformStats(): Promise<{
  totalSubagents: number;
  totalDownloads: number;
  totalSources: number;
}> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('get_platform_stats');

  if (error) {
    console.error('Error fetching platform stats:', error);
    return { totalSubagents: 0, totalDownloads: 0, totalSources: 0 };
  }

  const stats = data?.[0] || {
    total_subagents: 0,
    total_downloads: 0,
    total_sources: 0,
  };

  return {
    totalSubagents: Number(stats.total_subagents),
    totalDownloads: Number(stats.total_downloads),
    totalSources: Number(stats.total_sources),
  };
}

// Get all active sources
export async function getActiveSources(): Promise<Source[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching active sources:', error);
    throw error;
  }

  return data || [];
}

// Upsert a subagent (used during sync)
export async function upsertSubagent(
  subagent: Omit<Subagent, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'>
): Promise<Subagent> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('subagents')
    .upsert(
      {
        ...subagent,
        last_synced_at: new Date().toISOString(),
      },
      {
        onConflict: 'owner,repo,slug',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting subagent:', error);
    throw error;
  }

  return data;
}

// Update source sync status
export async function updateSourceSyncStatus(
  sourceId: string,
  error?: string
): Promise<void> {
  const supabase = createServiceClient();

  const { error: updateError } = await supabase
    .from('sources')
    .update({
      last_synced_at: new Date().toISOString(),
      sync_error: error || null,
    })
    .eq('id', sourceId);

  if (updateError) {
    console.error('Error updating source sync status:', updateError);
    throw updateError;
  }
}

// Get subagents count
export async function getSubagentsCount(): Promise<number> {
  const supabase = createServiceClient();

  const { count, error } = await supabase
    .from('subagents')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting subagents:', error);
    return 0;
  }

  return count || 0;
}
