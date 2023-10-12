ALTER TABLE contractor ADD COLUMN country text NOT NULL;
ALTER TABLE contractor ADD COLUMN city text NOT NULL;
ALTER TABLE contractor ADD COLUMN address text NOT NULL;
ALTER TABLE contractor ADD COLUMN post_code text NOT NULL;
ALTER TABLE contractor ADD COLUMN personal_email text NOT NULL UNIQUE;
ALTER TABLE contractor ADD COLUMN work_email text NOT NULL UNIQUE;