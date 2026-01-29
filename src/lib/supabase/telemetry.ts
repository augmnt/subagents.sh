import { createServiceClient } from './service';
import type { WeeklyDownloadData } from '@/components/subagent/sparkline-chart';

/**
 * Fetch weekly download aggregation for a subagent over the past N weeks.
 * Returns data with missing weeks filled with zero downloads.
 */
export async function getWeeklyDownloads(
  subagentId: string,
  weeks: number = 8
): Promise<WeeklyDownloadData[]> {
  const supabase = createServiceClient();

  // Calculate the start date (N weeks ago, at the beginning of that week in UTC)
  const now = new Date();
  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - weeks * 7);
  // Move to the beginning of that week (Monday)
  const dayOfWeek = startDate.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setUTCDate(startDate.getUTCDate() - daysToMonday);
  startDate.setUTCHours(0, 0, 0, 0);

  // Query telemetry for download events grouped by week
  const { data, error } = await supabase
    .from('telemetry')
    .select('created_at')
    .eq('subagent_id', subagentId)
    .eq('event_type', 'download')
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching weekly downloads:', error);
    return [];
  }

  // Initialize all weeks with zero downloads
  const weeklyData: Map<number, number> = new Map();
  for (let i = 0; i < weeks; i++) {
    weeklyData.set(i, 0);
  }

  // Aggregate downloads by week
  if (data) {
    for (const row of data) {
      const eventDate = new Date(row.created_at);
      const weekIndex = Math.floor(
        (eventDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      if (weekIndex >= 0 && weekIndex < weeks) {
        weeklyData.set(weekIndex, (weeklyData.get(weekIndex) || 0) + 1);
      }
    }
  }

  // Convert to array format for the chart
  const result: WeeklyDownloadData[] = [];
  for (let i = 0; i < weeks; i++) {
    result.push({
      week: i,
      downloads: weeklyData.get(i) || 0,
    });
  }

  return result;
}

/**
 * Determine whether to show the sparkline for a subagent.
 * Returns true if:
 * - Agent has more than 50 total downloads, OR
 * - Agent was created more than 2 weeks ago
 */
export async function shouldShowSparkline(
  subagentId: string
): Promise<boolean> {
  const supabase = createServiceClient();

  // Fetch the subagent's download count and created_at
  const { data, error } = await supabase
    .from('subagents')
    .select('download_count, created_at')
    .eq('id', subagentId)
    .single();

  if (error || !data) {
    console.error('Error checking sparkline visibility:', error);
    return false;
  }

  // Check if more than 50 downloads
  if (data.download_count > 50) {
    return true;
  }

  // Check if created more than 2 weeks ago
  const createdAt = new Date(data.created_at);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  return createdAt < twoWeeksAgo;
}
