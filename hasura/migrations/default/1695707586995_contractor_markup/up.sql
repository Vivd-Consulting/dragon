ALTER TABLE contractor ADD COLUMN markup float NOT NULL DEFAULT 0.0;
ALTER TABLE contractor add COLUMN contract_id int REFERENCES media(id);