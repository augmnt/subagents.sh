import { Subagent } from '@/types';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export function generateSubagentStructuredData(subagent: Subagent): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: subagent.name,
    description: subagent.description,
    url: `https://subagents.sh/${subagent.owner}/${subagent.repo}/${subagent.slug}`,
    applicationCategory: 'Developer Tools',
    applicationSubCategory: 'Claude Code Subagent',
    operatingSystem: 'Cross-platform',
    codeRepository: subagent.github_url,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/DownloadAction',
        userInteractionCount: subagent.download_count,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: subagent.view_count,
      },
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function generateWebsiteStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Subagents.sh',
    description: 'Discover and install Claude Code subagents to enhance your development workflow',
    url: 'https://subagents.sh',
    publisher: {
      '@type': 'Organization',
      name: 'Subagents.sh',
      url: 'https://subagents.sh',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://subagents.sh/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{
    name: string;
    url: string;
  }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
