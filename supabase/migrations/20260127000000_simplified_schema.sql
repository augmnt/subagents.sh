-- Migration: Simplified Schema for Subagents Discovery Platform
-- This migration drops all existing tables and creates a clean, minimal schema

-- Drop all existing tables and related objects
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. SUBAGENTS TABLE - core content
CREATE TABLE subagents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  file_path TEXT NOT NULL,
  tools TEXT[],
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  github_url TEXT,
  content_hash TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner, repo, slug)
);

-- 2. SOURCES TABLE - repos to sync from
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  agents_path TEXT DEFAULT '.claude/agents',
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner, repo)
);

-- 3. TELEMETRY TABLE - anonymous download tracking
CREATE TABLE telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subagent_id UUID REFERENCES subagents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('download', 'view', 'copy')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subagents_downloads ON subagents(download_count DESC);
CREATE INDEX idx_subagents_owner_repo ON subagents(owner, repo);
CREATE INDEX idx_subagents_slug ON subagents(slug);
CREATE INDEX idx_subagents_name_trgm ON subagents USING gin(name gin_trgm_ops);
CREATE INDEX idx_subagents_description_trgm ON subagents USING gin(description gin_trgm_ops);
CREATE INDEX idx_telemetry_subagent_id ON telemetry(subagent_id);
CREATE INDEX idx_telemetry_created_at ON telemetry(created_at);
CREATE INDEX idx_sources_active ON sources(is_active) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_subagents_updated_at
  BEFORE UPDATE ON subagents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(subagent_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE subagents
  SET download_count = download_count + 1
  WHERE id = subagent_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(subagent_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE subagents
  SET view_count = view_count + 1
  WHERE id = subagent_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function for searching subagents
CREATE OR REPLACE FUNCTION search_subagents(search_query TEXT, max_results INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  owner TEXT,
  repo TEXT,
  tools TEXT[],
  download_count INTEGER,
  view_count INTEGER,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.slug,
    s.description,
    s.owner,
    s.repo,
    s.tools,
    s.download_count,
    s.view_count,
    GREATEST(
      similarity(s.name, search_query),
      similarity(COALESCE(s.description, ''), search_query)
    ) AS similarity
  FROM subagents s
  WHERE
    s.name ILIKE '%' || search_query || '%'
    OR s.description ILIKE '%' || search_query || '%'
    OR search_query = ANY(s.tools)
  ORDER BY
    similarity DESC,
    s.download_count DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform stats
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_subagents BIGINT,
  total_downloads BIGINT,
  total_sources BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM subagents)::BIGINT AS total_subagents,
    (SELECT COALESCE(SUM(download_count), 0) FROM subagents)::BIGINT AS total_downloads,
    (SELECT COUNT(*) FROM sources WHERE is_active = true)::BIGINT AS total_sources;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE subagents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;

-- Policies for subagents (public read)
CREATE POLICY "Allow public read access to subagents"
  ON subagents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for sources (public read)
CREATE POLICY "Allow public read access to sources"
  ON sources FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for telemetry (public insert, service read)
CREATE POLICY "Allow public to insert telemetry"
  ON telemetry FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to telemetry"
  ON telemetry FOR ALL
  TO service_role
  USING (true);

-- Service role policies for full access
CREATE POLICY "Allow service role full access to subagents"
  ON subagents FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role full access to sources"
  ON sources FOR ALL
  TO service_role
  USING (true);

-- Seed initial source (augmnt/agents)
INSERT INTO sources (owner, repo, branch, agents_path)
VALUES ('anthropics', 'claude-code', 'main', 'skills/released');

-- Add comment for documentation
COMMENT ON TABLE subagents IS 'Core table storing Claude Code subagents fetched from GitHub repositories';
COMMENT ON TABLE sources IS 'GitHub repositories to sync subagents from';
COMMENT ON TABLE telemetry IS 'Anonymous telemetry for tracking downloads and views';
