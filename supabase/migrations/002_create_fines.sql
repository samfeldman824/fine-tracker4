CREATE TYPE fine_type_enum AS ENUM ('fine', 'credit', 'warning');

CREATE TABLE fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES users(id),
  proposer_id UUID NOT NULL REFERENCES users(id),
  
  -- Denormalized user info (avoids joins)
  subject_name TEXT NOT NULL,
  proposer_name TEXT NOT NULL,
  
  fine_type fine_type_enum DEFAULT 'fine',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT NOT NULL,
  
  -- Metadata
  comment_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Indexes for performance
CREATE INDEX idx_fines_subject_id ON fines(subject_id);
CREATE INDEX idx_fines_proposer_id ON fines(proposer_id);
CREATE INDEX idx_fines_created_at ON fines(created_at DESC);
CREATE INDEX idx_fines_type ON fines(fine_type);