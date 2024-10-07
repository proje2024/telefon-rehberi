--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8 (Debian 15.8-1.pgdg120+1)
-- Dumped by pg_dump version 15.8 (Debian 15.8-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: subscriptiontypes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.subscriptiontypes (id, subscription_types) FROM stdin;
1	substype1
2	substype2
3	substype3
\.


--
-- Data for Name: directory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.directory (id, "hiyerId", "ataId", adi, "hiyerAd", internal_number_area_code, internal_number, internal_number_subscription_id, ip_number_area_code, ip_number, ip_number_subscription_id, mailbox, visibility, "visibilityForSubDirectory") FROM stdin;
100	\N	\N	KURUCU	KURUCU	\N		1	\N		1		1	1
20	1.5.3	6	Ürün Müdürü	CEO/CMO/Ürün Müdürü	\N		1	\N		1		1	1
21	1.5.1.1	18	Pazarlama Uzmanı	CEO/CMO/Pazarlama Müdürü/Pazarlama Uzmanı	\N		1	\N		1		1	1
22	1.5.2.1	19	Grafik Tasarımcı	CEO/CMO/Dijital Pazarlama Müdürü/Grafik Tasarımcı	\N		1	\N		1		1	1
23	1.2.1.1	9	Yazılım Geliştirme Uzmanı	CEO/CTO/Yazılım Geliştirme Müdürü/Yazılım Geliştirme Uzmanı	\N		1	\N		1		1	1
24	1.2.2.1	10	Network Uzmanı	CEO/CTO/IT Destek Müdürü/Network Uzmanı	\N		1	\N		1		1	1
25	1.2.3.1	11	Siber Güvenlik Uzmanı	CEO/CTO/Siber Güvenlik Müdürü/Siber Güvenlik Uzmanı	\N		1	\N		1		1	1
26	1.1.2.1	8	Muhasebe Uzmanı	CEO/CFO/Muhasebe Müdürü/Muhasebe Uzmanı	\N		1	\N		1		1	1
27	1.3.3.1	14	Tedarik Uzmanı	CEO/COO/Tedarik Zinciri Müdürü/Tedarik Uzmanı	\N		1	\N		1		1	1
1	1	1	CEO	CEO	\N		1	\N		1		1	1
2	1.1	1	CFO	CEO/CFO	\N		1	\N		1		1	1
12	1.3.1	4	Operasyon Müdürü	CEO/COO/Operasyon Müdürü	\N		1	\N		1		1	1
13	1.3.2	4	Üretim Müdürü	CEO/COO/Üretim Müdürü	\N		1	\N		1		1	1
14	1.3.3	4	Tedarik Zinciri Müdürü	CEO/COO/Tedarik Zinciri Müdürü	\N		1	\N		1		1	1
15	1.4.1	5	İnsan Kaynakları Müdürü	CEO/CHRO/İnsan Kaynakları Müdürü	\N		1	\N		1		1	1
16	1.4.2	5	Eğitim ve Gelişim Müdürü	CEO/CHRO/Eğitim ve Gelişim Müdürü	\N		1	\N		1		1	1
3	1.2	1	CTO	CEO/CTO	\N		1	\N		1		1	1
4	1.3	1	COO	CEO/COO	\N		1	\N		1		1	1
5	1.4	1	CHRO	CEO/CHRO	\N		1	\N		1		1	1
6	1.5	1	CMO	CEO/CMO	\N		1	\N		1		1	1
7	1.1.1	2	Finans Müdürü	CEO/CFO/Finans Müdürü	\N		1	\N		1		1	1
8	1.1.2	2	Muhasebe Müdürü	CEO/CFO/Muhasebe Müdürü	\N		1	\N		1		1	1
9	1.2.1	3	Yazılım Geliştirme Müdürü	CEO/CTO/Yazılım Geliştirme Müdürü	\N		1	\N		1		1	1
10	1.2.2	3	IT Destek Müdürü	CEO/CTO/IT Destek Müdürü	\N		1	\N		1		1	1
11	1.2.3	3	Siber Güvenlik Müdürü	CEO/CTO/Siber Güvenlik Müdürü	\N		1	\N		1		1	1
17	1.4.3	5	İşe Alım Müdürü	CEO/CHRO/İşe Alım Müdürü	\N		1	\N		1		1	1
18	1.5.1	6	Pazarlama Müdürü	CEO/CMO/Pazarlama Müdürü	\N		1	\N		1		1	1
19	1.5.2	6	Dijital Pazarlama Müdürü	CEO/CMO/Dijital Pazarlama Müdürü	\N		1	\N		1		1	1
\.


--
-- Data for Name: dynamic_attributes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.dynamic_attributes (id, attribute_name) FROM stdin;
\.


--
-- Data for Name: dynamic_data; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.dynamic_data (id, attributeid, tableid, recordid, value) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.roles (id, name, description) FROM stdin;
1	admin	Admin has the capability to do everything
2	users	Default users can view directory
\.


--
-- Data for Name: sub_directory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sub_directory (id, directoryid, adi, internal_number_area_code, internal_number, internal_number_subscription_id, ip_number_area_code, ip_number, ip_number_subscription_id, mailbox) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, name, surname, phone_number, username, password, email, role) FROM stdin;
1				admin	$2b$12$Vs1knNW7gjv0v.nvzS2w/ulVFoV0Wpsir/I2G5.ZP3NCpTzIhWDfK		1
\.


--
-- Name: directory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.directory_id_seq', 1, false);


--
-- Name: dynamic_attributes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.dynamic_attributes_id_seq', 1, false);


--
-- Name: dynamic_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.dynamic_data_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.roles_id_seq', 33, true);


--
-- Name: sub_directory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.sub_directory_id_seq', 1, false);


--
-- Name: subscriptiontypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.subscriptiontypes_id_seq', 33, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

