CREATE TABLE secret (
  path text PRIMARY KEY,
  description text,
  project_id integer NOT NULL REFERENCES project(id),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);
