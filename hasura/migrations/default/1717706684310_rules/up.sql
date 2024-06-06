CREATE TYPE rule_type AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE accounting.rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  transaction_regex TEXT NOT NULL,
  rule_type rule_type NOT NULL,
  gic_id INT REFERENCES accounting.category(id),
  applied_rule INT REFERENCES accounting.rules(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);