CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE dragon_user (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,

  client_id integer REFERENCES client(id),
  contractor_id integer REFERENCES contractor(id),

  accepted_tos boolean NOT NULL DEFAULT false,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  key text NOT NULL,
  remote_url text, -- Represent remote url of the media
  filename text NOT NULL,
  mimetype text,

  user_id text NOT NULL REFERENCES dragon_user(id),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE contractor (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  description text,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE contractor_rate (
  id SERIAL PRIMARY KEY,
  rate float NOT NULL,
  description text,

  contractor_id integer NOT NULL REFERENCES contractor(id),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE client (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  description text,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE project (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  description text,

  client_id integer NOT NULL REFERENCES client(id),

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE project_contractor (
  dragon_user_id text NOT NULL REFERENCES dragon_user(id),
  project_id text NOT NULL REFERENCES project(id),

  PRIMARY KEY (dragon_user_id, project_id)
);

CREATE TABLE budget (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  description text,

  project_id integer NOT NULL REFERENCES project(id),
  start_date timestamp NOT NULL,
  end_date timestamp NOT NULL,

  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);

CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  user_id text NOT NULL REFERENCES dragon_user(id),
  priority integer NOT NULL DEFAULT 0,

  suggested_asignee_id integer REFERENCES dragon_user(id),
  asignee_id integer REFERENCES dragon_user(id),
  project_id integer NOT NULL REFERENCES project(id),
  suggested_estimate_minutes integer NOT NULL DEFAULT 0,
  estimate_minutes integer NOT NULL DEFAULT 0,

  is_approved boolean NOT NULL DEFAULT false,

  started_at timestamp,
  completed_at timestamp,
  due_date timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp
);
