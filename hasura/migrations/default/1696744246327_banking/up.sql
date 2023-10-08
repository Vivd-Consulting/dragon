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

  excluded boolean not null default false,

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

-- Consider this JSON mapping in JS:
-- {
--         account_id: transaction.account_id,
--         account_owner: transaction.account_owner,
--         credit: transaction.amount < 0 ? transaction.amount : null,
--         debit: transaction.amount > 0 ? transaction.amount : null,
--         date: transaction.datetime || transaction.date,
--         currency: transaction.iso_currency_code,
--         location: transaction.location, // TODO: JSONB
--         logo_url: transaction.logo_url,
--         merchant_name: transaction.merchant_name,
--         name: transaction.name,
--         payment_channel: transaction.payment_channel,
--         payment_meta: transaction.payment_meta, // TODO: JSONB
--         personal_finance_category: transaction.detailed,
--         personal_finance_category_confidence: transaction.confidence_level,
--         personal_finance_category_icon_url: transaction.personal_finance_category_icon_url,
--         id: transaction.transaction_id,
--         transaction_type: transaction.transaction_type,
--         website: transaction.website,
--         counterparties: transaction.counterparties, // TODO: JSONB
--         category_id: transaction.category_id,
--         category: transaction.category // TODO: Array
--       }

CREATE TABLE accounting.personal_finance_category (
  id int primary key,
  category_group text not null,
  hirearchy text[] not null
);

DROP TABLE accounting.transaction;
CREATE TABLE accounting.transaction (
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
  counterparties TEXT,
  category_id INT REFERENCES accounting.personal_finance_category(id),
  category TEXT[],

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
