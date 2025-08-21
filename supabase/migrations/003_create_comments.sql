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
  is_deleted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint to enforce Slack-style threading (no replies to replies)
  CONSTRAINT slack_style_threading CHECK (
    parent_id IS NULL OR 
    (SELECT parent_id FROM comments c WHERE c.id = comments.parent_id) IS NULL
  )
);

-- Indexes for efficient querying
CREATE INDEX idx_comments_fine_id ON comments(fine_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_root_latest ON comments(fine_id, created_at DESC) WHERE parent_id IS NULL;
CREATE INDEX idx_comments_replies ON comments(parent_id, created_at) WHERE parent_id IS NOT NULL;