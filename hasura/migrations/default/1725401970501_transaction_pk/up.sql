-- SET search_path = 'accounting';

-- ALTER TABLE transactions_recommendations DROP CONSTRAINT transactions_recommendations_transaction_id_fkey;
-- ALTER TABLE transactions_recommendations DROP CONSTRAINT transactions_recommendations_recommended_transaction_id_fkey;
-- ALTER TABLE transactions DROP CONSTRAINT transactions_related_transaction_id_fkey;

-- ALTER TABLE transactions DROP CONSTRAINT transactions_pkey;
-- ALTER TABLE transactions ADD PRIMARY KEY (id, account_id);

-- ALTER TABLE transactions add column related_account_id text references account(id);
-- ALTER TABLE transactions_recommendations add column account_id text references account(id);
-- ALTER TABLE transactions_recommendations add column recommended_account_id text references account(id);

-- ALTER TABLE transactions_recommendations ADD CONSTRAINT transactions_recommendations_transaction_id_fkey FOREIGN KEY (transaction_id, account_id) REFERENCES transactions(id, account_id);
-- ALTER TABLE transactions_recommendations ADD CONSTRAINT transactions_recommendations_recommended_transaction_id_fkey FOREIGN KEY (recommended_transaction_id, recommended_account_id) REFERENCES transactions(id, account_id);
-- -- ALTER TABLE transactions ADD CONSTRAINT transactions_related_transaction_id_fkey FOREIGN KEY (related_transaction_id) REFERENCES transactions(id, account_id);

-- ALTER TABLE transactions_recommendations DROP CONSTRAINT transactions_recommendations_transaction_id_recommended_tra_key;

-- ALTER TABLE transactions_recommendations ADD CONSTRAINT transactions_recommendations_unique_key UNIQUE (transaction_id, recommended_transaction_id, account_id, recommended_account_id);

-- UPDATE transactions tr
-- SET related_account_id = t.account_id
-- FROM transactions t
-- WHERE tr.related_transaction_id = t.id
--   AND tr.related_account_id IS NULL;

-- UPDATE transactions_recommendations tr
-- SET account_id = t.account_id
-- FROM transactions t
-- WHERE tr.transaction_id = t.id
--   AND tr.account_id IS NULL;

-- UPDATE transactions_recommendations tr
-- SET recommended_account_id = t.account_id
-- FROM transactions t
-- WHERE tr.recommended_transaction_id = t.id
--   AND tr.recommended_account_id IS NULL;