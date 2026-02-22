-- Fix agents_path for augmnt/agents source
-- Agent files are at the repo root, not in an 'agents/' subdirectory
UPDATE sources
SET agents_path = '.'
WHERE owner = 'augmnt' AND repo = 'agents';
