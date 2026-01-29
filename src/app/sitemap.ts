import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://subagents.sh';

  // Static routes - only pages that actually exist
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  try {
    // Fetch dynamic subagent routes
    const { data: subagents } = await supabase
      .from('subagents')
      .select('owner, repo, slug, updated_at')
      .order('updated_at', { ascending: false });

    const subagentRoutes = subagents?.map((s) => ({
      url: `${baseUrl}/${s.owner}/${s.repo}/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) ?? [];

    return [...staticRoutes, ...subagentRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes if database query fails
    return staticRoutes;
  }
}
