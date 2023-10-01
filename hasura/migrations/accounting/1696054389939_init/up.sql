CREATE TABLE bank (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  bank_id INTEGER NOT NULL REFERENCES bank(id),
  currency TEXT NOT NULL,
  balance FLOAT NOT NULL,
  logo_url TEXT,
  description TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE gic (
	id serial primary key,
	name text not null unique,
	code int unique,
  type text not null
);

CREATE TABLE debit (
  id SERIAL PRIMARY KEY,
  tid INT NOT NULL, -- ID of transaction in bank
  account_id INT NOT NULL REFERENCES account(id),
  date timestamp NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,
  business_transaction BOOLEAN NOT NULL DEFAULT FALSE,
  gic_id INT REFERENCES gic(id),

  CONSTRAINT debit_unique UNIQUE (tid, account_id, date),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE credit (
  id SERIAL PRIMARY KEY,
  tid INT NOT NULL, -- ID of transaction in bank
  account_id INT NOT NULL REFERENCES account(id),
  date timestamp NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,
  gic_id INT REFERENCES gic(id),
  invoice_id INT,
  business_transaction BOOLEAN NOT NULL DEFAULT FALSE,
  personal_pay BOOLEAN NOT NULL DEFAULT FALSE,

  CONSTRAINT credit_unique UNIQUE (tid, account_id, date),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
