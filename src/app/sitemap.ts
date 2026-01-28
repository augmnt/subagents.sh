import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://subagents.sh';
  // Using imported supabase client

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  try {
    // Fetch dynamic agent routes
    const { data: agents } = await supabase
      .from('agents')
      .select('id, slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    const agentRoutes = agents?.map((agent) => ({
      url: `${baseUrl}/agents/${agent.id}`,
      lastModified: new Date(agent.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) ?? [];

    // Fetch dynamic category routes
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });

    const categoryRoutes = categories?.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) ?? [];

    // Fetch dynamic user profile routes (only for users with public profiles and agents)
    const { data: users } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false });

    const userRoutes = users?.flatMap((user) => [
      {
        url: `${baseUrl}/user/${user.username}`,
        lastModified: new Date(user.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/user/${user.username}/agents`,
        lastModified: new Date(user.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      },
    ]) ?? [];

    return [...staticRoutes, ...agentRoutes, ...categoryRoutes, ...userRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes if database query fails
    return staticRoutes;
  }
}