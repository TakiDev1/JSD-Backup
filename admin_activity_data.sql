COPY public.admin_activity_log (id, user_id, action, details, ip_address, "timestamp") FROM stdin;
1	3	Admin Login	Admin login for Developer	172.31.128.83	2025-04-23 05:50:51.677668
2	3	Admin Login	Admin login for Developer	172.31.128.83	2025-04-23 05:52:13.055302
3	3	Admin Login	Admin login for Developer	172.31.128.83	2025-04-23 05:54:18.542132
4	3	Admin Login	Admin login for Developer	172.31.128.83	2025-04-23 06:02:17.17036
5	3	Admin Login	Admin login for Developer	172.31.128.83	2025-04-23 06:07:57.951582
6	3	Admin Login	Admin login for Developer	172.31.128.83	2025-04-23 06:09:45.301982
7	5	Admin Login	Admin login for admin	127.0.0.1	2025-04-23 22:52:43.641589
8	5	Admin Login	Admin login for admin	127.0.0.1	2025-04-23 22:53:17.57627
9	3	Admin Login	Admin login for Developer	172.31.128.4	2025-04-23 23:07:14.507802
10	3	Admin Login	Admin login for Developer	172.31.128.4	2025-04-23 23:11:57.616932
11	3	Admin Login	Admin login for Developer	172.31.128.4	2025-04-23 23:20:20.16001
12	3	Unpublish Mod	Unpublished mod ID: 18, Title: Test	172.31.128.86	2025-04-24 16:32:53.58172
13	3	Unpublish Mod	Unpublished mod ID: 20, Title: Test	172.31.128.70	2025-04-24 23:41:09.095377
14	3	Publish Mod	Published mod ID: 11, Title: JSD Velocity X	172.31.128.96	2025-04-25 02:42:43.058472
15	3	Publish Mod	Published mod ID: 23, Title: Test	172.31.128.96	2025-04-25 02:43:40.430137
16	15	Admin Login	Admin login for Camoz	172.31.128.67	2025-04-28 11:03:07.472356
17	15	Admin Login	Admin login for Camoz	172.31.128.68	2025-06-14 06:27:37.121298
18	15	Admin Login	Admin login for Camoz	172.31.128.38	2025-06-24 00:21:44.577146
19	0	mod_update_notification_sent	Email sent to camoz@example.com for Test v1.0.0	\N	2025-06-24 00:57:52.039393
20	0	mod_update_notification_sent	Email sent to tester@gmail.com for Test v1.0.0	\N	2025-06-24 00:57:52.243554
21	15	Admin Login	Admin login for Camoz	172.31.128.66	2025-06-24 06:21:19.823642
22	17	Ban User	Banned user 12	172.31.128.110	2025-06-24 06:42:48.802447
23	17	Ban User	Banned user 18	172.31.128.110	2025-06-24 06:43:26.709699
24	17	Unban User	Unbanned user 18	172.31.128.110	2025-06-24 06:43:57.385866
\.


--
-- TOC entry 3512 (class 0 OID 24587)
-- Dependencies: 218
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

