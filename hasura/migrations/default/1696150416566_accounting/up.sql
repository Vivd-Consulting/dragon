CREATE SCHEMA IF NOT EXISTS accounting;

CREATE TABLE accounting.bank (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE accounting.account (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  bank_id INTEGER NOT NULL REFERENCES accounting.bank(id),
  currency TEXT NOT NULL,
  balance FLOAT NOT NULL,
  logo_url TEXT,
  description TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE accounting.gic (
	id serial primary key,
	name text not null,
	code int not null,
  type text not null
);

-- CREATE TYPE accounting.transaction_type AS ENUM ('personal', 'business');

CREATE TABLE accounting.debit (
  id SERIAL PRIMARY KEY,
  tid INT NOT NULL, -- ID of transaction in bank
  account_id INT NOT NULL REFERENCES accounting.account(id),
  date timestamp NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,
  gic_id INT REFERENCES accounting.gic(id),
  invoice_item_id INT REFERENCES public.invoice_item(id),

  transaction_type text,

  CONSTRAINT debit_unique UNIQUE (tid, account_id, date),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE accounting.credit (
  id SERIAL PRIMARY KEY,
  tid INT NOT NULL, -- ID of transaction in bank
  account_id INT NOT NULL REFERENCES accounting.account(id),
  date timestamp NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,
  gic_id INT REFERENCES accounting.gic(id),
  invoice_id INT REFERENCES public.invoice(id),

  transaction_type text,

  CONSTRAINT credit_unique UNIQUE (tid, account_id, date),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE VIEW accounting.transactions AS
SELECT
  id AS transaction_id,
  tid,
  account_id,
  date,
  amount AS debit,
  0 AS credit,
  description,
  tax_charged,
  tax_rate,
  notes,
  gic_id,
  invoice_item_id,
  transaction_type,
  created_at,
  updated_at
FROM
  accounting.debit
UNION ALL
SELECT
  id AS transaction_id,
  tid,
  account_id,
  date,
  0 AS debit_amount,
  amount AS credit_amount,
  description,
  tax_charged,
  tax_rate,
  notes,
  gic_id,
  invoice_id,
  transaction_type,
  created_at,
  updated_at
FROM
  accounting.credit
ORDER BY
  tid,
  date;
  