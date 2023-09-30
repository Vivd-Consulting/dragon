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

CREATE TABLE debit (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES account(id),
  date timestamp NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE credit (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES account(id),
  date timestamp NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  tax_charged FLOAT,
  tax_rate FLOAT,
  notes TEXT,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
