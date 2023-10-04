ALTER TABLE client add COLUMN logo_id int REFERENCES media(id);
ALTER TABLE client add COLUMN contract_id int REFERENCES media(id);
