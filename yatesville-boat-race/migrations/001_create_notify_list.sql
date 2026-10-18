-- People who want to hear when race registration opens
CREATE TABLE IF NOT EXISTS notify_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The public (anon) key may add an email but never read the list back
ALTER TABLE notify_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can sign up" ON notify_list;
CREATE POLICY "anon can sign up" ON notify_list
  FOR INSERT TO anon
  WITH CHECK (true);
