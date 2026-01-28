-- Fix permissions for tables
-- Grant access to all roles that need it

-- Grant table permissions to anon role
GRANT SELECT ON subagents TO anon;
GRANT SELECT ON sources TO anon;
GRANT INSERT ON telemetry TO anon;

-- Grant table permissions to authenticated role
GRANT SELECT ON subagents TO authenticated;
GRANT SELECT ON sources TO authenticated;
GRANT INSERT ON telemetry TO authenticated;

-- Grant full permissions to service_role
GRANT ALL ON subagents TO service_role;
GRANT ALL ON sources TO service_role;
GRANT ALL ON telemetry TO service_role;

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION search_subagents(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION search_subagents(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_subagents(TEXT, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_stats() TO service_role;
