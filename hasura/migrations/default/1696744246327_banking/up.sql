DROP SCHEMA IF EXISTS accounting CASCADE;
CREATE SCHEMA accounting;

CREATE TABLE accounting.bank (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT,
  primary_color TEXT,
  logo TEXT,

  cursor TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE accounting.account (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bank_id TEXT NOT NULL REFERENCES accounting.bank(id),
  currency TEXT NOT NULL,
  balance FLOAT NOT NULL,
  description TEXT,

  excluded boolean not null default false,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE accounting.category (
  id serial primary key,
  name text not null,
  gic int,
  transaction_type text not null,
  is_business boolean not null default false
);

CREATE TABLE accounting.personal_finance_category (
  id int primary key,
  category_group text not null,
  hierarchy text[] not null
);

CREATE TABLE accounting.transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounting.account(id),
  account_owner TEXT,
  credit FLOAT,
  debit FLOAT,
  date timestamp NOT NULL,
  currency TEXT NOT NULL,
  location JSONB,
  logo_url TEXT,
  merchant_name TEXT,
  name TEXT NOT NULL,
  payment_channel TEXT,
  payment_meta JSONB,
  personal_finance_category TEXT,
  personal_finance_category_confidence TEXT,
  personal_finance_category_icon_url TEXT,
  transaction_type TEXT,
  website TEXT,
  counterparties JSONB[],
  gic_category_id INT REFERENCES accounting.category(id),
  -- DROP CONSTRAINT
  -- category_id INT REFERENCES accounting.personal_finance_category(id),
  category_id INT,
  category TEXT[],

  invoice_id INT REFERENCES public.invoice(id),
  invoice_item_id INT REFERENCES public.invoice_item(id),

  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE accounting.transactions_recommendations (
  id SERIAL PRIMARY KEY,
  transaction_id TEXT REFERENCES accounting.transactions(id) ON DELETE CASCADE,
  recommended_transaction_id TEXT REFERENCES accounting.transactions(id) ON DELETE CASCADE,
  UNIQUE (transaction_id, recommended_transaction_id)
);

ALTER TABLE accounting.transactions ADD COLUMN related_transaction_id TEXT REFERENCES accounting.transactions(id) ON DELETE CASCADE;
