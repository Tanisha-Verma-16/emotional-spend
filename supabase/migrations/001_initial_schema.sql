-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- JOURNAL ENTRIES
-- ─────────────────────────────────────────
CREATE TABLE journal_entries (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text          TEXT NOT NULL,
  sentiment_score   FLOAT,            -- -1.0 (negative) to 1.0 (positive)
  emotion_intensity FLOAT,            -- 0.0 to 1.0
  emotion_labels    TEXT[],           -- e.g. ['stress', 'anxiety', 'overwhelmed']
  triggers          TEXT[],           -- e.g. ['work', 'meetings', 'people']
  extracted_entities JSONB,           -- {people: [], places: [], events: []}
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- ─────────────────────────────────────────
-- GMAIL TOKENS (store OAuth tokens per user)
-- ─────────────────────────────────────────
CREATE TABLE gmail_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TRANSACTIONS (extracted from receipts)
-- ─────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name   TEXT NOT NULL,
  category        TEXT,              -- e.g. 'food_delivery', 'ecommerce', 'travel'
  amount          NUMERIC(10, 2),
  currency        TEXT DEFAULT 'INR',
  transaction_at  TIMESTAMPTZ NOT NULL,
  source_email_id TEXT,              -- Gmail message ID
  raw_snippet     TEXT,              -- email snippet for debug
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_at ON transactions(transaction_at DESC);

-- ─────────────────────────────────────────
-- CORRELATIONS
-- ─────────────────────────────────────────
CREATE TABLE correlations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_entry_id    UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  transaction_id      UUID REFERENCES transactions(id) ON DELETE SET NULL,
  hours_between       FLOAT,         -- time gap between entry and purchase
  sentiment_at_entry  FLOAT,         -- snapshot of sentiment
  spend_amount        NUMERIC(10, 2),
  correlation_score   FLOAT,         -- computed heuristic score
  description         TEXT,          -- human-readable insight
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_correlations_user_id ON correlations(user_id);

-- ─────────────────────────────────────────
-- WEEKLY REPORTS
-- ─────────────────────────────────────────
CREATE TABLE weekly_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,
  week_end     DATE NOT NULL,
  report_text  TEXT NOT NULL,        -- markdown from Mistral
  metadata     JSONB,                -- {top_triggers, avg_sentiment, total_spend}
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own data
CREATE POLICY "Own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own correlations" ON correlations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own weekly reports" ON weekly_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own gmail tokens" ON gmail_tokens
  FOR ALL USING (auth.uid() = user_id);