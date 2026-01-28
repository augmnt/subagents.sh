# Supabase Database Schema for Subagents Platform

This directory contains the complete database schema, migrations, and configuration for the Subagents platform.

## Quick Setup

Run the automated setup script:

```bash
./scripts/setup-supabase.sh
```

This script will:
- Initialize the Supabase project
- Start local development environment  
- Run all migrations
- Seed the database with sample data
- Generate TypeScript types
- Create `.env.local` with connection details

## Manual Setup

If you prefer to set up manually:

### 1. Install Supabase CLI

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### 2. Initialize Project

```bash
supabase init
```

### 3. Start Local Development

```bash
supabase start
```

### 4. Run Migrations

```bash
supabase db reset
```

### 5. Generate Types

```bash
supabase gen types typescript --local > src/types/supabase.ts
```

## Database Schema Overview

### Core Tables

#### `profiles`
Extended user profiles linked to Supabase Auth users.
- GitHub integration fields
- Social media links
- Bio and avatar

#### `categories` 
Hierarchical categories for organizing agents.
- Friendly URLs with slugs
- Icons and colors for UI
- Automatic agent counting

#### `agents`
The main entity representing subagents/tools.
- Rich metadata and descriptions
- GitHub repository integration
- Download/view tracking
- Rating system
- Tagging and categorization

#### `collections`
User-curated lists of agents.
- Public/private visibility
- Ordered agent lists
- Shareable collections

### Relationship Tables

#### `collection_agents`
Junction table for many-to-many between collections and agents.
- Position ordering
- Addition timestamps

#### `reviews`
User reviews and ratings for agents.
- 1-5 star ratings
- Text reviews with title
- Helpful vote tracking
- Moderation status

#### `votes`
Voting system for agents and reviews.
- Upvote/downvote mechanism
- Prevents duplicate votes
- Polymorphic design

### Analytics Tables

#### `agent_downloads`
Tracks agent download events.
- User attribution when possible
- IP and user agent tracking
- Referrer information
- Download type (direct, clone, zip)

#### `agent_views`
Tracks agent page views.
- Session-based deduplication
- Anonymous view support
- Referrer tracking

### Social Features

#### `follows`
User following relationships.
- Follower/following tracking
- Prevents self-following

#### `bookmarks`
User bookmarks for agents.
- Personal agent collections
- Quick access lists

### GitHub Integration

#### `github_sync_log`
Tracks GitHub repository synchronization.
- Success/failure logging
- Sync attempt history
- Error message storage

## Database Functions

### `search_agents()`
Full-text search across agents with:
- Multi-field search (name, description, tags)
- Category and tag filtering
- Multiple sort options
- Pagination support
- Relevance ranking

### `get_trending_agents()`
Calculates trending agents based on:
- Recent download activity
- Rating scores
- Configurable time windows
- Weighted scoring algorithm

### `sync_github_repo()`
Synchronizes agent metadata with GitHub:
- Star and fork counts
- Last commit timestamps
- Repository descriptions
- License information
- Error handling and logging

### `calculate_agent_rating()`
Computes aggregate rating statistics:
- Average rating calculation
- Total review count
- Active reviews only

## Row Level Security (RLS)

All tables have comprehensive RLS policies:

### Public Access
- Published agents viewable by everyone
- Public collections accessible to all
- Active reviews visible globally
- Categories publicly readable

### User Access
- Users can manage their own content
- Private collections restricted to owners
- Vote and bookmark privacy
- Review moderation capabilities

### Owner Access
- Agent owners can view analytics
- Download/view statistics available
- GitHub sync history access

## Storage Buckets

### `agent-assets`
Public bucket for agent screenshots, logos, and media.
- 50MB file size limit
- Image formats only
- User-organized folders

### `user-avatars`  
Public bucket for user profile pictures.
- 10MB file size limit
- Image formats only
- User-specific access

### `agent-files`
Private bucket for downloadable agent files.
- 100MB file size limit
- Various file formats
- Access control based on downloads

## Triggers and Automation

### Automatic Updates
- `updated_at` timestamps on all edits
- Rating recalculation on review changes
- Category counts on agent status changes
- Collection counts on membership changes

### Analytics Updates
- Download counts on new downloads
- View counts on page visits  
- Vote tallies on voting actions

### Data Integrity
- Foreign key constraints
- Check constraints for data validation
- Unique constraints preventing duplicates

## Indexes for Performance

### Search Indexes
- Full-text search on agents
- Trigram indexes for fuzzy matching
- Category and tag lookups

### Relationship Indexes
- Foreign key relationships
- User-specific data queries
- Temporal data sorting

### Analytics Indexes
- Download and view tracking
- Trending calculations
- User activity queries

## Sample Data

The seed files include:
- 25 predefined categories
- 8 sample agents across different categories
- User profiles and relationships
- Reviews and ratings
- Collections and bookmarks
- GitHub sync examples

## Environment Variables

Required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret
```

## Development Commands

```bash
# Database Management
supabase db reset              # Reset and re-run migrations
supabase db pull              # Pull schema from remote
supabase db push              # Push local changes to remote

# Migration Management  
supabase migration new name   # Create new migration
supabase migration up         # Apply pending migrations

# Type Generation
supabase gen types typescript --local > src/types/supabase.ts

# Status and Logs
supabase status               # Check service status
supabase logs                 # View service logs
```

## Production Deployment

1. Create Supabase project at https://supabase.com
2. Run migrations: `supabase db push`
3. Configure authentication providers
4. Set up storage buckets with proper CORS
5. Update environment variables
6. Configure RLS policies for production security

## Troubleshooting

### Common Issues

**Migration Errors**
- Check foreign key constraints
- Verify enum values match
- Ensure proper column types

**RLS Policy Issues**  
- Test policies with different user roles
- Check auth.uid() availability
- Verify policy conditions

**Performance Issues**
- Monitor slow query logs
- Check index usage
- Optimize search queries

**Type Generation Errors**
- Ensure database is running
- Check schema validity
- Update Supabase CLI version

For more help, check the [Supabase documentation](https://supabase.com/docs) or the project's GitHub issues.