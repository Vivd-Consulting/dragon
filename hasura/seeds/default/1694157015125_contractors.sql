SET check_function_bodies = false;
INSERT INTO public.contractor_rate (id, rate, created_at, updated_at, deleted_at) VALUES (1, 123, '2023-09-08 16:39:11.070919', '2023-09-08 16:39:11.070919', NULL);
INSERT INTO public.contractor_rate (id, rate, created_at, updated_at, deleted_at) VALUES (2, 456, '2023-09-08 16:39:20.885129', '2023-09-08 16:39:20.885129', NULL);
SELECT pg_catalog.setval('public.contractor_rate_id_seq', 2, true);

INSERT INTO public.contractor (id, name, location, gpt_persona, document, contact_id, rate_id, invoice, start_date, end_date, archived_at, created_at, updated_at) VALUES (1, 'John Doe', 'Canada', 'Here is a test persona for John Doe.', '', NULL, 1, 1555, '2023-09-09 21:00:00', '2023-09-29 21:00:00', NULL, '2023-09-08 06:51:54.937107', '2023-09-08 06:51:54.937107');
INSERT INTO public.contractor (id, name, location, gpt_persona, document, contact_id, rate_id, invoice, start_date, end_date, archived_at, created_at, updated_at) VALUES (2, 'Dawn Test', 'Turkey', 'Dawn Test persona.', '', NULL, 2, 1555, '2023-09-16 21:00:00', '2023-09-29 21:00:00', NULL, '2023-09-08 06:52:21.693842', '2023-09-08 06:52:21.693842');
SELECT pg_catalog.setval('public.contractor_id_seq', 2, true);
