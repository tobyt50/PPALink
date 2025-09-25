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
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, phone, "passwordHash", role, "emailVerifiedAt", status, "createdAt", "updatedAt") FROM stdin;
fcd910ed-f411-4524-bdb1-23de83a9e4d1	ezetaj@gmail.com	\N	$argon2id$v=19$m=65536,t=3,p=4$YtaIOT3kOhLeD2F444ftRQ$ob0tm3ekK4BOiYKLZgPH/CuV5yDELL9Rr3z+eAm4nTI	ADMIN	\N	ACTIVE	2025-09-05 08:05:35.134	2025-09-08 00:17:57.501
24561236-b941-4ff8-ad41-b9b71adcafdd	support@ppalink.com	\N	$argon2id$v=19$m=65536,t=3,p=4$aM2FsjKjTTJVChoYLzgOzQ$G86fbtF4p1HaYJJ9+xDMdzDEAmYM/RtREVVZFd9TyaM	SUPER_ADMIN	2025-09-23 01:46:58.475	ACTIVE	2025-09-23 09:32:44.74	2025-09-24 23:51:39.491
9784c3ee-80e5-46ae-b62c-e48f3fbde58b	test.candidate@example.com	1234567890	$argon2id$v=19$m=65536,t=3,p=4$aqMci1XbWGHugT4IXxkTgg$0FQu3NRnN51dv3O2CC0k3oJQvWIQ3LVhWOqdnPiFNwI	CANDIDATE	\N	ACTIVE	2025-09-04 15:02:03.164	2025-09-25 00:17:00.606
c1cfe44e-a176-474b-bf35-48398dca09c9	tedunjaiyeseun@gmail.com	\N	$argon2id$v=19$m=65536,t=3,p=4$Rp024XMb8bTU0WrnuQ+UFw$n2EfYDWN5gm/Co9gwFlQpxWhtnFvse1Ur/d7kXlK/aM	AGENCY	\N	ACTIVE	2025-09-17 20:07:32.282	2025-09-17 20:07:32.282
097944c2-3582-4220-ade4-4a93ab404375	adinkems@gmail.com	\N	$argon2id$v=19$m=65536,t=3,p=4$lJ8G2lXO24OnXyLsLeZdtg$a759APkYcPau2rJR2rUHNLSBIN5AWniF8JWeBK2aKUI	AGENCY	\N	ACTIVE	2025-09-05 08:06:38.202	2025-09-23 01:28:25.468
5900ca1a-625c-4a14-8331-ee286900ad73	tedunjaiyem@gmail.com	07046015410	$argon2id$v=19$m=65536,t=3,p=4$aM2FsjKjTTJVChoYLzgOzQ$G86fbtF4p1HaYJJ9+xDMdzDEAmYM/RtREVVZFd9TyaM	CANDIDATE	2025-09-23 01:46:58.475	ACTIVE	2025-09-04 15:12:23.319	2025-09-23 01:46:58.477
\.


--
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ActivityLog" (id, "userId", action, details, "createdAt") FROM stdin;
46c56492-381c-491e-86b5-9eb803216a3a	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-23 09:02:27.698
95c25c56-d664-4371-b72b-eb6f63dd0b45	097944c2-3582-4220-ade4-4a93ab404375	job.update	{"jobId": "d45805c9-c04f-4f5a-8beb-5cc970888e66", "changes": ["title", "description", "employmentType", "isRemote", "stateId", "lgaId", "minSalary", "maxSalary", "skills", "visibility", "status"], "jobTitle": "Frontend React Developers"}	2025-09-23 09:02:54.664
9dee3bea-813c-432b-b6b1-5550597786b8	097944c2-3582-4220-ade4-4a93ab404375	job.update	{"jobId": "d45805c9-c04f-4f5a-8beb-5cc970888e66", "changes": ["title", "description", "employmentType", "isRemote", "stateId", "lgaId", "minSalary", "maxSalary", "skills", "visibility", "status"], "jobTitle": "Frontend React Developer"}	2025-09-23 09:03:24.963
ddc2f3f1-ba2e-4dce-860e-ea1bbf3a91bb	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 09:55:07.823
eb8dd2c2-9ea1-4a66-8325-925adb03f3cc	fcd910ed-f411-4524-bdb1-23de83a9e4d1	user.login	\N	2025-09-23 09:55:48.382
64fa8c66-ee11-40b8-8a02-289d4372fc39	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:09:02.738
9879db03-b8fd-4456-917c-f1a38cb84307	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:10:02.395
e3e3273c-ea86-4968-a30b-9b92a21829ee	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:11:22.341
e9062d8a-1217-4673-87a8-92ee0e709f75	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:20:24.056
8847bf2f-4812-4520-ae8b-c22c6ace28d6	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:21:01.544
a4e2a6a2-003c-4140-bd99-588674b458b3	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:26:56.899
bbb820bc-9a48-40c1-bcdb-88143266058f	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:27:28.444
4a878a58-250f-4aff-b2ae-214bf252782f	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:35:53.636
2e88c179-b66b-4185-9d55-d5fe99aadab5	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:36:17.472
fb50044c-b141-4b8e-96ab-ee153bd9129e	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:36:54.232
9237a170-b8bc-485b-9612-9f61bc695a28	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:38:42.837
dc089f61-a6dd-4fc3-8228-0b8ccfe81b2e	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:40:11.006
fee7d697-b6f7-40ed-bd03-146dafdb7e3a	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:47:23.473
ae108278-627e-46a8-a997-2e57ca38b5b1	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:47:38.854
26a73d6b-c48d-4b4e-8f5c-36e29d4e20a2	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:48:00.46
9442a3d0-98b2-43e2-b175-733b076e6e7e	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:54:06.401
375bc1bf-da09-4cf5-aed5-72b2f0c2fc71	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:54:42.626
ed37862d-ebbb-4bfd-91d7-271ce61b82ee	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 10:58:04.053
81c72457-2988-4fc5-be13-332d04816052	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-23 10:58:36.658
3a130b7d-1028-4c7b-8780-9823a18990a0	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 11:01:04.11
34f8f835-081b-4d64-ad76-03264da80be1	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	{"targetUserId": "5900ca1a-625c-4a14-8331-ee286900ad73", "targetUserEmail": "tedunjaiyem@gmail.com"}	2025-09-23 11:41:40.531
094be065-3e7d-4ce5-b580-5fc3a8e2d376	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 11:42:25.282
5ce90f28-c111-4ad3-89e4-ad3af05b5781	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	{"targetUserId": "097944c2-3582-4220-ade4-4a93ab404375", "targetUserEmail": "adinkems@gmail.com"}	2025-09-23 11:43:09.914
b71f9ec4-da64-45e4-b6c5-2bf925bdad81	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 11:43:31.902
958834c0-d695-4f83-bd19-b1a22df5f078	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 12:02:03.549
b4064362-fabc-47ac-83f2-096a8761d37f	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	{"targetUserId": "097944c2-3582-4220-ade4-4a93ab404375", "targetUserEmail": "adinkems@gmail.com"}	2025-09-23 12:02:20.339
3f047c68-925f-4ac9-b509-ba7703053282	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	{"targetUserId": "097944c2-3582-4220-ade4-4a93ab404375", "targetUserEmail": "adinkems@gmail.com"}	2025-09-23 12:05:19.276
129fe815-58a1-4397-9025-bcdd53d9f55e	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-23 12:05:45.04
d903cb9d-1271-4752-a3d0-a21a10b2f9a5	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	{"targetUserId": "097944c2-3582-4220-ade4-4a93ab404375", "targetUserEmail": "adinkems@gmail.com"}	2025-09-23 12:07:09.521
c4287613-99c9-49fc-ab75-b1b87e22f5ba	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 01:09:54.559
190e4370-67e8-45f5-b59d-d00c9dd356b7	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 01:10:08.417
6ae61531-acf1-4f6c-89fc-0856297ef412	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 01:13:44.533
b70e38e9-6d1d-4672-a6d3-3d7c40125f99	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 01:17:50.115
0fb5857e-3eb2-4ca8-8a7c-d84868df5316	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 01:51:49.629
5faae161-2da6-4630-a381-59939e5f9522	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 01:52:31.305
daed7c74-4780-4a67-9b0c-78d94144bee9	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 02:32:23.809
7bb5c341-bd2d-4b12-a049-e4c44d79a408	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 03:11:27.096
b879393d-dc99-4431-bd79-5ab915ba27b2	fcd910ed-f411-4524-bdb1-23de83a9e4d1	user.login	\N	2025-09-24 03:11:59.111
4883d43b-9bd6-4f54-a651-e57b49db1788	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-24 03:12:16.308
67b6bcc7-b061-4c9a-b0d8-d4671f810bc6	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 03:16:49.874
4a8b8856-bc9d-4df2-a7c1-018a251dde92	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 03:31:54.206
f0362af9-4fed-4a76-b9f6-79cb8bf33c7b	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 03:32:58.154
d6a327a6-3305-4efe-8c4a-d36a3f0e8fb4	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 03:35:50.652
512b375f-17ef-4f09-a045-4babce376521	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 03:36:05.122
7adc0378-ad26-4e18-8fae-622e89ec6215	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 11:06:03.67
feddc443-3a35-4f0f-b651-2ff881b2375b	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 11:06:24.199
973b61ef-633b-4f0a-bf57-ec8303cdbde9	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 11:09:34.205
381d8811-2c89-4414-b713-4e26aa90e022	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-24 11:25:56.855
76d20cf6-0ff2-4d8e-bd4d-f41c81666751	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 11:27:14.46
08c3d43d-1627-4298-aa18-aaada739582a	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 11:48:53.132
0430867d-f862-476c-9a9c-a5f5fe42dfad	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 11:49:28.069
b780c855-21b0-4e44-8921-58102dfe059e	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 11:49:56.97
d62e4d73-d969-4962-b218-5f1bc24595b2	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 11:50:18.24
41eb6d7d-1651-4946-b776-d0421153224d	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 11:51:03.738
bd78e6c1-2189-4a60-8e71-9e12f76bb23a	c1cfe44e-a176-474b-bf35-48398dca09c9	job.create	{"jobId": "c5807914-9af4-41c2-8f54-8147169ad837", "jobTitle": "sghngsd"}	2025-09-24 11:57:17.884
84b457b1-2a75-4a42-9d5a-12ad0fd2d0cc	c1cfe44e-a176-474b-bf35-48398dca09c9	job.delete	{"jobId": "c5807914-9af4-41c2-8f54-8147169ad837", "jobTitle": "sghngsd"}	2025-09-24 11:57:28.458
6bc9fc6b-3f4b-448d-9eac-9538f4b5e97e	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 11:57:43.833
7db420eb-2e10-44b2-92a8-bffb9a5ddaaa	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 12:01:04.272
81502f5f-6cfa-49a2-b94b-268dd05170a1	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:01:20.166
e704655c-9aa9-44a6-9f8a-ba0a0ab98dba	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:09:17.343
cefbda8c-5b16-4f14-85ae-752ce70f9bc7	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:09:31.453
0b5a6ef4-a092-4a8c-a68b-a61d3ad97ef0	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:10:16.877
ee998779-6d7a-4558-be24-3e38ad0957c2	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:10:39.224
db621be7-bcac-4daa-b471-6ea9a195a991	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:19:39.646
17d36eae-cc32-41f5-9914-a594f3ca63c6	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:19:53.982
b801c9d5-d39b-4865-9834-21e2d69f8997	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:20:12.105
b987294a-f215-4c32-83de-7a14d308f76d	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:21:55.58
aab8d324-2662-41de-ab7a-dbf49e24acfa	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:32:15.948
25357321-b731-4c89-a759-9bd863245e63	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:32:31.383
a6c93331-82c8-432b-915d-dd4347cb5594	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-24 12:32:44.09
d35df04a-069c-4920-9ee1-2809c69c9942	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:32:53.527
04899ea6-ce51-4a3c-a932-6058b17112fb	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 12:33:14.145
e5982910-a330-4a75-86ee-db7943f03ced	c1cfe44e-a176-474b-bf35-48398dca09c9	user.login	\N	2025-09-24 12:33:35.262
1cc19036-5148-4c92-9091-82c3bce4abc5	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 13:15:23.852
b2a097a5-3d20-403c-a4a0-3c3d4bcef035	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-24 14:26:07.817
b3089d7c-294b-4eb0-af27-0144b9079a64	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 14:26:36.092
6e8d070c-357a-4992-907f-73e73dfb7c95	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-24 14:27:25.214
79d31b48-d62a-4785-8be2-513fdd6ce592	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 14:28:54.94
c8241859-44ea-4f12-b1a5-ce4753e90d61	5900ca1a-625c-4a14-8331-ee286900ad73	user.login	\N	2025-09-24 14:31:51.893
1bd62192-490d-4127-9014-a943aca619bf	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 15:16:18.958
61974d07-3f5e-458d-9f42-b249f326a819	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-24 16:04:02.952
817888fb-035f-4391-a6d4-1e18f451bcf5	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 16:04:46.816
d7ac4a35-1090-46bd-ae1d-0f1810703ef2	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	{"targetUserId": "097944c2-3582-4220-ade4-4a93ab404375", "targetUserEmail": "adinkems@gmail.com"}	2025-09-24 21:44:17.096
78b775b4-735a-407a-9ee9-d03a703000fa	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-24 23:51:52.926
c52579ed-d2d2-4218-aaea-f7461bcd9fba	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-25 00:00:29.37
1eb02fae-1628-42d5-a5c1-84c8b6c2a97e	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-25 00:01:56.127
5b0c4b4a-e3d1-4bf9-b6f9-3084219a1836	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-25 00:02:29.204
b2777137-8b6f-4979-baf5-967d3fad46b5	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-25 00:07:13.904
787b7cd3-f8b8-4b8c-8ac1-b29ff09af600	097944c2-3582-4220-ade4-4a93ab404375	user.login	\N	2025-09-25 00:33:01.897
b6ea22e0-1064-47de-8003-84239d568360	24561236-b941-4ff8-ad41-b9b71adcafdd	user.login	\N	2025-09-25 00:36:35.921
\.


--
-- Data for Name: Industry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Industry" (id, name, "createdAt", "isHeading", "order", "updatedAt") FROM stdin;
528	Finance & Professional Services	2025-09-24 11:30:22.985	t	1	2025-09-24 11:30:22.985
529	Accounting	2025-09-24 11:30:22.985	f	2	2025-09-24 11:30:22.985
530	Auditing	2025-09-24 11:30:22.985	f	3	2025-09-24 11:30:22.985
531	Banking	2025-09-24 11:30:22.985	f	4	2025-09-24 11:30:22.985
532	Financial Services	2025-09-24 11:30:22.985	f	5	2025-09-24 11:30:22.985
533	Insurance	2025-09-24 11:30:22.985	f	6	2025-09-24 11:30:22.985
534	Legal	2025-09-24 11:30:22.985	f	7	2025-09-24 11:30:22.985
535	Venture Capital	2025-09-24 11:30:22.985	f	8	2025-09-24 11:30:22.985
536	Investment	2025-09-24 11:30:22.985	f	9	2025-09-24 11:30:22.985
537	Business & Management	2025-09-24 11:30:22.985	t	10	2025-09-24 11:30:22.985
538	Consulting	2025-09-24 11:30:22.985	f	11	2025-09-24 11:30:22.985
539	Business Strategy	2025-09-24 11:30:22.985	f	12	2025-09-24 11:30:22.985
540	Management	2025-09-24 11:30:22.985	f	13	2025-09-24 11:30:22.985
541	Human Resources	2025-09-24 11:30:22.985	f	14	2025-09-24 11:30:22.985
542	Recruitment	2025-09-24 11:30:22.985	f	15	2025-09-24 11:30:22.985
543	Marketing	2025-09-24 11:30:22.985	f	16	2025-09-24 11:30:22.985
544	Public Relations	2025-09-24 11:30:22.985	f	17	2025-09-24 11:30:22.985
545	Advertising	2025-09-24 11:30:22.985	f	18	2025-09-24 11:30:22.985
546	Media	2025-09-24 11:30:22.985	f	19	2025-09-24 11:30:22.985
547	Communications	2025-09-24 11:30:22.985	f	20	2025-09-24 11:30:22.985
548	Research	2025-09-24 11:30:22.985	f	21	2025-09-24 11:30:22.985
549	Development	2025-09-24 11:30:22.985	f	22	2025-09-24 11:30:22.985
550	Technology & Digital	2025-09-24 11:30:22.985	t	23	2025-09-24 11:30:22.985
551	ICT	2025-09-24 11:30:22.985	f	24	2025-09-24 11:30:22.985
552	Software	2025-09-24 11:30:22.985	f	25	2025-09-24 11:30:22.985
553	Technology	2025-09-24 11:30:22.985	f	26	2025-09-24 11:30:22.985
554	Telecommunications	2025-09-24 11:30:22.985	f	27	2025-09-24 11:30:22.985
555	Cybersecurity	2025-09-24 11:30:22.985	f	28	2025-09-24 11:30:22.985
556	Data	2025-09-24 11:30:22.985	f	29	2025-09-24 11:30:22.985
557	Analytics	2025-09-24 11:30:22.985	f	30	2025-09-24 11:30:22.985
558	E-Commerce	2025-09-24 11:30:22.985	f	31	2025-09-24 11:30:22.985
559	Gaming	2025-09-24 11:30:22.985	f	32	2025-09-24 11:30:22.985
560	Entertainment Tech	2025-09-24 11:30:22.985	f	33	2025-09-24 11:30:22.985
561	FinTech	2025-09-24 11:30:22.985	f	34	2025-09-24 11:30:22.985
562	Education	2025-09-24 11:30:22.985	t	35	2025-09-24 11:30:22.985
563	Teaching	2025-09-24 11:30:22.985	f	36	2025-09-24 11:30:22.985
564	Training	2025-09-24 11:30:22.985	f	37	2025-09-24 11:30:22.985
565	E-Learning	2025-09-24 11:30:22.985	f	38	2025-09-24 11:30:22.985
566	EdTech	2025-09-24 11:30:22.985	f	39	2025-09-24 11:30:22.985
567	Capacity Building	2025-09-24 11:30:22.985	f	40	2025-09-24 11:30:22.985
568	Healthcare	2025-09-24 11:30:22.985	t	41	2025-09-24 11:30:22.985
569	Medical Services	2025-09-24 11:30:22.985	f	42	2025-09-24 11:30:22.985
570	Hospitals	2025-09-24 11:30:22.985	f	43	2025-09-24 11:30:22.985
571	Clinics	2025-09-24 11:30:22.985	f	44	2025-09-24 11:30:22.985
572	Pharmaceutical	2025-09-24 11:30:22.985	f	45	2025-09-24 11:30:22.985
573	Biotechnology	2025-09-24 11:30:22.985	f	46	2025-09-24 11:30:22.985
574	Public Health	2025-09-24 11:30:22.985	f	47	2025-09-24 11:30:22.985
575	Fitness	2025-09-24 11:30:22.985	f	48	2025-09-24 11:30:22.985
576	Wellness	2025-09-24 11:30:22.985	f	49	2025-09-24 11:30:22.985
577	Agriculture & Food	2025-09-24 11:30:22.985	t	50	2025-09-24 11:30:22.985
578	Agriculture	2025-09-24 11:30:22.985	f	51	2025-09-24 11:30:22.985
579	Agro-Allied	2025-09-24 11:30:22.985	f	52	2025-09-24 11:30:22.985
580	Fisheries	2025-09-24 11:30:22.985	f	53	2025-09-24 11:30:22.985
581	Aquaculture	2025-09-24 11:30:22.985	f	54	2025-09-24 11:30:22.985
582	Forestry	2025-09-24 11:30:22.985	f	55	2025-09-24 11:30:22.985
583	Food Processing	2025-09-24 11:30:22.985	f	56	2025-09-24 11:30:22.985
584	Retail	2025-09-24 11:30:22.985	f	57	2025-09-24 11:30:22.985
585	FMCG	2025-09-24 11:30:22.985	f	58	2025-09-24 11:30:22.985
586	Energy & Natural Resources	2025-09-24 11:30:22.985	t	59	2025-09-24 11:30:22.985
587	Oil & Gas	2025-09-24 11:30:22.985	f	60	2025-09-24 11:30:22.985
588	Energy	2025-09-24 11:30:22.985	f	61	2025-09-24 11:30:22.985
589	Power	2025-09-24 11:30:22.985	f	62	2025-09-24 11:30:22.985
590	Utilities	2025-09-24 11:30:22.985	f	63	2025-09-24 11:30:22.985
591	Renewable Energy	2025-09-24 11:30:22.985	f	64	2025-09-24 11:30:22.985
592	Mining	2025-09-24 11:30:22.985	f	65	2025-09-24 11:30:22.985
593	Extraction	2025-09-24 11:30:22.985	f	66	2025-09-24 11:30:22.985
594	Engineering & Manufacturing	2025-09-24 11:30:22.985	t	67	2025-09-24 11:30:22.985
595	Engineering	2025-09-24 11:30:22.985	f	68	2025-09-24 11:30:22.985
596	Technical Services	2025-09-24 11:30:22.985	f	69	2025-09-24 11:30:22.985
597	Construction	2025-09-24 11:30:22.985	f	70	2025-09-24 11:30:22.985
598	Real Estate	2025-09-24 11:30:22.985	f	71	2025-09-24 11:30:22.985
599	Architecture	2025-09-24 11:30:22.985	f	72	2025-09-24 11:30:22.985
600	Design	2025-09-24 11:30:22.985	f	73	2025-09-24 11:30:22.985
601	Manufacturing	2025-09-24 11:30:22.985	f	74	2025-09-24 11:30:22.985
602	Production	2025-09-24 11:30:22.985	f	75	2025-09-24 11:30:22.985
603	Industrial Automation	2025-09-24 11:30:22.985	f	76	2025-09-24 11:30:22.985
604	Transport & Logistics	2025-09-24 11:30:22.985	t	77	2025-09-24 11:30:22.985
605	Logistics	2025-09-24 11:30:22.985	f	78	2025-09-24 11:30:22.985
606	Supply Chain	2025-09-24 11:30:22.985	f	79	2025-09-24 11:30:22.985
607	Aviation	2025-09-24 11:30:22.985	f	80	2025-09-24 11:30:22.985
608	Aerospace	2025-09-24 11:30:22.985	f	81	2025-09-24 11:30:22.985
609	Maritime	2025-09-24 11:30:22.985	f	82	2025-09-24 11:30:22.985
610	Shipping	2025-09-24 11:30:22.985	f	83	2025-09-24 11:30:22.985
611	Rail Transport	2025-09-24 11:30:22.985	f	84	2025-09-24 11:30:22.985
612	Road Transport	2025-09-24 11:30:22.985	f	85	2025-09-24 11:30:22.985
613	Ride-hailing	2025-09-24 11:30:22.985	f	86	2025-09-24 11:30:22.985
614	Delivery Services	2025-09-24 11:30:22.985	f	87	2025-09-24 11:30:22.985
615	Government & Public Sector	2025-09-24 11:30:22.985	t	88	2025-09-24 11:30:22.985
616	Government	2025-09-24 11:30:22.985	f	89	2025-09-24 11:30:22.985
617	Public Service	2025-09-24 11:30:22.985	f	90	2025-09-24 11:30:22.985
618	NGO	2025-09-24 11:30:22.985	f	91	2025-09-24 11:30:22.985
619	Non-Profit	2025-09-24 11:30:22.985	f	92	2025-09-24 11:30:22.985
620	International Organizations	2025-09-24 11:30:22.985	f	93	2025-09-24 11:30:22.985
621	Security Services	2025-09-24 11:30:22.985	f	94	2025-09-24 11:30:22.985
622	Military	2025-09-24 11:30:22.985	f	95	2025-09-24 11:30:22.985
623	Defense	2025-09-24 11:30:22.985	f	96	2025-09-24 11:30:22.985
624	Creative & Lifestyle	2025-09-24 11:30:22.985	t	97	2025-09-24 11:30:22.985
625	Arts	2025-09-24 11:30:22.985	f	98	2025-09-24 11:30:22.985
626	Culture	2025-09-24 11:30:22.985	f	99	2025-09-24 11:30:22.985
627	Hospitality	2025-09-24 11:30:22.985	f	100	2025-09-24 11:30:22.985
628	Tourism	2025-09-24 11:30:22.985	f	101	2025-09-24 11:30:22.985
629	Events Management	2025-09-24 11:30:22.985	f	102	2025-09-24 11:30:22.985
630	Fashion	2025-09-24 11:30:22.985	f	103	2025-09-24 11:30:22.985
631	Beauty	2025-09-24 11:30:22.985	f	104	2025-09-24 11:30:22.985
632	Sports	2025-09-24 11:30:22.985	f	105	2025-09-24 11:30:22.985
633	Recreation	2025-09-24 11:30:22.985	f	106	2025-09-24 11:30:22.985
634	Entertainment	2025-09-24 11:30:22.985	f	107	2025-09-24 11:30:22.985
635	Music	2025-09-24 11:30:22.985	f	108	2025-09-24 11:30:22.985
636	Film	2025-09-24 11:30:22.985	f	109	2025-09-24 11:30:22.985
\.


--
-- Data for Name: Agency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Agency" (id, "ownerUserId", name, "rcNumber", "industryId", website, "sizeRange", "domainVerified", "cacVerified", "logoKey", "headquartersStateId", "lgaId", "createdAt", domain) FROM stdin;
7b63f0d4-ae27-46f4-8e3b-cabb88daa3d8	c1cfe44e-a176-474b-bf35-48398dca09c9	OhGiveThanks	\N	\N	\N	\N	t	t	\N	\N	\N	2025-09-17 20:07:32.599	tedunjaiyeseun@gmail.com
f7472be1-137d-42c4-b74a-9217988bd932	097944c2-3582-4220-ade4-4a93ab404375	AdinKems Inc.		553	https://www.adinkems.com	30-40	t	t	\N	37	\N	2025-09-05 08:06:38.204	\N
\.


--
-- Data for Name: AgencyMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AgencyMember" (id, "agencyId", "userId", role) FROM stdin;
8b66dfd6-9086-403b-b948-8c61bb7cff79	f7472be1-137d-42c4-b74a-9217988bd932	097944c2-3582-4220-ade4-4a93ab404375	OWNER
f2a37fec-899b-4fa7-83e5-3d091370ba41	7b63f0d4-ae27-46f4-8e3b-cabb88daa3d8	c1cfe44e-a176-474b-bf35-48398dca09c9	OWNER
\.


--
-- Data for Name: SubscriptionPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SubscriptionPlan" (id, name, description, price, currency, features, "stripePriceId", "jobPostLimit", "memberLimit") FROM stdin;
18b6484d-cd07-4fb5-b724-c5907049c251	Pro	Ideal for growing teams with continuous hiring needs.	10000	NGN	["Post up to 20 jobs", "Advanced search filters (skills - GPA - etc.)", "Shortlist up to 100 candidates", "Branded agency profile page", "Domain & email verification", "Add up to 3 recruiter accounts", "Job & applicant analytics"]	price_1S7cM5IGb6x0f4048axxqDh9	20	3
0b46b7e7-e867-43ce-a0ef-6be760d58cc2	Basic	Perfect for getting started and finding initial talent.	0	NGN	["Post 2 jobs at a time", "Limited search filters (location, role)", "Basic agency listing (unverified)", "1 agency member account", "Standard support"]	price_1S7citIGb6x0f4045UK1S7G4	2	1
307e72e7-163a-438f-a22e-44f43e0e2a17	Enterprise	For large organizations with dedicated hiring teams.	25000	NGN	["Unlimited job posts & shortlists", "AI-powered candidate recommendations", "Saved searches & new candidate alerts", "Full CAC verification badge", "Featured 'Top Employer' listing", "Unlimited recruiter accounts", "Advanced demographic & skills analytics"]	price_1S7cpkIGb6x0f404VFAaVjFK	-1	-1
\.


--
-- Data for Name: AgencySubscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AgencySubscription" (id, "agencyId", "planId", "endDate", status, "stripeCurrentPeriodEnd", "stripeCustomerId", "stripeSubscriptionId", "createdAt") FROM stdin;
ac2a9a7a-c2e6-4d3c-b058-7fa8bca1ade5	f7472be1-137d-42c4-b74a-9217988bd932	307e72e7-163a-438f-a22e-44f43e0e2a17	\N	ACTIVE	2025-10-19 01:40:00	cus_T53Pt00dPoqCgP	sub_1S8tItIGb6x0f404uGKe17Hh	2025-09-19 01:40:06.085
\.


--
-- Data for Name: CandidateProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CandidateProfile" (id, "userId", "firstName", "lastName", phone, dob, gender, "nyscNumber", "nyscBatch", "nyscStream", "callupHash", "stateCode", "primaryStateId", "lgaId", "disabilityInfo", "isVerified", "verificationLevel", "isRemote", "isOpenToReloc", "salaryMin", "salaryMax", availability, "workAuth", summary, linkedin, portfolio, "graduationYear", "gpaBand", "cvFileKey", "nyscFileKey") FROM stdin;
368bd3d5-db99-4983-9634-c28fb3833cdc	9784c3ee-80e5-46ae-b62c-e48f3fbde58b	John	Doe	1234567890	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	UNVERIFIED	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49318ac1-ce7e-435b-ac88-06a97a69641e	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Ezemuah	Tajudeen	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	UNVERIFIED	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10ef0a89-f235-4380-b1e3-b788ea0485c8	24561236-b941-4ff8-ad41-b9b71adcafdd	PPALink	Support	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	UNVERIFIED	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
243d4130-0256-4a3e-89f5-c99888237c0f	5900ca1a-625c-4a14-8331-ee286900ad73	Matthew	Tedunjaiye	07046015410	2001-05-09 00:00:00	\N	\N	Batch B	Stream 2	\N	\N	111	\N	\N	t	NYSC_VERIFIED	t	t	250000	\N	\N	\N	Oludasile PPALink	\N	\N	2024	\N	users/5900ca1a-625c-4a14-8331-ee286900ad73/cv/0f5e9afc-1552-4fe0-8dca-34cccf978e5a.pdf	users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/a9ebcbfb-0671-484d-849a-a734979f73f7.pdf
\.


--
-- Data for Name: Position; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Position" (id, "agencyId", title, description, "employmentType", "isRemote", "stateId", "lgaId", "minSalary", "maxSalary", "skillsReq", visibility, status, "createdAt", "updatedAt") FROM stdin;
d45805c9-c04f-4f5a-8beb-5cc970888e66	f7472be1-137d-42c4-b74a-9217988bd932	Frontend React Developer	We are seeking a skilled Frontend React Developer to join our growing team. You will be responsible for building user-friendly web interfaces, optimizing application performance, and collaborating with backend engineers to deliver scalable solutions. Strong experience with React, Tailwind CSS, and REST APIs is required.\n	FULLTIME	t	24	510	250000	450000	null	PUBLIC	OPEN	2025-09-07 01:32:10.152	2025-09-23 09:03:24.95
c32de97d-1bac-49d5-b026-5e77283e572c	7b63f0d4-ae27-46f4-8e3b-cabb88daa3d8	Software Tester	As a Software Tester, you will be responsible for evaluating and ensuring the quality, functionality, and reliability of software applications before they reach end users. You will design, execute, and maintain test cases, identify and document defects, and collaborate closely with developers and product teams to resolve issues. Your role requires a keen eye for detail, strong analytical skills, and a methodical approach to uncover potential problems, ensuring that software meets both functional and performance standards. You will also contribute to continuous improvement by suggesting enhancements to testing processes and participating in the development of automated testing where applicable.	FULLTIME	f	37	774	650000	719995	null	PUBLIC	OPEN	2025-09-17 20:10:37.758	2025-09-24 20:59:33.639
\.


--
-- Data for Name: Application; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Application" (id, "positionId", "candidateId", status, notes, "createdAt") FROM stdin;
c8849d9a-b562-43e5-a6f5-422ca612af6f	c32de97d-1bac-49d5-b026-5e77283e572c	243d4130-0256-4a3e-89f5-c99888237c0f	APPLIED	\N	2025-09-20 06:04:39.806
86788d61-bbff-4d42-9d79-b979aacac013	d45805c9-c04f-4f5a-8beb-5cc970888e66	49318ac1-ce7e-435b-ac88-06a97a69641e	INTERVIEW	\N	2025-09-07 01:55:36.786
e20ead25-4eef-4800-94cd-bd139aa8d1ff	d45805c9-c04f-4f5a-8beb-5cc970888e66	243d4130-0256-4a3e-89f5-c99888237c0f	APPLIED	Let us hire him and give him a chance, you hear me ba?	2025-09-09 17:26:37.096
30f4c19a-694c-4ce9-9e21-e9c3ddc35496	d45805c9-c04f-4f5a-8beb-5cc970888e66	368bd3d5-db99-4983-9634-c28fb3833cdc	REJECTED		2025-09-07 01:55:23.295
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "actorId", action, "createdAt", metadata, "targetId") FROM stdin;
ac5a7161-3fc7-4f7f-ba19-caca32b7bbbc	24561236-b941-4ff8-ad41-b9b71adcafdd	admin.user_impersonate	2025-09-24 21:44:17.371	{"targetUserEmail": "adinkems@gmail.com"}	097944c2-3582-4220-ade4-4a93ab404375
79960530-5620-47c6-969d-ffcb6d5227bb	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-24 21:46:47.214	{"changes": ["name", "description", "price", "features", "jobPostLimit", "memberLimit"]}	18b6484d-cd07-4fb5-b724-c5907049c251
6bc86dc0-9da2-40fb-9119-81781715bffc	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-24 21:47:05.449	{"changes": ["name", "description", "price", "features", "jobPostLimit", "memberLimit"]}	18b6484d-cd07-4fb5-b724-c5907049c251
b0b86f74-aff3-4e6f-b858-e5cc77477af6	24561236-b941-4ff8-ad41-b9b71adcafdd	verification.status.update	2025-09-24 21:52:33.866	{"newStatus": "APPROVED", "verificationId": "ddab4c76-595b-4b5f-a2a5-9f9da12ad723", "targetUserEmail": "adinkems@gmail.com", "verificationType": "CAC"}	097944c2-3582-4220-ade4-4a93ab404375
8cc5f090-dd6f-4c7b-9267-bcdb8fc72c46	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-24 21:57:14.84	{"changes": ["name", "description", "price", "features", "jobPostLimit", "memberLimit"], "planName": "Pro"}	18b6484d-cd07-4fb5-b724-c5907049c251
075b100e-5b2a-4094-be76-490c5873a22d	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-24 21:57:35.383	{"changes": ["name", "description", "price", "features", "jobPostLimit", "memberLimit"], "planName": "Prow"}	18b6484d-cd07-4fb5-b724-c5907049c251
329ce874-da76-4c25-bcfb-3cf009beab31	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-24 22:17:44.046	{"changes": ["name", "description", "price", "features", "jobPostLimit", "memberLimit"], "planName": "Pro"}	18b6484d-cd07-4fb5-b724-c5907049c251
d45eb4b6-139d-41a7-bff9-56f8edcc498a	24561236-b941-4ff8-ad41-b9b71adcafdd	user.status.update	2025-09-24 22:26:08.288	{"newStatus": "SUSPENDED", "previousStatus": "ACTIVE"}	9784c3ee-80e5-46ae-b62c-e48f3fbde58b
952434d9-11cd-40d9-9eb7-108003e84df3	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-24 23:16:58.738	{"after": {"name": "Pro", "price": 10000, "features": ["Post up to 20 jobs", "Advanced search filters (skills", "GPA", "etc.)", "Shortlist up to 100 candidates", "Branded agency profile page", "Domain & email verification", "Add up to 3 recruiter accounts", "Job & applicant analytics"], "description": "Ideal for growing teams with continuous hiring needs.", "memberLimit": 3, "jobPostLimit": 20}, "before": {"name": "Proq", "price": 10000, "features": ["Post up to 20 jobs", "Advanced search filters (skills", "GPA", "etc.)", "Shortlist up to 100 candidates", "Branded agency profile page", "Domain & email verification", "Add up to 3 recruiter accounts", "Job & applicant analytics"], "memberLimit": 3, "jobPostLimit": 20}, "planName": "Proq"}	18b6484d-cd07-4fb5-b724-c5907049c251
299c54aa-7ba5-4797-b54d-b08c29c9d209	24561236-b941-4ff8-ad41-b9b71adcafdd	user.status.update	2025-09-24 23:17:29.683	{"newStatus": "ACTIVE", "previousStatus": "SUSPENDED"}	9784c3ee-80e5-46ae-b62c-e48f3fbde58b
2a6e5162-f80e-4244-b46f-1171a3b574c4	24561236-b941-4ff8-ad41-b9b71adcafdd	user.status.update	2025-09-24 23:25:41.671	{"newStatus": "SUSPENDED", "previousStatus": "ACTIVE"}	9784c3ee-80e5-46ae-b62c-e48f3fbde58b
33613d92-9778-4895-80df-6311a43f9b3f	24561236-b941-4ff8-ad41-b9b71adcafdd	user.status.update	2025-09-24 23:29:01.94	{"newStatus": "ACTIVE", "previousStatus": "SUSPENDED", "targetUserEmail": "test.candidate@example.com"}	9784c3ee-80e5-46ae-b62c-e48f3fbde58b
4d637b5b-d262-45d4-b28f-4dd1636403c0	24561236-b941-4ff8-ad41-b9b71adcafdd	user.message.send	2025-09-24 23:35:50.516	{"messageExcerpt": "my boyyyy how far naaa", "recipientEmail": "tedunjaiyem@gmail.com"}	5900ca1a-625c-4a14-8331-ee286900ad73
0af62ca2-5f5d-4701-9882-18a84100db21	24561236-b941-4ff8-ad41-b9b71adcafdd	user.status.update	2025-09-25 00:16:47.71	{"newStatus": "SUSPENDED", "previousStatus": "ACTIVE", "targetUserEmail": "test.candidate@example.com"}	9784c3ee-80e5-46ae-b62c-e48f3fbde58b
ffd36ae7-c216-4839-b140-ad1d42058a80	24561236-b941-4ff8-ad41-b9b71adcafdd	user.status.update	2025-09-25 00:17:00.611	{"newStatus": "ACTIVE", "previousStatus": "SUSPENDED", "targetUserEmail": "test.candidate@example.com"}	9784c3ee-80e5-46ae-b62c-e48f3fbde58b
10aea2d8-fef6-4a96-97ea-a1dd94b4c998	24561236-b941-4ff8-ad41-b9b71adcafdd	plan.update	2025-09-25 01:00:57.292	{"after": {"name": "Pro", "price": 10000, "features": ["Post up to 20 jobs", "Advanced search filters (skills - GPA - etc.)", "Shortlist up to 100 candidates", "Branded agency profile page", "Domain & email verification", "Add up to 3 recruiter accounts", "Job & applicant analytics"], "description": "Ideal for growing teams with continuous hiring needs.", "memberLimit": 3, "jobPostLimit": 20}, "before": {"name": "Pro", "price": 10000, "features": ["Post up to 20 jobs", "Advanced search filters (skills", "GPA", "etc.)", "Shortlist up to 100 candidates", "Branded agency profile page", "Domain & email verification", "Add up to 3 recruiter accounts", "Job & applicant analytics"], "memberLimit": 3, "jobPostLimit": 20}, "planName": "Pro"}	18b6484d-cd07-4fb5-b724-c5907049c251
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
1	React.js	react.js
2	Node.js	node.js
3	TailwindCSS	tailwindcss
4	PostgresSQL	postgressql
5	REST	rest
6	xfbcnbb	xfbcnbb
7	dfg	dfg
8	dfsgfd	dfsgfd
9	dasgffh	dasgffh
10	bnvc	bnvc
11	TypeScript	typescript
12	Tailwind CSS	tailwind-css
13	REST APIs	rest-apis
14	Git/GitHub	git/github
15	Golang	golang
16	Express.js	express.js
17	Canva	canva
\.


--
-- Data for Name: CandidateSkill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CandidateSkill" (id, "candidateId", "skillId", level, years) FROM stdin;
9695cc96-4ee8-457c-a4a5-5a90b0314556	243d4130-0256-4a3e-89f5-c99888237c0f	1	1	\N
5e047d77-8fa6-43ea-a75e-5eb97cbeee29	243d4130-0256-4a3e-89f5-c99888237c0f	2	1	\N
dfab9e99-573b-4e93-b42c-8912b012116f	243d4130-0256-4a3e-89f5-c99888237c0f	4	1	\N
37cfb270-ceef-40fc-a80b-a69ad8e9088a	243d4130-0256-4a3e-89f5-c99888237c0f	12	1	\N
865d8b1a-5760-4b3a-b9bc-40887c509a64	243d4130-0256-4a3e-89f5-c99888237c0f	16	1	\N
91c9fae8-e4a3-4c8f-8677-3b121c6ca981	243d4130-0256-4a3e-89f5-c99888237c0f	17	1	\N
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
2be402a0-a2b1-496c-b40d-6f08375d52db	243d4130-0256-4a3e-89f5-c99888237c0f	The Federal University of Technology, Akure	Bachelor of Technology	Computer Science	Second Class Upper	2018-01-10 00:00:00	2024-01-04 00:00:00	2025-09-10 00:09:03.175	2025-09-21 13:28:28.476
\.


--
-- Data for Name: FeatureFlag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeatureFlag" (name, description, "isEnabled") FROM stdin;
enableAiRecommendations	Enables the AI-powered candidate matching feature for Enterprise agencies.	f
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
75	Abia
76	Adamawa
77	Akwa Ibom
78	Anambra
79	Bauchi
80	Bayelsa
81	Benue
82	Borno
83	Cross River
84	Delta
85	Ebonyi
86	Edo
87	Ekiti
88	Enugu
89	Gombe
90	Imo
91	Jigawa
92	Kaduna
93	Kano
94	Katsina
95	Kebbi
96	Kogi
97	Kwara
98	Lagos
99	Nasarawa
100	Niger
101	Ogun
102	Ondo
103	Osun
104	Oyo
105	Plateau
106	Rivers
107	Sokoto
108	Taraba
109	Yobe
110	Zamfara
111	Abuja (FCT)
\.


--
-- Data for Name: LocationLGA; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LocationLGA" (id, name, "stateId") FROM stdin;
1549	Aba North	75
1550	Aba South	75
1551	Arochukwu	75
1552	Bende	75
1553	Ikwuano	75
1554	Isiala Ngwa North	75
1555	Isiala Ngwa South	75
1556	Isuikwuato	75
1557	Obi Ngwa	75
1558	Ohafia	75
1559	Osisioma	75
1560	Ugwunagbo	75
1561	Ukwa East	75
1562	Ukwa West	75
1563	Umuahia North	75
1564	Umuahia South	75
1565	Umu Nneochi	75
1566	Demsa	76
1567	Fufure	76
1568	Ganye	76
1569	Gayuk	76
1570	Gombi	76
1571	Grie	76
1572	Hong	76
1573	Jada	76
1574	Larmurde	76
1575	Madagali	76
1576	Maiha	76
1577	Mayo Belwa	76
1578	Michika	76
1579	Mubi North	76
1580	Mubi South	76
1581	Numan	76
1582	Shelleng	76
1583	Song	76
1584	Toungo	76
1585	Yola North	76
1586	Yola South	76
1587	Abak	77
1588	Eastern Obolo	77
1589	Eket	77
1590	Esit Eket	77
1591	Essien Udim	77
1592	Etim Ekpo	77
1593	Etinan	77
1594	Ibeno	77
1595	Ibesikpo Asutan	77
1596	Ibiono-Ibom	77
1597	Ika	77
1598	Ikono	77
1599	Ikot Abasi	77
1600	Ikot Ekpene	77
1601	Ini	77
1602	Itu	77
1603	Mbo	77
1604	Mkpat-Enin	77
1605	Nsit-Atai	77
1606	Nsit-Ibom	77
1607	Nsit-Ubium	77
1608	Obot Akara	77
1609	Okobo	77
1610	Onna	77
1611	Oron	77
1612	Oruk Anam	77
1613	Udung-Uko	77
1614	Ukanafun	77
1615	Uruan	77
1616	Urue-Offong/Oruko	77
1617	Uyo	77
1618	Aguata	78
1619	Anambra East	78
1620	Anambra West	78
1621	Anaocha	78
1622	Awka North	78
1623	Awka South	78
1624	Ayamelum	78
1625	Dunukofia	78
1626	Ekwusigo	78
1627	Idemili North	78
1628	Idemili South	78
1629	Ihiala	78
1630	Njikoka	78
1631	Nnewi North	78
1632	Nnewi South	78
1633	Ogbaru	78
1634	Onitsha North	78
1635	Onitsha South	78
1636	Orumba North	78
1637	Orumba South	78
1638	Oyi	78
1639	Alkaleri	79
1640	Bauchi	79
1641	Bogoro	79
1642	Damban	79
1643	Darazo	79
1644	Dass	79
1645	Gamawa	79
1646	Ganjuwa	79
1647	Giade	79
1648	Itas/Gadau	79
1649	Jama'are	79
1650	Katagum	79
1651	Kirfi	79
1652	Misau	79
1653	Ningi	79
1654	Shira	79
1655	Tafawa Balewa	79
1656	Toro	79
1657	Warji	79
1658	Zaki	79
1659	Brass	80
1660	Ekeremor	80
1661	Kolokuma/Opokuma	80
1662	Nembe	80
1663	Ogbia	80
1664	Sagbama	80
1665	Southern Ijaw	80
1666	Yenagoa	80
1667	Ado	81
1668	Agatu	81
1669	Apa	81
1670	Buruku	81
1671	Gboko	81
1672	Guma	81
1673	Gwer East	81
1674	Gwer West	81
1675	Katsina-Ala	81
1676	Konshisha	81
1677	Kwande	81
1678	Logo	81
1679	Makurdi	81
1680	Obi	81
1681	Ogbadibo	81
1682	Ohimini	81
1683	Oju	81
1684	Okpokwu	81
1685	Oturkpo	81
1686	Tarka	81
1687	Ukum	81
1688	Ushongo	81
1689	Vandeikya	81
1690	Abadam	82
1691	Askira/Uba	82
1692	Bama	82
1693	Bayo	82
1694	Biu	82
1695	Chibok	82
1696	Damboa	82
1697	Dikwa	82
1698	Gubio	82
1699	Guzamala	82
1700	Gwoza	82
1701	Hawul	82
1702	Jere	82
1703	Kaga	82
1704	Kala/Balge	82
1705	Konduga	82
1706	Kukawa	82
1707	Kwaya Kusar	82
1708	Mafa	82
1709	Magumeri	82
1710	Maiduguri	82
1711	Marte	82
1712	Mobbar	82
1713	Monguno	82
1714	Ngala	82
1715	Nganzai	82
1716	Shani	82
1717	Abi	83
1718	Akamkpa	83
1719	Akpabuyo	83
1720	Bakassi	83
1721	Bekwarra	83
1722	Biase	83
1723	Boki	83
1724	Calabar Municipal	83
1725	Calabar South	83
1726	Etung	83
1727	Ikom	83
1728	Obanliku	83
1729	Obubra	83
1730	Obudu	83
1731	Odukpani	83
1732	Ogoja	83
1733	Yakuur	83
1734	Yala	83
1735	Aniocha North	84
1736	Aniocha South	84
1737	Bomadi	84
1738	Burutu	84
1739	Ethiope East	84
1740	Ethiope West	84
1741	Ika North East	84
1742	Ika South	84
1743	Isoko North	84
1744	Isoko South	84
1745	Ndokwa East	84
1746	Ndokwa West	84
1747	Okpe	84
1748	Oshimili North	84
1749	Oshimili South	84
1750	Patani	84
1751	Sapele	84
1752	Udu	84
1753	Ughelli North	84
1754	Ughelli South	84
1755	Ukwuani	84
1756	Uvwie	84
1757	Warri North	84
1758	Warri South	84
1759	Warri South West	84
1760	Abakaliki	85
1761	Afikpo North	85
1762	Afikpo South	85
1763	Ebonyi	85
1764	Ezza North	85
1765	Ezza South	85
1766	Ikwo	85
1767	Ishielu	85
1768	Ivo	85
1769	Izzi	85
1770	Ohaozara	85
1771	Ohaukwu	85
1772	Onicha	85
1773	Akoko-Edo	86
1774	Egor	86
1775	Esan Central	86
1776	Esan North-East	86
1777	Esan South-East	86
1778	Esan West	86
1779	Etsako Central	86
1780	Etsako East	86
1781	Etsako West	86
1782	Igueben	86
1783	Ikpoba Okha	86
1784	Orhionmwon	86
1785	Oredo	86
1786	Ovia North-East	86
1787	Ovia South-West	86
1788	Owan East	86
1789	Owan West	86
1790	Uhunmwonde	86
1791	Ado Ekiti	87
1792	Efon	87
1793	Ekiti East	87
1794	Ekiti South-West	87
1795	Ekiti West	87
1796	Emure	87
1797	Gbonyin	87
1798	Ido Osi	87
1799	Ijero	87
1800	Ikere	87
1801	Ikole	87
1802	Ilejemeje	87
1803	Irepodun/Ifelodun	87
1804	Ise/Orun	87
1805	Moba	87
1806	Oye	87
1807	Aninri	88
1808	Awgu	88
1809	Enugu East	88
1810	Enugu North	88
1811	Enugu South	88
1812	Ezeagu	88
1813	Igbo Etiti	88
1814	Igbo Eze North	88
1815	Igbo Eze South	88
1816	Isi Uzo	88
1817	Nkanu East	88
1818	Nkanu West	88
1819	Nsukka	88
1820	Oji River	88
1821	Udenu	88
1822	Udi	88
1823	Uzo Uwani	88
1824	Akko	89
1825	Balanga	89
1826	Billiri	89
1827	Dukku	89
1828	Funakaye	89
1829	Gombe	89
1830	Kaltungo	89
1831	Kwami	89
1832	Nafada	89
1833	Shongom	89
1834	Yamaltu/Deba	89
1835	Aboh Mbaise	90
1836	Ahiazu Mbaise	90
1837	Ehime Mbano	90
1838	Ezinihitte	90
1839	Ideato North	90
1840	Ideato South	90
1841	Ihitte/Uboma	90
1842	Ikeduru	90
1843	Isiala Mbano	90
1844	Isu	90
1845	Mbaitoli	90
1846	Ngor Okpala	90
1847	Njaba	90
1848	Nkwerre	90
1849	Nwangele	90
1850	Obowo	90
1851	Oguta	90
1852	Ohaji/Egbema	90
1853	Okigwe	90
1854	Orlu	90
1855	Orsu	90
1856	Oru East	90
1857	Oru West	90
1858	Owerri Municipal	90
1859	Owerri North	90
1860	Owerri West	90
1861	Unuimo	90
1862	Auyo	91
1863	Babura	91
1864	Biriniwa	91
1865	Birnin Kudu	91
1866	Buji	91
1867	Dutse	91
1868	Gagarawa	91
1869	Garki	91
1870	Gumel	91
1871	Guri	91
1872	Gwaram	91
1873	Gwiwa	91
1874	Hadejia	91
1875	Jahun	91
1876	Kafin Hausa	91
1877	Kazaure	91
1878	Kiri Kasama	91
1879	Kiyawa	91
1880	Kaugama	91
1881	Maigatari	91
1882	Malam Madori	91
1883	Miga	91
1884	Ringim	91
1885	Roni	91
1886	Sule Tankarkar	91
1887	Taura	91
1888	Yankwashi	91
1889	Birnin Gwari	92
1890	Chikun	92
1891	Giwa	92
1892	Igabi	92
1893	Ikara	92
1894	Jaba	92
1895	Jema'a	92
1896	Kachia	92
1897	Kaduna North	92
1898	Kaduna South	92
1899	Kagarko	92
1900	Kajuru	92
1901	Kaura	92
1902	Kauru	92
1903	Kubau	92
1904	Kudan	92
1905	Lere	92
1906	Makarfi	92
1907	Sabon Gari	92
1908	Sanga	92
1909	Soba	92
1910	Zangon Kataf	92
1911	Zaria	92
1912	Ajingi	93
1913	Albasu	93
1914	Bagwai	93
1915	Bebeji	93
1916	Bichi	93
1917	Bunkure	93
1918	Dala	93
1919	Dambatta	93
1920	Dawakin Kudu	93
1921	Dawakin Tofa	93
1922	Doguwa	93
1923	Fagge	93
1924	Gabasawa	93
1925	Garko	93
1926	Garun Mallam	93
1927	Gaya	93
1928	Gezawa	93
1929	Gwale	93
1930	Gwarzo	93
1931	Kabo	93
1932	Kano Municipal	93
1933	Karaye	93
1934	Kibiya	93
1935	Kiru	93
1936	Kumbotso	93
1937	Kunchi	93
1938	Kura	93
1939	Madobi	93
1940	Makoda	93
1941	Minjibir	93
1942	Nasarawa	93
1943	Rano	93
1944	Rimin Gado	93
1945	Rogo	93
1946	Shanono	93
1947	Sumaila	93
1948	Takai	93
1949	Tarauni	93
1950	Tofa	93
1951	Tsanyawa	93
1952	Tudun Wada	93
1953	Ungogo	93
1954	Warawa	93
1955	Wudil	93
1956	Bakori	94
1957	Batagarawa	94
1958	Batsari	94
1959	Baure	94
1960	Bindawa	94
1961	Charanchi	94
1962	Dandume	94
1963	Danja	94
1964	Dan Musa	94
1965	Daura	94
1966	Dutsi	94
1967	Dutsin Ma	94
1968	Faskari	94
1969	Funtua	94
1970	Ingawa	94
1971	Jibia	94
1972	Kafur	94
1973	Kaita	94
1974	Kankara	94
1975	Kankia	94
1976	Katsina	94
1977	Kurfi	94
1978	Kusada	94
1979	Mai'Adua	94
1980	Malumfashi	94
1981	Mani	94
1982	Mashi	94
1983	Matazu	94
1984	Musawa	94
1985	Rimi	94
1986	Sabuwa	94
1987	Safana	94
1988	Sandamu	94
1989	Zango	94
1990	Aleiro	95
1991	Arewa Dandi	95
1992	Argungu	95
1993	Augie	95
1994	Bagudo	95
1995	Birnin Kebbi	95
1996	Bunza	95
1997	Dandi	95
1998	Fakai	95
1999	Gwandu	95
2000	Jega	95
2001	Kalgo	95
2002	Koko/Besse	95
2003	Maiyama	95
2004	Ngaski	95
2005	Sakaba	95
2006	Shanga	95
2007	Suru	95
2008	Wasagu/Danko	95
2009	Yauri	95
2010	Zuru	95
2011	Adavi	96
2012	Ajaokuta	96
2013	Ankpa	96
2014	Bassa	96
2015	Dekina	96
2016	Ibaji	96
2017	Idah	96
2018	Igalamela Odolu	96
2019	Ijumu	96
2020	Kabba/Bunu	96
2021	Kogi	96
2022	Lokoja	96
2023	Mopa Muro	96
2024	Ofu	96
2025	Ogori/Magongo	96
2026	Okehi	96
2027	Okene	96
2028	Olamaboro	96
2029	Omala	96
2030	Yagba East	96
2031	Yagba West	96
2032	Asa	97
2033	Baruten	97
2034	Edu	97
2035	Ekiti	97
2036	Ifelodun	97
2037	Ilorin East	97
2038	Ilorin South	97
2039	Ilorin West	97
2040	Irepodun	97
2041	Isin	97
2042	Kaiama	97
2043	Moro	97
2044	Offa	97
2045	Oke Ero	97
2046	Oyun	97
2047	Pategi	97
2048	Agege	98
2049	Ajeromi-Ifelodun	98
2050	Alimosho	98
2051	Amuwo-Odofin	98
2052	Apapa	98
2053	Badagry	98
2054	Epe	98
2055	Eti Osa	98
2056	Ibeju-Lekki	98
2057	Ifako-Ijaiye	98
2058	Ikeja	98
2059	Ikorodu	98
2060	Kosofe	98
2061	Lagos Island	98
2062	Lagos Mainland	98
2063	Mushin	98
2064	Ojo	98
2065	Oshodi-Isolo	98
2066	Shomolu	98
2067	Surulere	98
2068	Akwanga	99
2069	Awe	99
2070	Doma	99
2071	Karu	99
2072	Keana	99
2073	Keffi	99
2074	Kokona	99
2075	Lafia	99
2076	Nasarawa	99
2077	Nasarawa Egon	99
2078	Obi	99
2079	Toto	99
2080	Wamba	99
2081	Agaie	100
2082	Agwara	100
2083	Bida	100
2084	Borgu	100
2085	Bosso	100
2086	Chanchaga	100
2087	Edati	100
2088	Gbako	100
2089	Gurara	100
2090	Katcha	100
2091	Kontagora	100
2092	Lapai	100
2093	Lavun	100
2094	Magama	100
2095	Mariga	100
2096	Mashegu	100
2097	Mokwa	100
2098	Moya	100
2099	Paikoro	100
2100	Rafi	100
2101	Rijau	100
2102	Shiroro	100
2103	Suleja	100
2104	Tafa	100
2105	Wushishi	100
2106	Abeokuta North	101
2107	Abeokuta South	101
2108	Ado-Odo/Ota	101
2109	Egbado North	101
2110	Egbado South	101
2111	Ewekoro	101
2112	Ifo	101
2113	Ijebu East	101
2114	Ijebu North	101
2115	Ijebu North East	101
2116	Ijebu Ode	101
2117	Ikenne	101
2118	Imeko Afon	101
2119	Ipokia	101
2120	Obafemi Owode	101
2121	Odeda	101
2122	Odogbolu	101
2123	Ogun Waterside	101
2124	Remo North	101
2125	Shagamu	101
2126	Akoko North-East	102
2127	Akoko North-West	102
2128	Akoko South-West	102
2129	Akoko South-East	102
2130	Akure North	102
2131	Akure South	102
2132	Ese Odo	102
2133	Idanre	102
2134	Ifedore	102
2135	Ilaje	102
2136	Ile Oluji/Okeigbo	102
2137	Irele	102
2138	Odigbo	102
2139	Okitipupa	102
2140	Ondo East	102
2141	Ondo West	102
2142	Ose	102
2143	Owo	102
2144	Aiyedaade	103
2145	Aiyedire	103
2146	Atakunmosa East	103
2147	Atakunmosa West	103
2148	Boluwaduro	103
2149	Boripe	103
2150	Ede North	103
2151	Ede South	103
2152	Ife Central	103
2153	Ife East	103
2154	Ife North	103
2155	Ife South	103
2156	Egbedore	103
2157	Ejigbo	103
2158	Ifedayo	103
2159	Ifelodun	103
2160	Ila	103
2161	Ilesa East	103
2162	Ilesa West	103
2163	Irepodun	103
2164	Irewole	103
2165	Isokan	103
2166	Iwo	103
2167	Obokun	103
2168	Odo Otin	103
2169	Ola Oluwa	103
2170	Olorunda	103
2171	Oriade	103
2172	Orolu	103
2173	Osogbo	103
2174	Afijio	104
2175	Akinyele	104
2176	Atiba	104
2177	Atisbo	104
2178	Egbeda	104
2179	Ibadan North	104
2180	Ibadan North-East	104
2181	Ibadan North-West	104
2182	Ibadan South-East	104
2183	Ibadan South-West	104
2184	Ibarapa Central	104
2185	Ibarapa East	104
2186	Ibarapa North	104
2187	Ido	104
2188	Irepo	104
2189	Iseyin	104
2190	Itesiwaju	104
2191	Iwajowa	104
2192	Kajola	104
2193	Lagelu	104
2194	Ogbomosho North	104
2195	Ogbomosho South	104
2196	Ogo Oluwa	104
2197	Olorunsogo	104
2198	Oluyole	104
2199	Ona Ara	104
2200	Orelope	104
2201	Ori Ire	104
2202	Oyo	104
2203	Oyo East	104
2204	Saki East	104
2205	Saki West	104
2206	Surulere	104
2207	Bokkos	105
2208	Barkin Ladi	105
2209	Bassa	105
2210	Jos East	105
2211	Jos North	105
2212	Jos South	105
2213	Kanam	105
2214	Kanke	105
2215	Langtang South	105
2216	Langtang North	105
2217	Mangu	105
2218	Mikang	105
2219	Pankshin	105
2220	Qua'an Pan	105
2221	Riyom	105
2222	Shendam	105
2223	Wase	105
2224	Port Harcourt	106
2225	Obio-Akpor	106
2226	Okrika	106
2227	OguΓÇôBolo	106
2228	Eleme	106
2229	Tai	106
2230	Gokana	106
2231	Khana	106
2232	Oyigbo	106
2233	OpoboΓÇôNkoro	106
2234	Andoni	106
2235	Bonny	106
2236	Degema	106
2237	Asari-Toru	106
2238	Akuku-Toru	106
2239	AbuaΓÇôOdual	106
2240	Ahoada West	106
2241	Ahoada East	106
2242	OgbaΓÇôEgbemaΓÇôNdoni	106
2243	Emuoha	106
2244	Ikwerre	106
2245	Etche	106
2246	Omuma	106
2247	Binji	107
2248	Bodinga	107
2249	Dange Shuni	107
2250	Gada	107
2251	Goronyo	107
2252	Gudu	107
2253	Gwadabawa	107
2254	Illela	107
2255	Isa	107
2256	Kebbe	107
2257	Kware	107
2258	Rabah	107
2259	Sabon Birni	107
2260	Shagari	107
2261	Silame	107
2262	Sokoto North	107
2263	Sokoto South	107
2264	Tambuwal	107
2265	Tangaza	107
2266	Tureta	107
2267	Wamako	107
2268	Wurno	107
2269	Yabo	107
2270	Ardo Kola	108
2271	Bali	108
2272	Donga	108
2273	Gashaka	108
2274	Gassol	108
2275	Ibi	108
2276	Jalingo	108
2277	Karim Lamido	108
2278	Kumi	108
2279	Lau	108
2280	Sardauna	108
2281	Takum	108
2282	Ussa	108
2283	Wukari	108
2284	Yorro	108
2285	Zing	108
2286	Bade	109
2287	Bursari	109
2288	Damaturu	109
2289	Fika	109
2290	Fune	109
2291	Geidam	109
2292	Gujba	109
2293	Gulani	109
2294	Jakusko	109
2295	Karasuwa	109
2296	Machina	109
2297	Nangere	109
2298	Nguru	109
2299	Potiskum	109
2300	Tarmuwa	109
2301	Yunusari	109
2302	Yusufari	109
2303	Anka	110
2304	Bakura	110
2305	Birnin Magaji/Kiyaw	110
2306	Bukkuyum	110
2307	Bungudu	110
2308	Gummi	110
2309	Gusau	110
2310	Kaura Namoda	110
2311	Maradun	110
2312	Maru	110
2313	Shinkafi	110
2314	Talata Mafara	110
2315	Chafe	110
2316	Zurmi	110
2317	Abaji	111
2318	Bwari	111
2319	Gwagwalada	111
2320	Kuje	111
2321	Kwali	111
2322	Municipal Area Council	111
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
de6f7452-0bd4-4721-a27f-7491dac84e5b	097944c2-3582-4220-ade4-4a93ab404375	9784c3ee-80e5-46ae-b62c-e48f3fbde58b	\N	hiiii	2025-09-19 02:17:39.216	\N
1cb8f5b6-4290-4aac-b1ee-876535cc671d	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hi	2025-09-20 04:47:04.064	2025-09-20 05:02:07.048
679caef0-0566-4b4c-81da-3972dfb6b5fa	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	oi	2025-09-20 04:47:27.171	2025-09-20 05:02:07.048
7f6e04fe-d67a-46e8-b133-4b869715254e	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	fs	2025-09-20 04:47:34.367	2025-09-20 05:02:07.048
0a94ba2f-bc54-48f1-bad5-13aca2794807	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	dfs	2025-09-20 04:47:44.075	2025-09-20 05:02:07.048
fdf878a3-05ba-42eb-a2b4-8646e205604e	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	sf	2025-09-20 04:47:57.522	2025-09-20 05:02:07.048
43b410bd-dd7d-4599-adad-5c0ff9251093	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	vx	2025-09-20 04:48:03.509	2025-09-20 05:02:07.048
dfbc1a2d-5138-4ad1-a99b-6da3729d7422	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	f	2025-09-20 04:48:11.022	2025-09-20 05:02:07.048
36aea139-9a41-478e-929a-d5c0eb4e60a5	5900ca1a-625c-4a14-8331-ee286900ad73	097944c2-3582-4220-ade4-4a93ab404375	\N	hi	2025-09-21 11:04:43.451	2025-09-21 11:04:49.78
1e8954f2-dcc6-432a-8334-34ee8a484284	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hello	2025-09-21 11:04:57.116	2025-09-21 13:29:22.329
db84fb22-95bd-4e0d-bf58-290bc38d8e2a	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	how far my guy	2025-09-23 10:09:54.8	2025-09-23 10:10:08.655
b22b8b32-e57d-4aa7-a15f-a17bc295d0a6	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	Hi boss. i hope this gets you well	2025-09-23 09:54:57.048	2025-09-23 09:55:17.143
9bbb87b0-6821-4cd9-9a78-f428ae9301ad	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	hello	2025-09-23 09:55:31.267	2025-09-23 10:09:16.19
aacf44e6-1337-499e-a8c4-4d56330fa396	097944c2-3582-4220-ade4-4a93ab404375	5900ca1a-625c-4a14-8331-ee286900ad73	\N	hew	2025-09-23 00:44:51.525	2025-09-23 10:10:57.455
f56edaaf-e946-4501-8697-1166338bf97c	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	heyyyy	2025-09-23 10:11:15.474	2025-09-23 10:11:27.757
2d19d92c-a174-40a8-b28e-40bf5b62c5ca	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	okay thanks	2025-09-23 10:20:53.464	2025-09-23 10:21:10.501
315380b8-4e1d-4e33-bdec-69d8e0b31e75	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	indomie boy	2025-09-23 10:20:16.973	2025-09-23 10:20:44.032
96f97a7b-28d3-4578-a14a-c6cfae539700	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	how far	2025-09-23 10:35:46.514	2025-09-23 10:36:00.064
e4d79b2c-7672-4396-a746-de2f3b989513	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	yooooooooooooooo	2025-09-23 10:27:20.547	2025-09-23 10:35:43.23
f9664dbd-3e93-4c0e-a705-46e332900cca	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	i dey	2025-09-23 10:36:05.179	2025-09-23 10:47:43.656
bf22773a-ad2f-42e2-bdb2-d593973ad799	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	fsw	2025-09-23 10:47:30.522	2025-09-23 10:47:43.656
1971042d-4f9e-4327-b954-08f6dc5f6f1e	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	cool	2025-09-23 10:47:53.315	2025-09-23 10:53:55.288
98098569-e22d-498e-aeb0-422cfa25f872	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	yeah	2025-09-23 10:53:58.034	2025-09-23 10:54:11.043
8a9ae3d0-fe0d-4ca3-a6a4-5bfd482f7e03	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	mayonaises	2025-09-23 10:54:35.299	2025-09-23 10:57:45.56
c90cc872-39fb-4f8d-acee-a956ae3ca197	5900ca1a-625c-4a14-8331-ee286900ad73	24561236-b941-4ff8-ad41-b9b71adcafdd	\N	good	2025-09-23 10:57:51.442	2025-09-23 10:58:08.64
4a7b538a-ce52-41a2-af1d-477e3129cd9b	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	boat and slide	2025-09-23 10:58:27.633	2025-09-24 11:26:00.99
e52fcbc2-cdc2-4a0c-9dc8-541546ff6f69	24561236-b941-4ff8-ad41-b9b71adcafdd	5900ca1a-625c-4a14-8331-ee286900ad73	\N	my boyyyy how far naaa	2025-09-24 23:35:50.368	\N
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
b8d3848b-9549-43b4-ada1-f8174e4bb32a	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-14 00:58:34.435	MESSAGE	\N
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
02916119-1f09-4a20-b8ca-cb029df28449	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-18 21:20:43.811	GENERIC	\N
02de4c21-f604-4342-b4fd-6b2f1074bfad	9784c3ee-80e5-46ae-b62c-e48f3fbde58b	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	f	2025-09-19 02:17:39.426	MESSAGE	{"lastMessage": "hiiii"}
dbb29e49-90fe-47fa-889e-dafa82afa1ef	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to INTERVIEW.	/dashboard/candidate/applications	t	2025-09-19 02:51:27.793	GENERIC	\N
f330a732-c58c-4140-9729-1c62f3e94249	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-20 02:03:35.44	GENERIC	\N
2cc2ce43-f3dc-46fe-b099-d3e829ee7d58	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-20 02:03:36.392	GENERIC	\N
1e8ce61b-a6ee-4eaa-a761-c00ad35bd815	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-20 04:47:04.327	MESSAGE	{"lastMessage": "hi"}
2225b718-b793-4b9d-a1e6-52d2178682da	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-20 04:47:27.176	MESSAGE	{"lastMessage": "oi"}
ddca471f-7f7e-416e-8b0c-1b8b3f07dc95	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-20 04:47:34.37	MESSAGE	{"lastMessage": "fs"}
cf9288ec-36dc-43d9-9474-92f9202f5f76	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-20 04:47:44.077	MESSAGE	{"lastMessage": "dfs"}
5babbf7c-097a-4e75-a2cc-1738c2bdc689	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-20 04:47:57.525	MESSAGE	{"lastMessage": "sf"}
799a90f3-7f93-4865-83f3-1244dd61ee45	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-20 04:48:11.037	MESSAGE	{"lastMessage": "f"}
cf12491f-8107-4de8-a70c-541357c8cd28	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-20 04:48:03.512	MESSAGE	{"lastMessage": "vx"}
01df9f78-0fad-4dfc-a6b8-7b94def3d9cc	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 04:23:11.469	GENERIC	\N
b6e4c483-6df1-4491-9d39-9a4e200cb9b9	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-21 04:53:47.516	GENERIC	\N
4149efcd-580f-4ff8-ab91-a7d80005dfa9	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 04:53:54.055	GENERIC	\N
7719b05b-c0f1-4c29-9153-a2adb87bbb94	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-21 04:54:05.868	GENERIC	\N
c2b3aa0e-9c96-470c-a7c1-9feb39140762	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 04:54:08.31	GENERIC	\N
75796c29-75c4-4cf2-8571-df8f72ef1385	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-21 04:58:56.15	GENERIC	\N
da3d220d-c5c1-4fe5-b7fa-e7dd392fa6dc	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 05:02:56.485	GENERIC	\N
1e646e2c-ed08-484f-ba3e-2d17ad3f82b3	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-21 05:03:03.667	GENERIC	\N
cb3910ec-61de-4973-a603-6a408c8a858b	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 05:03:21.78	GENERIC	\N
376eff07-02ad-47a0-bdd3-bd8dd4237177	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to INTERVIEW.	/dashboard/candidate/applications	f	2025-09-21 05:03:37.947	GENERIC	\N
6b4aab13-c533-484f-b182-65f55c41967c	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 05:10:27.016	GENERIC	\N
95aba24a-800e-4222-aaee-445c8475b429	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to REVIEWING.	/dashboard/candidate/applications	f	2025-09-21 05:19:17.951	GENERIC	\N
8eaa7f44-c588-406c-b40a-7bc5a043111e	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to OFFER.	/dashboard/candidate/applications	f	2025-09-21 05:35:16.995	GENERIC	\N
57a879ff-3654-4f43-822c-3f324840a8f8	5900ca1a-625c-4a14-8331-ee286900ad73	Your application for "Frontend React Developer" was updated to APPLIED.	/dashboard/candidate/applications	f	2025-09-21 10:59:45.218	GENERIC	\N
b3837027-de8a-4ae0-b6d8-aff2fdab055b	097944c2-3582-4220-ade4-4a93ab404375	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-21 11:04:43.463	MESSAGE	{"lastMessage": "hi"}
b8207757-4fef-44d3-be11-facc6adf939a	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-21 11:04:57.121	MESSAGE	{"lastMessage": "hello"}
f1825e88-6018-4dbe-bafd-e7fc67389c11	fcd910ed-f411-4524-bdb1-23de83a9e4d1	Your application for "Frontend React Developer" was updated to INTERVIEW.	/dashboard/candidate/applications	t	2025-09-21 05:35:18.697	GENERIC	\N
cca2e9d2-7511-4dd8-b43d-1a2d87c44a4d	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from AdinKems Inc..	/inbox?with=097944c2-3582-4220-ade4-4a93ab404375	t	2025-09-23 00:44:51.684	MESSAGE	{"lastMessage": "hew"}
42cd44d6-5c48-435a-bbe4-dca86ce071dc	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 09:55:31.293	MESSAGE	{"lastMessage": "hello"}
38cad77e-8b95-4083-9f48-747330d6b110	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 10:11:15.477	MESSAGE	{"lastMessage": "heyyyy"}
4d6069b5-7fd0-45f8-8b25-5275e832e5e7	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from PPAHire Admin.	/inbox?with=24561236-b941-4ff8-ad41-b9b71adcafdd	t	2025-09-23 10:20:17.437	MESSAGE	{"lastMessage": "indomie boy"}
17f3cab0-f61a-4c15-ac9e-c2032348d7d9	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 10:20:53.467	MESSAGE	{"lastMessage": "okay thanks"}
d993b740-0839-469f-86e2-5d58c837c810	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 10:27:20.571	MESSAGE	{"lastMessage": "yooooooooooooooo"}
ddec3708-1757-4752-bcc3-f48ebc61c754	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from A user.	/inbox?with=24561236-b941-4ff8-ad41-b9b71adcafdd	t	2025-09-23 10:35:46.561	MESSAGE	{"lastMessage": "how far"}
8bf5cd1d-5d25-4097-a70d-24514f91218f	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	f	2025-09-23 10:36:05.183	MESSAGE	{"lastMessage": "i dey"}
7084ce5f-dea0-4aa9-8e24-fe5c4c86ed1e	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew Tedunjaiye.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 10:47:30.556	MESSAGE	{"lastMessage": "fsw"}
12d3c564-16f9-407e-8cc8-7b9ebf5ae0a0	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from PPALink Support.	/inbox?with=24561236-b941-4ff8-ad41-b9b71adcafdd	t	2025-09-23 10:47:53.355	MESSAGE	{"lastMessage": "cool"}
b3767525-ddd0-4434-9d00-9070928c8b5e	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew Tedunjaiye.	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 10:53:58.092	MESSAGE	{"lastMessage": "yeah"}
20de3832-b290-4bfa-9952-fa820ab2a981	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from PPAHire Admin.	/inbox?with=24561236-b941-4ff8-ad41-b9b71adcafdd	t	2025-09-23 10:54:35.35	MESSAGE	{"lastMessage": "mayonaises"}
512c3816-af13-4f1b-9cd4-4b74d5042dd5	24561236-b941-4ff8-ad41-b9b71adcafdd	You have a new message from Matthew Tedunjaiye	/inbox?with=5900ca1a-625c-4a14-8331-ee286900ad73	t	2025-09-23 10:57:51.631	MESSAGE	{"lastMessage": "good"}
57865583-49b0-4261-99e0-179cc8079e3e	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from PPALink Support	/inbox?with=24561236-b941-4ff8-ad41-b9b71adcafdd	t	2025-09-23 10:58:27.647	MESSAGE	{"lastMessage": "boat and slide"}
0c58053c-5408-46ad-824d-5007881aa6b6	5900ca1a-625c-4a14-8331-ee286900ad73	You have a new message from PPALink Support	/inbox?with=24561236-b941-4ff8-ad41-b9b71adcafdd	f	2025-09-24 23:35:50.47	MESSAGE	{"lastMessage": "my boyyyy how far naaa"}
\.


--
-- Data for Name: Offer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Offer" (id, "applicationId", salary, "startDate", status) FROM stdin;
\.


--
-- Data for Name: PositionSkill; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PositionSkill" ("positionId", "skillId") FROM stdin;
d45805c9-c04f-4f5a-8beb-5cc970888e66	1
d45805c9-c04f-4f5a-8beb-5cc970888e66	11
d45805c9-c04f-4f5a-8beb-5cc970888e66	12
d45805c9-c04f-4f5a-8beb-5cc970888e66	13
d45805c9-c04f-4f5a-8beb-5cc970888e66	14
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Setting" (key, value, description, "updatedAt") FROM stdin;
maintenanceMode	false	If true, the entire public-facing site will be disabled.	2025-09-24 12:32:25.624
freeJobPostLimit	2	The number of open jobs an agency on the 'Free' plan can have.	2025-09-24 12:32:25.624
freeMemberLimit	1	The number of team members an agency on the 'Free' plan can have.	2025-09-24 12:32:25.624
\.


--
-- Data for Name: Shortlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Shortlist" (id, "agencyId", "candidateId", source, "createdAt") FROM stdin;
\.


--
-- Data for Name: Verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Verification" (id, "userId", type, status, evidence, "reviewedBy", "createdAt") FROM stdin;
1	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/your-user-id/nysc_document/some-uuid.pdf", "fileName": "nysc_letter.pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-08 00:38:03.711
3921e9dd-2ff7-47fc-8972-c4ea9b346c5b	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/20a32e77-e540-48dd-a25a-9b93bd4c1c65.pdf", "fileName": "callup_Letter.pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-08 10:35:12.54
86e8467e-1390-45bc-8108-ee3e52ea33c8	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/42ac05c0-1804-4c90-b935-eed1c1d46715.pdf", "fileName": "._NECO RESULT_..pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-14 23:19:00.723
ec572c2f-0068-4e96-9fee-38a053b439ea	c1cfe44e-a176-474b-bf35-48398dca09c9	CAC	APPROVED	{"fileKey": "users/c1cfe44e-a176-474b-bf35-48398dca09c9/nysc_document/defccb12-76ff-41ca-a82e-c01d80656b88.pdf", "fileName": "Akinbo_Talking_Drum_Tone_2019.pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-19 15:05:12.961
8451b215-d6f6-4a72-b128-6a1fb98c13fc	5900ca1a-625c-4a14-8331-ee286900ad73	NYSC	APPROVED	{"fileKey": "users/5900ca1a-625c-4a14-8331-ee286900ad73/nysc_document/e643da35-89d4-467d-9dd8-06e9da640f5a.pdf", "fileName": "472_Bio 101.pdf"}	fcd910ed-f411-4524-bdb1-23de83a9e4d1	2025-09-20 11:17:43.163
ddab4c76-595b-4b5f-a2a5-9f9da12ad723	097944c2-3582-4220-ade4-4a93ab404375	CAC	APPROVED	{"fileKey": "users/097944c2-3582-4220-ade4-4a93ab404375/nysc_document/7a20a9e5-02ed-40ad-8e42-b4aa4209cbeb.pdf", "fileName": "._NECO RESULT_..pdf"}	24561236-b941-4ff8-ad41-b9b71adcafdd	2025-09-21 10:27:27.113
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
9c0fa8c5-af98-457a-aca0-c476273bf278	331e78f64c992b3b14d4b60125224482b81b2aec1dc4a8255b26ee7b71a7abbf	2025-09-17 22:05:01.842772+01	20250917210501_add_position_skill_relation	\N	\N	2025-09-17 22:05:01.185381+01	1
99ba647d-617f-4601-8a6e-a2f66ebc63f7	5e708114a88a357dfe4ee0305e4a7223eb1819f6ed371f53e07dcf5e671c9334	2025-09-15 13:25:18.992777+01	20250915122518_add_stripe_price_id	\N	\N	2025-09-15 13:25:18.77795+01	1
01f4af0f-9f05-4a30-bd05-658e2a0a871c	a961073d121965acf821aa267ad75733a39b65717d483020253e184aae700d95	2025-09-15 15:33:46.366222+01	20250915143345_remove_subscription_startdate	\N	\N	2025-09-15 15:33:45.396888+01	1
1894caea-6c6b-4ab4-b29e-5f69e457cd2c	f45aa01b07c0e68b5c206291ce43e315d221d9d44d3cf6c816f280e25d19c320	2025-09-15 15:56:33.285113+01	20250915145633_make_stripe_current_period_end_optional	\N	\N	2025-09-15 15:56:33.265716+01	1
5b8ab782-bad6-40b7-8809-d92824625da9	935e9a7fe8265d030052f2a069736447b2a25a6fb906a7f92d8dea8e7294a545	2025-09-19 11:28:06.339208+01	20250919102806_add_agency_domain	\N	\N	2025-09-19 11:28:06.165868+01	1
076b0caf-d177-4b1a-a03d-769ada6c23ca	5693d3f1cfcc4bdd478e3a7ea7832b4eab8e25b2904eda82207dda36f9073ca0	2025-09-16 09:25:37.333526+01	20250916082536_add_industry_model	\N	\N	2025-09-16 09:25:36.180633+01	1
fe0e18a6-b60d-429d-8108-205dd5e4b5fe	cb036e00f9d1e40f25bc40230ed0530c64131239064fe5554084ad9aaf5fce95	2025-09-16 10:08:07.735832+01	20250916090803_add_agency_industry_relation	\N	\N	2025-09-16 10:08:04.015574+01	1
9a3caf39-3bbd-4f02-9e21-041730f51234	b49412a6666b71239ccbe667c542543cf1898e7e9c9ddda872a2920524bc0574	2025-09-22 23:52:22.056322+01	20250922225221_add_admin_foundations	\N	\N	2025-09-22 23:52:21.502026+01	1
fff853ed-427c-4f0e-832e-6b475275b3af	e92d6ca6716ee629cde30fe3430667a2a590ae40933658f2518b830840ecf29e	2025-09-23 08:18:18.19526+01	20250923071817_add_activity_log	\N	\N	2025-09-23 08:18:17.778416+01	1
2086a0c4-8395-4a16-88b8-a1f1cff7f91e	6ef785de2b78692fddd3349c39cb1a3c881ba5a39c3fbe862c14528a2b05350e	2025-09-24 14:30:31.885497+01	20250924133031_add_hired_status	\N	\N	2025-09-24 14:30:31.758966+01	1
9ea05aef-a1f1-4efe-b87d-283f467c2105	1f4a40e80aaa3e3715d61b720bd7cd0b32dee96d0d1fcb5b0b2891c443a329ae	2025-09-25 00:45:28.911514+01	20250924234528_add_super_admin_role	\N	\N	2025-09-25 00:45:28.852749+01	1
\.


--
-- Name: Industry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Industry_id_seq"', 636, true);


--
-- Name: LocationLGA_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LocationLGA_id_seq"', 2322, true);


--
-- Name: LocationState_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LocationState_id_seq"', 111, true);


--
-- Name: Skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Skill_id_seq"', 17, true);


--
-- PostgreSQL database dump complete
--

