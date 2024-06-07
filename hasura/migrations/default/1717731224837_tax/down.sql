DROP TABLE accounting.tax;

ALTER TABLE accounting.rules DROP COLUMN tax_id;

ALTER TABLE accounting.transactions DROP COLUMN tax_id;
ALTER TABLE accounting.transactions ADD COLUMN tax_charged FLOAT;
ALTER TABLE accounting.transactions ADD COLUMN tax_rate FLOAT;