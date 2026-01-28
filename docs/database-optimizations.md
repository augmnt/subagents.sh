# Database Optimization Guide

## Recommended Database Indexes

### Core Indexes for Performance

```sql
-- Agents table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agents_status_author ON agents(status, author_id);
CREATE INDEX IF NOT EXISTS idx_agents_category_status ON agents(category_id, status);
CREATE INDEX IF NOT EXISTS idx_agents_created_status ON agents(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_agents_rating_status ON agents(rating_average DESC, status);
CREATE INDEX IF NOT EXISTS idx_agents_downloads_status ON agents(download_count DESC, status);
CREATE INDEX IF NOT EXISTS idx_agents_views_status ON agents(view_count DESC, status);
CREATE INDEX IF NOT EXISTS idx_agents_tags_gin ON agents USING gin(tags);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_agent_status ON reviews(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user_status ON reviews(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(overall_rating DESC);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_github_username ON profiles(github_username);

-- Follows table indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Agent views and downloads for analytics
CREATE INDEX IF NOT EXISTS idx_agent_views_agent_created ON agent_views(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_downloads_agent_created ON agent_downloads(agent_id, created_at DESC);
```

### Full-Text Search Optimization

```sql
-- Enable full-text search on agents
CREATE INDEX IF NOT EXISTS idx_agents_fts ON agents 
USING gin(to_tsvector('english', name || ' ' || description || ' ' || coalesce(short_description, '')));

-- Enable full-text search on reviews
CREATE INDEX IF NOT EXISTS idx_reviews_fts ON reviews 
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
```

## Query Optimization Tips

### 1. Use Specific Column Selection
```typescript
// Bad: Avoid selecting all columns
supabase.from('agents').select('*')

// Good: Select only needed columns
supabase.from('agents').select('id, name, description, rating_average')
```

### 2. Optimize Joins
```typescript
// Good: Use efficient joins with specific columns
supabase
  .from('agents')
  .select(`
    id, name, rating_average,
    categories!inner(name, color),
    profiles!inner(username, avatar_url)
  `)
```

### 3. Use Pagination Effectively
```typescript
// Good: Use offset and limit for pagination
supabase
  .from('agents')
  .select('id, name, rating_average')
  .range(offset, offset + limit - 1)
```

### 4. Optimize Count Queries
```typescript
// Good: Use head: true for count-only queries
supabase
  .from('agents')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'published')
```

### 5. Batch Related Queries
```typescript
// Good: Use Promise.all for parallel queries
const [agents, categories, stats] = await Promise.all([
  supabase.from('agents').select('*').limit(10),
  supabase.from('categories').select('*'),
  supabase.from('agent_stats').select('*').single()
]);
```

## Caching Strategy

### 1. Client-Side Caching
- Use React Query or SWR for client-side caching
- Cache search results for 2-5 minutes
- Cache user profiles for 10-15 minutes
- Cache categories and static data for 1 hour

### 2. Server-Side Caching
- Implement Redis for frequently accessed data
- Cache search facets for 10 minutes
- Cache user statistics for 5 minutes
- Cache featured agents for 30 minutes

### 3. Database-Level Optimizations
- Use materialized views for complex aggregations
- Implement partial indexes for filtered queries
- Use connection pooling (already implemented)

## RLS (Row Level Security) Optimizations

### Efficient RLS Policies
```sql
-- Optimize agent visibility policy
CREATE POLICY "agents_visible_to_all" ON agents
FOR SELECT USING (status = 'published');

-- Optimize user data access
CREATE POLICY "profiles_visible_to_all" ON profiles
FOR SELECT USING (true);

-- Optimize review access
CREATE POLICY "reviews_visible_when_active" ON reviews
FOR SELECT USING (status = 'active');
```

## Monitoring and Analytics

### Key Metrics to Monitor
1. Query execution time
2. Database connection pool usage
3. Index usage statistics
4. Cache hit rates
5. API response times

### Recommended Tools
- Supabase Dashboard for query analysis
- PostgreSQL's `pg_stat_statements` for query performance
- Application-level logging for slow queries
- Real User Monitoring (RUM) for frontend performance

## Production Deployment Checklist

- [ ] All recommended indexes are created
- [ ] RLS policies are optimized
- [ ] Connection pooling is configured
- [ ] Caching is implemented at multiple levels
- [ ] Query performance is monitored
- [ ] Database vacuum and analyze are scheduled
- [ ] Backup and recovery procedures are tested