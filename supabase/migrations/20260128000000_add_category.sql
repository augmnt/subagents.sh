-- Migration: Add category column to subagents table
-- This allows categorization of subagents for filtering

-- Add category column
ALTER TABLE subagents ADD COLUMN category VARCHAR(50);

-- Create index for category filtering
CREATE INDEX idx_subagents_category ON subagents(category);

-- Update search function to include category
DROP FUNCTION IF EXISTS search_subagents(TEXT, INTEGER);

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
  category VARCHAR(50),
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
    s.category,
    GREATEST(
      similarity(s.name, search_query),
      similarity(COALESCE(s.description, ''), search_query)
    ) AS similarity
  FROM subagents s
  WHERE
    s.name ILIKE '%' || search_query || '%'
    OR s.description ILIKE '%' || search_query || '%'
    OR search_query = ANY(s.tools)
    OR s.category ILIKE '%' || search_query || '%'
  ORDER BY
    similarity DESC,
    s.download_count DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN subagents.category IS 'Optional category for filtering (backend, frontend, testing, etc.)';
