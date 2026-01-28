/**
 * Category detection utilities for CLI
 */

// Valid categories that can be assigned to subagents
export const VALID_CATEGORIES = [
  'backend',
  'frontend',
  'fullstack',
  'testing',
  'security',
  'devops',
  'documentation',
  'refactoring',
  'database',
  'api',
  'ai-ml',
  'other',
] as const;

export type Category = (typeof VALID_CATEGORIES)[number];

// Category keyword mappings for auto-detection
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  devops: [
    'bash', 'docker', 'kubernetes', 'k8s', 'deploy', 'terraform', 'aws',
    'azure', 'gcp', 'ci', 'cd', 'pipeline', 'infrastructure', 'helm',
    'ansible', 'jenkins', 'github-actions', 'gitlab', 'shell', 'script'
  ],
  testing: [
    'test', 'jest', 'playwright', 'cypress', 'e2e', 'spec', 'mocha',
    'vitest', 'pytest', 'unittest', 'coverage', 'qa', 'assertion'
  ],
  database: [
    'sql', 'postgres', 'postgresql', 'mongodb', 'prisma', 'redis', 'supabase',
    'mysql', 'sqlite', 'migration', 'schema', 'query', 'orm', 'drizzle'
  ],
  api: [
    'api', 'rest', 'graphql', 'endpoint', 'grpc', 'openapi', 'swagger',
    'http', 'request', 'response', 'webhook', 'fetch', 'axios'
  ],
  frontend: [
    'react', 'vue', 'angular', 'css', 'tailwind', 'component', 'ui',
    'styled', 'sass', 'scss', 'dom', 'browser', 'svelte', 'nextjs', 'nuxt'
  ],
  backend: [
    'server', 'express', 'django', 'flask', 'node', 'fastapi', 'spring',
    'rails', 'laravel', 'nestjs', 'middleware', 'authentication', 'session'
  ],
  fullstack: [
    'fullstack', 'full-stack', 'monorepo', 'turborepo', 'nx', 'trpc'
  ],
  security: [
    'auth', 'oauth', 'jwt', 'encryption', 'vulnerability', 'security',
    'password', 'token', 'permission', 'rbac', 'audit', 'sanitize', 'xss'
  ],
  documentation: [
    'docs', 'readme', 'swagger', 'openapi', 'markdown', 'jsdoc', 'typedoc',
    'comment', 'docstring', 'wiki', 'changelog', 'specification'
  ],
  refactoring: [
    'refactor', 'lint', 'format', 'migrate', 'upgrade', 'prettier',
    'eslint', 'cleanup', 'modernize', 'deprecate', 'optimize', 'simplify'
  ],
  'ai-ml': [
    'ai', 'ml', 'llm', 'gpt', 'claude', 'embedding', 'vector', 'openai',
    'anthropic', 'huggingface', 'model', 'training', 'inference', 'neural'
  ],
  other: [],
};

// Category display labels
export const CATEGORY_LABELS: Record<Category, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  fullstack: 'Full Stack',
  testing: 'Testing',
  security: 'Security',
  devops: 'DevOps',
  documentation: 'Documentation',
  refactoring: 'Refactoring',
  database: 'Database',
  api: 'API',
  'ai-ml': 'AI/ML',
  other: 'Other',
};

export interface DetectionResult {
  category: Category;
  confidence: 'high' | 'medium' | 'low';
  matchedKeywords: string[];
}

/**
 * Detect the most likely category for a subagent based on its metadata
 */
export function detectCategory(input: {
  name?: string;
  description?: string;
  tools?: string[];
}): DetectionResult {
  const scores: Record<Category, { score: number; keywords: string[] }> = {} as Record<Category, { score: number; keywords: string[] }>;

  // Initialize scores
  for (const category of VALID_CATEGORIES) {
    scores[category] = { score: 0, keywords: [] };
  }

  // Combine all text for matching
  const searchText = [
    input.name || '',
    input.description || '',
    ...(input.tools || []),
  ].join(' ').toLowerCase();

  // Score each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        scores[category].score += 1;
        scores[category].keywords.push(keyword);
      }
    }
  }

  // Find best category
  let bestCategory: Category = 'other';
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const [category, data] of Object.entries(scores) as [Category, { score: number; keywords: string[] }][]) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestCategory = category;
      matchedKeywords = data.keywords;
    }
  }

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (bestScore >= 3) {
    confidence = 'high';
  } else if (bestScore >= 1) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    category: bestCategory,
    confidence,
    matchedKeywords,
  };
}

/**
 * Type guard to check if a string is a valid category
 */
export function isValidCategory(value: string): value is Category {
  return VALID_CATEGORIES.includes(value as Category);
}
