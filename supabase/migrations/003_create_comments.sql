-- Comments table with Slack-style threading (only 2 levels: comments and replies)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_id UUID NOT NULL REFERENCES fines(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Denormalized author info
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  
  content TEXT NOT NULL,
  
  -- Metadata
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  
  -- Note: Slack-style threading (no replies to replies) is enforced in application code
  -- Database-level constraint removed due to PostgreSQL subquery limitations in CHECK constraints
);

-- Indexes for efficient querying
CREATE INDEX idx_comments_fine_id ON comments(fine_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_root_latest ON comments(fine_id, created_at DESC) WHERE parent_id IS NULL;
CREATE INDEX idx_comments_replies ON comments(parent_id, created_at) WHERE parent_id IS NOT NULL;