DROP TABLE accounting.bank;
CREATE TABLE accounting.bank (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT,
  primary_color TEXT,
  logo TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

DROP TABLE accounting.account;
CREATE TABLE accounting.account (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bank_id TEXT NOT NULL REFERENCES accounting.bank(id),
  currency TEXT NOT NULL,
  balance FLOAT NOT NULL,
  description TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

DROP TABLE accounting.gic;
CREATE TABLE accounting.category (
  id serial primary key,
  name text not null,
  gic int,
  transaction_type text not null,
  is_business boolean not null default false
);

CREATE TABLE accounting.transactions (
  id SERIAL PRIMARY KEY,
  tid INT NOT NULL, -- ID of transaction in bank
  account_id INT NOT NULL REFERENCES accounting.account(id),
  date timestamp NOT NULL,
  credit FLOAT,
  debit FLOAT,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,
  gic_id INT REFERENCES accounting.gic(id),
  invoice_id INT REFERENCES public.invoice(id),
  invoice_item_id INT REFERENCES public.invoice_item(id),

  transaction_type text,

  CONSTRAINT transaction_unique UNIQUE (tid, account_id, date),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
