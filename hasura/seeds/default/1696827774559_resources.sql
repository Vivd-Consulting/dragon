SET check_function_bodies = false;
INSERT INTO public.dragon_user (id, name, email, client_id, contractor_id, accepted_tos, is_enabled, created_at, updated_at, deleted_at) VALUES ('google-oauth2|117827800973080497040', 'loren.jk3', 'loren.jk3@gmail.com', NULL, NULL, true, true, '2023-10-06 10:47:59.211282', '2023-10-06 10:47:59.211282', NULL);
INSERT INTO public.media (id, key, remote_url, filename, mimetype, user_id, created_at, updated_at, deleted_at) VALUES (1, 'a77a20a1-6b82-48cb-8930-b2f29e165e22', NULL, 'blob', 'image/png', 'google-oauth2|117827800973080497040', '2023-10-09 04:39:36.923293', '2023-10-09 04:39:36.923293', NULL);
INSERT INTO public.media (id, key, remote_url, filename, mimetype, user_id, created_at, updated_at, deleted_at) VALUES (2, '98041343-d75e-41aa-a81f-8e11bce1c106', NULL, 'blob', 'image/png', 'google-oauth2|117827800973080497040', '2023-10-09 04:40:03.982035', '2023-10-09 04:40:03.982035', NULL);
INSERT INTO public.media (id, key, remote_url, filename, mimetype, user_id, created_at, updated_at, deleted_at) VALUES (3, '1c4d89a2-5350-4a15-a275-507654e59f2f', NULL, 'blob', 'image/png', 'google-oauth2|117827800973080497040', '2023-10-09 04:40:30.952934', '2023-10-09 04:40:30.952934', NULL);
INSERT INTO public.client (id, name, description, gpt_persona, contact_id, document, start_date, end_date, archived_at, deleted_at, created_at, updated_at, logo_id) VALUES (1, 'Agents of Discovery', NULL, NULL, NULL, NULL, '2023-10-01 07:00:00', NULL, NULL, NULL, '2023-10-09 04:39:43.795646', '2023-10-09 04:39:43.795646', 1);
INSERT INTO public.client (id, name, description, gpt_persona, contact_id, document, start_date, end_date, archived_at, deleted_at, created_at, updated_at, logo_id) VALUES (2, 'the botox course', NULL, NULL, NULL, NULL, '2023-10-01 07:00:00', NULL, NULL, NULL, '2023-10-09 04:40:08.553344', '2023-10-09 04:40:08.553344', 2);
INSERT INTO public.client (id, name, description, gpt_persona, contact_id, document, start_date, end_date, archived_at, deleted_at, created_at, updated_at, logo_id) VALUES (3, 'Vivd', NULL, NULL, NULL, NULL, '2023-10-01 07:00:00', NULL, NULL, NULL, '2023-10-09 04:40:36.257356', '2023-10-09 04:40:36.257356', 3);
INSERT INTO public.contractor_rate (id, rate, created_at, updated_at, deleted_at) VALUES (1, 1, '2023-10-09 04:42:20.175459', '2023-10-09 04:42:20.175459', NULL);
INSERT INTO public.contractor_rate (id, rate, created_at, updated_at, deleted_at) VALUES (2, 1, '2023-10-09 04:43:09.303104', '2023-10-09 04:43:09.303104', NULL);
INSERT INTO public.contractor (id, name, location, gpt_persona, document, contact_id, rate_id, invoice, start_date, end_date, archived_at, created_at, updated_at, markup) VALUES (1, 'Loren Kuich', 'West Kelowna, BC, Canada', '', '', NULL, 1, 0, '2023-10-01 07:00:00', NULL, NULL, '2023-10-09 04:42:20.175459', '2023-10-09 04:42:20.175459', 0);
INSERT INTO public.contractor (id, name, location, gpt_persona, document, contact_id, rate_id, invoice, start_date, end_date, archived_at, created_at, updated_at, markup) VALUES (2, 'Dogan Saglam', 'Izmir, Turkey', '', '', NULL, 2, 0, '2023-10-01 07:00:00', NULL, NULL, '2023-10-09 04:43:09.303104', '2023-10-09 04:43:09.303104', 1);
INSERT INTO public.project (id, name, description, gpt_persona, github_repo_org, github_repo_name, tax_rate, currency, client_id, created_at, updated_at, archived_at) VALUES (1, 'Mission Maker', 'Next.js rebuild of the classic AoD Mission Maker: https://mm.agentsofdiscovery.com/Account/SignIn?ReturnUrl=%2F', '', 'Vivd-Consulting', 'mm-next', 0.5, 'CAD', 1, '2023-10-09 04:41:28.205369', '2023-10-09 04:41:28.205369', NULL);
INSERT INTO public.project (id, name, description, gpt_persona, github_repo_org, github_repo_name, tax_rate, currency, client_id, created_at, updated_at, archived_at) VALUES (2, 'Dragon', '', '', 'Vivd-Consulting', 'vms', 0.5, 'CAD', 3, '2023-10-09 04:41:39.710469', '2023-10-09 04:41:39.710469', NULL);
INSERT INTO public.project_contractor (contractor_id, project_id) VALUES (1, 1);
INSERT INTO public.project_contractor (contractor_id, project_id) VALUES (2, 2);
INSERT INTO public.project_contractor (contractor_id, project_id) VALUES (1, 2);
INSERT INTO public.project_time (id, start_time, end_time, description, dragon_user_id, project_id, new_time, created_at, updated_at, deleted_at, invoice_id) VALUES (1, '2023-10-09 04:45:14.161', '2023-10-09 04:46:15.289', NULL, 'google-oauth2|117827800973080497040', 1, NULL, '2023-10-09 04:45:14.178715', '2023-10-09 04:45:14.178715', NULL, NULL);
INSERT INTO public.project_time (id, start_time, end_time, description, dragon_user_id, project_id, new_time, created_at, updated_at, deleted_at, invoice_id) VALUES (2, '2023-10-09 04:46:15.362', '2023-10-09 04:46:21.559', 'Seed data', 'google-oauth2|117827800973080497040', 2, NULL, '2023-10-09 04:46:15.367622', '2023-10-09 04:46:15.367622', NULL, NULL);
INSERT INTO public.secret (path, description, project_id, created_at, updated_at, deleted_at) VALUES ('/Dragon2/HASURA_GRAPHQL_SERVER_PORT', NULL, 2, '2023-10-09 04:48:09.90311', '2023-10-09 04:48:09.90311', NULL);
INSERT INTO public.task (id, title, description, status, user_id, priority, suggested_asignee_id, project_id, suggested_estimate_minutes, estimate_minutes, is_approved, started_at, completed_at, due_date, created_at, updated_at, deleted_at) VALUES (1, 'Accounting Portal', 'Create the accounting section in Dragon', 'todo', 'google-oauth2|117827800973080497040', 2, NULL, 2, 0, 0, false, NULL, NULL, NULL, '2023-10-09 04:43:36.401779', '2023-10-09 04:43:36.401779', NULL);
INSERT INTO public.task (id, title, description, status, user_id, priority, suggested_asignee_id, project_id, suggested_estimate_minutes, estimate_minutes, is_approved, started_at, completed_at, due_date, created_at, updated_at, deleted_at) VALUES (2, 'Rename VMS to Dragon', NULL, 'todo', 'google-oauth2|117827800973080497040', 3, NULL, 2, 0, 0, false, NULL, NULL, NULL, '2023-10-09 04:43:47.580624', '2023-10-09 04:43:47.580624', NULL);
INSERT INTO public.task (id, title, description, status, user_id, priority, suggested_asignee_id, project_id, suggested_estimate_minutes, estimate_minutes, is_approved, started_at, completed_at, due_date, created_at, updated_at, deleted_at) VALUES (3, 'Phase 3C Plan for AoD', NULL, 'todo', 'google-oauth2|117827800973080497040', 2, NULL, 1, 0, 0, false, NULL, NULL, NULL, '2023-10-09 04:44:00.762008', '2023-10-09 04:44:00.762008', NULL);
SELECT pg_catalog.setval('public.client_id_seq', 3, true);
SELECT pg_catalog.setval('public.contractor_id_seq', 2, true);
SELECT pg_catalog.setval('public.contractor_rate_id_seq', 2, true);
SELECT pg_catalog.setval('public.media_id_seq', 3, true);
SELECT pg_catalog.setval('public.project_id_seq', 2, true);
SELECT pg_catalog.setval('public.project_time_id_seq', 2, true);
SELECT pg_catalog.setval('public.task_id_seq', 3, true);

UPDATE public.dragon_user SET contractor_id = 1 WHERE id = 'google-oauth2|117827800973080497040';
