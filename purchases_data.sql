COPY public.purchases (id, user_id, mod_id, transaction_id, stripe_payment_intent_id, price, status, purchase_date) FROM stdin;
1	15	25	pi_3Rap4gBIKE90JGG20gsjWJ50	\N	1	completed	2025-06-17 02:18:40.469172
3	16	25	pi_3RdKUABIKE90JGG21wZjufVR	\N	1	completed	2025-06-24 00:13:57.788594
4	17	25	pi_3RdsT1BIKE90JGG21LBnX6bb	\N	1	completed	2025-06-25 12:30:29.206304
\.


--
-- TOC entry 3526 (class 0 OID 24669)
-- Dependencies: 232
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

