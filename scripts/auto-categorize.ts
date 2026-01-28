#!/usr/bin/env npx tsx
/**
 * Auto-categorize script for subagents
 *
 * Usage:
 *   npx tsx scripts/auto-categorize.ts --dry-run    # Preview suggestions
 *   npx tsx scripts/auto-categorize.ts --export     # Export CSV for review
 *   npx tsx scripts/auto-categorize.ts --apply      # Update database
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Category keyword mappings for detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
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
};

interface Subagent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner: string;
  repo: string;
  tools: string[] | null;
  category: string | null;
}

interface CategorySuggestion {
  subagent: Subagent;
  suggestedCategory: string;
  confidence: 'high' | 'medium' | 'low';
  matchedKeywords: string[];
}

function detectCategory(subagent: Subagent): CategorySuggestion {
  const scores: Record<string, { score: number; keywords: string[] }> = {};

  // Initialize scores
  for (const category of Object.keys(CATEGORY_KEYWORDS)) {
    scores[category] = { score: 0, keywords: [] };
  }

  // Combine all text for matching
  const searchText = [
    subagent.name,
    subagent.slug,
    subagent.description || '',
    ...(subagent.tools || []),
  ].join(' ').toLowerCase();

  // Score each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        scores[category].score += 1;
        scores[category].keywords.push(keyword);
      }
    }
  }

  // Find best category
  let bestCategory = 'other';
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const [category, data] of Object.entries(scores)) {
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
    subagent,
    suggestedCategory: bestCategory,
    confidence,
    matchedKeywords,
  };
}

async function fetchUncategorizedSubagents(): Promise<Subagent[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('subagents')
    .select('id, name, slug, description, owner, repo, tools, category')
    .is('category', null);

  if (error) {
    throw new Error(`Failed to fetch subagents: ${error.message}`);
  }

  return data || [];
}

async function applyCategories(suggestions: CategorySuggestion[]): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let updated = 0;
  let errors = 0;

  for (const suggestion of suggestions) {
    const { error } = await supabase
      .from('subagents')
      .update({ category: suggestion.suggestedCategory })
      .eq('id', suggestion.subagent.id);

    if (error) {
      console.error(`Error updating ${suggestion.subagent.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`✓ Updated ${suggestion.subagent.name} → ${suggestion.suggestedCategory}`);
      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} subagents, ${errors} errors`);
}

function generateCSV(suggestions: CategorySuggestion[]): string {
  const headers = ['id', 'name', 'owner', 'repo', 'suggested_category', 'confidence', 'matched_keywords'];
  const rows = suggestions.map(s => [
    s.subagent.id,
    `"${s.subagent.name.replace(/"/g, '""')}"`,
    s.subagent.owner,
    s.subagent.repo,
    s.suggestedCategory,
    s.confidence,
    `"${s.matchedKeywords.join(', ')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode || !['--dry-run', '--export', '--apply'].includes(mode)) {
    console.log(`
Usage:
  npx tsx scripts/auto-categorize.ts --dry-run    # Preview suggestions in terminal
  npx tsx scripts/auto-categorize.ts --export     # Generate CSV for manual review
  npx tsx scripts/auto-categorize.ts --apply      # Update database with suggestions
    `);
    process.exit(1);
  }

  console.log('🔍 Fetching uncategorized subagents...');
  const subagents = await fetchUncategorizedSubagents();

  if (subagents.length === 0) {
    console.log('✅ All subagents are already categorized!');
    process.exit(0);
  }

  console.log(`📊 Found ${subagents.length} uncategorized subagents\n`);

  // Generate suggestions
  const suggestions = subagents.map(detectCategory);

  // Group by confidence
  const highConfidence = suggestions.filter(s => s.confidence === 'high');
  const mediumConfidence = suggestions.filter(s => s.confidence === 'medium');
  const lowConfidence = suggestions.filter(s => s.confidence === 'low');

  if (mode === '--dry-run') {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('HIGH CONFIDENCE (3+ keyword matches)');
    console.log('═══════════════════════════════════════════════════════════════');
    for (const s of highConfidence) {
      console.log(`  ${s.subagent.name}`);
      console.log(`    → ${s.suggestedCategory} (matched: ${s.matchedKeywords.join(', ')})`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('MEDIUM CONFIDENCE (1-2 keyword matches)');
    console.log('═══════════════════════════════════════════════════════════════');
    for (const s of mediumConfidence) {
      console.log(`  ${s.subagent.name}`);
      console.log(`    → ${s.suggestedCategory} (matched: ${s.matchedKeywords.join(', ')})`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('LOW CONFIDENCE (no keyword matches → "other")');
    console.log('═══════════════════════════════════════════════════════════════');
    for (const s of lowConfidence) {
      console.log(`  ${s.subagent.name}`);
      console.log(`    → ${s.suggestedCategory}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   High confidence: ${highConfidence.length}`);
    console.log(`   Medium confidence: ${mediumConfidence.length}`);
    console.log(`   Low confidence: ${lowConfidence.length}`);
    console.log(`\nRun with --apply to update the database.`);
  } else if (mode === '--export') {
    const csv = generateCSV(suggestions);
    const filename = `category-suggestions-${Date.now()}.csv`;
    fs.writeFileSync(filename, csv);
    console.log(`✅ Exported to ${filename}`);
  } else if (mode === '--apply') {
    console.log('📝 Applying category suggestions...\n');
    await applyCategories(suggestions);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
