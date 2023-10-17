SET check_function_bodies = false;
INSERT INTO accounting.payment_info (id, contractor_id, method, swift, swift_iban, ach_routing, ach_account, usdt_wallet) VALUES (6, 2, 'ach', NULL, NULL, 'ach test routing', 'ach test account', NULL);
INSERT INTO accounting.payment_info (id, contractor_id, method, swift, swift_iban, ach_routing, ach_account, usdt_wallet) VALUES (5, 6, 'swift', 'TEBUTRIS930', 'TR330006100519786457841326', '', '', '');
INSERT INTO accounting.payment_info (id, contractor_id, method, swift, swift_iban, ach_routing, ach_account, usdt_wallet) VALUES (7, 1, '', NULL, NULL, '', '', '0x9932de421F159F4441660fFc690Ae895c493203e');
SELECT pg_catalog.setval('accounting.payment_info_id_seq', 5, true);
