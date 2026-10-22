-- People who want to hear when BedLunch and Little Big Cat come out
CREATE TABLE IF NOT EXISTS mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The public (anon) key may add an email but never read the list back
GRANT INSERT ON mailing_list TO anon;
ALTER TABLE mailing_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can sign up" ON mailing_list;
CREATE POLICY "anon can sign up" ON mailing_list
  FOR INSERT TO anon
  WITH CHECK (true);
