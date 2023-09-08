SET check_function_bodies = false;
INSERT INTO public.project (id, name, description, gpt_persona, github_repo_org, github_repo_name, client_id, created_at, updated_at, archived_at) VALUES (1, 'Dragon Project', 'Here is a test description.', 'Here is a test persona.', 'dsaglam94', 'dragon', 1, '2023-09-08 09:21:07.631159', '2023-09-08 09:21:07.631159', NULL);
INSERT INTO public.project (id, name, description, gpt_persona, github_repo_org, github_repo_name, client_id, created_at, updated_at, archived_at) VALUES (2, 'Doe Inc.', 'Test description', 'test persona', 'john', 'doe', 2, '2023-09-08 09:21:38.550253', '2023-09-08 09:21:38.550253', NULL);
SELECT pg_catalog.setval('public.project_id_seq', 2, true);
