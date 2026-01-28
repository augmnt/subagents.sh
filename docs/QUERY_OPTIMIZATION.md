# Query Optimization Guide

## Overview

This document describes the query optimization implementation for subagents.sh that uses the Supabase SDK directly to improve performance.

## Feature Flags

The optimization is controlled by feature flags to allow safe, incremental rollout:

```bash
# In your .env.local file
NEXT_PUBLIC_USE_OPTIMIZED_QUERIES=true      # Master flag (not currently used)
NEXT_PUBLIC_USE_OPTIMIZED_SEARCH=true       # Enable optimized agent search
NEXT_PUBLIC_USE_OPTIMIZED_FACETS=true       # Enable optimized facets
NEXT_PUBLIC_USE_OPTIMIZED_CATEGORIES=true   # Enable optimized categories
```

## What Was Optimized

### 1. Direct SDK Usage
- Removed multiple abstraction layers (database.ts → optimized-search.ts → connection-pool.ts)
- Use Supabase client directly for all queries
- Leverages Supabase's built-in connection pooling and optimizations

### 2. Improved Query Patterns
- Replaced `overlaps` operator with `in` operator for better performance on arrays
- Added proper `abortSignal` for query timeouts
- Optimized pagination using `range` instead of separate limit/offset
- Removed expensive joins where not necessary

### 3. Smarter Caching
- Simple in-memory cache with TTL
- Cache key generation based on query parameters
- Automatic cache cleanup to prevent memory leaks

### 4. Better Error Handling
- Consistent error messages
- Proper handling of aborted requests
- Fallback data for facets to prevent empty UI

## Performance Improvements

Expected improvements:
- **Search queries**: 50-70% faster
- **Category loading**: 80% faster (due to caching)
- **Facets loading**: 60% faster (parallel queries)
- **Reduced server load**: Fewer database connections

## Usage

### Testing the Optimizations

1. Enable feature flags in your `.env.local`:
```bash
NEXT_PUBLIC_USE_OPTIMIZED_SEARCH=true
NEXT_PUBLIC_USE_OPTIMIZED_FACETS=true
NEXT_PUBLIC_USE_OPTIMIZED_CATEGORIES=true
```

2. Test each area:
- **Search**: Go to `/agents` and try searching
- **Categories**: Check the filter sidebar
- **Facets**: Look at language/tag filters

3. Compare performance:
- Open browser DevTools Network tab
- Compare query times with flags on vs off
- Check for any UI differences

### Rollback

If issues arise, simply set the feature flags to `false`:
```bash
NEXT_PUBLIC_USE_OPTIMIZED_SEARCH=false
NEXT_PUBLIC_USE_OPTIMIZED_FACETS=false
NEXT_PUBLIC_USE_OPTIMIZED_CATEGORIES=false
```

## Implementation Details

### Optimized Hooks

Located in `/src/hooks/use-optimized-database.ts`:

- `useOptimizedAgentSearch()` - Direct SDK search with debouncing
- `useOptimizedCategories()` - Cached categories with counts
- `useOptimizedSearchFacets()` - Parallel facet queries
- `useOptimizedFeaturedAgents()` - Featured agents with caching
- `useOptimizedTrendingAgents()` - Trending calculation

### Data Structure Compatibility

The optimized hooks return data in the exact same structure as the original hooks to ensure UI compatibility:

```typescript
// SearchResult structure remains the same
interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  // ... all other fields
}
```

## Next Steps

1. **Monitor Performance**: Use browser DevTools and Supabase dashboard
2. **Gradual Rollout**: Enable one flag at a time
3. **Database Indexes**: Add indexes for commonly queried fields
4. **RPC Functions**: Create Supabase RPC functions for complex aggregations
5. **Materialized Views**: For frequently accessed computed data

## Troubleshooting

### Queries Still Slow?
- Check Supabase dashboard for slow query logs
- Ensure database indexes are properly configured
- Verify feature flags are actually enabled (check browser console)

### UI Differences?
- Compare returned data structure in browser DevTools
- Check for missing fields in the optimized queries
- Ensure all joins are properly included

### Cache Issues?
- Cache is cleared on component unmount
- TTLs are set conservatively (2-15 minutes)
- Can manually clear cache by refreshing the page