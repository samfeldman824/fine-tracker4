-- Comments table with proper user and fine relationships
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_id UUID NOT NULL REFERENCES fines(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Denormalized author info
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  
  content TEXT NOT NULL,
  
  -- For threading
  depth INTEGER DEFAULT 0,
  path TEXT[], -- For efficient hierarchy queries
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_fine_id ON comments(fine_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_path ON comments USING GIN(path);
CREATE INDEX idx_comments_created_at ON comments(fine_id, created_at);