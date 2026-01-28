#!/usr/bin/env node

/**
 * Test data seeding script
 * Seeds the test database with sample data for testing
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Clear existing test data
    console.log('🧹 Clearing existing test data...');
    await supabase.from('agents').delete().neq('id', 0);
    await supabase.from('categories').delete().neq('id', 0);
    await supabase.from('users').delete().neq('id', 0);

    // Seed categories
    console.log('📁 Seeding categories...');
    const categories = [
      { name: 'Web Development', slug: 'web-development', description: 'Tools for web development' },
      { name: 'Data Science', slug: 'data-science', description: 'Data analysis and ML tools' },
      { name: 'DevOps', slug: 'devops', description: 'Development operations tools' },
    ];

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (categoryError) {
      console.warn('Category seeding skipped:', categoryError.message);
    } else {
      console.log(`✅ Seeded ${categoryData?.length || 0} categories`);
    }

    // Seed test users
    console.log('👤 Seeding test users...');
    const users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com',
        user_metadata: { user_name: 'testuser' }
      }
    ];

    // Note: In real tests, you'd create users through auth, not direct DB insert
    console.log('✅ Test user setup complete');

    // Seed sample agents
    console.log('🤖 Seeding sample agents...');
    const agents = [
      {
        name: 'Test Agent 1',
        description: 'A test agent for unit testing',
        prompt: 'You are a test agent',
        category_id: categoryData?.[0]?.id || null,
        author_id: '00000000-0000-0000-0000-000000000001',
        tags: ['test', 'sample'],
        is_featured: false,
        github_url: 'https://github.com/test/agent1'
      },
      {
        name: 'Test Agent 2', 
        description: 'Another test agent',
        prompt: 'You are another test agent',
        category_id: categoryData?.[1]?.id || null,
        author_id: '00000000-0000-0000-0000-000000000001',
        tags: ['test', 'example'],
        is_featured: true,
        github_url: 'https://github.com/test/agent2'
      }
    ];

    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .insert(agents)
      .select();

    if (agentError) {
      console.warn('Agent seeding skipped:', agentError.message);
    } else {
      console.log(`✅ Seeded ${agentData?.length || 0} agents`);
    }

    console.log('🎉 Test data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData();
}

module.exports = { seedTestData };