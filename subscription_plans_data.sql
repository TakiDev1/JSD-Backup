COPY public.subscription_plans (id, name, description, price, "interval", features, stripe_price_id, is_active, is_featured, sort_order, created_at, updated_at) FROM stdin;
1	Monthly Premium	Access to all premium mods for one month	5.99	month	["Access to all premium mods", "Early access to new releases", "No download limits", "Premium support"]	\N	t	f	1	2025-05-11 00:07:15.240536	2025-05-11 00:07:15.240536
2	Quarterly Premium	Access to all premium mods for three months	14.99	quarter	["Access to all premium mods", "Early access to new releases", "No download limits", "Premium support", "Save 17% compared to monthly"]	\N	t	t	2	2025-05-11 00:07:15.328227	2025-05-11 00:07:15.328227
3	Annual Premium	Access to all premium mods for a full year	39.99	year	["Access to all premium mods", "Early access to new releases", "No download limits", "Premium support", "Save 45% compared to monthly", "Exclusive annual subscriber mod packs"]	\N	t	f	3	2025-05-11 00:07:15.407159	2025-05-11 00:07:15.407159
\.


--
-- TOC entry 3530 (class 0 OID 24692)
-- Dependencies: 236
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

