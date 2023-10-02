CREATE TABLE accounting.transactions_recommendations (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES accounting.transactions(id) ON DELETE CASCADE,
    recommended_transaction_id INT REFERENCES accounting.transactions(id) ON DELETE CASCADE,
    UNIQUE (transaction_id, recommended_transaction_id)
);

-- ALTER TABLE accounting.transactions ADD COLUMN recommended_relations JSONB;
ALTER TABLE accounting.transactions ADD COLUMN related_transaction_id INT REFERENCES accounting.transactions(id) ON DELETE CASCADE;