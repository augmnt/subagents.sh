-- Fix telemetry table to accept string identifiers (not just UUIDs)
-- This allows tracking downloads of external agents not in our database

-- Drop the existing foreign key and change column type
ALTER TABLE telemetry DROP CONSTRAINT IF EXISTS telemetry_subagent_id_fkey;
ALTER TABLE telemetry ALTER COLUMN subagent_id TYPE TEXT USING subagent_id::TEXT;

-- Add index for the text column
DROP INDEX IF EXISTS idx_telemetry_subagent_id;
CREATE INDEX idx_telemetry_subagent_id ON telemetry(subagent_id);

-- Update the seeded source to use augmnt/agents instead of anthropics/claude-code
DELETE FROM sources WHERE owner = 'anthropics' AND repo = 'claude-code';
INSERT INTO sources (owner, repo, branch, agents_path)
VALUES ('augmnt', 'agents', 'main', 'agents')
ON CONFLICT (owner, repo) DO NOTHING;

-- Add comment for clarity
COMMENT ON COLUMN telemetry.subagent_id IS 'String identifier in format owner/repo/name - can be any agent, not just registered ones';
