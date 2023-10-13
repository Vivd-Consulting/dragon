ALTER TABLE contractor DROP COLUMN name;

ALTER TABLE contractor ADD COLUMN first_name TEXT NOT NULL DEFAULT md5(random()::text);
ALTER TABLE contractor ALTER COLUMN first_name DROP DEFAULT;

ALTER TABLE contractor ADD COLUMN last_name TEXT NOT NULL DEFAULT md5(random()::text);
ALTER TABLE contractor ALTER COLUMN last_name DROP DEFAULT;
