--
-- PostgreSQL database dump
--

\restrict Jw0SGdlTPDZkCAGdqbZ01RgGq9RhDOPueJKDhhQQwKZoDnqWbpgqAEmWg8MZ2uN

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.document_chunks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    token_count integer,
    embedding_status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_chunks OWNER TO jeddgwapz;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    product_id uuid,
    document_type text NOT NULL,
    title text NOT NULL,
    source_url text,
    storage_key text,
    mime_type text,
    status text DEFAULT 'pending'::text NOT NULL,
    source_hash text,
    raw_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO jeddgwapz;

--
-- Name: ingestion_runs; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.ingestion_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    source_type text NOT NULL,
    source_label text,
    status text DEFAULT 'pending'::text NOT NULL,
    records_seen integer DEFAULT 0 NOT NULL,
    records_written integer DEFAULT 0 NOT NULL,
    error_message text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone
);


ALTER TABLE public.ingestion_runs OWNER TO jeddgwapz;

--
-- Name: knowledge_qa_items; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.knowledge_qa_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_file text NOT NULL,
    category_slug text NOT NULL,
    category_name text NOT NULL,
    source_sheet text NOT NULL,
    source_row_number integer NOT NULL,
    item_code text,
    item_number integer,
    question text NOT NULL,
    answer text NOT NULL,
    multimedia_asset text,
    content_type text,
    file_name text,
    product_slug text,
    raw_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.knowledge_qa_items OWNER TO jeddgwapz;

--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    asset_slug text NOT NULL,
    asset_type text NOT NULL,
    title text NOT NULL,
    description text,
    storage_provider text NOT NULL,
    storage_key text,
    public_url text,
    thumbnail_url text,
    mime_type text,
    duration_seconds numeric(10,2),
    source_label text,
    raw_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media_assets OWNER TO jeddgwapz;

--
-- Name: price_list_items; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.price_list_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_file text NOT NULL,
    sheet_name text NOT NULL,
    source_row_number integer NOT NULL,
    row_label text,
    size_label text,
    model_name text NOT NULL,
    property_text text,
    prompter_monitor text,
    portable_hardcase text,
    protect_cover text,
    software_bundle text,
    camera_plate text,
    global_online_price_usd numeric(12,2),
    abroad_dealer_price_usd numeric(12,2),
    product_slug text,
    raw_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.price_list_items OWNER TO jeddgwapz;

--
-- Name: product_aliases; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.product_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    alias text NOT NULL,
    alias_type text DEFAULT 'search'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_aliases OWNER TO jeddgwapz;

--
-- Name: product_families; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.product_families (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_families OWNER TO jeddgwapz;

--
-- Name: product_faqs; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.product_faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    faq_key text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    keywords text[] DEFAULT ARRAY[]::text[] NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_faqs OWNER TO jeddgwapz;

--
-- Name: product_media_links; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.product_media_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    media_asset_id uuid NOT NULL,
    usage_type text DEFAULT 'gallery'::text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_media_links OWNER TO jeddgwapz;

--
-- Name: product_specs; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.product_specs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    spec_group text,
    spec_label text NOT NULL,
    spec_value text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_specs OWNER TO jeddgwapz;

--
-- Name: products; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    family_id uuid,
    slug text NOT NULL,
    name text NOT NULL,
    tagline text,
    summary text,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    screen_size_inches numeric(6,2),
    resolution text,
    aspect_ratio text,
    brightness_cd_m2 numeric(10,2),
    weight_kg numeric(10,2),
    inputs text[],
    hero_image_url text,
    thumbnail_url text,
    buy_now_notes text,
    raw_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO jeddgwapz;

--
-- Name: support_channels; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.support_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    channel_type text NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    region_code text,
    is_sales boolean DEFAULT false NOT NULL,
    is_support boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.support_channels OWNER TO jeddgwapz;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: jeddgwapz
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenants OWNER TO jeddgwapz;

--
-- Data for Name: document_chunks; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.document_chunks (id, document_id, chunk_index, content, token_count, embedding_status, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.documents (id, tenant_id, product_id, document_type, title, source_url, storage_key, mime_type, status, source_hash, raw_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ingestion_runs; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.ingestion_runs (id, tenant_id, source_type, source_label, status, records_seen, records_written, error_message, started_at, finished_at) FROM stdin;
\.


--
-- Data for Name: knowledge_qa_items; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.knowledge_qa_items (id, source_file, category_slug, category_name, source_sheet, source_row_number, item_code, item_number, question, answer, multimedia_asset, content_type, file_name, product_slug, raw_metadata, created_at, updated_at) FROM stdin;
81db1494-5f3f-40b3-ba5d-927cddc6f0fc	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	2	1	1	What is Crystal Prompter?	Crystal Prompter is a leading South Korean teleprompter manufacturer established in 2017. We handle everything in-house — from design and manufacturing to sales and after-sales support. Our mission is to make professional teleprompting simple, affordable, and accessible for everyone.	Company introduction video showing headquarters and products	Video	crystal_prompter_intro.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d7468358-a087-41c8-9eee-344d7938eab0	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	3	2	2	When was Crystal Prompter established?	Crystal Prompter Co., Ltd. was established in 2017. Since then, the company has grown into a comprehensive teleprompter manufacturer serving broadcasters, government agencies, universities, and content creators worldwide.	Company founding timeline graphic	Infographic	founding_timeline.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
71e59a53-aa57-4eb5-b548-bf4f259d73af	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	4	3	3	What types of products does Crystal Prompter manufacture?	Crystal Prompter specializes in broadcast equipment, specifically teleprompters and electric pedestals. Its focus is delivering high-quality prompter solutions through ongoing technical expertise and innovation.	Company introduction video overview	Video	crystal_prompter_intro.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8226d6b4-5a90-4223-8629-42b5b446338f	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	5	4	4	What is Crystal Prompter's company mission?	Crystal Prompter emphasizes high-quality prompter products and services with a strong focus on customer satisfaction. The company highlights continuous research and development to improve usability and performance.	Mission statement slide	Slide	mission_statement.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9ca95fcb-e140-4ae5-9f25-fcb816a47412	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	6	5	5	Where is Crystal Prompter headquartered?	Crystal Prompter is headquartered in South Korea. The company operates its design, manufacturing, and customer support operations from this base, serving clients domestically and internationally.	Company location map and building photo	Map	headquarters_map.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
dc353e72-9ca2-4410-a11b-22c1f2760e8f	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	7	6	6	Does Crystal Prompter manufacture its products in-house?	Yes. Crystal Prompter handles everything in-house — from product design and manufacturing to sales and after-sales support. This vertical integration ensures quality control at every stage of production.	Factory and production line photos	Photo	manufacturing_facility.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
5b4c2f66-6371-4389-ac08-edb0d55115be	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	8	7	7	Who are Crystal Prompter's primary customers?	Crystal Prompter serves a wide range of industries including broadcasting, government agencies, education, corporate communications, military, and content creation. Its products are used by institutions like Korea Broadcasting System, Seoul National University, and POSCO.	Industry use case collage	Infographic	industries_served.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
421c098d-5ec5-47dd-b7f2-1a161f0bf658	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	9	8	8	What sets Crystal Prompter apart from other teleprompter brands?	Crystal Prompter stands out through its in-house manufacturing, ultra-low iron special reflective glass technology, tool-free modular assembly, and a comprehensive product range covering everything from compact tablet prompters to 55-inch broadcast systems.	Feature comparison chart	Table	competitive_comparison.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
da2dc6e7-4410-4c9c-b540-1590fe5af187	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	10	9	9	Does Crystal Prompter offer international shipping?	Yes. Crystal Prompter serves international customers with a global price list in USD. The 2026 price table includes both global online prices and abroad dealer prices, indicating an established international distribution network.	Global shipping and dealer map	Map	global_presence_map.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
717a993c-3b7a-4877-9d42-8f7f51cac2de	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	11	10	10	Does Crystal Prompter have a dedicated R&D department?	Crystal Prompter focuses on continuous research and development to improve usability and performance. The company designs products with user-friendly features like tool-free assembly, modular construction, and remote script control systems.	R&D process infographic	Infographic	rd_process.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b7d798cb-b5ef-47fc-acaa-5c88be1e5430	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	12	11	11	How many teleprompter models does Crystal Prompter offer?	Crystal Prompter offers multiple product lines including Cue Series, Framer Series, Mime Series, Ultra Series, LessonQ Series, Speech Series (Adamas and Rotunda), Clone, Folder, Ollesson, Tab, Flex, and Electric Pedestals — over 25 distinct models.	Full product lineup overview	Slide	product_lineup_overview.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1fe830fb-3f85-4441-a258-07eb44eb1771	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	13	12	12	What type of glass is used in Crystal Prompter teleprompters?	Crystal Prompter uses ultra-low iron special reflective glass with a special anti-reflective coating. This minimizes camera iris and color adjustments while displaying the clearest possible text and images for the presenter.	Reflective glass technology close-up	Photo	reflective_glass_closeup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a7c3fa49-3da4-45ee-a77e-7e03ca5decd1	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	14	13	13	What materials are Crystal Prompter products made from?	Crystal Prompter products are constructed from structurally strong aluminum with a special anti-reflective matte surface treatment. The aluminum construction reduces overall weight while maximizing stability and durability.	Material composition diagram	Infographic	materials_diagram.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f8b31074-69ce-46c4-9b88-66215ed7e73c	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	15	14	14	Does Crystal Prompter include software with its teleprompters?	Yes. All Crystal Prompter teleprompters come with proprietary teleprompter software (SW) that allows remote control of script font size and speed. The software is included with every purchase at no additional cost.	Software interface screenshot	Photo	prompter_sw_interface.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c433edf1-8046-42ef-998b-ba1ea1ac1e5e	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	16	15	15	Which notable organizations use Crystal Prompter products?	Crystal Prompter is used by Korea Broadcasting System, Daesung Group, Seoul National University, Yonsei University, POSCO, Busan Metropolitan Office of Education, National Tax Service, Gyeonggi Provincial Government, National Fire Agency, and many more.	Client logos and testimonials	Slide	notable_clients.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
eee23133-b502-401a-b326-5ebb3393ba88	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	17	16	16	Are Crystal Prompter teleprompters suitable for beginners?	Absolutely not. Crystal Prompter products are designed to be easy to assemble even for the general public or non-experts. The tool-free modular design, remote script control, and included software make professional teleprompting accessible to everyone.	Easy setup demonstration video	Video	beginner_setup_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
94fb1bd7-e356-426e-a3cd-b65ef03b074c	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	18	17	17	What quality control standards does Crystal Prompter follow?	Crystal Prompter emphasizes high-quality products and services with a strong focus on customer satisfaction. By handling everything in-house from design to after-sales support, the company maintains strict quality control throughout the entire product lifecycle.	Quality assurance process	Infographic	quality_philosophy.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ab64063d-04e1-4c6b-a493-83f020658e62	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	19	18	18	How can I contact Crystal Prompter for technical support?	Crystal Prompter provides comprehensive support through sales@crystalprompter.com, phone support at (+82) 32-576-0277, and its website contact form. The company handles after-sales support directly as part of its in-house operations.	Customer support channels overview	Card	support_channels.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6da0c75d-eff6-4c13-a002-9adb03d27dad	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	20	19	19	What is the smallest and largest teleprompter model available?	Crystal Prompter products range from 12-inch compact tablet prompters (Tab 12) all the way up to 55-inch professional broadcast systems (Ultra 55). This comprehensive range ensures there is a perfect solution for every production need.	Size comparison visual	Infographic	size_range_comparison.png	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
35731199-6ce5-4669-bfaf-8742457dc0ab	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	21	20	20	Are Crystal Prompter products suitable for broadcast television?	Yes. Crystal Prompter products are widely used in professional broadcasting environments. The Cue, Ultra, and Speech series models feature high brightness displays up to 1500 cd/m² and are used by Korea Broadcasting System and other major broadcasters.	Broadcasting studio setup photo	Photo	broadcast_studio_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0771e35c-0880-47c7-9ccd-d0a5719efb22	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	22	21	21	What is Crystal Prompter's phone number?	You can reach Crystal Prompter by phone at (+82) 32-576-0277. This number connects you directly to the company's headquarters in South Korea for sales inquiries and support.	Contact information card	Card	contact_card.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ee8c3d09-28ae-45fa-a75c-53f8a189c6a3	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	23	22	22	What is Crystal Prompter's email address?	Crystal Prompter's email address is sales@crystalprompter.com. You can use this for product inquiries, pricing requests, dealer information, and after-sales support.	Contact information card	Card	contact_card.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
44646074-a172-4e57-812a-c65471d5d0ed	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	24	23	23	What is Crystal Prompter's website URL?	The official Crystal Prompter website is www.crystalprompter.com. You can browse all products, view specifications, read about the company, and access the contact form for inquiries.	Website homepage screenshot	Photo	website_screenshot.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3bd2d72b-f90c-42fb-97cf-5b191641b9c6	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	25	24	24	Are there authorized Crystal Prompter dealers in my region?	The 2026 price list includes separate abroad dealer pricing for all products, indicating an established international dealer network. Contact sales@crystalprompter.com for dealer information in your region.	Dealer network map	Map	dealer_network_map.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
37e783ef-5b48-4ce1-a6de-f69b115260f4	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	26	25	25	Does Crystal Prompter hold any industry certifications or awards?	⚠️ MISSING: Specific awards and certifications not found in available materials. Please contact Crystal Prompter directly for the latest information on industry certifications and awards.	Awards and certifications display	Slide	awards_certifications.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
5b0665aa-f27d-488f-82d7-774c02c110c2	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	27	26	26	How has Crystal Prompter evolved since its founding in 2017?	Crystal Prompter was established in 2017 and has been operating in the teleprompter industry for over 8 years. During this time, the company has built a comprehensive product lineup serving broadcasting, government, education, and corporate sectors.	Company history timeline	Infographic	company_timeline.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
5035995e-74ae-4eee-8fa1-b5c018f55965	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	28	27	27	Does Crystal Prompter offer custom-built teleprompter solutions?	⚠️ MISSING: Custom solution details not explicitly documented in available materials. Contact sales@crystalprompter.com for information about custom configurations and special requirements.	Custom solution examples	Slide	custom_solutions.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0be59d84-0786-4e9f-9c59-08ee929820f9	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	29	28	28	What proprietary technology does Crystal Prompter use?	Crystal Prompter's technology features include ultra-low iron special reflective glass, one-button screen flip function, wireless remote script control, built-in reverse board for PowerPoint and Hangul presentations, and high-brightness panels up to 1500 cd/m².	Technology features comparison	Infographic	technology_features.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
125687f1-8a18-4edc-91bd-f66bed9fc976	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	30	29	29	Can I visit Crystal Prompter's showroom or factory?	⚠️ MISSING: Showroom or factory visit details not documented. Contact Crystal Prompter at (+82) 32-576-0277 or sales@crystalprompter.com to arrange a facility visit or product demonstration.	Facility tour photos	Photo	facility_tour.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
29a9a492-f6e4-4486-8a6a-16165cd200b0	Crystal_Prompter_QA_V3_Professional.xlsx	1-about-crystal-prompter	1. About Crystal Prompter	Master Q&A Database	31	30	30	What are Crystal Prompter's plans for future product development?	Crystal Prompter's vision centers on continuous innovation in teleprompter technology, expanding global reach, and making professional teleprompting accessible to all users — from solo content creators to large broadcasting networks.	Company vision statement	Slide	company_vision.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8aa72b21-1a73-42f1-a42c-628d18a10535	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	32	31	31	What is the full Crystal Prompter product lineup?	The lineup includes Tab 12, Flex 15, Clone 16, Ollesson 18, Folder 22N, Cue 24/27/32, Framer 24/27/32, Mime 24/27/32, Ultra 43/55, LessonQ 24/27/32/43, Speech series (Rotunda 15, Adamas 19/22/24), Electric Pedestals (EP 30K/40K/50K/60K/80K), and ENG camera plates.	2026 Global price list table	Table	price_table_2026.xlsx	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
21f8949e-4424-4a37-8775-f4b780a684f6	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	33	32	32	Which Crystal Prompter model is compatible with tablets and iPads?	Tab 12 is the compact teleprompter designed for iPad or tablet use. It features an ultra-simple, foldable design that is easy to use on location. Priced at $900 global online.	Tab 12 product showcase	Video	tab_12_showcase.mp4	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
307b1bc2-9a19-458f-ad76-e1083f8a2afe	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	34	33	33	Which model is designed for use with a laptop as the script source?	Flex 15 is the portable teleprompter designed for laptops up to 15.6 inches. It is foldable and easy to set up for field or studio use. Priced at $1,000 global online.	Flex 15 product video	Video	flex_15_showcase.mp4	flex15	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
04dbcd09-9d35-4892-b403-420756cb3d9d	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	35	34	34	What are the key features of the Clone 16?	The Clone 16 is a 15.6-inch Full HD portable teleprompter optimized for broadcasting environments. It features HDMI input/output and is used by news broadcasters, government agencies, universities, and corporate broadcasting centers. Priced at $2,000.	Clone 16 product overview	Video	clone_16_overview.mp4	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
75840741-45c3-4be1-8873-c282f62fd927	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	36	35	35	What is the Ollesson 18 and what is it designed for?	The Ollesson 18 is a 17-inch Full HD teleprompter with 400 cd/m² brightness and HDMI connectivity. It weighs 7.96 kg, making it portable for various filming environments. Priced at $2,100 global online.	Ollesson 18 product showcase	Video	ollesson_18_showcase.mp4	olleson18	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
787d8443-e40e-486b-b96b-b4af0f756da3	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	37	36	36	What are the key features of the Folder 22N?	The Folder 22N features a 21.5-inch Full HD display with 1000 cd/m² brightness and a foldable design. It weighs 8 kg and supports HDMI in/out. Ideal for online lectures and broadcasting. Priced at $2,750.	Folder 22N product demo	Video	folder_22n_demo.mp4	folder22n	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e7045e1f-c380-48f8-a28b-0f9874dcf2a0	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	38	37	37	What is the Cue Series and what models are available?	The Cue Series includes three models: Cue 24 (23.8-inch), Cue 27 (27-inch), and Cue 32 (32-inch). All feature Full HD resolution, 1000 cd/m² brightness, and HDMI connectivity. They include a monitor, portable hardcase, and protect cover. Prices range from $1,500 to $2,200.	Cue Series comparison chart	Table	cue_series_comparison.xlsx	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c5cab730-5a50-4c64-916b-4640b46ce4fc	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	39	38	38	What screen sizes are available in the Cue Series?	The Cue Series comes in three sizes: Cue 24 at 23.8 inches, Cue 27 at 27 inches, and Cue 32 at 32 inches. All three share the same 1000 cd/m² brightness and Full HD resolution but offer different viewing areas for various studio sizes.	Cue Series size comparison	Infographic	cue_size_comparison.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
66156752-b287-4135-bf70-12817fb6cb8b	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	40	39	39	What is included in the Framer Series package?	The Framer Series includes Framer 24, Framer 27, and Framer 32. These are professional teleprompters with Full HD resolution and HDMI in/out. They come with portable hardcase and protect cover. Prices range from $1,200 to $1,550.	Framer Series overview	Slide	framer_series_overview.png	framer24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
54b919e4-ba57-4112-a40a-be8c01287c54	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	41	40	40	What is the difference between the Cue Series and the Framer Series?	Both series offer 24, 27, and 32-inch models with Full HD resolution. The key difference is the Cue Series features 1000 cd/m² brightness and includes a prompter monitor, while the Framer Series is more budget-friendly. Cue prices: $1,500-$2,200. Framer prices: $1,200-$1,550.	Cue vs Framer comparison	Table	cue_vs_framer.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1fba0e59-4f93-4fbb-99a8-ceb391fe8a1d	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	42	41	41	What is the Mime Series and why is it considered budget-friendly?	The Mime Series includes Mime 24, Mime 27, and Mime 32 — all featuring a 17-inch Full HD display with 400 cd/m² brightness at 7.96 kg. These are the most affordable professional prompters, priced from $280 to $420. They use a head plate (HP) mount system.	Mime Series overview	Slide	mime_series_overview.png	mime24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fe06fc6a-8788-4f88-86ef-2a5232b9df11	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	43	42	42	Which Crystal Prompter model has the lowest price point?	The Mime Series offers the most affordable options: Mime 24 at $280, Mime 27 at $325, and Mime 32 at $420 global online price. These are professional 17-inch Full HD teleprompters with 400 cd/m² brightness.	Budget-friendly models comparison	Table	affordable_models.xlsx	mime24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ef8dfd78-1d10-4d30-9b6d-a3d7e684c066	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	44	43	43	Which model is recommended for high-brightness studio environments?	The Ultra Series represents Crystal Prompter's premium broadcast-grade line. Ultra 43 features a 42.5-inch display with 1500 cd/m² ultra-high brightness at $6,500. Ultra 55 offers a massive display with 1000 cd/m² brightness at $10,500. Both include a prompter monitor and protect cover.	Ultra Series showcase	Video	ultra_series_showcase.mp4	ultra43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6f473ea1-6a43-4dcb-ae31-d8f377f60c07	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	75	74	74	What type of power adapter is required for Crystal Prompter products?	Most models use 12V adapters: Cue 24/Clone 16/Mime at 12V/5A, Cue 27/32 at 12V/10A, Framer at 12V/2A, LessonQ 43 at 12V/3.3A. LessonQ 24/27/32 use 19V/1.3-1.35A adapters. Ultra 43 uses AC 220V 60Hz.	Power supply specifications	Table	power_supply_specs.xlsx	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0952346a-489a-4307-bad3-3080a6e0d691	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	45	44	44	Which teleprompter model is designed for educational use?	The LessonQ Series is specifically designed for online lectures. It comes in four sizes: LessonQ 24 ($2,800), LessonQ 27 ($3,400), LessonQ 32 ($4,000), and LessonQ 43 ($4,950). All include a prompter monitor, portable hardcase, and protect cover.	LessonQ Series overview	Video	lessonq_series_overview.mp4	lessonq24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
497c7117-791e-41ad-940c-3ab507501c3d	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	46	45	45	Which model is best suited for VIP speeches and live events?	The Speech Series includes Rotunda 15 ($3,800), Adamas 19 ($5,000), Adamas 22 ($5,600), and Adamas 24 ($6,200). These are VIP speech teleprompters designed for legislative sessions, executive speeches, and broadcast presentations. All include a prompter monitor and portable hardcase.	Speech Series lineup	Slide	speech_series_lineup.png	adamas19	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
299376cb-058e-4cea-b1c2-bd5e9acacee5	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	47	46	46	What is the Rotunda 15 and what are its primary use cases?	The Rotunda 15 is a 15.6-inch professional speech teleprompter with 500 cd/m² brightness and 1280 x 1024 resolution. It weighs only 4.98 kg, making it the most portable speech prompter. Designed for legislative sessions and VIP speeches. Priced at $3,800.	Rotunda 15 product demo	Video	rotunda_15_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
7f599e26-020e-42b0-868a-d0eced5dd04f	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	48	47	47	What are the differences between the Adamas 19, Adamas 22, and Adamas 24?	The Adamas Series includes three sizes: Adamas 19 (19-inch, 1000 cd/m², $5,000), Adamas 22 (21.5-inch, 100 cd/m², $5,600), and Adamas 24 (24-inch, 1000 cd/m², $6,200). All feature Full HD resolution and are used by organizations like POSCO and government agencies.	Adamas Series comparison	Table	adamas_comparison.xlsx	adamas19	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1f6630f5-78c7-4c06-83f2-db37c207c108	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	49	48	48	Does Crystal Prompter offer electric height-adjustable pedestals?	Crystal Prompter offers five electric pedestal models: EP 30K ($750), EP 40K ($1,150, portable with hardcase), EP 50K ($1,600), EP 60K ($1,950), and EP 80K ($2,150). These provide motorized height adjustment for teleprompter systems.	Electric Pedestal lineup	Slide	ep_lineup.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
446af6c8-fd68-46d2-a043-bade0ff6e42c	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	50	49	49	What is the highest-priced product in the Crystal Prompter catalog?	The Ultra 55 is the most expensive model at $10,500 global online price ($8,800 dealer price). It features a massive display with 1000 cd/m² brightness, Full HD resolution, and is designed for the largest broadcasting environments.	Ultra 55 premium showcase	Video	ultra_55_showcase.mp4	ultra55	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
03e9841c-2951-4e29-a918-3d8ba9bf9810	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	51	50	50	Which model is the most portable for on-location use?	The Tab 12 is the most compact Crystal Prompter, designed as a 12-inch tablet/iPad teleprompter. It features a foldable design for maximum portability and is priced at $900 global online.	Tab 12 portability showcase	Video	tab_12_portable.mp4	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
14fc0ee3-c347-4d9b-953d-5397c866b9de	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	52	51	51	Which model is best for independent content creators on a budget?	For a small YouTube studio, the Framer 24 ($1,200) or Mime 24 ($280) are excellent choices. The Framer 24 offers Full HD display with portable hardcase, while the Mime 24 provides a budget-friendly 17-inch option with 400 cd/m² brightness.	YouTube studio setup guide	Video	youtube_studio_guide.mp4	mime24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b4d074e7-da03-417e-8d78-41a18cb572da	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	53	52	52	Which model is recommended for a professional broadcast studio setup?	For large broadcasting studios, the Ultra 43 ($6,500) with its 42.5-inch display and 1500 cd/m² brightness, or the Cue 32 ($2,200) with 1000 cd/m² brightness are recommended. Both feature Full HD resolution and HDMI connectivity.	Broadcast studio configuration	Photo	broadcast_studio_config.jpg	cue32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d7bb5417-f7dc-45f7-b48e-288daef30a7f	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	54	53	53	Which model is suitable for schools and classrooms with limited budgets?	The LessonQ Series is specifically designed for education. LessonQ 24 ($2,800) to LessonQ 43 ($4,950) provide online lecture-optimized teleprompters. For tighter budgets, the Cue 24 ($1,500) or Framer 24 ($1,200) are strong alternatives.	Education sector solutions	Slide	education_solutions.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b349a049-9a60-4071-bff3-565f0dd39d8f	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	55	54	54	Which model is recommended for executive presentations and keynotes?	The Speech Series is purpose-built for government and VIP use. The Adamas 24 ($6,200) with 1000 cd/m² brightness is the premium choice. The Rotunda 15 ($3,800) offers portability at 4.98 kg for traveling officials. Both are used by government agencies nationwide.	Government speech setup	Photo	government_speech_setup.jpg	adamas24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9985b8c4-6c51-4e54-b613-1c2dddbc0706	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	56	55	55	Does Crystal Prompter offer accessories for ENG broadcast cameras?	Crystal Prompter offers two ENG camera plates: ForENG_70 and ForENG_120, both priced at $600 global online ($480 dealer). These plates are designed specifically for ENG (Electronic News Gathering) cameras used in field broadcasting.	ENG plate product photos	Photo	eng_plates.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
15de82b9-0746-494c-b6a6-0daca451833f	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	57	56	56	Are there bundle or package deals available for multi-unit orders?	⚠️ MISSING: Specific bundle deal details not documented in available materials. The price list shows individual product pricing. Contact sales@crystalprompter.com for information about package deals and bundle discounts.	Bundle package options	Card	bundle_deals.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
03258901-a510-4026-9440-6e135c7c7017	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	58	57	57	What components are included in a standard Cue Series package?	The Cue Series includes: the teleprompter unit with prompter monitor, portable hardcase for transport, protect cover, teleprompter software (SW), and a head plate (HP) camera mount. Everything needed for professional operation is included.	Cue Series package contents	Photo	cue_package_contents.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
262fbbd5-f7ec-4c87-857a-309e247d9055	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	59	58	58	How should I choose between the 24-inch, 27-inch, and 32-inch display sizes?	Choose based on your studio size and viewing distance. The 24-inch models suit small to medium studios and close-range reading. The 27-inch models work well for medium studios and lecture halls. The 32-inch models are ideal for large venues where scripts need to be read from greater distances.	Size selection guide	Infographic	size_selection_guide.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fa6d6a0a-8aad-415a-baff-bc31a43263b3	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	60	59	59	Are there any upcoming new product releases?	⚠️ MISSING: Future product roadmap not available in current materials. Contact Crystal Prompter at sales@crystalprompter.com for the latest information on upcoming products and models.	Product roadmap	Slide	product_roadmap.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
be6ce9a8-285d-4c60-b4e3-38f281ad1479	Crystal_Prompter_QA_V3_Professional.xlsx	2-product-discovery	2. Product Discovery	Master Q&A Database	61	60	60	What is the difference between the Tab 12 and the Flex 15?	Tab 12 ($900) is a 12-inch compact teleprompter for iPads and tablets with QR-style quick release mount. Flex 15 ($1,000) is a 15.6-inch model designed for laptops up to 15.6 inches. Both are portable and foldable, but Flex 15 offers a larger screen for laptop users.	Tab vs Flex comparison	Table	tab_vs_flex_comparison.xlsx	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1a10f934-e8fc-4f49-b5a3-faa41852141d	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	62	61	61	What is the display size of the Cue 24?	The Cue 24 has a 23.8-inch display with 1920 x 1080 Full HD resolution in a 16:9 widescreen format.	Cue 24 specification sheet	PDF	cue_24_spec.pdf	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b432bc43-32b3-4493-bc29-3b0f36f1eb37	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	63	62	62	What is the screen resolution of the Cue 24?	Yes. The Cue 24 supports 1920 x 1080 Full HD resolution in 16:9 aspect ratio, providing sharp and clear text display for professional broadcasting and presentations.	Cue 24 specification sheet	PDF	cue_24_spec.pdf	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0fd8072d-6b4d-431a-9c83-8854bc672e8e	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	64	63	63	What is the brightness rating of the Cue 24 display?	The Cue 24 has a brightness of 1000 cd/m², making it suitable for bright studio environments, conference rooms, and broadcasting setups.	Cue 24 specification sheet	PDF	cue_24_spec.pdf	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
71c89c34-3cb3-44ca-80db-aa5db5f44fbe	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	65	64	64	What are the full technical specifications of the Cue 27?	Cue 27 specs: 27-inch display, 1920 x 1080 FHD resolution, 1000 cd/m² brightness, HDMI in/out, 12V/10A power adapter, 14.04 kg weight, built-in power and FHD panel.	Cue 27 specification sheet	PDF	cue_27_spec.pdf	cue27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
be399469-22d2-4e8e-b567-f82dda4b1245	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	66	65	65	What are the full technical specifications of the Cue 32?	Cue 32 specs: 32-inch display, 1920 x 1080 FHD resolution, 1000 cd/m² brightness, HDMI in/out, 12V/10A power adapter, 17.89 kg weight, built-in power and FHD panel.	Cue 32 specification sheet	PDF	cue_32_spec.pdf	cue32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3217716a-ca09-4451-941f-aa7712e85061	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	67	66	66	What input/output ports are available on the Cue 24?	The Cue 24 supports HDMI, DVI, and DisplayPort (DP) input signals, providing the most versatile connectivity options in the Cue Series. The Cue 27 and Cue 32 support HDMI in/out.	Cue 24 connectivity diagram	Infographic	cue_24_connectivity.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
eef1c573-e071-43e2-b5a8-a6b0c5abd654	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	68	67	67	What is the total weight of the Cue 24?	The Cue 24 weighs 11.31 kg. It uses a 12V/5A power adapter for stable operation. One person can carry it, especially with the included portable hardcase.	Cue 24 weight and dimensions	Card	cue_24_dimensions.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3b6c81f8-21dc-44e3-9f9b-b6bde11d37f4	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	69	68	68	What is the total weight of the Ultra 43?	The Ultra 43 uses AC 220V 60Hz power and features a 42.5-inch display with 1500 cd/m² brightness. ⚠️ MISSING: Exact weight not specified in available FAQ documents.	Ultra 43 specification sheet	PDF	ultra_43_spec.pdf	ultra43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
323bab53-7703-49f2-aa16-33a212b60eb6	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	70	69	69	What is the brightness rating of the Ultra 43?	The Ultra 43 features the highest brightness in the lineup at 1500 cd/m². This is 50% brighter than the Cue Series (1000 cd/m²) and makes it ideal for the most demanding studio lighting conditions.	Ultra 43 brightness comparison	Infographic	brightness_comparison.png	ultra43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
39109e93-8894-4b0f-b9d2-b5ec2c992185	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	71	70	70	What are the technical specifications of the Clone 16?	Clone 16 specs: 15.6-inch display, 1920 x 1080 FHD resolution, 16:9 aspect ratio, HDMI in/out, 400 cd/m² brightness, built-in power supply. Designed for portable broadcasting use.	Clone 16 specification sheet	PDF	clone_16_spec.pdf	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b6862adb-b37d-4019-ae48-0ef20e0a30c1	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	72	71	71	What are the full specifications of the Folder 22N?	Folder 22N specs: 21.5-inch display, 1920 x 1080 FHD resolution, 1000 cd/m² brightness, HDMI in/out, 12V/5A power adapter, 8 kg weight, foldable design, 16:9 widescreen format.	Folder 22N specification sheet	PDF	folder_22n_spec.pdf	folder22n	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9619348a-d602-48e2-a377-53e99f316fe3	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	73	72	72	Do all Crystal Prompter models support Full HD (1920×1080) resolution?	Most Crystal Prompter models use 1920 x 1080 Full HD resolution in 16:9 format. The exception is the Rotunda 15, which uses 1280 x 1024 resolution. All models deliver sharp, clear text for professional use.	Resolution comparison chart	Table	resolution_comparison.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4693a5b2-2b57-427a-9ce9-83e8f516f49f	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	74	73	73	Which Crystal Prompter model has the highest brightness rating?	Brightness ranges: Ultra 43 at 1500 cd/m² (highest), Cue/Folder/Adamas 19/24 at 1000 cd/m², Rotunda 15 at 500 cd/m², Clone 16/Ollesson/Mime at 400 cd/m², LessonQ 24/27/32 at 250 cd/m², LessonQ 43 at 300 cd/m², Adamas 22 at 100 cd/m².	Brightness comparison chart	Infographic	brightness_levels.png	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
18eb674a-0e00-4dda-8e4e-2f64ca924982	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	76	75	75	What makes Crystal Prompter's beam-splitting glass different from standard glass?	Crystal Prompter uses ultra-low iron special reflective glass with a specially coated surface. This minimizes camera iris and color adjustments while displaying the clearest possible text and images for the presenter.	Reflective glass technology detail	Photo	glass_technology.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
44ed0b9a-8856-4ec6-b85e-38201dedcee1	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	77	76	76	What are the technical specifications of the LessonQ 24?	LessonQ 24 specs: 24-inch display, 1920 x 1080 FHD resolution, 250 cd/m² brightness, HDMI in/out, 19V/1.3A power adapter, 51.07 kg weight, 16:9 format. Designed for online lecture environments.	LessonQ 24 specification sheet	PDF	lessonq_24_spec.pdf	lessonq24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
2e743b61-00f5-4590-bb36-b9b28788f249	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	78	77	77	What are the technical specifications of the LessonQ 27?	LessonQ 27 specs: 27-inch FHD display, 250 cd/m² brightness, HDMI in/out, 19V/1.3A power adapter, 2.5mm aluminum body, electric pedestal included, 16:9 format.	LessonQ 27 specification sheet	PDF	lessonq_27_spec.pdf	lessonq27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
bfd34037-3ae2-4af1-a862-e1c0c8648fb5	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	79	78	78	What are the technical specifications of the LessonQ 32?	LessonQ 32 specs: 32-inch display, 1920 x 1080 FHD resolution, 250 cd/m² brightness, HDMI in/out, 19V/1.35A power adapter, 16:9 widescreen format, built-in power system.	LessonQ 32 specification sheet	PDF	lessonq_32_spec.pdf	lessonq32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
81ef8b50-4f95-4bbc-9925-8dabc80c27b2	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	80	79	79	What are the technical specifications of the LessonQ 43?	LessonQ 43 specs: 43-inch display, 1920 x 1080 FHD resolution, 300 cd/m² brightness, HDMI in/out, 12V/3.3A power adapter, 65 kg weight, 16:9 format. The largest LessonQ model.	LessonQ 43 specification sheet	PDF	lessonq_43_spec.pdf	lessonq43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
eba3c081-38e8-40f2-9a94-3a169338bbf4	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	81	80	80	What is the brightness rating of the Adamas 19?	Adamas 19 specs: 19-inch display, 1920 x 1080 FHD resolution, 1000 cd/m² high brightness, HDMI in/out, 12V/5A power adapter, 16:9 format. Designed for VIP speeches and broadcasting.	Adamas 19 specification sheet	PDF	adamas_19_spec.pdf	adamas19	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
63a26896-45a1-420a-b694-c33bafa3f7aa	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	82	81	81	What are the full specifications of the Adamas 22?	Adamas 22 specs: 21.5-inch display, 1920 x 1080 FHD resolution, 100 cd/m² brightness, HDMI in/out, 12V/5A power adapter, 16:9 widescreen format. Suitable for indoor presentation environments.	Adamas 22 specification sheet	PDF	adamas_22_spec.pdf	adamas22	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
92bc5c8b-5049-4469-a57e-c77ac413f360	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	83	82	82	What are the full specifications of the Adamas 24?	Adamas 24 specs: 24-inch display, 1920 x 1080 FHD resolution, 1000 cd/m² high brightness, HDMI in/out, 12V/5A power adapter, 16:9 format. The largest model in the Adamas speech series.	Adamas 24 specification sheet	PDF	adamas_24_spec.pdf	adamas24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
bef23619-c8a1-4c2f-ba92-a1bda17a6c63	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	84	83	83	What are the dimensions and weight of the Rotunda 15?	Rotunda 15 specs: 15.6-inch display, 1280 x 1024 resolution, 500 cd/m² brightness, HDMI in/out, 12V/5A power adapter, 4.98 kg weight. The most portable speech teleprompter in the lineup.	Rotunda 15 specification sheet	PDF	rotunda_15_spec.pdf	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
421753b9-52af-441a-bf83-7e6040d36641	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	85	84	84	What is the weight of the Framer 24?	Framer 24 specs: Full HD 1920 x 1080 resolution, 16:9 format, HDMI in/out, 12V/2A power adapter, 9.08 kg weight. A budget-friendly professional teleprompter.	Framer 24 specification sheet	PDF	framer_24_spec.pdf	framer24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
10df59bf-52bd-4fe0-8d93-7a170567d76d	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	86	85	85	What is the weight of the Framer 27?	Framer 27 specs: Full HD 1920 x 1080 resolution, 16:9 format, HDMI in/out, 12V/2A power adapter, 10.43 kg weight. The mid-size option in the Framer Series.	Framer 27 specification sheet	PDF	framer_27_spec.pdf	framer27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c4913fd8-fec2-4e6f-a840-e8681297c4ce	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	87	86	86	What are the full specifications of the Framer 32?	Framer 32 specs: Full HD 1920 x 1080 resolution, 16:9 format, HDMI in/out, 12V/2A power adapter, 11.99 kg weight. The largest Framer Series model.	Framer 32 specification sheet	PDF	framer_32_spec.pdf	framer32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e70766e0-b7d7-4992-959e-4c0a811d247b	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	88	87	87	What type of display does the Mime 24 use?	Mime 24 specs: 17-inch display, 1920 x 1080 FHD resolution, 400 cd/m² brightness, HDMI in/out, 12V/5A power adapter, 7.96 kg weight, 16:9 format. The most affordable professional model.	Mime 24 specification sheet	PDF	mime_24_spec.pdf	mime24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
560437ce-9e2f-44e5-8e55-21707362f8fa	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	89	88	88	What are the specifications of the Ollesson 18?	Ollesson 18 specs: 17-inch display, 1920 x 1080 FHD resolution, 400 cd/m² brightness, HDMI in/out, 12V/5A power adapter, 7.96 kg weight, 16:9 format. Similar display to the Mime but comes with a 500 cd/m² prompter monitor included.	Ollesson 18 specification sheet	PDF	ollesson_18_spec.pdf	olleson18	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
69020006-0785-472f-8de1-8d29837edd40	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	90	89	89	What is the weight comparison across all Cue models?	Cue 24 weighs 11.31 kg, Cue 27 weighs 14.04 kg, and Cue 32 weighs 17.89 kg. Weight increases proportionally with display size, reflecting the larger panels and frames in bigger models.	Cue Series weight comparison	Table	cue_weights.xlsx	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
905d5581-a648-42e7-8969-733949493c0b	Crystal_Prompter_QA_V3_Professional.xlsx	3-technical-specifications	3. Technical Specifications	Master Q&A Database	91	90	90	Which Crystal Prompter model is the lightest for portable use?	The Rotunda 15 is the lightest at just 4.98 kg, followed by the Mime series and Ollesson 18 at 7.96 kg each. The Folder 22N at 8 kg and Framer 24 at 9.08 kg are also relatively lightweight options.	Weight comparison across all models	Infographic	weight_comparison.png	folder22n	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d4aacfa8-a355-4d33-9537-5c496a5d1d3a	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	92	91	91	Is the Tab 12 compatible with iPads and other tablets?	Yes. Tab 12 is designed as a teleprompter for any iPad or tablet, with a compact and portable setup for on-location use. It uses a QR (Quick Release) mount system.	Tab 12 device compatibility guide	Infographic	tab_12_compatibility.png	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e5f4ab33-23c4-4ad0-baef-28b99ed31c00	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	93	92	92	Can the Flex 15 be used with a laptop as the script source?	Yes. Flex 15 is compatible with laptops up to 15.6 inches. It features a foldable design and QR mount system, making it easy to set up with standard laptop screens.	Flex 15 laptop compatibility guide	Infographic	flex_15_compatibility.png	flex15	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fa0fa5f0-4575-4a0c-8efb-194e12300fdd	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	94	93	93	What video input connections does the Cue 24 support?	The Cue 24 supports three input types: HDMI, DVI, and DisplayPort (DP). This makes it the most versatile Cue Series model for connectivity.	Cue 24 connectivity diagram	Infographic	cue_24_inputs.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
21aa5648-7cf9-4d9b-ab45-b14620516133	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	95	94	94	Does the Cue 27 support connections other than HDMI?	Yes, both the Cue 27 and Cue 32 support HDMI input and output. This allows direct connection to computers, cameras, and broadcasting systems.	Cue 27/32 connectivity guide	Infographic	cue_27_32_inputs.png	cue27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
51c6cb76-b36d-4a46-9321-05fe0c387e72	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	96	95	95	What camera mounting system do Crystal Prompter products use?	Crystal Prompter uses two mount systems: QR (Quick Release) for compact models like Tab 12, Flex 15, and Clone 16; and HP (Head Plate) for professional models like Cue, Framer, Mime, Ultra, LessonQ, and Speech series.	Mount system comparison	Infographic	mount_systems.png	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4302238a-331b-4697-a335-8972bf99de5b	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	97	96	96	Can I mount a DSLR camera on a Crystal Prompter teleprompter?	Yes. Crystal Prompter models with HP (Head Plate) mount systems support DSLR cameras. The camera is mounted on a plate connected to the prompter frame. ENG camera plates (ForENG_70/120) are also available for professional cameras.	DSLR camera mounting guide	Video	dslr_mount_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c3259c15-e5c5-45cb-bc01-866078327110	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	98	97	97	What is the difference between the QR mount and the HP mount?	QR (Quick Release) provides fast attach/detach for portable models, used on Tab 12, Flex 15, and Clone 16. HP (Head Plate) provides a stable, professional mounting platform for larger models and is standard on Cue, Framer, Mime, Ultra, LessonQ, and Speech series.	QR vs HP mount comparison	Infographic	qr_vs_hp_mounts.png	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
101eaf0c-0f4f-45ca-ba2c-c0795b241932	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	99	98	98	Will the teleprompter work with any device that has an HDMI output?	Yes. Nearly all Crystal Prompter models feature HDMI input and output, allowing connection to laptops, desktop computers, cameras, and any HDMI-compatible device.	HDMI compatibility overview	Infographic	hdmi_compatibility.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c13bf7ee-72e3-44b7-bada-4443b371792a	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	100	99	99	Can I display PowerPoint presentations on the teleprompter?	Yes. Crystal Prompter models feature a built-in reverse board that allows operation of PowerPoint and Hangul presentation programs. The teleprompter software also supports script display while PowerPoint runs simultaneously.	PowerPoint integration demo	Video	powerpoint_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c7894750-0a29-4d1d-ad47-5d12666b6f91	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	101	100	100	What prompting software is included with Crystal Prompter products?	All Crystal Prompter models include proprietary teleprompter software (SW) at no additional cost. The software allows remote wireless control of script font size and speed, with play/stop functionality.	Software interface walkthrough	Video	software_walkthrough.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
07d66614-4f16-432f-bae7-e921f62c3cc8	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	102	101	101	Is there a wireless remote control for adjusting scroll speed?	Yes. Crystal Prompter includes a remote system that allows even non-experts to wirelessly adjust font size and speed of scripts. Play/stop and speed control can be managed without touching the teleprompter.	Wireless remote control demo	Video	wireless_control_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d220fc0f-353e-463c-83e5-a917699e335d	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	103	102	102	Are the ForENG camera plates compatible with standard broadcast cameras?	Yes. Crystal Prompter offers ForENG_70 and ForENG_120 plates designed specifically for ENG (Electronic News Gathering) cameras. Both are priced at $600 and provide professional-grade camera mounting for field broadcasting.	ENG plate compatibility chart	Table	eng_plate_compatibility.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
48e06829-fc02-480a-8ef2-883ef8affca4	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	104	103	103	Can I use a smartphone to control the teleprompter script?	Crystal Prompter models connect via HDMI, so you can use a phone with an HDMI adapter to display scripts. The included teleprompter software can also run on various devices that output HDMI.	Phone connectivity guide	Infographic	phone_connectivity.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ba62298e-6fd7-489d-accc-57dfd733f759	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	105	104	104	Is the teleprompter compatible with DisplayPort sources via adapter?	The Cue 24 supports DisplayPort (DP) input natively. For other models that use HDMI, a simple DisplayPort to HDMI adapter will work perfectly. These are widely available and inexpensive.	DisplayPort connectivity guide	Infographic	displayport_guide.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
59d31391-9dfb-4758-a998-e92f96cfa476	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	106	105	105	Does every Crystal Prompter model include a camera mounting plate?	Yes. Tab 12, Flex 15, and Clone 16 come with a QR (Quick Release) camera plate. All other professional models (Cue, Framer, Mime, Ultra, LessonQ) come with an HP (Head Plate) camera mount system.	Camera plate guide	Infographic	camera_plate_guide.png	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ce7689fe-36f8-48b9-bb91-fcd964e60aea	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	107	106	106	Can I connect a DVI source to a Crystal Prompter teleprompter?	Yes, the Cue 24 model specifically supports DVI input along with HDMI and DisplayPort. For other models that only have HDMI, a DVI to HDMI adapter can be used.	DVI connectivity diagram	Infographic	dvi_connectivity.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
7984cf57-ca87-4015-99c1-4f8aad29b2aa	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	108	107	107	Is the included prompting software compatible with Windows?	⚠️ MISSING: Specific OS compatibility details (Windows/Mac/Linux) not documented in available materials. Contact sales@crystalprompter.com for software system requirements.	Software system requirements	Card	software_requirements.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b8b0e895-0899-4296-a8f8-fad5c0c629af	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	109	108	108	Is there a Mac-compatible version of the prompting software?	⚠️ MISSING: Mac compatibility details not specifically documented. Contact sales@crystalprompter.com for software platform support information.	Software Mac compatibility	Card	software_mac.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6692e700-f5a0-4d5b-b7b6-fc8ba005be2f	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	110	109	109	Can I use third-party prompting apps such as PromptSmart?	Since Crystal Prompter models accept standard HDMI input, they can display output from any teleprompter app or software that outputs via HDMI. The built-in reverse board handles the text mirroring automatically.	Third-party app compatibility	Infographic	third_party_apps.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b6a55695-fd74-430a-abe1-52b09ce7f0c5	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	111	110	110	Do any Crystal Prompter models support 4K resolution input?	Current Crystal Prompter models support Full HD 1920 x 1080 resolution. 4K is not listed in current specifications but Full HD provides sharp, clear text visibility for professional use.	Resolution support overview	Card	resolution_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4aca515e-4755-4242-81e3-c6f2b590b1f8	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	112	111	111	What adapter is needed for USB-C laptops without HDMI?	You'll need a USB-C to HDMI adapter. These are standard and widely available. Just plug the adapter into your MacBook's USB-C port and connect an HDMI cable from it to the teleprompter.	USB-C adapter guide	Infographic	usbc_adapter_guide.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0341e715-4875-45d6-aec4-88c3a310722c	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	113	112	112	Can Crystal Prompter teleprompters be mounted on standard photo tripods?	The Cue Series and other HP-mount models use a head plate system designed to interface with professional tripod heads. The camera mounting plate connects to standard tripod heads for stable studio operation.	Tripod compatibility guide	Video	tripod_compatibility.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b13d23bc-d4cf-4607-85d6-58053232f777	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	114	113	113	Is the teleprompter compatible with Sony mirrorless cameras?	Yes. The HP (Head Plate) camera mount system accommodates mirrorless cameras of any brand. The mounting plate provides a stable platform, and the camera can be positioned directly behind the teleprompter glass for optimal eye contact.	Mirrorless camera setup guide	Video	mirrorless_setup.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b5103d02-7194-4497-9b82-d544013f6dcc	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	115	114	114	What additional adapters may be needed for my setup?	Depending on your devices, you may need: USB-C to HDMI adapter, DisplayPort to HDMI adapter (if not using Cue 24), DVI to HDMI adapter, or phone HDMI adapter. Crystal Prompter natively supports HDMI on all models.	Adapter requirements guide	Infographic	adapter_guide.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3c6b44e7-4287-49dd-b5d7-c0f123a31931	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	116	115	115	Can the LessonQ connect to existing classroom AV systems?	Yes. The LessonQ Series supports HDMI in/out, allowing it to integrate with classroom AV systems, projectors, and recording equipment. The HDMI output can pass the signal to additional displays or recording devices.	LessonQ classroom integration	Infographic	lessonq_classroom.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
dc8fbb17-9814-4c4d-890e-6198464e7150	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	117	116	116	Is the teleprompter compatible with live streaming setups?	Yes. Crystal Prompter works with any live streaming setup that uses HDMI connectivity. The camera sees through the prompter glass while you read the script, maintaining eye contact with your viewers during live broadcasts.	Live streaming integration guide	Infographic	livestream_setup.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ecf3cbe3-e589-4bbd-b448-de731aaf594a	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	118	117	117	Can two teleprompters be connected to a single video source?	Models with HDMI in/out can pass the signal through to another display. For more complex multi-prompter setups, an HDMI splitter is recommended to send the same script to both units simultaneously.	Multi-prompter setup diagram	Infographic	multi_prompter_setup.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
cb4b8d3d-ff29-40e2-a289-e3f2c474a387	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	119	118	118	Are the Electric Pedestals compatible with all Crystal Prompter models?	⚠️ MISSING: Specific EP-to-prompter compatibility matrix not detailed in available materials. The LessonQ 27 FAQ mentions an electric pedestal for convenient adjustment. Contact sales@crystalprompter.com for compatibility details.	EP compatibility matrix	Table	ep_compatibility.xlsx	lessonq27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f163aa41-da2f-4e0e-b605-941b97fc5929	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	120	119	119	Does the HDMI output allow recording of the script feed?	Yes. Most professional Crystal Prompter models feature HDMI output that passes the signal through to recording equipment, additional monitors, or streaming devices. Great for production workflows.	Video output guide	Infographic	video_output_guide.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
5879989c-69d0-4eed-84c3-d61f31fddfb0	Crystal_Prompter_QA_V3_Professional.xlsx	4-compatibility	4. Compatibility	Master Q&A Database	121	120	120	Is the teleprompter compatible with cinema cameras such as ARRI or RED?	Yes. Crystal Prompter supports professional cameras through HP (Head Plate) mounts and ENG camera plates (ForENG_70/120). These provide stable mounting for cinema cameras and professional broadcast cameras.	Cinema camera mounting guide	Video	cinema_camera_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3c2a6630-14a9-4ea4-8d5b-ffd9dfffd649	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	122	121	121	How long does it take to assemble a Crystal Prompter teleprompter?	Crystal Prompter features a modular, tool-free assembly with a simplified three-section design that allows setup or disassembly in minutes. Even non-experts can assemble the system quickly.	Assembly speed demonstration	Video	quick_assembly_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c5ba0379-4fc0-48f2-87b3-5a3491aebb4b	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	182	181	181	What is the price of the Tab 12?	Tab 12 is priced at $900 USD global online price, with $750 USD abroad dealer price. Prices are in USD and tax is not included.	2026 Global price list	Table	price_table_2026.xlsx	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ce0794fc-d3ef-4b49-921d-449a43179229	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	123	122	122	What are the main components included in the assembly?	Crystal Prompter teleprompters consist of three core modules: the Hood (glass), the Monitor, and the Frame. This modular layout is designed for quick, tool-free assembly and easy transport.	Modular design diagram	Infographic	three_modules.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d0398fbb-cdef-410c-a1ca-9c2e8b0764fc	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	124	123	123	What is included in the Tab 12 package?	Tab 12 components include: angle bar, base plate, glass hood, lens cover, plate, and teleprompter software. These parts make up the compact teleprompter frame for iPad and tablet use.	Tab 12 unboxing contents	Photo	tab_12_unboxing.jpg	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
19bb3f77-bcc2-4ec0-8986-893dbb87d689	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	125	124	124	What is included in the Cue Series package?	Cue Series packages include: teleprompter unit with prompter monitor, portable hardcase, protect cover, head plate (HP) camera mount, and teleprompter software (SW). Everything needed for professional operation.	Cue Series package contents	Photo	cue_unboxing.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
77b0af21-3e6b-41c1-b98a-38bf6151c5e1	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	126	125	125	Are any tools required for assembly?	No special tools are required. Crystal Prompter products feature tool-free modular assembly. The components snap together with simple connections that even non-experts can complete in minutes.	Tool-free assembly demonstration	Video	tool_free_assembly.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1c213613-987f-446a-82d0-6a2d245ac2f1	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	127	126	126	How do I mount my camera onto the teleprompter?	Mount the camera on the included plate — either QR (Quick Release) for compact models or HP (Head Plate) for professional models. The plate connects to the prompter frame, positioning the camera directly behind the reflective glass.	Camera mounting step-by-step	Video	camera_mounting_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
26124501-a872-42ca-9487-e42ce50ad003	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	128	127	127	How do I properly position the beam-splitting glass?	The reflective glass sits in the Hood module. Position it at approximately 45 degrees to reflect the monitor text toward you while allowing the camera to see through. Crystal Prompter's ultra-low iron glass ensures minimal color distortion.	Glass installation guide	Video	glass_setup_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0e7b29dc-5422-407e-9b7c-ddf1f6eb7194	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	129	128	128	What is the correct glass angle for optimal readability?	The teleprompter glass should be positioned at approximately 45 degrees. This reflects the monitor text toward you while letting the camera lens see through the glass without obstruction.	Glass angle adjustment guide	Infographic	glass_angle.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
26c7154b-3ccd-4c3d-a1c4-e97e3e209eba	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	130	129	129	How do I connect the teleprompter to my computer or video source?	Connect your computer to the teleprompter using an HDMI cable plugged into the HDMI input port. Launch the included teleprompter software on your computer, and the script will display on the teleprompter's monitor.	HDMI connection guide	Video	hdmi_connection_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
158ac0cd-c440-42c4-a06c-4e2787a8c552	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	131	130	130	How do I install the included prompting software?	The teleprompter software (SW) is included with every Crystal Prompter purchase. Follow the installation instructions provided with your unit. The software enables script display with adjustable font size and speed control.	Software installation walkthrough	Video	software_install_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b0c7b25b-bf97-4102-b6fd-2aa1000d2355	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	132	131	131	How do I pair and use the wireless remote control?	The wireless remote allows you to control play/stop and speed of the scrolling script without touching the teleprompter. Simply pair the remote and use it to adjust font size and scrolling speed during operation.	Remote control tutorial	Video	remote_control_tutorial.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f738f9ba-bd23-4292-896a-0a5c05e879c9	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	133	132	132	What does the screen flip function do and when should I use it?	The one-button screen flip function quickly flips the text orientation on screen. This is essential because the reflective glass mirrors the text, so the monitor needs to display a reversed image for you to read normally.	Screen flip demonstration	Video	screen_flip_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8365b14a-bff4-4f2e-b744-6fc3f8e8ef42	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	134	133	133	How do I mount the teleprompter on a tripod?	Mount the HP (Head Plate) onto your tripod head. Attach the teleprompter frame to the plate. Position the setup so the camera lens aligns with the center of the reflective glass. Adjust height so you can read comfortably at eye level.	Tripod positioning guide	Video	tripod_positioning.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
04d90e02-65a0-411c-9f22-a2caf0f33db6	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	135	134	134	What are the most common setup mistakes to avoid?	Common mistakes to avoid: placing the glass at the wrong angle, not centering the camera behind the glass, having the monitor too dim for the lighting, forgetting to install the lens cover, and not securing all modular connections properly.	Common setup mistakes guide	Infographic	setup_mistakes.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0b5e1bd9-3a03-4ab9-9f60-99575972f25a	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	136	135	135	How do I adjust the font size of the displayed script?	Use the included teleprompter software or wireless remote to adjust font size. The remote allows you to wirelessly increase or decrease font size and scrolling speed for comfortable reading during presentations.	Text size adjustment tutorial	Video	text_size_tutorial.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a2845c7f-2acf-4b7f-8745-ef3958ba3ccb	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	137	136	136	How do I control the scrolling speed during a recording?	Scrolling speed can be adjusted using the wireless remote control or through the software interface. Start with a comfortable pace and adjust during rehearsal until the speed matches your natural speaking rhythm.	Speed control tutorial	Video	speed_control_tutorial.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
59e58e0b-439a-418c-b18e-5789c3a008fb	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	183	182	182	What is the price of the Flex 15?	Flex 15 is priced at $1,000 USD global online price, with $830 USD abroad dealer price. Tax is not included.	2026 Global price list	Table	price_table_2026.xlsx	flex15	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
cf865012-382e-4348-ac9b-85b6eb732163	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	138	137	137	What is the recommended procedure for disassembly after use?	Reverse the three-module process: remove the Hood (glass), separate the Monitor, and fold the Frame. Store everything in the included portable hardcase. The tool-free design makes teardown as quick as setup.	Disassembly and packing guide	Video	disassembly_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e5eb89dc-fd70-48f0-be0a-2ebfaff8f68b	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	139	138	138	Does the teleprompter come with a carrying case?	The portable hardcase (included with Cue, Framer, LessonQ, and Speech series) holds all teleprompter components securely. Place each module in its designated compartment for safe transport.	Hardcase packing tutorial	Video	hardcase_tutorial.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
21d98c78-43af-4ca4-964f-3bf2745f4db3	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	140	139	139	How do I set up the Electric Pedestal?	Position the electric pedestal on a stable surface. Mount the teleprompter assembly on top. Use the electric controls to adjust height to the desired position. The EP 40K model includes a portable hardcase for field use.	Electric Pedestal setup guide	Video	ep_setup_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d0b11f4d-8097-4002-a5e1-39c049415d33	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	141	140	140	What is the recommended setup procedure for the LessonQ in a lecture hall?	Place the LessonQ in front of the lecture camera. Connect via HDMI to your computer running the teleprompter software. The LessonQ 27 includes an electric pedestal for easy height adjustment. Position so the instructor can read while looking at the camera.	LessonQ classroom setup	Video	lessonq_classroom_setup.mp4	lessonq27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f1c2986d-e360-4d23-8330-aa1f65a9f088	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	142	141	141	What are the step-by-step setup instructions for the Clone 16?	Mount the Clone 16 on its QR (Quick Release) plate, connect HDMI from your source device, power on with the built-in power supply, and launch the teleprompter software. The portable design allows quick setup in any broadcasting environment.	Clone 16 assembly guide	Video	clone_16_setup.mp4	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
841ca994-2979-4b7a-b0f2-c6a43b64d974	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	143	142	142	How do I adjust display brightness for high-light studio environments?	Adjust the monitor brightness to match your environment. In bright studios, use maximum brightness. In dimmer settings, reduce brightness to avoid glare. Models with 1000+ cd/m² brightness give you the most flexibility.	Brightness calibration guide	Infographic	brightness_calibration.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a87961e6-8099-4cc8-bb99-b7df96a0f092	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	144	143	143	How long should I expect the first-time setup to take as a new user?	First-time setup typically takes 10-15 minutes as you learn the three-module system. After the initial setup, experienced users can assemble the teleprompter in under 5 minutes thanks to the tool-free modular design.	First-time setup timeline	Infographic	first_setup_timeline.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ce696a90-d0ba-4475-a000-00d8f735184d	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	145	144	144	Is there a pre-recording checklist I should follow?	Before recording, check: glass angle at 45 degrees, camera centered behind glass, HDMI connection secure, script loaded, font size readable from your position, scrolling speed tested, lens cover installed, and brightness adjusted.	Pre-recording checklist	Infographic	pre_recording_checklist.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
74fb7440-4fcc-4a13-9c24-30070516b41d	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	146	145	145	How do I set up a dual-teleprompter configuration for podium speeches?	For presidential-style speeches, use two Speech Series units with an HDMI splitter. Position one on each side of the podium for natural left-right reading. Both units will display the same scrolling script.	Dual prompter configuration	Infographic	dual_prompter_setup.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0d51c084-423d-4943-b023-bf804ecc8fd1	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	147	146	146	Can the teleprompter be used for outdoor filming?	Yes, but choose a model with high brightness (1000+ cd/m²) for outdoor visibility. The Cue Series, Adamas 19/24, and Ultra 43 are best suited. Protect the glass from direct sunlight and use shade when possible.	Outdoor setup considerations	Infographic	outdoor_setup.png	ultra43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ba0cb650-598e-4c9e-a90c-d4db8aebb86e	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	148	147	147	How do I install the lens hood or light shield?	The lens cover attaches to the hood module around the camera lens opening. It prevents stray light from interfering with the camera image and helps maintain clean footage. Ensure it is securely fitted before recording.	Lens cover installation	Photo	lens_cover_install.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a1b37de6-f010-4807-8eea-a8a35529e3f6	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	149	148	148	How do I connect the HDMI output to an external recording device?	Connect an HDMI cable from the teleprompter's HDMI output port to your recording device, capture card, or additional monitor. This pass-through feature lets you record or display the script feed on external equipment.	HDMI output connection guide	Infographic	hdmi_output_guide.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
cef87434-6739-457e-903d-001c804896e3	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	150	149	149	What are the setup recommendations for the Adamas at a podium?	Position the Adamas beside or in front of the podium at eye level. Mount on a tripod or stand using the HP mount. Connect to your script source via HDMI. The 1000 cd/m² brightness on the Adamas 19 and 24 ensures readability under stage lighting.	Adamas podium setup guide	Video	adamas_podium_setup.mp4	adamas19	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6aebb683-124a-4a74-bc8e-b9dd497dd4a0	Crystal_Prompter_QA_V3_Professional.xlsx	5-setup-assembly	5. Setup & Assembly	Master Q&A Database	151	150	150	What is the recommended cleaning and maintenance procedure?	Clean the reflective glass gently with a microfiber cloth. Avoid harsh chemicals. Store in the provided hardcase when not in use. Keep HDMI connections clean. Check all connections before each use. The aluminum frame requires no special maintenance.	Maintenance tips guide	Infographic	maintenance_guide.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
66e4e438-e9b9-4635-ab93-d674f0703161	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	152	151	151	What types of clients typically purchase the Cue 24?	Cue 24 is commonly used by broadcasting institutions, government agencies, corporations, and universities. Specific users include Korea Broadcasting System, Daesung Group, Seoul National University, and Yonsei University.	Cue 24 user case studies	Slide	cue_24_users.png	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
65cbe163-1a63-49ee-a10c-817b29ee96fb	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	153	152	152	Which major organizations and institutions use Crystal Prompter products?	Crystal Prompter is used by Korea Broadcasting System, Daesung Group, Seoul National University, Yonsei University, military and government officials, Korean Housing Developers Association, POSCO, National Tax Service, and more.	Cue 27 installation photos	Photo	cue_27_installations.jpg	cue27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
696f0e17-e141-48c5-8fcc-6a8b4af77fbd	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	154	153	153	Which Crystal Prompter models are used by government agencies?	Government agencies commonly use the Cue 32, Speech Series, and LessonQ models. Notable government users include National Tax Service, Gyeonggi Provincial Government, National Fire Agency, Haman County Office, and military organizations.	Cue 32 institutional setups	Photo	cue_32_setups.jpg	cue32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
96dae2c6-0982-4bc9-a8c7-e8c99ce97f05	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	155	154	154	How do independent content creators and YouTubers use the teleprompter?	Load your script into the software, mount your camera behind the glass, and start recording. You'll read your script while looking directly at the camera lens, creating natural eye contact with viewers. The Mime Series ($280-$420) and Framer Series ($1,200-$1,550) are popular creator picks.	YouTube creator setup guide	Video	youtube_creator_guide.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
42440b87-a1a2-41ed-905d-49bab623bc9f	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	156	155	155	How are Crystal Prompter products used in broadcast television studios?	Broadcasting studios use Crystal Prompter for news reading, interview productions, and live broadcasts. The Cue Series (1000 cd/m²), Ultra Series (up to 1500 cd/m²), and Clone 16 are popular choices. Korea Broadcasting System is among the notable users.	Broadcasting studio showcase	Video	broadcast_studio_showcase.mp4	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c58620ef-2c1f-44f7-9883-e42102640bf7	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	157	156	156	What are the common use cases for teleprompters in government offices?	Government agencies use Crystal Prompters to clearly present complex information through internal broadcasting systems. Notable users include National Tax Service, Gyeonggi Provincial Government, National Fire Agency, Haman County Office, and military organizations.	Government use case overview	Slide	government_use_cases.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
516d2925-4ecb-4da4-9826-7bcbb8bad5d7	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	158	157	157	Can the teleprompter be used for delivering university lectures?	Absolutely. Universities use Crystal Prompters for online lectures and campus broadcasting. The LessonQ Series is specifically designed for this. Seoul National University and Yonsei University are among the institutional users.	University lecture setup	Video	university_setup.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0448f09e-fced-45d5-8dac-a639e29ed9e7	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	159	158	158	How is the teleprompter used for corporate training video production?	Yes. Companies use Crystal Prompter for internal training videos, executive speeches, corporate announcements, and PR materials. The teleprompter ensures consistent, professional delivery of training content across the organization.	Corporate training production	Video	corporate_training.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
853d9f18-08c2-49c0-810f-463cba312c15	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	160	159	159	How does a news anchor benefit from using a Crystal Prompter teleprompter?	Crystal Prompter allows news anchors to read scripts naturally while looking directly at the camera. The high-brightness models ensure text visibility under studio lighting, while HDMI connectivity integrates seamlessly with broadcast workflows.	News anchor demonstration	Video	news_anchor_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
271c9aa7-1fe3-4c6d-a61c-25f96ee6f6e6	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	161	160	160	Is the teleprompter suitable for producing professional online courses?	Yes. The LessonQ Series is specifically designed for online course production. It allows instructors to read detailed course material while maintaining natural camera eye contact, greatly improving course quality and professionalism.	Online course production setup	Video	online_course_setup.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
bfe35a44-8c53-450d-b89d-27174db05da5	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	162	161	161	Do financial institutions use Crystal Prompter products for internal communications?	Yes. Banks use teleprompters in in-house broadcasting systems to deliver information to customers and improve internal communication. The LessonQ 27 documentation specifically lists banks and financial institutions as common users.	Banking sector use case	Slide	banking_use_case.png	lessonq27	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fed8c514-7ade-4775-982f-00905d2bee59	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	163	162	162	Can the teleprompter be used at live events and conferences?	Yes. The Speech Series (Rotunda 15 and Adamas) is designed for live event speeches. These portable, high-brightness units can be set up at podiums, stages, and conference venues for professional speech delivery.	Live event setup showcase	Photo	live_event_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
69ff8fc9-3ea3-4ce1-908a-98e771f2f4be	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	164	163	163	Are Crystal Prompter products used by military organizations?	Yes. Military organizations use Crystal Prompters for official communications, briefings, and internal broadcasting. Multiple product FAQs list military and government officials as key users of Cue, LessonQ, and Speech series models.	Military communication setup	Photo	military_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1e0878de-fe65-49cb-99d5-e27c565cac3e	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	165	164	164	Is the teleprompter suitable for video podcast production?	Definitely. Crystal Prompter can enhance video podcasts by helping you maintain eye contact with the camera while reading discussion points, questions, or ad reads. The Mime Series ($280-$420) is an affordable option.	Podcast studio setup with prompter	Photo	podcast_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e368bb23-e5e0-4227-8aa4-03c09a6c2e2e	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	166	165	165	Can a teleprompter improve on-camera presentation for non-professionals?	Yes. Crystal Prompter helps non-professional presenters deliver speeches naturally. The remote control and easy-to-read display reduce anxiety and improve delivery confidence. Many users report immediately looking more polished on camera.	First-time user experience	Video	first_time_user.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4cd9b515-a33d-48ad-96b1-30fd57762a0b	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	167	166	166	Do cable and regional television stations use Crystal Prompter equipment?	Yes. Cable TV broadcasting is specifically listed as a common use case for Crystal Prompter products. The teleprompters help production staff reduce filming time and improve on-camera presentation quality.	Cable TV production setup	Photo	cable_tv_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
5a8a1012-21fc-4673-afcd-c99eff387c1b	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	168	167	167	Is the teleprompter suitable for filming official statements and press releases?	The Cue Series or Framer Series are great for PR teams. Crystal Prompter ensures consistent, polished messaging for PR videos, corporate announcements, crisis communications, and stakeholder updates.	PR video production guide	Video	pr_video_production.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e9907509-b753-4280-ab36-a608137268e9	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	169	168	168	Can the teleprompter be used for religious sermons and presentations?	Yes. Crystal Prompter can help religious leaders deliver sermons while maintaining eye contact with the congregation. The Speech Series is particularly suitable for podium-based speaking. ⚠️ MISSING: Specific religious use case documentation.	House of worship setup	Photo	worship_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
719d95b6-fdb0-481e-b0f3-4fe150bb2beb	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	170	169	169	How does a teleprompter help with tutorial and instructional video production?	Absolutely. A teleprompter lets you read detailed tutorial scripts while looking directly at the camera, which is especially valuable for technical content requiring precise language. The Framer and Mime series offer budget-friendly options.	Tutorial production setup	Video	tutorial_production.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
df3ca778-b4ca-4a7f-84d1-b73cd55a637d	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	171	170	170	Are Crystal Prompter products used in real estate marketing?	Yes. Korean Housing Developers Association and Hengsin Real Estate Club are listed as actual Crystal Prompter users. Real estate professionals use teleprompters for property presentations, virtual tours, and marketing videos.	Real estate video setup	Photo	real_estate_video.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0a9badba-9a34-497a-998f-3c7c6eee069c	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	172	171	171	Can the teleprompter be used for medical and scientific conference presentations?	Yes. Crystal Prompter helps medical and scientific professionals present complex information clearly and accurately, ensuring precise terminology delivery during lectures, conference presentations, and instructional videos.	Medical presentation setup	Photo	medical_presentation.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
2a134814-eaaa-4d84-908b-107419f86c2e	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	173	172	172	How is the teleprompter used in interview-style video production?	Yes. The Clone 16 specifications specifically mention vertical adjustment for interview video filming. Crystal Prompter supports interview-style productions where questions are displayed for the interviewer to read naturally.	Interview setup configuration	Video	interview_setup.mp4	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c6a3f089-27c7-46d6-89ec-5c528d62b642	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	174	173	173	How do teachers use the LessonQ in classroom settings?	Teachers load their lecture notes into the software and read them while looking at the camera, making online lectures feel much more natural and engaging. Available in 24, 27, 32, and 43-inch sizes to match any classroom setup.	LessonQ educational use demo	Video	lessonq_education_demo.mp4	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1bba0694-6e83-4bc1-8da2-4d72ce839149	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	175	174	174	Can the teleprompter be rented for one-time events such as speeches?	The Rotunda 15 (4.98 kg) is light enough to bring to events. It's great for wedding speeches, corporate events, and social gatherings where polished delivery matters. ⚠️ MISSING: Rental program documentation.	Event speech teleprompter setup	Photo	wedding_event_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
40d93a5e-67f1-4793-b61c-dac27345e78d	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	176	175	175	How does POSCO use Crystal Prompter teleprompters?	POSCO uses Crystal Prompter for corporate communications and broadcasting. The Adamas speech series documentation specifically lists POSCO as a client, likely using the teleprompter for executive speeches and corporate announcements.	POSCO corporate use case	Slide	posco_use_case.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6246a9e5-a5e9-40e7-b4fe-7ddc3209ed1e	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	177	176	176	Does the teleprompter support right-to-left scripts such as Arabic?	Yes. Crystal Prompter's software supports any language. The Full HD displays ensure clear visibility of characters from any writing system, including Arabic, Korean, English, Chinese, Japanese, and more.	Multilingual script setup	Infographic	multilingual_setup.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ee8f7603-9516-4954-b1be-bad24db83900	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	178	177	177	Is the Rotunda 15 suitable for parliamentary and courtroom settings?	Yes. The Rotunda 15 is specifically designed for legislative sessions and VIP speeches. It allows speakers in government or legislative environments to read scripts clearly while maintaining eye contact with the audience.	Legislative setup showcase	Photo	legislative_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3a12df80-8c92-4d95-93e3-a36231b4d510	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	179	178	178	Can the teleprompter be used in music video production?	Yes. Crystal Prompter can display lyrics or dialogue cues during music video production. The high-brightness models ensure visibility under production lighting, and HDMI connectivity integrates with standard video production workflows.	Music video production setup	Photo	music_video_setup.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ff389a11-ede6-407f-90c6-d52df52f9f8b	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	180	179	179	Do municipal and city government offices use Crystal Prompter products?	Yes. Local government offices use Crystal Prompters for public announcements, press conferences, internal broadcasts, and community communications. The Cue 32 documentation specifically lists local governments as common users.	Local government use cases	Slide	local_gov_use_cases.png	cue32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
edc14ed5-2c95-4fe4-bdf8-e6592d479bde	Crystal_Prompter_QA_V3_Professional.xlsx	6-use-cases-users	6. Use Cases & Users	Master Q&A Database	181	180	180	Is a teleprompter practical for short-form social media content?	Not at all. The compact Tab 12 ($900) and Mime Series ($280-$420) are ideal for social media creators. They help you produce professional-looking videos with natural eye contact for YouTube, Instagram, TikTok, and other platforms.	Social media content setup	Video	social_media_setup.mp4	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b08b93a4-2844-404d-a809-0533c0111ccb	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	184	183	183	What is the price of the Clone 16?	Clone 16 is priced at $2,000 USD global online price, with $1,700 USD abroad dealer price. It includes a 15.6-inch 400 cd/m² prompter monitor and portable hardcase. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c5460894-2903-4617-91d6-3b68d22f5f0b	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	185	184	184	What is the price of the Ollesson 18?	Ollesson 18 is priced at $2,100 USD global online price, with $1,900 USD abroad dealer price. It includes a 17.3-inch 500 cd/m² prompter monitor and portable hardcase. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	olleson18	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9ce79746-b13f-4ba9-846d-a8a7c27a3948	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	186	185	185	What is the price of the Folder 22N?	Folder 22N is priced at $2,750 USD global online price, with $2,500 USD abroad dealer price. It features a 1000 cd/m² foldable display with prompter monitor and portable hardcase.	2026 Global price list	Table	price_table_2026.xlsx	folder22n	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
cec13ce3-e8a5-4ffa-8e22-8a721bcec3f8	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	187	186	186	What are the prices for the Cue 24, Cue 27, and Cue 32?	Cue 24: $1,500 online / $1,250 dealer. Cue 27: $1,650 online / $1,450 dealer. Cue 32: $2,200 online / $1,650 dealer. All include prompter monitor, portable hardcase, protect cover, and SW. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
37146a29-08f0-4691-bc54-f8a1b62911ea	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	188	187	187	What are the prices for the Framer 24, Framer 27, and Framer 32?	Framer 24: $1,200 online / $1,000 dealer. Framer 27: $1,350 online / $1,200 dealer. Framer 32: $1,550 online / $1,300 dealer. All include portable hardcase, protect cover, and SW. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	framer24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
c1aaf807-3f09-4cd0-8631-e3b397f02dba	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	189	188	188	What are the prices for the Mime 24, Mime 27, and Mime 32?	Mime 24: $280 online / $250 dealer. Mime 27: $325 online / $285 dealer. Mime 32: $420 online / $380 dealer. These are the most affordable professional models. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	mime24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
05e6dad5-a3c1-4362-a7b1-4fa684ff59e0	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	190	189	189	What are the prices for the Ultra 43 and Ultra 55?	Ultra 43: $6,500 online / $5,800 dealer. Ultra 55: $10,500 online / $8,800 dealer. Both include a 1000 cd/m² prompter monitor and protect cover. These are Crystal Prompter's premium broadcast models. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	ultra43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d168e5d7-6966-433e-a89b-d72bf344623f	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	191	190	190	What are the prices for the LessonQ 24, 27, 32, and 43?	LessonQ 24: $2,800 online / $2,500 dealer. LessonQ 27: $3,400 online / $2,800 dealer. LessonQ 32: $4,000 online / $3,300 dealer. LessonQ 43: $4,950 online / $4,450 dealer. All include prompter monitor, hardcase, protect cover. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	lessonq24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
2195bac6-a7c4-4071-ad03-c07d824268e9	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	192	191	191	What are the prices for the Adamas 19, Adamas 22, and Adamas 24?	Rotunda 15: $3,800 online / $3,350 dealer. Adamas 19: $5,000 online / $4,300 dealer. Adamas 22: $5,600 online / $4,800 dealer. Adamas 24: $6,200 online / $5,400 dealer. All include prompter monitor and portable hardcase. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	adamas19	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
bd6fb4b2-77de-43c6-9993-4c4256003653	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	193	192	192	What are the prices for the Electric Pedestals (EP Series)?	EP 30K: $750 online / $600 dealer. EP 40K: $1,150 online / $900 dealer (portable with hardcase). EP 50K: $1,600 online / $1,250 dealer. EP 60K: $1,950 online / $1,500 dealer. EP 80K: $2,150 online / $1,750 dealer. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a46c68a9-978a-4bb5-a3de-3067ff39c188	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	194	193	193	What are the prices for the ForENG camera plates?	Both ForENG_70 and ForENG_120 are priced at $600 USD global online price, with $480 USD abroad dealer price. These plates are designed for ENG broadcast cameras. Tax not included.	2026 Global price list	Table	price_table_2026.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8f8bff6a-bceb-4174-9db7-1c3a31eff216	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	195	194	194	Are all Crystal Prompter prices listed in US dollars?	Yes. All Crystal Prompter prices on the 2026 Global price list are in USD. Both global online and abroad dealer pricing are provided.	Price list currency note	Card	price_currency.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d722098a-5375-432b-8b52-6b06111ea6d7	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	196	195	195	Is tax included in the listed prices?	No. Tax is not included in any Crystal Prompter listed prices. The 2026 price list states: TAX not included. Applicable taxes depend on your country and region.	Tax information note	Card	tax_info.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d65277c3-cfb1-4848-a39e-eaa3ded242d5	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	197	196	196	What is the difference between the online price and the dealer price?	Crystal Prompter has two tiers: Global Online Price (direct purchase) and Abroad Dealer Price (for authorized resellers). Dealer prices are typically 15-20% lower, intended for resellers and bulk purchasers.	Pricing tiers explanation	Card	pricing_tiers.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d54616d0-9ddc-4aa2-9420-c2708954dea2	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	198	197	197	How do I place an order with Crystal Prompter?	Contact Crystal Prompter at sales@crystalprompter.com or call (+82) 32-576-0277 to place an order. You can also use the Contact Us form at www.crystalprompter.com. ⚠️ MISSING: Specific online ordering platform details.	Order process flowchart	Flowchart	order_process.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
2522a374-6701-4cdd-b039-32bce0f586b9	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	199	198	198	What payment methods does Crystal Prompter accept?	⚠️ MISSING: Specific payment method details not documented. Contact sales@crystalprompter.com for accepted payment methods, wire transfer details, and payment terms.	Payment methods overview	Card	payment_methods.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fdfcfc26-67a8-41fb-b2a8-98f4416230cb	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	200	199	199	How can I apply to become an authorized Crystal Prompter dealer?	Yes. The 2026 price list includes separate Abroad Dealer pricing, typically 15-20% below online prices. Contact sales@crystalprompter.com with your business details for dealer application information.	Dealer program information	Card	dealer_program.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d1958a0b-e31f-4099-a938-32b5db38aa63	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	201	200	200	Are volume discounts available for bulk purchases?	⚠️ MISSING: Specific volume discount tiers not documented. The existence of dealer pricing suggests bulk purchasing programs exist. Contact sales@crystalprompter.com for volume pricing.	Volume pricing information	Card	volume_pricing.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
883108ae-2e05-4e57-8586-28c4bea143ac	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	202	201	201	Can I request a custom quote for a specific configuration?	Yes. Email sales@crystalprompter.com with your desired models, quantities, and delivery location for a customized quote. Phone inquiries: (+82) 32-576-0277.	Quote request process	Flowchart	quote_process.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3ee66bb2-6fce-4385-b736-bcc4bde83d5e	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	203	202	202	What is included in the listed price? Are additional purchases required?	Inclusions vary: Cue/LessonQ/Speech include prompter monitor, hardcase, protect cover, SW. Framer includes hardcase, protect cover, SW. Mime includes SW only. Clone/Ollesson include prompter monitor, hardcase, SW.	Package inclusions comparison	Table	package_inclusions.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6aebb4cd-a7da-47d2-8a77-f6fdec17e373	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	204	203	203	Is the prompting software included in the price or sold separately?	The teleprompter software (SW) is included free with every Crystal Prompter purchase. The 2026 price list shows SW included for all teleprompter models — no extra charge.	Software inclusion confirmation	Card	software_included.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8a0f1a1d-c2c1-445f-9a3b-d4709baaddd0	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	205	204	204	Why is there a price difference between the online and dealer pricing tiers?	Yes, the Cue 32 offers a $550 savings (25%) at dealer pricing — one of the largest discounts in the lineup. Contact sales@crystalprompter.com for dealer qualification information.	Cue 32 price comparison	Card	cue_32_price.png	cue32	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
aa099858-55d6-4544-b416-01e8b411d3b4	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	206	205	205	What is the most affordable way to purchase a professional teleprompter?	The most affordable entry points are: Mime 24 at $280, Mime 27 at $325, or Mime 32 at $420. For tablet users, Tab 12 is $900. All include teleprompter software.	Budget starter packages	Card	budget_starters.png	tab12	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
93bb485d-f1ef-4c21-b658-1a17379024a7	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	207	206	206	Can I purchase individual replacement parts?	⚠️ MISSING: Replacement parts catalog not detailed. Contact sales@crystalprompter.com or call (+82) 32-576-0277 for replacement glass, mounts, cables, and other spare parts.	Replacement parts availability	Card	replacement_parts.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
92d4459f-c561-43e5-b027-ae9ccdbc247b	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	208	207	207	Can the Electric Pedestal be purchased separately from the teleprompter?	Yes. Electric Pedestals are listed as separate products: EP 30K ($750) through EP 80K ($2,150). They can be purchased independently to add motorized height adjustment to compatible teleprompter systems.	EP standalone purchase info	Card	ep_standalone.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
7a9f8ca5-dc4d-4df3-b5f1-626b6bdd5d76	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	209	208	208	Do Crystal Prompter prices change throughout the year?	The current price list is dated January 16, 2026. Pricing may be updated periodically. Contact sales@crystalprompter.com for the most current pricing.	Annual pricing policy	Card	pricing_policy.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
311d6460-0cd1-4e0c-87c3-ac804dca787d	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	210	209	209	Does Crystal Prompter offer financing or installment payment options?	⚠️ MISSING: Financing program details not documented. Contact sales@crystalprompter.com for payment plans, leasing options, and institutional financing arrangements.	Financing options	Card	financing_options.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1b1d34f7-8fa4-45a2-a6ba-a2192ef11275	Crystal_Prompter_QA_V3_Professional.xlsx	7-pricing-purchasing	7. Pricing & Purchasing	Master Q&A Database	211	210	210	Is there a full product price comparison chart available?	Yes! The 2026 Global price list covers all 30 products from $280 (Mime 24) to $10,500 (Ultra 55). It includes online and dealer pricing, inclusions, and mount type for each model. Contact sales@crystalprompter.com for the current list.	Complete price comparison table	Table	full_price_comparison.xlsx	ultra55	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
2ed75542-9420-4811-bdb9-455b72dfe3d5	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	212	211	211	What is the estimated delivery time for domestic orders?	⚠️ MISSING: Standard delivery timeframes not documented. Contact sales@crystalprompter.com or call (+82) 32-576-0277 for delivery estimates based on your location.	Shipping information page	Card	shipping_info.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
cb83bbbe-26fa-4c27-9b68-af33a9f21c87	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	213	212	212	What is the estimated delivery time for international orders?	⚠️ MISSING: International shipping timelines not specified. Contact sales@crystalprompter.com with your delivery address for estimated shipping times.	International shipping timeline	Card	intl_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f869b0d5-cbc4-4e84-a473-944bde568f13	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	214	213	213	Is expedited shipping available for urgent orders?	⚠️ MISSING: Express shipping details not documented. Contact sales@crystalprompter.com for expedited delivery options and costs.	Express shipping options	Card	express_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
513b6b76-2021-4aa8-8ee9-0b728aa7a5f9	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	215	214	214	Which countries does Crystal Prompter ship to?	Crystal Prompter serves international customers as evidenced by the 2026 Global price list with USD pricing and abroad dealer pricing. ⚠️ MISSING: Specific country list. Contact sales@crystalprompter.com for availability in your region.	Global shipping map	Map	shipping_map.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
af406e56-1120-467e-8862-ee2560383e62	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	216	215	215	How are shipping costs calculated?	⚠️ MISSING: Shipping cost schedule not provided. Costs vary by destination, weight, and model. Contact sales@crystalprompter.com for a shipping quote.	Shipping cost calculator	Card	shipping_costs.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
bb954813-b0ec-4002-98b0-ad75514ede4f	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	217	216	216	How are fragile components such as glass panels packaged for shipping?	Professional models like Cue, LessonQ, and Speech series include portable hardcases that double as shipping protection. Products are securely packaged to protect the reflective glass, monitors, and aluminum frames.	Shipping package photos	Photo	shipping_packaging.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a8476317-3894-4529-8da7-6d8d69d92df8	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	218	217	217	Is shipment tracking available after placing an order?	⚠️ MISSING: Order tracking system details not documented. Contact sales@crystalprompter.com after placing your order for tracking information.	Order tracking guide	Card	order_tracking.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4d756533-0604-4cc8-9b29-8cf22e209465	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	219	218	218	Does Crystal Prompter ship to the United States?	Crystal Prompter's global price list includes USD pricing and abroad dealer pricing, indicating international shipping. ⚠️ MISSING: Specific US shipping details. Contact sales@crystalprompter.com to confirm US delivery.	US shipping information	Card	us_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b310196d-878e-41e4-93f3-ee3c79722c70	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	220	219	219	Does Crystal Prompter ship to European countries?	Crystal Prompter's global pricing structure suggests international shipping capabilities. ⚠️ MISSING: Specific EU shipping details. Contact sales@crystalprompter.com for European delivery options.	European shipping information	Card	eu_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
88c699bd-a7f3-4558-8245-49fc5ee4937d	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	221	220	220	Does Crystal Prompter ship to the Middle East?	⚠️ MISSING: Middle East shipping details not documented. Contact sales@crystalprompter.com for delivery availability to your specific country.	Middle East shipping information	Card	me_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1a4f2512-6aa3-4031-b8b7-42a1b268e2c7	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	222	221	221	Does Crystal Prompter ship to Southeast Asia?	⚠️ MISSING: Southeast Asia shipping details not documented. Contact sales@crystalprompter.com for regional delivery options.	Southeast Asia shipping	Card	sea_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3bc8e612-70f9-4b10-9640-b3bbe85f3147	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	223	222	222	Will I need to pay customs duties or import taxes on international orders?	⚠️ MISSING: Import duty details not documented. As Crystal Prompter ships from South Korea, import duties and customs fees depend on your country's regulations and are typically the buyer's responsibility.	Customs and duties information	Card	customs_duties.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fa108d9b-5929-41f5-b714-c74a5fcbbee9	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	224	223	223	What protections are in place to prevent glass damage during transit?	The reflective glass and monitors are protected by included portable hardcases (with Cue, Framer, LessonQ, and Speech series) plus additional packaging. The aluminum construction also provides structural protection.	Glass protection packaging	Photo	glass_protection.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
bf8c7ef6-b7c3-424e-8985-b3547981f301	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	225	224	224	What should I do if my order arrives damaged?	⚠️ MISSING: Damage claim process not documented. Contact sales@crystalprompter.com or call (+82) 32-576-0277 immediately if your order arrives damaged.	Damage claim process	Flowchart	damage_claim.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1a1cb11a-2e29-41e3-8ccc-08d2fbe477a5	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	226	225	225	Is local pickup available at Crystal Prompter's Korea headquarters?	⚠️ MISSING: Local pickup details not documented. Crystal Prompter is based in South Korea. Contact (+82) 32-576-0277 to inquire about in-person pickup.	Local pickup information	Card	local_pickup.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
959f99b5-16a4-462f-81e6-4876a2486e23	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	227	226	226	How long does order processing take before shipment?	⚠️ MISSING: Processing timelines not documented. Contact sales@crystalprompter.com for production and processing times for your specific model.	Order processing timeline	Card	processing_timeline.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
448874ce-f6a2-440f-ad8c-17f9e75d070e	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	228	227	227	Is free shipping available for orders above a certain value?	⚠️ MISSING: Free shipping thresholds not documented. Contact sales@crystalprompter.com for current shipping promotions.	Free shipping policy	Card	free_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
16089aaa-9b7b-482b-87b1-b826fef01ceb	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	229	228	228	Can orders be delivered to a commercial or office address?	⚠️ MISSING: Business vs residential shipping details not documented. Contact sales@crystalprompter.com with your delivery address for options.	Address type shipping	Card	address_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
960ebd04-7694-46e6-98d0-59db25ad9acf	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	230	229	229	Which shipping carriers does Crystal Prompter use for international deliveries?	⚠️ MISSING: Specific shipping carriers not documented. Contact sales@crystalprompter.com for carrier information based on your destination.	Shipping carrier information	Card	shipping_carriers.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f61c70da-cc5b-446b-aa97-bbe054f22c8e	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	231	230	230	What are the approximate shipping box dimensions and weight?	Product weights: Rotunda 15 at 4.98 kg, Mime at 7.96 kg, Folder 22N at 8 kg, Framer 24 at 9.08 kg, Cue 24 at 11.31 kg, Cue 27 at 14.04 kg, Cue 32 at 17.89 kg, LessonQ 24 at 51.07 kg, LessonQ 43 at 65 kg. Packaging adds additional weight.	Shipping weight by model	Table	shipping_weights.xlsx	cue24	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
ec85bb88-6cb3-4ecb-bf58-ea26929a8ba8	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	232	231	231	Can multiple items be consolidated into a single shipment?	⚠️ MISSING: Consolidation shipping policies not documented. Contact sales@crystalprompter.com for multi-item shipping options.	Consolidated shipping info	Card	consolidated_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
22dd5592-07d7-4b47-a581-ef979f782fb1	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	233	232	232	Are the Electric Pedestals shipped separately from the teleprompter?	Electric Pedestals are separate products with their own packaging. The EP 40K includes a portable hardcase. ⚠️ MISSING: Specific EP shipping dimensions and costs.	EP shipping information	Card	ep_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d20d410e-3d70-4eb6-8eeb-3c0685166255	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	234	233	233	Is shipping insurance included with all orders?	⚠️ MISSING: Shipping insurance policy not documented. Contact sales@crystalprompter.com for transit insurance and coverage options.	Shipping insurance details	Card	shipping_insurance.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e84514b4-372d-40de-8a8b-98c1c96f9ee0	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	235	234	234	Can I request a specific delivery date for my order?	⚠️ MISSING: Delivery date scheduling not documented. Contact sales@crystalprompter.com to discuss timing preferences for your order.	Delivery scheduling	Card	delivery_scheduling.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e889f347-7d6c-4e0e-b340-51eb384debe8	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	236	235	235	Are there local distributors or resellers outside South Korea?	⚠️ MISSING: Distributor directory not provided. The abroad dealer pricing indicates a dealer network exists. Contact sales@crystalprompter.com to find a distributor near you.	Distributor locator	Map	distributor_map.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b55cbef6-749e-45f2-9234-6e5b6a7cbb89	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	237	236	236	What documentation is included with international shipments?	⚠️ MISSING: International shipping documentation details not provided. Standard shipments typically include commercial invoices and packing lists. Contact sales@crystalprompter.com for requirements.	Shipping documentation guide	Card	shipping_docs.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
57eb94be-4afd-4901-a074-ee9383593652	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	238	237	237	What is Crystal Prompter's return policy?	⚠️ MISSING: Return shipping policy not documented. Contact sales@crystalprompter.com or call (+82) 32-576-0277 for return eligibility and procedures.	Return shipping process	Flowchart	return_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9cd72479-d135-4c83-8b31-4d238b7496ea	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	239	238	238	Are there shipping delays during holidays or peak seasons?	⚠️ MISSING: Seasonal delay information not documented. International shipping may be affected by holiday periods. Contact sales@crystalprompter.com for current estimates.	Seasonal shipping calendar	Card	seasonal_shipping.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
35979eef-6e48-4491-8d0c-cc8d99090895	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	240	239	239	Can I change the shipping address after placing an order?	⚠️ MISSING: Address change policy not documented. Contact sales@crystalprompter.com as soon as possible if you need to update your delivery address.	Address change process	Card	address_change.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
7c7e2119-ac7e-40c3-bc49-d6de24acec3d	Crystal_Prompter_QA_V3_Professional.xlsx	8-shipping-delivery	8. Shipping & Delivery	Master Q&A Database	241	240	240	What are the standard shipping box dimensions for planning storage?	⚠️ MISSING: Specific box dimensions not documented. Product sizes range from 15.6 to 55 inches. Contact sales@crystalprompter.com for exact shipping carton dimensions.	Shipping box dimensions	Table	shipping_dimensions.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9c4100fa-65e2-466e-9344-d52f7f45305a	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	242	241	241	What warranty coverage is provided with Crystal Prompter products?	⚠️ MISSING: Specific warranty duration not documented. Contact sales@crystalprompter.com or call (+82) 32-576-0277 for official warranty terms and coverage.	Warranty policy document	PDF	warranty_policy.pdf	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e370a56a-6419-44f4-8b7d-d80989b980d2	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	243	242	242	Is the beam-splitting glass covered under warranty?	⚠️ MISSING: Component-specific warranty coverage not documented. Contact sales@crystalprompter.com for details on what's covered for monitors, glass, and electronics.	Warranty coverage details	Card	warranty_coverage.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
00956dca-7751-49a6-a720-7cbeffcf89b6	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	244	243	243	Do the Electric Pedestals have a separate warranty policy?	⚠️ MISSING: EP warranty details not documented. Contact sales@crystalprompter.com for pedestal-specific warranty terms.	EP warranty information	Card	ep_warranty.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
33a0746d-a75e-4e57-a728-17dc4d5b9782	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	245	244	244	How do I submit a warranty claim?	⚠️ MISSING: Warranty claim process not documented. Contact sales@crystalprompter.com or call (+82) 32-576-0277 with your product details and issue description.	Warranty claim process flowchart	Flowchart	warranty_claim_process.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8ba1ab70-4472-4ede-9aaf-4535c4afa599	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	246	245	245	Is an extended warranty option available?	⚠️ MISSING: Extended warranty program not documented. Contact sales@crystalprompter.com for extended warranty options and pricing.	Extended warranty options	Card	extended_warranty.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d5088045-1bc2-4882-a124-2141bad5f35d	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	247	246	246	What is excluded from the standard warranty coverage?	⚠️ MISSING: Warranty exclusions not documented. Standard exclusions typically include physical damage, misuse, and unauthorized modifications. Contact sales@crystalprompter.com for complete terms.	Warranty exclusions	Card	warranty_exclusions.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
63f9c68c-6f59-46cd-be20-933d4243ca7d	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	248	247	247	Does Crystal Prompter offer product repair services?	Yes. Crystal Prompter handles after-sales support directly as part of its in-house operations. Contact sales@crystalprompter.com or call (+82) 32-576-0277 to arrange repair service.	Repair service information	Card	repair_service.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d43d47d5-de17-4268-939d-9b1872842db8	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	249	248	248	What is the typical turnaround time for repairs?	⚠️ MISSING: Repair timelines not documented. Contact sales@crystalprompter.com with details about your issue for an estimated timeframe.	Repair timeline information	Card	repair_timeline.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
76137cf0-605f-4a86-9373-a80fc25917d3	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	250	249	249	Is a loaner unit available during the repair period?	⚠️ MISSING: Loaner program not documented. Contact sales@crystalprompter.com to inquire about temporary replacement options during repairs.	Loaner program information	Card	loaner_program.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1e2a304d-4f12-4922-9779-220f60aacf92	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	251	250	250	What is Crystal Prompter's return and refund policy?	⚠️ MISSING: Return and refund policy not documented. Contact sales@crystalprompter.com for return eligibility, timeframes, and refund procedures.	Return policy details	Card	return_policy.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
65731c5e-858c-4f6c-80f4-0ef9493553d5	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	252	251	251	Can I exchange my product for a different model or size?	⚠️ MISSING: Exchange policy not documented. Contact sales@crystalprompter.com as soon as possible to discuss exchange options.	Exchange process	Flowchart	exchange_process.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6f578c60-179c-4f5a-a9c1-e51121d783fa	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	253	252	252	Can I purchase a replacement glass panel separately?	⚠️ MISSING: Replacement glass availability not documented. Crystal Prompter uses ultra-low iron special reflective glass. Contact sales@crystalprompter.com for replacement orders.	Replacement parts availability	Card	replacement_glass.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d012d827-dc6c-4242-964a-9da719c23bb2	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	254	253	253	Where can I purchase replacement cables and accessories?	⚠️ MISSING: Replacement cable catalog not documented. Contact sales@crystalprompter.com for HDMI cables, power adapters, and other accessories.	Replacement accessories	Card	replacement_accessories.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
76b85905-b5c7-4089-b5e0-667260073756	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	255	254	254	Is there a restocking fee for returned products?	⚠️ MISSING: Restocking fee details not documented. Contact sales@crystalprompter.com for complete return terms.	Restocking fee policy	Card	restocking_fee.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0ab64681-133b-46fb-a046-b1ce2b11e68f	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	256	255	255	What should I do if I receive a defective unit?	Contact sales@crystalprompter.com or call (+82) 32-576-0277 with your model, purchase date, and a description of the defect. The in-house support team will guide you through resolution.	Defect reporting process	Flowchart	defect_report.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b354c566-c9a1-4689-a355-3dbda97442ae	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	257	256	256	Does Crystal Prompter have a dedicated technical support team?	Yes. Crystal Prompter provides direct technical support as part of its in-house operations. Contact sales@crystalprompter.com or call (+82) 32-576-0277 for help with setup, software, or hardware issues.	Technical support overview	Card	tech_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
39d0a47e-60a8-4047-9362-a8e7d871cdcd	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	258	257	257	Does Crystal Prompter offer a trade-in program for upgrades?	⚠️ MISSING: Trade-in program not documented. Contact sales@crystalprompter.com to discuss upgrade options when moving to a larger model.	Upgrade options	Card	upgrade_options.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b9a381fa-9bf3-4b86-9a8d-2655dbb753e4	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	259	258	258	Will there be ongoing software updates for my teleprompter?	⚠️ MISSING: Software update policy not documented. Contact sales@crystalprompter.com for information about software updates for your model.	Software update information	Card	software_updates.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
28529a80-e053-4676-bac9-18fb0c3096c9	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	260	259	259	How should I troubleshoot an HDMI port that is not working?	First, try a different HDMI cable and source device to isolate the issue. If the problem persists, contact Crystal Prompter at sales@crystalprompter.com or (+82) 32-576-0277 for technical support and potential warranty service.	HDMI troubleshooting guide	Infographic	hdmi_troubleshooting.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
97e8ceb4-a1f7-41d7-8f8e-31df9360f76c	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	261	260	260	Are dead pixels on the display covered under warranty?	Contact sales@crystalprompter.com with photos and your product details. The in-house support team will assess the issue and recommend repair or replacement options.	Dead pixel support	Card	dead_pixel_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4a90067e-1574-457c-abf9-ffb4877d8a7b	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	262	261	261	Can the reflective glass coating be restored or reapplied?	⚠️ MISSING: Glass recoating service not documented. Crystal Prompter uses specially coated ultra-low iron reflective glass. Contact sales@crystalprompter.com for glass maintenance or replacement.	Glass recoating service	Card	glass_recoating.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9390ace2-6c15-46df-a7fe-7ef09b0a0c3d	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	263	262	262	Does Crystal Prompter offer remote or on-site installation assistance?	Crystal Prompter products feature tool-free modular assembly designed for easy self-installation. If you need additional help, contact sales@crystalprompter.com or (+82) 32-576-0277 for remote guidance.	Installation support services	Card	installation_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
19caa467-92e5-4945-b503-d6b7fef8a722	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	264	263	263	How do I troubleshoot a wireless remote that has stopped working?	Check the battery first. Re-pair the remote with the system. If it still doesn't work, contact sales@crystalprompter.com for a replacement remote or technical assistance.	Remote troubleshooting	Infographic	remote_troubleshooting.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
91f5bff2-b46c-4d6c-b4ba-b69686575341	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	265	264	264	Is a downloadable user manual available for my model?	⚠️ MISSING: Downloadable manual location not documented. Each product should include documentation. Contact sales@crystalprompter.com for digital copies of user manuals.	User manual access	PDF	user_manual.pdf	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
8e269a6a-9456-4ba3-98c2-981e1e14640e	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	266	265	265	Can I order additional camera mounting plates?	⚠️ MISSING: Spare plate availability not documented. Crystal Prompter uses QR and HP mount systems. Contact sales@crystalprompter.com for replacement plates and hardware.	Spare parts ordering	Card	spare_mounting_plates.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e7558fd9-7fde-4b47-98aa-837064dbb3c4	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	267	266	266	How do I identify the correct replacement power adapter for my unit?	Contact sales@crystalprompter.com with your model number. Specs vary (12V/2A to 12V/10A, 19V adapters, or AC 220V for Ultra 43). The team will match the correct replacement for your model.	Power adapter replacement	Card	power_adapter_replacement.png	ultra43	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
4cbf9dcc-e517-499e-88ff-d324ff04611c	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	268	267	267	Does Crystal Prompter provide on-site repair services?	⚠️ MISSING: On-site repair details not documented. Crystal Prompter is based in South Korea. Contact sales@crystalprompter.com for repair options in your area.	On-site service availability	Card	onsite_service.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1f1aaa81-b910-49d2-b4ee-11a01fed7c02	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	269	268	268	What are the recommended storage conditions for the teleprompter?	Store in the included portable hardcase. Keep the glass clean with a microfiber cloth. Disconnect cables. Store in a cool, dry place away from direct sunlight. The aluminum frame needs no special care.	Storage best practices	Infographic	storage_guide.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
274a4b78-71d7-42a9-b022-543ecbcc902e	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	270	269	269	Is Crystal Prompter's customer support handled in-house?	Crystal Prompter handles all after-sales support directly in-house — the same team that designs and builds the products also supports them. This means the support team has deep product knowledge.	After-sales commitment	Slide	after_sales_philosophy.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d3ef6516-b627-4558-8ada-4ab3bfd649d4	Crystal_Prompter_QA_V3_Professional.xlsx	9-warranty-after-sales	9. Warranty & After-Sales	Master Q&A Database	271	270	270	Is warranty support available for international customers?	⚠️ MISSING: International warranty logistics not documented. Crystal Prompter serves global customers with a dealer network. Contact sales@crystalprompter.com for warranty procedures in your region.	International warranty support	Card	intl_warranty.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
68a86bc6-45b9-4516-8ae5-64ed6c952ad2	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	272	271	271	How do I contact the Crystal Prompter sales team?	You can contact Crystal Prompter sales at sales@crystalprompter.com. You can also call (+82) 32-576-0277 for direct phone support from the South Korea headquarters.	Contact page details	Card	contact_card.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6cd2be4d-12ab-4fb1-b74d-4fec0119b00b	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	273	272	272	What is Crystal Prompter's main phone number?	Crystal Prompter's phone number is (+82) 32-576-0277. This connects you to company headquarters in South Korea for sales, support, and general inquiries.	Contact information	Card	contact_card.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
242b2324-fbfb-4025-b0fe-b87e1c7c3e7b	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	274	273	273	What email address should I use for technical support inquiries?	Use sales@crystalprompter.com for all inquiries — product questions, pricing, orders, technical support, and after-sales assistance.	Contact information	Card	contact_card.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0fee7471-a2bf-4046-aea4-67da748c6cf8	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	275	274	274	Is there a contact form on the Crystal Prompter website?	Yes. Visit www.crystalprompter.com/contactus to submit your name, email, and message directly to the Crystal Prompter team through the contact form.	Website contact form screenshot	Photo	contact_form.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
80c2d457-5146-4790-9cef-01409ffcb92e	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	276	275	275	What is Crystal Prompter's official website address?	The official website is www.crystalprompter.com. Key pages: /aboutus for company info, /product for the full catalog, and /contactus to get in touch.	Website homepage	Photo	website_homepage.jpg	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
fcf54c96-e11a-408b-bbef-9bc3c1d51c46	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	277	276	276	What are Crystal Prompter's business hours?	⚠️ MISSING: Specific business hours not documented. Crystal Prompter is based in South Korea (KST timezone). Contact sales@crystalprompter.com for response time expectations.	Business hours information	Card	business_hours.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
dc6e1a15-5992-4b25-a784-416c4b545265	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	278	277	277	What is the typical response time for email inquiries?	⚠️ MISSING: Response times not documented. For urgent needs, call (+82) 32-576-0277 directly. Email inquiries are typically handled during Korean business hours.	Response time information	Card	response_times.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a0230362-ee72-40cc-84ea-a44cfe191afc	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	279	278	278	Does Crystal Prompter have official social media accounts?	⚠️ MISSING: Social media links not found in available materials. Visit www.crystalprompter.com or contact sales@crystalprompter.com for social media information.	Social media channels	Card	social_media.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
0427e2b8-b788-47ed-b9d8-441611d83475	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	280	279	279	Where can I find video tutorials for my specific model?	Crystal Prompter provides product videos for most models including Tab 12, Flex 15, Clone 16, Ollesson 18, and all Cue, Framer, LessonQ, and Ultra series models. Contact support for access.	Tutorial video directory	Card	tutorial_directory.png	clone16	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b186605d-3799-4e0a-913b-cc6e83542a4f	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	281	280	280	Does Crystal Prompter have an official YouTube channel?	⚠️ MISSING: YouTube channel details not documented. Contact sales@crystalprompter.com or check the website for links to official video content.	YouTube channel link	Card	youtube_channel.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
d7f1e0fc-3ad7-4149-a8ed-a48dd5bcab6c	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	282	281	281	Can I schedule a product demonstration before purchasing?	Yes. Contact sales@crystalprompter.com or call (+82) 32-576-0277 to request a demo. Specify which model you're interested in and your location for the best options.	Demo request process	Card	demo_request.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
7de10474-71bc-4a09-bf23-e5d745bc0601	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	283	282	282	Is there a user community or discussion forum for Crystal Prompter owners?	⚠️ MISSING: User community details not documented. Contact sales@crystalprompter.com for information about user groups and online communities.	Community resources	Card	community_resources.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
e6d4986f-4d95-4ee3-b1ed-fdfed2b5da28	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	284	283	283	Who should I contact for software-related issues?	Contact sales@crystalprompter.com or call (+82) 32-576-0277. Describe your issue, operating system, and model number for the fastest resolution.	Software support guide	Card	software_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
5b6dfd22-ace3-4742-813b-38d8927b1d93	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	285	284	284	Is video call support available for troubleshooting?	⚠️ MISSING: Video call support not documented. Contact sales@crystalprompter.com to inquire about remote video support for complex issues.	Video support scheduling	Card	video_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
40507f56-eb54-4255-952b-c2fd0477837c	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	286	285	285	Where can I download product brochures and data sheets?	Brochures are available for all models. Contact sales@crystalprompter.com for digital copies, or visit www.crystalprompter.com/product for product information including specifications and features.	Brochure download page	PDF	brochure_downloads.pdf	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
a36c30ee-1625-45b9-b4b0-bff1590cca36	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	287	286	286	How do I apply to become an authorized Crystal Prompter dealer?	The 2026 price list confirms a dealer program exists with special pricing. Contact sales@crystalprompter.com with your business details, location, and expected sales volume.	Dealer application process	Flowchart	dealer_application.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
30c8c384-1405-42d5-983b-4438a3903c3d	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	288	287	287	Is there an FAQ or knowledge base section on the website?	Yes. Each Crystal Prompter product includes detailed FAQ documentation covering specs, features, and common questions. The website at www.crystalprompter.com also provides product information and company details.	Online FAQ resources	Card	faq_resources.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
14cc70ea-47de-4c60-8ad8-06577c16f5b9	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	289	288	288	Is customer support available in both Korean and English?	Crystal Prompter is a South Korean company, so Korean language support is fully available. English support is provided through sales@crystalprompter.com. ⚠️ MISSING: Full list of supported languages.	Multilingual support	Card	multilingual_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
f9887e08-177f-4d5c-9a80-86c04777e70d	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	290	289	289	How do I report a software bug or issue?	Email sales@crystalprompter.com with your model number, software version, operating system, and a description of the bug with screenshots if possible. The in-house development team handles software issues directly.	Bug report process	Card	bug_report.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
6aad8e92-1e60-4610-bcb2-80c8c7397aa7	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	291	290	290	Where can I find model-specific setup instructions?	Setup documentation is included with your purchase. Crystal Prompter products feature tool-free assembly. For additional guidance, contact sales@crystalprompter.com or call (+82) 32-576-0277.	Installation guide directory	Card	installation_guides.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
3bbb360a-f602-4bfc-b35e-9b919efb76e7	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	292	291	291	Is it possible to visit Crystal Prompter's office in South Korea?	⚠️ MISSING: Specific office address and visit policy not documented. Contact (+82) 32-576-0277 or email sales@crystalprompter.com to arrange a visit.	Office visit information	Card	office_visit.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
2e51cda5-b961-4315-a8fb-5ee309383578	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	293	292	292	How can I stay informed about new product launches and updates?	⚠️ MISSING: Newsletter details not documented. Visit www.crystalprompter.com regularly or contact sales@crystalprompter.com to be notified of new launches.	Product updates subscription	Card	product_updates.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
160cafca-ea32-4723-8e80-97b03382a4f9	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	294	293	293	Is there a mobile app for controlling the teleprompter remotely?	⚠️ MISSING: Mobile app availability not documented. Crystal Prompter provides desktop teleprompter software with all purchases. Contact sales@crystalprompter.com for the latest app info.	Mobile app information	Card	mobile_app.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
7871732d-1519-432d-9e4e-f017def5eddc	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	295	294	294	What resources are available for first-time teleprompter users?	You'll receive: teleprompter software (SW), wireless remote control, and easy tool-free assembly components. Start by assembling the three modules (Hood, Monitor, Frame), connect HDMI, install the software, and load your first script. Contact support for any help.	Getting started resources	Card	getting_started.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1e7c243c-a731-4e7d-a9d9-55b336ffced8	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	296	295	295	Does Crystal Prompter offer a trial or demo program?	⚠️ MISSING: Sample or trial program not documented. Contact sales@crystalprompter.com to discuss evaluation or demo unit options.	Sample request process	Card	sample_request.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
1d876d69-b594-42d0-a23b-c94294a04168	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	297	296	296	How can I submit product feedback to Crystal Prompter?	Share feedback at sales@crystalprompter.com or call (+82) 32-576-0277. As an in-house manufacturer, your feedback goes directly to the design and development team for product improvements.	Feedback submission channels	Card	feedback_channels.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
b9c2ccf9-83b1-4a85-85b6-98860417efe5	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	298	297	297	Is there a product comparison guide available?	Yes. The 2026 Global price list provides a comprehensive overview of all models with pricing and inclusions. Individual product FAQs contain detailed specs. Contact sales@crystalprompter.com for personalized recommendations.	Model comparison resources	Table	model_comparison.xlsx	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
54507d4d-1da1-45e0-b40a-2c2962d0ae43	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	299	298	298	Does Crystal Prompter exhibit at industry trade shows?	⚠️ MISSING: Trade show schedule not documented. Contact sales@crystalprompter.com for upcoming exhibitions where you can see Crystal Prompter products in person.	Trade show schedule	Card	trade_shows.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
9d32bba3-92f1-479b-b955-a810bd5d66cf	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	300	299	299	Is after-hours support available for urgent issues?	⚠️ MISSING: After-hours support not documented. Crystal Prompter operates from South Korea (KST). Email sales@crystalprompter.com anytime or call (+82) 32-576-0277 during business hours.	After-hours support info	Card	after_hours_support.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
42f18cb5-0d53-4be7-957d-c8cf8c12a6c4	Crystal_Prompter_QA_V3_Professional.xlsx	10-contact-support	10. Contact & Support	Master Q&A Database	301	300	300	What is the fastest way to get a response from Crystal Prompter?	Call (+82) 32-576-0277 directly during Korean business hours for the fastest response. For email, send to sales@crystalprompter.com with your specific model, question, and urgency level.	Fast response tips	Card	fast_response.png	\N	{}	2026-03-24 13:47:33.032784+08	2026-03-24 13:47:33.032784+08
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.media_assets (id, tenant_id, asset_slug, asset_type, title, description, storage_provider, storage_key, public_url, thumbnail_url, mime_type, duration_seconds, source_label, raw_metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: price_list_items; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.price_list_items (id, source_file, sheet_name, source_row_number, row_label, size_label, model_name, property_text, prompter_monitor, portable_hardcase, protect_cover, software_bundle, camera_plate, global_online_price_usd, abroad_dealer_price_usd, product_slug, raw_metadata, created_at, updated_at) FROM stdin;
146b3e30-d1bf-4ce8-ad1a-6cc4cd95ca7c	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	6	1	12"	Tab 12	tab-book 13.0"	not included	included	\N	SW	QR	900.00	750.00	tab12	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
aa0d523c-8f5c-44d7-8fad-f819e6b595e8	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	7	2	15"	Flex 15	tab-book 15.6"	not included	included	\N	SW	QR	1000.00	830.00	flex15	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
12942e9e-cee9-4d9e-9beb-aab8ce520cd0	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	8	2	16"	Clone 16	15.6" / 400 cds	included	included	\N	SW	QR	2000.00	1700.00	clone16	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
269b015c-616f-4cd5-a3cd-350f6f9679ee	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	9	3	18"	Ollesson 18	17.3" / 500 cds	included	included	\N	SW	QR	2100.00	1900.00	olleson18	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
90df11f5-e6ef-4928-b9ac-58a99066b74c	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	10	4	22"	Folder 22N	1000 cds / foldable	included	included	\N	SW	HP	2750.00	2500.00	folder22n	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
09cd23a0-217e-4fb3-85be-a07c7a9a8c06	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	11	5	24"	Cue 24	1000 cds	included	included	included	SW	HP	1500.00	1250.00	cue24	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
15e828f7-f2da-4c81-989c-cb84006470d0	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	12	6	27"	Cue 27	1001 cds	included	included	included	SW	HP	1650.00	1450.00	cue27	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
f2585084-0097-45a6-b5cd-a2365efac24c	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	13	7	32"	Cue 32	1002 cds	included	included	included	SW	HP	2200.00	1650.00	cue32	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
149937d3-544a-4668-a7a7-2b470b5beeef	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	14	8	Framer	Framer 24	\N	\N	included	included	SW	HP	1200.00	1000.00	framer24	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
33300204-a278-4e07-a42e-1b9ff1c81694	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	15	9	\N	Framer 27	\N	\N	included	included	SW	HP	1350.00	1200.00	framer27	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
689d1e9e-2fa1-4fd9-9dcd-8f99a5996b56	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	16	10	\N	Framer 32	\N	\N	included	included	SW	HP	1550.00	1300.00	framer32	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
5caefc47-de64-4a50-85a3-e8854183d745	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	17	11	Mime	Mime 24	\N	\N	\N	\N	SW	HP	280.00	250.00	mime24	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
003c2bda-f281-4dfb-aee8-c37bad61b3b2	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	18	12	\N	Mime 27	\N	\N	\N	\N	SW	HP	325.00	285.00	mime27	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
d9c53033-4083-465b-b850-788f8d883c29	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	19	13	\N	Mime 32	\N	\N	\N	\N	SW	HP	420.00	380.00	mime32	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
ae37ec19-3f91-49f3-9305-e3525cec2408	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	20	14	Ultra	Ultra 43	1000 cds	included	\N	included	SW	HP	6500.00	5800.00	ultra43	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
ffe660c5-d02e-4e22-baf4-e92283685a78	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	21	15	\N	Ultra 55	1000 cds	included	\N	included	SW	HP	10500.00	8800.00	ultra55	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
347383d5-4ed2-412c-9336-38bd92367d96	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	22	16	LessonQ	LessonQ 24	Online lecture	included	included	included	SW	HP	2800.00	2500.00	lessonq24	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
6dd820e1-528f-4222-9331-6c725eb5abcb	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	23	17	\N	LessonQ 27	Online lecture	included	included	included	SW	HP	3400.00	2800.00	lessonq27	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
e43d75fa-fc6b-4f9b-bb33-08ade28ee740	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	24	18	\N	LessonQ 32	Online lecture	included	included	included	SW	HP	4000.00	3300.00	lessonq32	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
7540b6f5-0102-4cb9-a7f3-c1181fb51abe	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	25	19	\N	LessonQ 43	Online lecture	included	included	included	SW	HP	4950.00	4450.00	lessonq43	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
e6eafe9e-5005-4a10-b336-dea0371bdeac	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	26	20	Speech	Lotunda 15	VIP speech	included	included	\N	SW	\N	3800.00	3350.00	\N	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
ce089fb8-877f-499b-a0df-f05e27956dc9	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	27	21	\N	Adamas 19 A	VIP speech	included	included	\N	SW	\N	5000.00	4300.00	adamas19	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
3e0f870f-ff7a-4728-b3f7-e7ebb95e1a83	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	28	22	\N	Adamas 22 A	VIP speech	included	included	\N	SW	\N	5600.00	4800.00	adamas22	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
7dea0f5a-4a6f-46ab-ba11-7ef768abf5fc	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	29	23	\N	Adamas 24 A	VIP speech	included	included	\N	SW	\N	6200.00	5400.00	adamas24	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
84853536-f540-4299-b2a4-8accd3413cce	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	30	24	Electric Pedestal	Crystal EP 30K	electric	\N	\N	\N	\N	\N	750.00	600.00	ep30k	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
7ec4feee-d61e-43e4-b35c-0816410c9898	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	31	25	\N	Crystal EP 40K	electric / portable	\N	included	\N	\N	\N	1150.00	900.00	ep40k	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
0ec5b04c-fd72-42c7-b72a-20548cbf48f3	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	32	26	\N	Crystal EP 50K	electric	\N	\N	\N	\N	\N	1600.00	1250.00	ep50k	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
90521b74-5e30-4043-8bac-d1c352181dff	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	33	27	\N	Crystal EP 60K	electric	\N	\N	\N	\N	\N	1950.00	1500.00	ep60k	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
7ffdc21e-8799-44de-9695-58f0c76f8406	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	34	28	\N	Crystal EP 80K	electric	\N	\N	\N	\N	\N	2150.00	1750.00	ep80k	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
acca7ace-2591-4856-b1f9-59ebffc28f7b	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	35	29	Plate	ForENG_70	for ENG CAM	\N	\N	\N	\N	\N	600.00	480.00	\N	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
60c3f2ec-b685-4e88-b82b-2e7ce4cec508	Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx	Global	36	30	\N	ForENG_120	for ENG CAM	\N	\N	\N	\N	\N	600.00	480.00	\N	{}	2026-03-24 13:49:06.055059+08	2026-03-24 13:49:06.055059+08
\.


--
-- Data for Name: product_aliases; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.product_aliases (id, product_id, alias, alias_type, created_at) FROM stdin;
\.


--
-- Data for Name: product_families; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.product_families (id, tenant_id, slug, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_faqs; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.product_faqs (id, product_id, faq_key, question, answer, keywords, display_order, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_media_links; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.product_media_links (id, product_id, media_asset_id, usage_type, display_order, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: product_specs; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.product_specs (id, product_id, spec_group, spec_label, spec_value, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.products (id, tenant_id, family_id, slug, name, tagline, summary, description, status, screen_size_inches, resolution, aspect_ratio, brightness_cd_m2, weight_kg, inputs, hero_image_url, thumbnail_url, buy_now_notes, raw_metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: support_channels; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.support_channels (id, tenant_id, channel_type, label, value, region_code, is_sales, is_support, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: jeddgwapz
--

COPY public.tenants (id, slug, name, created_at, updated_at) FROM stdin;
\.


--
-- Name: document_chunks document_chunks_document_id_chunk_index_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_document_id_chunk_index_key UNIQUE (document_id, chunk_index);


--
-- Name: document_chunks document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: ingestion_runs ingestion_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.ingestion_runs
    ADD CONSTRAINT ingestion_runs_pkey PRIMARY KEY (id);


--
-- Name: knowledge_qa_items knowledge_qa_items_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.knowledge_qa_items
    ADD CONSTRAINT knowledge_qa_items_pkey PRIMARY KEY (id);


--
-- Name: knowledge_qa_items knowledge_qa_items_source_file_source_sheet_source_row_numb_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.knowledge_qa_items
    ADD CONSTRAINT knowledge_qa_items_source_file_source_sheet_source_row_numb_key UNIQUE (source_file, source_sheet, source_row_number);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: media_assets media_assets_tenant_id_asset_slug_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_tenant_id_asset_slug_key UNIQUE (tenant_id, asset_slug);


--
-- Name: price_list_items price_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_pkey PRIMARY KEY (id);


--
-- Name: price_list_items price_list_items_source_file_sheet_name_source_row_number_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_source_file_sheet_name_source_row_number_key UNIQUE (source_file, sheet_name, source_row_number);


--
-- Name: product_aliases product_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_aliases
    ADD CONSTRAINT product_aliases_pkey PRIMARY KEY (id);


--
-- Name: product_aliases product_aliases_product_id_alias_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_aliases
    ADD CONSTRAINT product_aliases_product_id_alias_key UNIQUE (product_id, alias);


--
-- Name: product_families product_families_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT product_families_pkey PRIMARY KEY (id);


--
-- Name: product_families product_families_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT product_families_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- Name: product_faqs product_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_faqs
    ADD CONSTRAINT product_faqs_pkey PRIMARY KEY (id);


--
-- Name: product_faqs product_faqs_product_id_faq_key_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_faqs
    ADD CONSTRAINT product_faqs_product_id_faq_key_key UNIQUE (product_id, faq_key);


--
-- Name: product_media_links product_media_links_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_pkey PRIMARY KEY (id);


--
-- Name: product_media_links product_media_links_product_id_media_asset_id_usage_type_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_product_id_media_asset_id_usage_type_key UNIQUE (product_id, media_asset_id, usage_type);


--
-- Name: product_specs product_specs_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_specs
    ADD CONSTRAINT product_specs_pkey PRIMARY KEY (id);


--
-- Name: product_specs product_specs_product_id_spec_group_spec_label_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_specs
    ADD CONSTRAINT product_specs_product_id_spec_group_spec_label_key UNIQUE (product_id, spec_group, spec_label);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- Name: support_channels support_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.support_channels
    ADD CONSTRAINT support_channels_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- Name: idx_document_chunks_document_index; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_document_chunks_document_index ON public.document_chunks USING btree (document_id, chunk_index);


--
-- Name: idx_documents_product_status; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_documents_product_status ON public.documents USING btree (product_id, status);


--
-- Name: idx_knowledge_qa_category; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_knowledge_qa_category ON public.knowledge_qa_items USING btree (category_slug, source_row_number);


--
-- Name: idx_knowledge_qa_product_slug; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_knowledge_qa_product_slug ON public.knowledge_qa_items USING btree (product_slug);


--
-- Name: idx_media_assets_tenant_type; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_media_assets_tenant_type ON public.media_assets USING btree (tenant_id, asset_type);


--
-- Name: idx_price_list_items_model; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_price_list_items_model ON public.price_list_items USING btree (model_name);


--
-- Name: idx_price_list_items_product_slug; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_price_list_items_product_slug ON public.price_list_items USING btree (product_slug);


--
-- Name: idx_product_aliases_alias; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_product_aliases_alias ON public.product_aliases USING btree (lower(alias));


--
-- Name: idx_product_faqs_keywords; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_product_faqs_keywords ON public.product_faqs USING gin (keywords);


--
-- Name: idx_product_faqs_product_order; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_product_faqs_product_order ON public.product_faqs USING btree (product_id, display_order);


--
-- Name: idx_product_media_links_product_order; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_product_media_links_product_order ON public.product_media_links USING btree (product_id, usage_type, display_order);


--
-- Name: idx_product_specs_product_order; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_product_specs_product_order ON public.product_specs USING btree (product_id, display_order);


--
-- Name: idx_products_family_id; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_products_family_id ON public.products USING btree (family_id);


--
-- Name: idx_products_tenant_status; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_products_tenant_status ON public.products USING btree (tenant_id, status);


--
-- Name: idx_support_channels_tenant_order; Type: INDEX; Schema: public; Owner: jeddgwapz
--

CREATE INDEX idx_support_channels_tenant_order ON public.support_channels USING btree (tenant_id, display_order);


--
-- Name: document_chunks document_chunks_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: documents documents_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: documents documents_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: ingestion_runs ingestion_runs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.ingestion_runs
    ADD CONSTRAINT ingestion_runs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: media_assets media_assets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_aliases product_aliases_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_aliases
    ADD CONSTRAINT product_aliases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_families product_families_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT product_families_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: product_faqs product_faqs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_faqs
    ADD CONSTRAINT product_faqs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_media_links product_media_links_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE CASCADE;


--
-- Name: product_media_links product_media_links_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_specs product_specs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.product_specs
    ADD CONSTRAINT product_specs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.product_families(id) ON DELETE SET NULL;


--
-- Name: products products_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: support_channels support_channels_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeddgwapz
--

ALTER TABLE ONLY public.support_channels
    ADD CONSTRAINT support_channels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Jw0SGdlTPDZkCAGdqbZ01RgGq9RhDOPueJKDhhQQwKZoDnqWbpgqAEmWg8MZ2uN

