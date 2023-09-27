CREATE TABLE invoice (
  id SERIAL PRIMARY KEY,

  client_id integer REFERENCES client(id),
  contractor_id integer REFERENCES contractor(id),

  submitted_at timestamp,
  due_date timestamp,
  paid_at timestamp,

  archived_at timestamp,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE invoice_item (
  id SERIAL PRIMARY KEY,
  description text,
  currency text NOT NULL DEFAULT 'CAD',
  price float NOT NULL,
  tax float NOT NULL,

  invoice_id integer REFERENCES invoice(id),

  deleted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- ALTER TABLE project_time ADD COLUMN invoice_id integer REFERENCES invoice(id);
