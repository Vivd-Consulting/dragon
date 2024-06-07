CREATE TABLE accounting.tax (
  id serial PRIMARY KEY,
  name text NOT NULL,
  rate float NOT NULL,
  country text NOT NULL,
  province text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE accounting.rules ADD COLUMN tax_id integer REFERENCES accounting.tax(id);

ALTER TABLE accounting.transactions DROP COLUMN tax_charged;
ALTER TABLE accounting.transactions DROP COLUMN tax_rate;
ALTER TABLE accounting.transactions ADD COLUMN tax_id integer REFERENCES accounting.tax(id);