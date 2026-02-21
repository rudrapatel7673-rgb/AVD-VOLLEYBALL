-- Auction real-time state table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS auction_state (
  id int PRIMARY KEY DEFAULT 1,
  state jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Insert the initial row
INSERT INTO auction_state (id, state) VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security but allow public access (anon key)
ALTER TABLE auction_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON auction_state FOR SELECT USING (true);

CREATE POLICY "Allow public update"
  ON auction_state FOR UPDATE USING (true);

CREATE POLICY "Allow public insert"
  ON auction_state FOR INSERT WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE auction_state;
