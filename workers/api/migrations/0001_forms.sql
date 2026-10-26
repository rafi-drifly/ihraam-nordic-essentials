-- Stage 1 of the move off Supabase: the two public forms.

-- Same shape as public.hajj_prep_subscribers in Supabase, so rows copy across
-- one for one. One signup per email, case-insensitively.
CREATE TABLE hajj_prep_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX idx_hajj_prep_subscribers_email_lower
  ON hajj_prep_subscribers (lower(email));

-- New: Supabase never stored contact messages, so a failed Web3Forms delivery
-- lost the message outright. Every message is now written here first, and
-- delivered = 0 marks the ones that never reached the inbox.
CREATE TABLE contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  delivered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
