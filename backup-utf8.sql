--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Industry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Industry" (id, name, "createdAt", "isHeading", "order", "updatedAt") FROM stdin;
310	Finance & Professional Services	2025-09-16 08:41:08.872	t	1	2025-09-16 08:41:08.872
311	Accounting	2025-09-16 08:41:08.872	f	2	2025-09-16 08:41:08.872
312	Auditing	2025-09-16 08:41:08.872	f	3	2025-09-16 08:41:08.872
313	Banking	2025-09-16 08:41:08.872	f	4	2025-09-16 08:41:08.872
314	Financial Services	2025-09-16 08:41:08.872	f	5	2025-09-16 08:41:08.872
315	Insurance	2025-09-16 08:41:08.872	f	6	2025-09-16 08:41:08.872
316	Legal	2025-09-16 08:41:08.872	f	7	2025-09-16 08:41:08.872
317	Venture Capital	2025-09-16 08:41:08.872	f	8	2025-09-16 08:41:08.872
318	Investment	2025-09-16 08:41:08.872	f	9	2025-09-16 08:41:08.872
319	Business & Management	2025-09-16 08:41:08.872	t	10	2025-09-16 08:41:08.872
320	Consulting	2025-09-16 08:41:08.872	f	11	2025-09-16 08:41:08.872
321	Business Strategy	2025-09-16 08:41:08.872	f	12	2025-09-16 08:41:08.872
322	Management	2025-09-16 08:41:08.872	f	13	2025-09-16 08:41:08.872
323	Human Resources	2025-09-16 08:41:08.872	f	14	2025-09-16 08:41:08.872
324	Recruitment	2025-09-16 08:41:08.872	f	15	2025-09-16 08:41:08.872
325	Marketing	2025-09-16 08:41:08.872	f	16	2025-09-16 08:41:08.872
326	Public Relations	2025-09-16 08:41:08.872	f	17	2025-09-16 08:41:08.872
327	Advertising	2025-09-16 08:41:08.872	f	18	2025-09-16 08:41:08.872
328	Media	2025-09-16 08:41:08.872	f	19	2025-09-16 08:41:08.872
329	Communications	2025-09-16 08:41:08.872	f	20	2025-09-16 08:41:08.872
330	Research	2025-09-16 08:41:08.872	f	21	2025-09-16 08:41:08.872
331	Development	2025-09-16 08:41:08.872	f	22	2025-09-16 08:41:08.872
332	Technology & Digital	2025-09-16 08:41:08.872	t	23	2025-09-16 08:41:08.872
333	ICT	2025-09-16 08:41:08.872	f	24	2025-09-16 08:41:08.872
334	Software	2025-09-16 08:41:08.872	f	25	2025-09-16 08:41:08.872
335	Technology	2025-09-16 08:41:08.872	f	26	2025-09-16 08:41:08.872
336	Telecommunications	2025-09-16 08:41:08.872	f	27	2025-09-16 08:41:08.872
337	Cybersecurity	2025-09-16 08:41:08.872	f	28	2025-09-16 08:41:08.872
338	Data	2025-09-16 08:41:08.872	f	29	2025-09-16 08:41:08.872
339	Analytics	2025-09-16 08:41:08.872	f	30	2025-09-16 08:41:08.872
340	E-Commerce	2025-09-16 08:41:08.872	f	31	2025-09-16 08:41:08.872
341	Gaming	2025-09-16 08:41:08.872	f	32	2025-09-16 08:41:08.872
342	Entertainment Tech	2025-09-16 08:41:08.872	f	33	2025-09-16 08:41:08.872
343	FinTech	2025-09-16 08:41:08.872	f	34	2025-09-16 08:41:08.872
344	Education	2025-09-16 08:41:08.872	t	35	2025-09-16 08:41:08.872
345	Teaching	2025-09-16 08:41:08.872	f	36	2025-09-16 08:41:08.872
346	Training	2025-09-16 08:41:08.872	f	37	2025-09-16 08:41:08.872
347	E-Learning	2025-09-16 08:41:08.872	f	38	2025-09-16 08:41:08.872
348	EdTech	2025-09-16 08:41:08.872	f	39	2025-09-16 08:41:08.872
349	Capacity Building	2025-09-16 08:41:08.872	f	40	2025-09-16 08:41:08.872
350	Healthcare	2025-09-16 08:41:08.872	t	41	2025-09-16 08:41:08.872
351	Medical Services	2025-09-16 08:41:08.872	f	42	2025-09-16 08:41:08.872
352	Hospitals	2025-09-16 08:41:08.872	f	43	2025-09-16 08:41:08.872
353	Clinics	2025-09-16 08:41:08.872	f	44	2025-09-16 08:41:08.872
354	Pharmaceutical	2025-09-16 08:41:08.872	f	45	2025-09-16 08:41:08.872
355	Biotechnology	2025-09-16 08:41:08.872	f	46	2025-09-16 08:41:08.872
356	Public Health	2025-09-16 08:41:08.872	f	47	2025-09-16 08:41:08.872
357	Fitness	2025-09-16 08:41:08.872	f	48	2025-09-16 08:41:08.872
358	Wellness	2025-09-16 08:41:08.872	f	49	2025-09-16 08:41:08.872
359	Agriculture & Food	2025-09-16 08:41:08.872	t	50	2025-09-16 08:41:08.872
360	Agriculture	2025-09-16 08:41:08.872	f	51	2025-09-16 08:41:08.872
361	Agro-Allied	2025-09-16 08:41:08.872	f	52	2025-09-16 08:41:08.872
362	Fisheries	2025-09-16 08:41:08.872	f	53	2025-09-16 08:41:08.872
363	Aquaculture	2025-09-16 08:41:08.872	f	54	2025-09-16 08:41:08.872
364	Forestry	2025-09-16 08:41:08.872	f	55	2025-09-16 08:41:08.872
365	Food Processing	2025-09-16 08:41:08.872	f	56	2025-09-16 08:41:08.872
366	Retail	2025-09-16 08:41:08.872	f	57	2025-09-16 08:41:08.872
367	FMCG	2025-09-16 08:41:08.872	f	58	2025-09-16 08:41:08.872
368	Energy & Natural Resources	2025-09-16 08:41:08.872	t	59	2025-09-16 08:41:08.872
369	Oil & Gas	2025-09-16 08:41:08.872	f	60	2025-09-16 08:41:08.872
370	Energy	2025-09-16 08:41:08.872	f	61	2025-09-16 08:41:08.872
371	Power	2025-09-16 08:41:08.872	f	62	2025-09-16 08:41:08.872
372	Utilities	2025-09-16 08:41:08.872	f	63	2025-09-16 08:41:08.872
373	Renewable Energy	2025-09-16 08:41:08.872	f	64	2025-09-16 08:41:08.872
374	Mining	2025-09-16 08:41:08.872	f	65	2025-09-16 08:41:08.872
375	Extraction	2025-09-16 08:41:08.872	f	66	2025-09-16 08:41:08.872
376	Engineering & Manufacturing	2025-09-16 08:41:08.872	t	67	2025-09-16 08:41:08.872
377	Engineering	2025-09-16 08:41:08.872	f	68	2025-09-16 08:41:08.872
378	Technical Services	2025-09-16 08:41:08.872	f	69	2025-09-16 08:41:08.872
379	Construction	2025-09-16 08:41:08.872	f	70	2025-09-16 08:41:08.872
380	Real Estate	2025-09-16 08:41:08.872	f	71	2025-09-16 08:41:08.872
381	Architecture	2025-09-16 08:41:08.872	f	72	2025-09-16 08:41:08.872
382	Design	2025-09-16 08:41:08.872	f	73	2025-09-16 08:41:08.872
383	Manufacturing	2025-09-16 08:41:08.872	f	74	2025-09-16 08:41:08.872
384	Production	2025-09-16 08:41:08.872	f	75	2025-09-16 08:41:08.872
385	Industrial Automation	2025-09-16 08:41:08.872	f	76	2025-09-16 08:41:08.872
386	Transport & Logistics	2025-09-16 08:41:08.872	t	77	2025-09-16 08:41:08.872
387	Logistics	2025-09-16 08:41:08.872	f	78	2025-09-16 08:41:08.872
388	Supply Chain	2025-09-16 08:41:08.872	f	79	2025-09-16 08:41:08.872
389	Aviation	2025-09-16 08:41:08.872	f	80	2025-09-16 08:41:08.872
390	Aerospace	2025-09-16 08:41:08.872	f	81	2025-09-16 08:41:08.872
391	Maritime	2025-09-16 08:41:08.872	f	82	2025-09-16 08:41:08.872
392	Shipping	2025-09-16 08:41:08.872	f	83	2025-09-16 08:41:08.872
393	Rail Transport	2025-09-16 08:41:08.872	f	84	2025-09-16 08:41:08.872
394	Road Transport	2025-09-16 08:41:08.872	f	85	2025-09-16 08:41:08.872
395	Ride-hailing	2025-09-16 08:41:08.872	f	86	2025-09-16 08:41:08.872
396	Delivery Services	2025-09-16 08:41:08.872	f	87	2025-09-16 08:41:08.872
397	Government & Public Sector	2025-09-16 08:41:08.872	t	88	2025-09-16 08:41:08.872
398	Government	2025-09-16 08:41:08.872	f	89	2025-09-16 08:41:08.872
399	Public Service	2025-09-16 08:41:08.872	f	90	2025-09-16 08:41:08.872
400	NGO	2025-09-16 08:41:08.872	f	91	2025-09-16 08:41:08.872
401	Non-Profit	2025-09-16 08:41:08.872	f	92	2025-09-16 08:41:08.872
402	International Organizations	2025-09-16 08:41:08.872	f	93	2025-09-16 08:41:08.872
403	Security Services	2025-09-16 08:41:08.872	f	94	2025-09-16 08:41:08.872
404	Military	2025-09-16 08:41:08.872	f	95	2025-09-16 08:41:08.872
405	Defense	2025-09-16 08:41:08.872	f	96	2025-09-16 08:41:08.872
406	Creative & Lifestyle	2025-09-16 08:41:08.872	t	97	2025-09-16 08:41:08.872
407	Arts	2025-09-16 08:41:08.872	f	98	2025-09-16 08:41:08.872
408	Culture	2025-09-16 08:41:08.872	f	99	2025-09-16 08:41:08.872
409	Hospitality	2025-09-16 08:41:08.872	f	100	2025-09-16 08:41:08.872
410	Tourism	2025-09-16 08:41:08.872	f	101	2025-09-16 08:41:08.872
411	Events Management	2025-09-16 08:41:08.872	f	102	2025-09-16 08:41:08.872
412	Fashion	2025-09-16 08:41:08.872	f	103	2025-09-16 08:41:08.872
413	Beauty	2025-09-16 08:41:08.872	f	104	2025-09-16 08:41:08.872
414	Sports	2025-09-16 08:41:08.872	f	105	2025-09-16 08:41:08.872
415	Recreation	2025-09-16 08:41:08.872	f	106	2025-09-16 08:41:08.872
416	Entertainment	2025-09-16 08:41:08.872	f	107	2025-09-16 08:41:08.872
417	Music	2025-09-16 08:41:08.872	f	108	2025-09-16 08:41:08.872
418	Film	2025-09-16 08:41:08.872	f	109	2025-09-16 08:41:08.872
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, phone, "passwordHash", role, "emailVerifiedAt", status, "createdAt", "updatedAt") FROM stdin;
9784c3ee-80e5-46ae-b62c-e48f3fbde58b	test.candidate@example.com	1234567890	$argon2id$v=19$m=65536,t=3,p=4$aqMci1XbWGHugT4IXxkTgg$0FQu3NRnN51dv3O2CC0k3oJQvWIQ3LVhWOqdnPiFNwI	CANDIDATE	\N	ACTIVE	2025-09-04 15:02:03.164	2025-09-04 15:02:03.164
097944c2-3582-4220-ade4-4a93ab404375	adinkems@gmail.com	\N	$argon2id$v=19$m=65536,t=3,p=4$lJ8G2lXO24OnXyLsLeZdtg$a759APkYcPau2rJR2rUHNLSBIN5AWniF8JWeBK2aKUI	AGENCY	\N	ACTIVE	2025-09-05 08:06:38.202	2025-09-05 08:06:38.202
fcd910ed-f411-4524-bdb1-23de83a9e4d1	ezetaj@gmail.com	\N	$argon2id$v=19$m=65536,t=3,p=4$YtaIOT3kOhLeD2F444ftRQ$ob0tm3ekK4BOiYKLZgPH/CuV5yDELL9Rr3z+eAm4nTI	ADMIN	\N	ACTIVE	2025-09-05 08:05:35.134	2025-09-08 00:17:57.501
5900ca1a-625c-4a14-8331-ee286900ad73	tedunjaiyem@gmail.com	07046015410	$argon2id$v=19$m=65536,t=3,p=4$aM2FsjKjTTJVChoYLzgOzQ$G86fbtF4p1HaYJJ9+xDMdzDEAmYM/RtREVVZFd9TyaM	CANDIDATE	\N	ACTIVE	2025-09-04 15:12:23.319	2025-09-09 16:37:15.578
\.


--
-- Data for Name: Agency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Agency" (id, "ownerUserId", name, "rcNumber", "industryId", website, "sizeRange", "domainVerified", "cacVerified", "logoKey", "headquartersStateId", "lgaId", "createdAt") FROM stdin;
f7472be1-137d-42c4-b74a-9217988bd932	097944c2-3582-4220-ade4-4a93ab404375	AdinKems Inc.		335			f	f	\N	37	\N	2025-09-05 08:06:38.204
\.


--
-- Data for Name: AgencyMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AgencyMember" (id, "agencyId", "userId", role) FROM stdin;
8b66dfd6-9086-403b-b948-8c61bb7cff79	f7472be1-137d-42c4-b74a-9217988bd932	097944c2-3582-4220-ade4-4a93ab404375	OWNER
\.


--
-- Data for Name: SubscriptionPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SubscriptionPlan" (id, name, description, price, currency, features, "stripePriceId", "jobPostLimit", "memberLimit") FROM stdin;
0b46b7e7-e867-43ce-a0ef-6be760d58cc2	Basic	Perfect for getting started and finding initial talent.	0	NGN	["Post 2 jobs at a time", "Limited search filters (location, role)", "Basic agency listing (unverified)", "1 agency member account", "Standard support"]	price_1S7citIGb6x0f4045UK1S7G4	2	1
18b6484d-cd07-4fb5-b724-c5907049c251	Pro	Ideal for growing teams with continuous hiring needs.	10000	NGN	["Post up to 20 jobs", "Advanced search filters (skills, GPA, etc.)", "Shortlist up to 100 candidates", "Branded agency profile page", "Domain & email verification", "Add up to 3 recruiter accounts", "Job & applicant analytics"]	price_1S7cM5IGb6x0f4048axxqDh9	20	3
307e72e7-163a-438f-a22e-44f43e0e2a17	Enterprise	For large organizations with dedicated hiring teams.	25000	NGN	["Unlimited job posts & shortlists", "AI-powered candidate recommendations", "Saved searches & new candidate alerts", "Full CAC verification badge", "Featured 'Top Employer' listing", "Unlimited recruiter accounts", "Advanced demographic & skills analytics"]	price_1S7cpkIGb6x0f404VFAaVjFK	-1	-1
\.


--
-- Data for Name: AgencySubscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AgencySubscription" (id, "agencyId", "planId", "endDate", status, "stripeCurrentPeriodEnd", "stripeCustomerId", "stripeSubscriptionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: CandidateProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CandidateProfile" (id, "userId", "firstName", "lastName", phone, dob, gender, "nyscNumber", "nyscBatch", "nyscStream", "callupHash", "stateCode", "primaryStateId", "lgaId", "disabilityInfo", "isVerified", "verificationLevel", "isRemote", "isOpenToReloc", "salaryMin", "salaryMax", availability, "workAuth", summary, linkedin, portfolio, "graduationYear", "gpaBand", "cvFileKey", "nyscFileKey") FROM stdin;
368bd3d5-db99-4983-9634-c28fb3833cdc	9784c3ee-80e5-46ae-b62c-e48f3fbde58b	John	Doe	1234567890	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	UNVERIFIED	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49318ac1-ce7e-435b-ac88-06a97a69641e	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Ezemuah	Tajudeen	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	UNVERIFIED	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
243d4130-0256-4a3e-89f5-c99888237c0f	5900ca1a-625c-4a14-8331-ee286900ad73	Matthew	Tedunjaiye	07046015410	2001-05-09 00:00:00	\N	\N	Batch B	Stream 2	\N	\N	\N	\N	\N	f	UNVERIFIED	t	t	250000	\N	\N	\N	Oludasile PPALink	\N	\N	2024	\N	users/5900ca1a-625c-4a14-8331-ee286900ad73/cv/0f5e9afc-1552-4fe0-8dca-34cccf978e5a.pdf	users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/a9ebcbfb-0671-484d-849a-a734979f73f7.pdf
\.


--
-- Data for Name: Position; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Position" (id, "agencyId", title, description, "employmentType", "isRemote", "stateId", "lgaId", "minSalary", "maxSalary", "skillsReq", visibility, status, "createdAt", "updatedAt") FROM stdin;
d45805c9-c04f-4f5a-8beb-5cc970888e66	f7472be1-137d-42c4-b74a-9217988bd932	Frontend React Developer	We are seeking a skilled Frontend React Developer to join our growing team. You will be responsible for building user-friendly web interfaces, optimizing application performance, and collaborating with backend engineers to deliver scalable solutions. Strong experience with React, Tailwind CSS, and REST APIs is required.\n	FULLTIME	t	24	510	250000	450000	["React.js", "TypeScript", "Tailwind CSS", "REST APIs", "Git/GitHub"]	PUBLIC	OPEN	2025-09-07 01:32:10.152	2025-09-12 15:42:39.928
\.


--
-- Data for Name: Application; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Application" (id, "positionId", "candidateId", status, notes, "createdAt") FROM stdin;
30f4c19a-694c-4ce9-9e21-e9c3ddc35496	d45805c9-c04f-4f5a-8beb-5cc970888e66	368bd3d5-db99-4983-9634-c28fb3833cdc	REJECTED	\N	2025-09-07 01:55:23.295
86788d61-bbff-4d42-9d79-b979aacac013	d45805c9-c04f-4f5a-8beb-5cc970888e66	49318ac1-ce7e-435b-ac88-06a97a69641e	INTERVIEW	\N	2025-09-07 01:55:36.786
e20ead25-4eef-4800-94cd-bd139aa8d1ff	d45805c9-c04f-4f5a-8beb-5cc970888e66	243d4130-0256-4a3e-89f5-c99888237c0f	APPLIED	Let us hire him and give him a chance, you hear me ba?	2025-09-09 17:26:37.096
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "actorId", action, entity, "entityId", meta, "createdAt") FROM stdin;
\.


--
-- Data for Name: CandidateCertificate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CandidateCertificate" (id, "candidateId", title, issuer, "issuedAt", "fileKey", "fileHash", verified, "verifierId") FROM stdin;
\.


--
-- Data for Name: Skill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Skill" (id, name, slug) FROM stdin;
\.


--
-- Data for Name: CandidateSkill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CandidateSkill" (id, "candidateId", "skillId", level, years) FROM stdin;
\.


--
-- Data for Name: Credential; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Credential" (id, "candidateId", "fileUrl", type, hash, verified) FROM stdin;
\.


--
-- Data for Name: Education; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Education" (id, "candidateId", institution, degree, field, grade, "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
2be402a0-a2b1-496c-b40d-6f08375d52db	243d4130-0256-4a3e-89f5-c99888237c0f	The Federal University of Technology, Akure	Bachelor of Technology	Computer Science	Second Class Upper	2018-01-10 00:00:00	2024-01-04 00:00:00	2025-09-10 00:09:03.175	2025-09-16 02:54:30.083
\.


--
-- Data for Name: Interview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Interview" (id, "applicationId", "scheduledAt", mode, location, status) FROM stdin;
\.


--
-- Data for Name: Invitation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Invitation" (id, email, "agencyId", "inviterId", token, "expiresAt", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: LocationState; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LocationState" (id, name) FROM stdin;
1	Abia
2	Adamawa
3	Akwa Ibom
4	Anambra
5	Bauchi
6	Bayelsa
7	Benue
8	Borno
9	Cross River
10	Delta
11	Ebonyi
12	Edo
13	Ekiti
14	Enugu
15	Gombe
16	Imo
17	Jigawa
18	Kaduna
19	Kano
20	Katsina
21	Kebbi
22	Kogi
23	Kwara
24	Lagos
25	Nasarawa
26	Niger
27	Ogun
28	Ondo
29	Osun
30	Oyo
31	Plateau
32	Rivers
33	Sokoto
34	Taraba
35	Yobe
36	Zamfara
37	Abuja (FCT)
\.


--
-- Data for Name: LocationLGA; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LocationLGA" (id, name, "stateId") FROM stdin;
1	Aba North	1
2	Aba South	1
3	Arochukwu	1
4	Bende	1
5	Ikwuano	1
6	Isiala Ngwa North	1
7	Isiala Ngwa South	1
8	Isuikwuato	1
9	Obi Ngwa	1
10	Ohafia	1
11	Osisioma	1
12	Ugwunagbo	1
13	Ukwa East	1
14	Ukwa West	1
15	Umuahia North	1
16	Umuahia South	1
17	Umu Nneochi	1
18	Demsa	2
19	Fufure	2
20	Ganye	2
21	Gayuk	2
22	Gombi	2
23	Grie	2
24	Hong	2
25	Jada	2
26	Larmurde	2
27	Madagali	2
28	Maiha	2
29	Mayo Belwa	2
30	Michika	2
31	Mubi North	2
32	Mubi South	2
33	Numan	2
34	Shelleng	2
35	Song	2
36	Toungo	2
37	Yola North	2
38	Yola South	2
39	Abak	3
40	Eastern Obolo	3
41	Eket	3
42	Esit Eket	3
43	Essien Udim	3
44	Etim Ekpo	3
45	Etinan	3
46	Ibeno	3
47	Ibesikpo Asutan	3
48	Ibiono-Ibom	3
49	Ika	3
50	Ikono	3
51	Ikot Abasi	3
52	Ikot Ekpene	3
53	Ini	3
54	Itu	3
55	Mbo	3
56	Mkpat-Enin	3
57	Nsit-Atai	3
58	Nsit-Ibom	3
59	Nsit-Ubium	3
60	Obot Akara	3
61	Okobo	3
62	Onna	3
63	Oron	3
64	Oruk Anam	3
65	Udung-Uko	3
66	Ukanafun	3
67	Uruan	3
68	Urue-Offong/Oruko	3
69	Uyo	3
70	Aguata	4
71	Anambra East	4
72	Anambra West	4
73	Anaocha	4
74	Awka North	4
75	Awka South	4
76	Ayamelum	4
77	Dunukofia	4
78	Ekwusigo	4
79	Idemili North	4
80	Idemili South	4
81	Ihiala	4
82	Njikoka	4
83	Nnewi North	4
84	Nnewi South	4
85	Ogbaru	4
86	Onitsha North	4
87	Onitsha South	4
88	Orumba North	4
89	Orumba South	4
90	Oyi	4
91	Alkaleri	5
92	Bauchi	5
93	Bogoro	5
94	Damban	5
95	Darazo	5
96	Dass	5
97	Gamawa	5
98	Ganjuwa	5
99	Giade	5
100	Itas/Gadau	5
101	Jama'are	5
102	Katagum	5
103	Kirfi	5
104	Misau	5
105	Ningi	5
106	Shira	5
107	Tafawa Balewa	5
108	Toro	5
109	Warji	5
110	Zaki	5
111	Brass	6
112	Ekeremor	6
113	Kolokuma/Opokuma	6
114	Nembe	6
115	Ogbia	6
116	Sagbama	6
117	Southern Ijaw	6
118	Yenagoa	6
119	Ado	7
120	Agatu	7
121	Apa	7
122	Buruku	7
123	Gboko	7
124	Guma	7
125	Gwer East	7
126	Gwer West	7
127	Katsina-Ala	7
128	Konshisha	7
129	Kwande	7
130	Logo	7
131	Makurdi	7
132	Obi	7
133	Ogbadibo	7
134	Ohimini	7
135	Oju	7
136	Okpokwu	7
137	Oturkpo	7
138	Tarka	7
139	Ukum	7
140	Ushongo	7
141	Vandeikya	7
142	Abadam	8
143	Askira/Uba	8
144	Bama	8
145	Bayo	8
146	Biu	8
147	Chibok	8
148	Damboa	8
149	Dikwa	8
150	Gubio	8
151	Guzamala	8
152	Gwoza	8
153	Hawul	8
154	Jere	8
155	Kaga	8
156	Kala/Balge	8
157	Konduga	8
158	Kukawa	8
159	Kwaya Kusar	8
160	Mafa	8
161	Magumeri	8
162	Maiduguri	8
163	Marte	8
164	Mobbar	8
165	Monguno	8
166	Ngala	8
167	Nganzai	8
168	Shani	8
169	Abi	9
170	Akamkpa	9
171	Akpabuyo	9
172	Bakassi	9
173	Bekwarra	9
174	Biase	9
175	Boki	9
176	Calabar Municipal	9
177	Calabar South	9
178	Etung	9
179	Ikom	9
180	Obanliku	9
181	Obubra	9
182	Obudu	9
183	Odukpani	9
184	Ogoja	9
185	Yakuur	9
186	Yala	9
187	Aniocha North	10
188	Aniocha South	10
189	Bomadi	10
190	Burutu	10
191	Ethiope East	10
192	Ethiope West	10
193	Ika North East	10
194	Ika South	10
195	Isoko North	10
196	Isoko South	10
197	Ndokwa East	10
198	Ndokwa West	10
199	Okpe	10
200	Oshimili North	10
201	Oshimili South	10
202	Patani	10
203	Sapele	10
204	Udu	10
205	Ughelli North	10
206	Ughelli South	10
207	Ukwuani	10
208	Uvwie	10
209	Warri North	10
210	Warri South	10
211	Warri South West	10
212	Abakaliki	11
213	Afikpo North	11
214	Afikpo South	11
215	Ebonyi	11
216	Ezza North	11
217	Ezza South	11
218	Ikwo	11
219	Ishielu	11
220	Ivo	11
221	Izzi	11
222	Ohaozara	11
223	Ohaukwu	11
224	Onicha	11
225	Akoko-Edo	12
226	Egor	12
227	Esan Central	12
228	Esan North-East	12
229	Esan South-East	12
230	Esan West	12
231	Etsako Central	12
232	Etsako East	12
233	Etsako West	12
234	Igueben	12
235	Ikpoba Okha	12
236	Orhionmwon	12
237	Oredo	12
238	Ovia North-East	12
239	Ovia South-West	12
240	Owan East	12
241	Owan West	12
242	Uhunmwonde	12
243	Ado Ekiti	13
244	Efon	13
245	Ekiti East	13
246	Ekiti South-West	13
247	Ekiti West	13
248	Emure	13
249	Gbonyin	13
250	Ido Osi	13
251	Ijero	13
252	Ikere	13
253	Ikole	13
254	Ilejemeje	13
255	Irepodun/Ifelodun	13
256	Ise/Orun	13
257	Moba	13
258	Oye	13
259	Aninri	14
260	Awgu	14
261	Enugu East	14
262	Enugu North	14
263	Enugu South	14
264	Ezeagu	14
265	Igbo Etiti	14
266	Igbo Eze North	14
267	Igbo Eze South	14
268	Isi Uzo	14
269	Nkanu East	14
270	Nkanu West	14
271	Nsukka	14
272	Oji River	14
273	Udenu	14
274	Udi	14
275	Uzo Uwani	14
276	Akko	15
277	Balanga	15
278	Billiri	15
279	Dukku	15
280	Funakaye	15
281	Gombe	15
282	Kaltungo	15
283	Kwami	15
284	Nafada	15
285	Shongom	15
286	Yamaltu/Deba	15
287	Aboh Mbaise	16
288	Ahiazu Mbaise	16
289	Ehime Mbano	16
290	Ezinihitte	16
291	Ideato North	16
292	Ideato South	16
293	Ihitte/Uboma	16
294	Ikeduru	16
295	Isiala Mbano	16
296	Isu	16
297	Mbaitoli	16
298	Ngor Okpala	16
299	Njaba	16
300	Nkwerre	16
301	Nwangele	16
302	Obowo	16
303	Oguta	16
304	Ohaji/Egbema	16
305	Okigwe	16
306	Orlu	16
307	Orsu	16
308	Oru East	16
309	Oru West	16
310	Owerri Municipal	16
311	Owerri North	16
312	Owerri West	16
313	Unuimo	16
314	Auyo	17
315	Babura	17
316	Biriniwa	17
317	Birnin Kudu	17
318	Buji	17
319	Dutse	17
320	Gagarawa	17
321	Garki	17
322	Gumel	17
323	Guri	17
324	Gwaram	17
325	Gwiwa	17
326	Hadejia	17
327	Jahun	17
328	Kafin Hausa	17
329	Kazaure	17
330	Kiri Kasama	17
331	Kiyawa	17
332	Kaugama	17
333	Maigatari	17
334	Malam Madori	17
335	Miga	17
336	Ringim	17
337	Roni	17
338	Sule Tankarkar	17
339	Taura	17
340	Yankwashi	17
341	Birnin Gwari	18
342	Chikun	18
343	Giwa	18
344	Igabi	18
345	Ikara	18
346	Jaba	18
347	Jema'a	18
348	Kachia	18
349	Kaduna North	18
350	Kaduna South	18
351	Kagarko	18
352	Kajuru	18
353	Kaura	18
354	Kauru	18
355	Kubau	18
356	Kudan	18
357	Lere	18
358	Makarfi	18
359	Sabon Gari	18
360	Sanga	18
361	Soba	18
362	Zangon Kataf	18
363	Zaria	18
364	Ajingi	19
365	Albasu	19
366	Bagwai	19
367	Bebeji	19
368	Bichi	19
369	Bunkure	19
370	Dala	19
371	Dambatta	19
372	Dawakin Kudu	19
373	Dawakin Tofa	19
374	Doguwa	19
375	Fagge	19
376	Gabasawa	19
377	Garko	19
378	Garun Mallam	19
379	Gaya	19
380	Gezawa	19
381	Gwale	19
382	Gwarzo	19
383	Kabo	19
384	Kano Municipal	19
385	Karaye	19
386	Kibiya	19
387	Kiru	19
388	Kumbotso	19
389	Kunchi	19
390	Kura	19
391	Madobi	19
392	Makoda	19
393	Minjibir	19
394	Nasarawa	19
395	Rano	19
396	Rimin Gado	19
397	Rogo	19
398	Shanono	19
399	Sumaila	19
400	Takai	19
401	Tarauni	19
402	Tofa	19
403	Tsanyawa	19
404	Tudun Wada	19
405	Ungogo	19
406	Warawa	19
407	Wudil	19
408	Bakori	20
409	Batagarawa	20
410	Batsari	20
411	Baure	20
412	Bindawa	20
413	Charanchi	20
414	Dandume	20
415	Danja	20
416	Dan Musa	20
417	Daura	20
418	Dutsi	20
419	Dutsin Ma	20
420	Faskari	20
421	Funtua	20
422	Ingawa	20
423	Jibia	20
424	Kafur	20
425	Kaita	20
426	Kankara	20
427	Kankia	20
428	Katsina	20
429	Kurfi	20
430	Kusada	20
431	Mai'Adua	20
432	Malumfashi	20
433	Mani	20
434	Mashi	20
435	Matazu	20
436	Musawa	20
437	Rimi	20
438	Sabuwa	20
439	Safana	20
440	Sandamu	20
441	Zango	20
442	Aleiro	21
443	Arewa Dandi	21
444	Argungu	21
445	Augie	21
446	Bagudo	21
447	Birnin Kebbi	21
448	Bunza	21
449	Dandi	21
450	Fakai	21
451	Gwandu	21
452	Jega	21
453	Kalgo	21
454	Koko/Besse	21
455	Maiyama	21
456	Ngaski	21
457	Sakaba	21
458	Shanga	21
459	Suru	21
460	Wasagu/Danko	21
461	Yauri	21
462	Zuru	21
463	Adavi	22
464	Ajaokuta	22
465	Ankpa	22
466	Bassa	22
467	Dekina	22
468	Ibaji	22
469	Idah	22
470	Igalamela Odolu	22
471	Ijumu	22
472	Kabba/Bunu	22
473	Kogi	22
474	Lokoja	22
475	Mopa Muro	22
476	Ofu	22
477	Ogori/Magongo	22
478	Okehi	22
479	Okene	22
480	Olamaboro	22
481	Omala	22
482	Yagba East	22
483	Yagba West	22
484	Asa	23
485	Baruten	23
486	Edu	23
487	Ekiti	23
488	Ifelodun	23
489	Ilorin East	23
490	Ilorin South	23
491	Ilorin West	23
492	Irepodun	23
493	Isin	23
494	Kaiama	23
495	Moro	23
496	Offa	23
497	Oke Ero	23
498	Oyun	23
499	Pategi	23
500	Agege	24
501	Ajeromi-Ifelodun	24
502	Alimosho	24
503	Amuwo-Odofin	24
504	Apapa	24
505	Badagry	24
506	Epe	24
507	Eti Osa	24
508	Ibeju-Lekki	24
509	Ifako-Ijaiye	24
510	Ikeja	24
511	Ikorodu	24
512	Kosofe	24
513	Lagos Island	24
514	Lagos Mainland	24
515	Mushin	24
516	Ojo	24
517	Oshodi-Isolo	24
518	Shomolu	24
519	Surulere	24
520	Akwanga	25
521	Awe	25
522	Doma	25
523	Karu	25
524	Keana	25
525	Keffi	25
526	Kokona	25
527	Lafia	25
528	Nasarawa	25
529	Nasarawa Egon	25
530	Obi	25
531	Toto	25
532	Wamba	25
533	Agaie	26
534	Agwara	26
535	Bida	26
536	Borgu	26
537	Bosso	26
538	Chanchaga	26
539	Edati	26
540	Gbako	26
541	Gurara	26
542	Katcha	26
543	Kontagora	26
544	Lapai	26
545	Lavun	26
546	Magama	26
547	Mariga	26
548	Mashegu	26
549	Mokwa	26
550	Moya	26
551	Paikoro	26
552	Rafi	26
553	Rijau	26
554	Shiroro	26
555	Suleja	26
556	Tafa	26
557	Wushishi	26
558	Abeokuta North	27
559	Abeokuta South	27
560	Ado-Odo/Ota	27
561	Egbado North	27
562	Egbado South	27
563	Ewekoro	27
564	Ifo	27
565	Ijebu East	27
566	Ijebu North	27
567	Ijebu North East	27
568	Ijebu Ode	27
569	Ikenne	27
570	Imeko Afon	27
571	Ipokia	27
572	Obafemi Owode	27
573	Odeda	27
574	Odogbolu	27
575	Ogun Waterside	27
576	Remo North	27
577	Shagamu	27
578	Akoko North-East	28
579	Akoko North-West	28
580	Akoko South-West	28
581	Akoko South-East	28
582	Akure North	28
583	Akure South	28
584	Ese Odo	28
585	Idanre	28
586	Ifedore	28
587	Ilaje	28
588	Ile Oluji/Okeigbo	28
589	Irele	28
590	Odigbo	28
591	Okitipupa	28
592	Ondo East	28
593	Ondo West	28
594	Ose	28
595	Owo	28
596	Aiyedaade	29
597	Aiyedire	29
598	Atakunmosa East	29
599	Atakunmosa West	29
600	Boluwaduro	29
601	Boripe	29
602	Ede North	29
603	Ede South	29
604	Ife Central	29
605	Ife East	29
606	Ife North	29
607	Ife South	29
608	Egbedore	29
609	Ejigbo	29
610	Ifedayo	29
611	Ifelodun	29
612	Ila	29
613	Ilesa East	29
614	Ilesa West	29
615	Irepodun	29
616	Irewole	29
617	Isokan	29
618	Iwo	29
619	Obokun	29
620	Odo Otin	29
621	Ola Oluwa	29
622	Olorunda	29
623	Oriade	29
624	Orolu	29
625	Osogbo	29
626	Afijio	30
627	Akinyele	30
628	Atiba	30
629	Atisbo	30
630	Egbeda	30
631	Ibadan North	30
632	Ibadan North-East	30
633	Ibadan North-West	30
634	Ibadan South-East	30
635	Ibadan South-West	30
636	Ibarapa Central	30
637	Ibarapa East	30
638	Ibarapa North	30
639	Ido	30
640	Irepo	30
641	Iseyin	30
642	Itesiwaju	30
643	Iwajowa	30
644	Kajola	30
645	Lagelu	30
646	Ogbomosho North	30
647	Ogbomosho South	30
648	Ogo Oluwa	30
649	Olorunsogo	30
650	Oluyole	30
651	Ona Ara	30
652	Orelope	30
653	Ori Ire	30
654	Oyo	30
655	Oyo East	30
656	Saki East	30
657	Saki West	30
658	Surulere	30
659	Bokkos	31
660	Barkin Ladi	31
661	Bassa	31
662	Jos East	31
663	Jos North	31
664	Jos South	31
665	Kanam	31
666	Kanke	31
667	Langtang South	31
668	Langtang North	31
669	Mangu	31
670	Mikang	31
671	Pankshin	31
672	Qua'an Pan	31
673	Riyom	31
674	Shendam	31
675	Wase	31
676	Port Harcourt	32
677	Obio-Akpor	32
678	Okrika	32
679	OguΓÇôBolo	32
680	Eleme	32
681	Tai	32
682	Gokana	32
683	Khana	32
684	Oyigbo	32
685	OpoboΓÇôNkoro	32
686	Andoni	32
687	Bonny	32
688	Degema	32
689	Asari-Toru	32
690	Akuku-Toru	32
691	AbuaΓÇôOdual	32
692	Ahoada West	32
693	Ahoada East	32
694	OgbaΓÇôEgbemaΓÇôNdoni	32
695	Emuoha	32
696	Ikwerre	32
697	Etche	32
698	Omuma	32
699	Binji	33
700	Bodinga	33
701	Dange Shuni	33
702	Gada	33
703	Goronyo	33
704	Gudu	33
705	Gwadabawa	33
706	Illela	33
707	Isa	33
708	Kebbe	33
709	Kware	33
710	Rabah	33
711	Sabon Birni	33
712	Shagari	33
713	Silame	33
714	Sokoto North	33
715	Sokoto South	33
716	Tambuwal	33
717	Tangaza	33
718	Tureta	33
719	Wamako	33
720	Wurno	33
721	Yabo	33
722	Ardo Kola	34
723	Bali	34
724	Donga	34
725	Gashaka	34
726	Gassol	34
727	Ibi	34
728	Jalingo	34
729	Karim Lamido	34
730	Kumi	34
731	Lau	34
732	Sardauna	34
733	Takum	34
734	Ussa	34
735	Wukari	34
736	Yorro	34
737	Zing	34
738	Bade	35
739	Bursari	35
740	Damaturu	35
741	Fika	35
742	Fune	35
743	Geidam	35
744	Gujba	35
745	Gulani	35
746	Jakusko	35
747	Karasuwa	35
748	Machina	35
749	Nangere	35
750	Nguru	35
751	Potiskum	35
752	Tarmuwa	35
753	Yunusari	35
754	Yusufari	35
755	Anka	36
756	Bakura	36
757	Birnin Magaji/Kiyaw	36
758	Bukkuyum	36
759	Bungudu	36
760	Gummi	36
761	Gusau	36
762	Kaura Namoda	36
763	Maradun	36
764	Maru	36
765	Shinkafi	36
766	Talata Mafara	36
767	Chafe	36
768	Zurmi	36
769	Abaji	37
770	Bwari	37
771	Gwagwalada	37
772	Kuje	37
773	Kwali	37
774	Municipal Area Council	37
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "fromId", "toId", subject, body, "createdAt", "readAt") FROM stdin;
f2187571-d2ed-4384-a295-f47942d8edc3	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hey	2025-09-11 03:17:44.555	2025-09-13 13:03:24.67
ffff5966-6910-4a8e-895a-32688bd7302c	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	my guy	2025-09-11 03:20:53.072	2025-09-13 13:03:24.67
5a304d64-d78c-4d8a-88c0-ec4aff570e2b	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	yoooo	2025-09-11 03:26:19.071	2025-09-13 13:03:24.67
141b285e-ade5-4348-a252-d35fd39bf3a5	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	g	2025-09-11 03:40:43.646	2025-09-13 13:03:24.67
acb90136-2b1f-44eb-bfe8-04e5dd35a1e7	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hello	2025-09-11 21:34:32.832	2025-09-13 13:03:24.67
c551c028-4349-4a83-b516-24ec2053a1ae	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	cool	2025-09-11 03:47:12.686	2025-09-13 13:20:07.203
4a11a69f-c26c-4a98-ad95-a9069082e1db	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	g	2025-09-13 13:00:35.155	2025-09-13 13:20:07.203
b1d421e2-99d7-4f13-b3f5-36f1f304c6a2	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	yoooo	2025-09-13 13:19:16.965	2025-09-13 13:20:07.203
98d5d339-65d7-4c6e-8fa0-a303c8e054a1	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	my geee	2025-09-13 13:20:16.048	2025-09-13 13:25:39.151
63c77aa8-91d0-42bc-96c5-0de0b62309a0	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	my geee	2025-09-13 13:25:36.206	2025-09-13 13:25:39.151
1c194ee1-a554-480e-9ac2-c343764dcfb3	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hey	2025-09-13 13:25:33.276	2025-09-13 13:25:52.725
8a7f5357-0711-4f77-a17a-21dea8d2108c	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	r	2025-09-13 13:25:44.044	2025-09-13 13:25:52.725
ebb72620-0f76-4bac-92e2-df8d50ddd211	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fd	2025-09-13 13:25:50.673	2025-09-13 13:34:14.544
f2597c5e-3a50-4799-ae65-d86376d181dd	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hey	2025-09-13 13:34:20.299	2025-09-13 13:34:20.362
3ec5876b-07a5-415b-bfd3-cafad237492a	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hi	2025-09-13 13:34:25.92	2025-09-13 13:34:25.939
964cb8f8-7daa-4614-9bd9-c068a29d3004	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	yooo	2025-09-13 13:34:38.463	2025-09-13 13:34:38.474
5b3b04b4-df03-477c-ae47-5b7f516f56eb	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	okay	2025-09-13 13:35:14.836	2025-09-13 13:35:14.847
bcb4a78b-5686-429e-849d-9d4641eba37e	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hi	2025-09-13 13:41:30.994	2025-09-13 13:41:31.04
e8785017-4654-4ea0-af36-f45427c3eea0	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	heyyy	2025-09-13 13:41:37.578	2025-09-13 13:41:37.588
c8accd00-76cf-40f3-9eae-4c1ec4f76b9a	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	fg	2025-09-13 13:54:01.701	2025-09-13 13:54:02.17
abfa9aa7-0583-4983-879a-c30b3cf1e780	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hi	2025-09-13 13:58:42.414	2025-09-13 13:58:42.535
69a170e3-92da-42e4-be5d-2db303fe177e	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hello	2025-09-13 13:58:48.028	2025-09-13 13:58:48.041
e1eaaeee-a46b-428b-aaec-00d9744f6ca6	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	how far?	2025-09-13 13:58:55.565	2025-09-13 13:58:55.598
5517957f-3274-45aa-80a1-c542fa44ec5c	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	i dey	2025-09-13 13:59:02.509	2025-09-13 13:59:02.524
a0dddeb5-2e52-4919-877b-10deb03e51c9	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	okay	2025-09-13 13:59:11.011	2025-09-13 13:59:11.022
d4e70405-3ba8-4028-a114-6da7d187f260	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	pr	2025-09-13 22:57:22.995	2025-09-13 23:05:43.028
1f78fd09-5a52-4beb-b2d7-de35528af5af	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	sure	2025-09-13 13:59:22.27	2025-09-13 22:24:01.9
bb0e2fa2-9463-4b61-87ab-d7b6b88d88af	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hey youuuuu	2025-09-13 14:15:22.26	2025-09-13 22:24:01.9
f8030df6-08ca-4059-9280-217b89f3d4ff	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	helloooo	2025-09-13 22:24:13.347	2025-09-13 22:38:08.121
f4a50c1e-014a-41b5-867a-191c588121c2	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hiii	2025-09-13 22:24:37.054	2025-09-13 22:38:08.121
5839d23f-40e5-4efa-9dfe-6d862b8224c9	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	oga mi	2025-09-13 22:37:55.847	2025-09-13 22:38:08.121
54cc2a17-f0ff-4926-b137-043c399205ea	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	my guy	2025-09-13 22:56:14.482	2025-09-13 22:56:21.611
fda165a3-00b7-48dc-9285-0c9becd65370	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	heyyyy	2025-09-13 22:56:40.566	2025-09-13 22:56:52.079
ea3487c9-403f-4d72-a7d4-c53b6fa2af0f	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hi	2025-09-13 22:57:02.731	2025-09-13 22:57:02.764
99cd547b-093c-45bf-a060-f7f51193e2d0	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hey there	2025-09-13 23:42:27.87	2025-09-13 23:42:37.008
c30cf7ee-de1c-4ee1-a548-f4b7c83b6df7	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	gs	2025-09-14 00:02:06.133	2025-09-14 00:43:17.057
a4d53264-3dc1-4975-b362-569ac8482ed5	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	okay	2025-09-13 23:42:47.381	2025-09-14 00:43:17.057
5c346b73-bec0-4c1e-8616-a4400c06be7d	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	tr	2025-09-13 23:42:57.126	2025-09-14 00:43:17.057
c73f08ed-7de4-4afd-b6bb-128a40fb137c	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hegr	2025-09-13 23:49:15.896	2025-09-14 00:43:17.057
6530a1a3-ed71-4295-a1b1-9dde8ea8483f	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fw	2025-09-13 23:55:47.46	2025-09-14 00:43:17.057
c707563d-ce57-41f1-a52e-bdb64392879f	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fs	2025-09-13 23:56:05.086	2025-09-14 00:43:17.057
d51d005d-a8bb-46f9-9748-30c64184a403	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	gds	2025-09-13 23:56:23.656	2025-09-14 00:43:17.057
bbf8fa20-f638-478a-a1ec-bd8355166087	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	f	2025-09-14 00:01:52.905	2025-09-14 00:43:17.057
065979f5-f4be-4373-9618-89869e32c497	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fs	2025-09-14 00:42:48.773	2025-09-14 00:43:17.057
19ff6e48-6a4d-40d8-b570-aa133c09d371	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fds	2025-09-14 00:55:59.179	2025-09-14 00:58:29.475
192dc5cb-1f3a-4980-94e1-5430deb49d3a	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	df	2025-09-14 00:56:21.198	2025-09-14 00:58:29.475
4d5de5cc-4c30-493a-b027-ce4fb325610c	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fds	2025-09-14 00:58:27.922	2025-09-14 00:58:29.475
e39e241f-2734-4c85-a7d9-d33436537f45	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	dsf	2025-09-14 00:58:34.416	2025-09-14 00:58:34.447
775da248-aa96-4ec9-85d0-e46b3c77f73f	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	fsffg	2025-09-14 00:58:49.59	2025-09-14 00:58:49.614
c8015003-0c03-4684-937a-a162ee12e6c7	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hi	2025-09-14 22:00:27.888	2025-09-14 22:00:31.748
098e7a9c-ffa3-4be9-bc68-66fc3d007fdf	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hruue	2025-09-14 22:21:52.824	2025-09-14 22:22:14.709
5c321d93-e6af-4330-bdfa-cccb2aa22dd1	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	fgds	2025-09-14 22:46:01.259	2025-09-14 22:46:01.637
e5fe7ebb-1aa1-46c5-a800-fe047b22eeab	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hello my guy. how far na???	2025-09-14 22:46:24.919	2025-09-14 22:46:24.935
c54f9596-7fca-425e-90ce-92618039b2cb	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	imds	2025-09-14 22:46:39.214	2025-09-14 22:46:39.226
d9be5ed5-f38b-4dcb-af6e-67e3b5ef9ea0	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	how far	2025-09-14 22:48:08.049	2025-09-14 22:48:08.063
4145acc0-a0da-4838-afbf-7472f94534e7	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	yoooo	2025-09-14 22:48:26.253	2025-09-14 22:54:46.88
903eb0e0-53c8-4449-8354-d413b97f2884	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	rtrds	2025-09-14 22:48:39.365	2025-09-14 22:54:46.88
481b88b0-1267-4abd-a63e-a606e3c8b866	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	heyyyy	2025-09-14 22:54:39.354	2025-09-14 22:54:46.88
004225de-a7a0-4b7e-bb6f-3a4f1524c985	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	how your side na	2025-09-14 22:55:39.027	2025-09-14 22:56:01.302
b2e4c329-bcb7-4840-9cde-1e3dbfe2a738	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	good	2025-09-14 23:53:53.226	2025-09-14 23:54:04.303
283a392a-3b14-4c35-be26-b62b6519f19c	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	reeeeeeeeeeg\nGegeR\nEGRterg	2025-09-15 11:31:54.817	2025-09-15 23:02:51.3
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", message, link, read, "createdAt", type, meta) FROM stdin;
6186633d-ab68-48a0-a212-c26923e7b53b	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	t	2025-09-13 22:25:02.04	GENERIC	\N
0b3e8fca-650d-462f-bfc7-d992d9f192f7	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	t	2025-09-13 22:25:32.481	GENERIC	\N
acfe9975-8a73-4ffc-8475-25dcca87ab44	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-13 22:57:02.756	MESSAGE	\N
08bd575f-bdb1-4a90-a1ab-3f0c56c6ecd5	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 00:42:48.888	MESSAGE	\N
8e8066e6-60fd-4c70-9c99-75f2cdf66045	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 00:02:06.138	MESSAGE	\N
f0441eac-4dae-4e64-9384-2f42e366a4aa	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 00:01:52.91	MESSAGE	\N
511281c7-c8d7-4fb5-9e59-cc4cee7caeb1	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 23:49:15.93	MESSAGE	\N
236c2ce9-ff5a-4336-b997-ac89df7067e5	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-13 23:42:28.136	MESSAGE	\N
b8d3848b-9549-43b4-ada1-f8174e4bb32a	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-14 00:58:34.435	MESSAGE	\N
c0a2dbdc-0896-4ac0-8a7a-e350eaf28f47	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 22:56:14.53	MESSAGE	\N
28d62786-78bc-4092-af08-eff5fdffc6af	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 22:56:40.572	MESSAGE	\N
a9136756-dc33-41f5-b49d-748899628034	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 22:57:22.998	MESSAGE	\N
22f705e2-7b57-4eb6-8a15-6c655b468d57	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 23:42:47.393	MESSAGE	\N
48d1ac5d-f7ab-4cd1-bfd4-aa8b7863d497	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 23:42:57.129	MESSAGE	\N
6a29acc7-fb24-4a9c-b9ed-e1aec4b93da8	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 23:55:47.475	MESSAGE	\N
da6faf03-3440-4f5b-a8d4-1fdeee068767	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 23:56:05.089	MESSAGE	\N
c6199467-977d-44c5-9030-99cd26da2567	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 22:37:55.863	GENERIC	\N
ec9cf8b8-cddc-422b-93af-f6296571b6d6	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	t	2025-09-14 00:44:58.22	GENERIC	\N
a72e4f6f-0d7f-4f95-a799-32a74a478d2b	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	t	2025-09-14 00:45:40.516	GENERIC	\N
eb5aa5d4-c748-4dcc-b2b1-17b190f8677a	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-14 00:58:49.603	MESSAGE	\N
1dc1a0a5-8cc1-452c-906f-67243ad63daa	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-13 23:56:23.659	MESSAGE	\N
5a653b38-561d-4589-86f2-0e00045f7415	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 00:55:59.183	MESSAGE	\N
84ea417f-53ee-4204-a6ec-b38ad9b255c1	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 00:56:21.201	MESSAGE	\N
1f2391e9-0cf7-4f96-aa07-d37e08685866	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 00:58:27.948	MESSAGE	\N
936416fa-babb-44b9-ac86-f64f3ec5608f	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:00:27.976	MESSAGE	\N
95850ee6-1ee0-4245-a80f-6218ac8a0aad	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:21:52.922	MESSAGE	\N
4be6cf59-a65b-4f1a-9804-3873968a4d19	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:46:01.389	MESSAGE	{"lastMessage": "fgds"}
b3b61f45-8a2f-400b-b49c-ed2ab94449a6	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:46:24.924	MESSAGE	{"lastMessage": "hello my guy. how far na???"}
6a69f387-b776-4e92-a0de-bfb086b5a8fa	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:46:39.216	MESSAGE	{"lastMessage": "imds"}
c311eef5-e105-4e86-9bd6-6925d0100a89	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:48:08.055	MESSAGE	{"lastMessage": "how far"}
c38b2449-b8ee-4975-9c8e-d4116b03c088	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:48:26.257	MESSAGE	{"lastMessage": "yoooo"}
75e0fbd0-dbf3-4c78-a56e-25187afbffd3	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:48:39.369	MESSAGE	{"lastMessage": "rtrds"}
0c5ff497-9a3f-446e-8bb1-7f397ea6fa98	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:54:39.361	MESSAGE	{"lastMessage": "heyyyy"}
2d880202-842c-449e-9159-134addb75d72	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-14 22:55:39.03	MESSAGE	{"lastMessage": "how your side na"}
182c875a-101a-4420-9953-e3b802a33221	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	t	2025-09-14 01:00:54.31	GENERIC	\N
f68123f6-8252-479e-92e5-a8ed04b5f9e0	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	t	2025-09-14 01:01:09.776	GENERIC	\N
33925c42-0be3-4e5b-9479-8e510daac78a	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-14 23:53:53.249	MESSAGE	{"lastMessage": "good"}
651f72a0-92ae-4a92-874a-5567d03a1636	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-15 11:31:55.159	MESSAGE	{"lastMessage": "reeeeeeeeeeg\\nGegeR\\nEGRterg"}
\.


--
-- Data for Name: Offer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Offer" (id, "applicationId", salary, "startDate", status) FROM stdin;
\.


--
-- Data for Name: Shortlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Shortlist" (id, "agencyId", "candidateId", source, "createdAt") FROM stdin;
8724a62d-ce88-4fe0-a4d5-f7cc22ad4433	f7472be1-137d-42c4-b74a-9217988bd932	243d4130-0256-4a3e-89f5-c99888237c0f	SEARCH	2025-09-11 21:26:46.443
\.


--
-- Data for Name: Verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Verification" (id, "userId", type, status, evidence, "reviewedBy", "createdAt") FROM stdin;
1	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/your-user-id/nysc_document/some-uuid.pdf", "fileName": "nysc_letter.pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-08 00:38:03.711
3921e9dd-2ff7-47fc-8972-c4ea9b346c5b	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/20a32e77-e540-48dd-a25a-9b93bd4c1c65.pdf", "fileName": "callup_Letter.pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-08 10:35:12.54
86e8467e-1390-45bc-8108-ee3e52ea33c8	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/42ac05c0-1804-4c90-b935-eed1c1d46715.pdf", "fileName": "._NECO RESULT_..pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-14 23:19:00.723
\.


--
-- Data for Name: WorkExperience; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WorkExperience" (id, "candidateId", company, title, description, "startDate", "endDate", "isCurrent", "createdAt", "updatedAt") FROM stdin;
c831e99a-6e8d-4ca0-801e-6642ebba36fb	243d4130-0256-4a3e-89f5-c99888237c0f	Tertiary Education Trust Fund (TETFund)	HR Administrator	I worked in the HR Registry unit.	2024-10-09 00:00:00	2025-07-31 00:00:00	f	2025-09-09 22:57:47.282	2025-09-12 15:43:34.513
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9c989b44-739a-4748-8221-9e0254009e40	e572dd1268208af14101d806024af9c1955aa74a4d86a9edc32e53bfaae605cb	2025-09-04 13:52:41.688116+01	20250904125241_init	\N	\N	2025-09-04 13:52:41.473525+01	1
9d611722-4d7f-4567-9f35-3d476985bd27	b9e93f0c1033919e5f696a66e64c1f8a5b4201ce3f335d00f87a629b8b4282d7	2025-09-06 22:23:59.862535+01	20250906212359_add_shortlist_timestamp	\N	\N	2025-09-06 22:23:59.637942+01	1
dafe6ad4-ffcc-48c0-a0e5-dc3621d0c7ca	ced5196bbf70e9cc6333a233576e2f41191ac859b4827bf7cb02f30d60c96d4c	2025-09-16 13:14:57.493517+01	20250916121457_add_job_limit_to_plans	\N	\N	2025-09-16 13:14:57.400299+01	1
7fa17ae4-2fe2-44dc-982f-6c2c9eddb5c3	74696d2589aa4342014d4fc1b087153e6581dbc4dbe90f029e759e32f6db397d	2025-09-08 00:33:45.898788+01	20250907233345_add_candidate_document_keys	\N	\N	2025-09-08 00:33:45.84607+01	1
7bf6b164-24de-4b52-b8d8-82fcfd6f7714	8131555b9b0d3f2bc6545aea50d56948b9bf8f60d733e3a04057b2428445ba3a	2025-09-09 22:21:17.392988+01	20250909212117_add_experience_education_models	\N	\N	2025-09-09 22:21:17.07994+01	1
846224e4-ab84-40fa-a4f0-39757936fcae	382b627c27e7bacc9d05b1210e3133a3f014082e1b68091d28243f52ce84b2d5	2025-09-13 13:40:05.514964+01	20250913124005_add_message_read_receipts	\N	\N	2025-09-13 13:40:05.422104+01	1
a6993828-c05c-4f61-9141-0a630456febf	7ef760135e658f1a50a452d9adb6bfa0fb27c147dfa170c3e4ff5ede8861adb0	2025-09-16 14:30:33.219856+01	20250916133032_add_invitation_system	\N	\N	2025-09-16 14:30:32.6819+01	1
5410162d-da7c-4c66-a734-813ca2ff9ad4	d7413eb359fe6bbbcab00b9469afcd79c581c2066abdbe91bc25ce4d3340ab75	2025-09-13 16:27:35.455226+01	20250913152735_add_notification_model	\N	\N	2025-09-13 16:27:35.224722+01	1
fa11c401-f947-45e3-ab7d-f99a86561705	a428d41466248740f018749795714fc77a82f8740975cac436d3cf4e38bc3898	2025-09-13 23:43:52.565651+01	20250913224352_add_notification_type	\N	\N	2025-09-13 23:43:52.398435+01	1
ef10699c-0ab4-4da1-8b09-973830b4f4fc	fef607b8c88f6bb4279cbdb9b5e5560e26e455757b254b9b64e97fc3fc055939	2025-09-14 23:41:30.618785+01	20250914224130_add_meta_to_notifications	\N	\N	2025-09-14 23:41:30.581923+01	1
99ba647d-617f-4601-8a6e-a2f66ebc63f7	5e708114a88a357dfe4ee0305e4a7223eb1819f6ed371f53e07dcf5e671c9334	2025-09-15 13:25:18.992777+01	20250915122518_add_stripe_price_id	\N	\N	2025-09-15 13:25:18.77795+01	1
01f4af0f-9f05-4a30-bd05-658e2a0a871c	a961073d121965acf821aa267ad75733a39b65717d483020253e184aae700d95	2025-09-15 15:33:46.366222+01	20250915143345_remove_subscription_startdate	\N	\N	2025-09-15 15:33:45.396888+01	1
1894caea-6c6b-4ab4-b29e-5f69e457cd2c	f45aa01b07c0e68b5c206291ce43e315d221d9d44d3cf6c816f280e25d19c320	2025-09-15 15:56:33.285113+01	20250915145633_make_stripe_current_period_end_optional	\N	\N	2025-09-15 15:56:33.265716+01	1
076b0caf-d177-4b1a-a03d-769ada6c23ca	5693d3f1cfcc4bdd478e3a7ea7832b4eab8e25b2904eda82207dda36f9073ca0	2025-09-16 09:25:37.333526+01	20250916082536_add_industry_model	\N	\N	2025-09-16 09:25:36.180633+01	1
fe0e18a6-b60d-429d-8108-205dd5e4b5fe	cb036e00f9d1e40f25bc40230ed0530c64131239064fe5554084ad9aaf5fce95	2025-09-16 10:08:07.735832+01	20250916090803_add_agency_industry_relation	\N	\N	2025-09-16 10:08:04.015574+01	1
\.


--
-- Name: Industry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Industry_id_seq"', 418, true);


--
-- Name: LocationLGA_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LocationLGA_id_seq"', 774, true);


--
-- Name: LocationState_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LocationState_id_seq"', 37, true);


--
-- Name: Skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Skill_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

