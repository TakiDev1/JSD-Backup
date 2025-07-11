--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

-- Started on 2025-06-25 12:34:01 UTC

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

DROP DATABASE IF EXISTS neondb;
--
-- TOC entry 3547 (class 1262 OID 16389)
-- Name: neondb; Type: DATABASE; Schema: -; Owner: neondb_owner
--

CREATE DATABASE neondb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE neondb OWNER TO neondb_owner;

\connect neondb

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 24577)
-- Name: admin_activity_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_activity_log (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    details text,
    ip_address text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_activity_log OWNER TO neondb_owner;

--
-- TOC entry 215 (class 1259 OID 24576)
-- Name: admin_activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_activity_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_activity_log_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 215
-- Name: admin_activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_activity_log_id_seq OWNED BY public.admin_activity_log.id;


--
-- TOC entry 218 (class 1259 OID 24587)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    mod_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cart_items OWNER TO neondb_owner;

--
-- TOC entry 217 (class 1259 OID 24586)
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 217
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- TOC entry 220 (class 1259 OID 24595)
-- Name: forum_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0
);


ALTER TABLE public.forum_categories OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 24594)
-- Name: forum_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_categories_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 219
-- Name: forum_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forum_categories_id_seq OWNED BY public.forum_categories.id;


--
-- TOC entry 222 (class 1259 OID 24605)
-- Name: forum_replies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_replies (
    id integer NOT NULL,
    thread_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.forum_replies OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 24604)
-- Name: forum_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_replies_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 221
-- Name: forum_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forum_replies_id_seq OWNED BY public.forum_replies.id;


--
-- TOC entry 224 (class 1259 OID 24616)
-- Name: forum_threads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_threads (
    id integer NOT NULL,
    category_id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    reply_count integer DEFAULT 0
);


ALTER TABLE public.forum_threads OWNER TO neondb_owner;

--
-- TOC entry 223 (class 1259 OID 24615)
-- Name: forum_threads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_threads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_threads_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 223
-- Name: forum_threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forum_threads_id_seq OWNED BY public.forum_threads.id;


--
-- TOC entry 238 (class 1259 OID 40961)
-- Name: mod_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mod_images (
    id integer NOT NULL,
    mod_id integer NOT NULL,
    image_url text NOT NULL,
    sort_order integer DEFAULT 0,
    caption text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mod_images OWNER TO neondb_owner;

--
-- TOC entry 237 (class 1259 OID 40960)
-- Name: mod_images_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.mod_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mod_images_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 237
-- Name: mod_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.mod_images_id_seq OWNED BY public.mod_images.id;


--
-- TOC entry 240 (class 1259 OID 40972)
-- Name: mod_requirements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mod_requirements (
    id integer NOT NULL,
    mod_id integer NOT NULL,
    requirement text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mod_requirements OWNER TO neondb_owner;

--
-- TOC entry 239 (class 1259 OID 40971)
-- Name: mod_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.mod_requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mod_requirements_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 239
-- Name: mod_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.mod_requirements_id_seq OWNED BY public.mod_requirements.id;


--
-- TOC entry 226 (class 1259 OID 24630)
-- Name: mod_versions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mod_versions (
    id integer NOT NULL,
    mod_id integer NOT NULL,
    version text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    changelog text,
    is_latest boolean DEFAULT true,
    release_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mod_versions OWNER TO neondb_owner;

--
-- TOC entry 225 (class 1259 OID 24629)
-- Name: mod_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.mod_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mod_versions_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 225
-- Name: mod_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.mod_versions_id_seq OWNED BY public.mod_versions.id;


--
-- TOC entry 228 (class 1259 OID 24641)
-- Name: mods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.mods (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    discount_price double precision,
    preview_image_url text,
    download_url text,
    category text NOT NULL,
    tags json DEFAULT '[]'::json,
    is_featured boolean DEFAULT false,
    download_count integer DEFAULT 0,
    average_rating double precision DEFAULT 0,
    is_subscription_only boolean DEFAULT false,
    version text DEFAULT '1.0.0'::text,
    release_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    features json DEFAULT '[]'::json,
    is_published boolean DEFAULT false,
    changelog text DEFAULT ''::text
);


ALTER TABLE public.mods OWNER TO neondb_owner;

--
-- TOC entry 227 (class 1259 OID 24640)
-- Name: mods_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.mods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mods_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 227
-- Name: mods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.mods_id_seq OWNED BY public.mods.id;


--
-- TOC entry 242 (class 1259 OID 40982)
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- TOC entry 241 (class 1259 OID 40981)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 241
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 230 (class 1259 OID 24658)
-- Name: purchases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    user_id integer NOT NULL,
    mod_id integer NOT NULL,
    transaction_id text NOT NULL,
    stripe_payment_intent_id text,
    price double precision NOT NULL,
    status text DEFAULT 'completed'::text,
    purchase_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchases OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 24657)
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3559 (class 0 OID 0)
-- Dependencies: 229
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- TOC entry 232 (class 1259 OID 24669)
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    mod_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 24668)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3560 (class 0 OID 0)
-- Dependencies: 231
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 243 (class 1259 OID 65536)
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- TOC entry 234 (class 1259 OID 24680)
-- Name: site_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.site_settings OWNER TO neondb_owner;

--
-- TOC entry 233 (class 1259 OID 24679)
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3561 (class 0 OID 0)
-- Dependencies: 233
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- TOC entry 247 (class 1259 OID 65561)
-- Name: subscription_benefits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscription_benefits (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_benefits OWNER TO neondb_owner;

--
-- TOC entry 246 (class 1259 OID 65560)
-- Name: subscription_benefits_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscription_benefits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_benefits_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3562 (class 0 OID 0)
-- Dependencies: 246
-- Name: subscription_benefits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscription_benefits_id_seq OWNED BY public.subscription_benefits.id;


--
-- TOC entry 245 (class 1259 OID 65545)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "interval" text DEFAULT 'month'::text NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    stripe_price_id text,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO neondb_owner;

--
-- TOC entry 244 (class 1259 OID 65544)
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3563 (class 0 OID 0)
-- Dependencies: 244
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- TOC entry 236 (class 1259 OID 24692)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text,
    discord_id text,
    discord_username text,
    discord_avatar text,
    stripe_customer_id text,
    stripe_subscription_id text,
    is_admin boolean DEFAULT false,
    is_premium boolean DEFAULT false,
    is_banned boolean DEFAULT false,
    patreon_id text,
    patreon_tier text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone,
    password text,
    premium_expires_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 235 (class 1259 OID 24691)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3564 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3259 (class 2604 OID 24580)
-- Name: admin_activity_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_activity_log ALTER COLUMN id SET DEFAULT nextval('public.admin_activity_log_id_seq'::regclass);


--
-- TOC entry 3261 (class 2604 OID 24590)
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- TOC entry 3263 (class 2604 OID 24598)
-- Name: forum_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_categories ALTER COLUMN id SET DEFAULT nextval('public.forum_categories_id_seq'::regclass);


--
-- TOC entry 3265 (class 2604 OID 24608)
-- Name: forum_replies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies ALTER COLUMN id SET DEFAULT nextval('public.forum_replies_id_seq'::regclass);


--
-- TOC entry 3268 (class 2604 OID 24619)
-- Name: forum_threads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_threads ALTER COLUMN id SET DEFAULT nextval('public.forum_threads_id_seq'::regclass);


--
-- TOC entry 3303 (class 2604 OID 40964)
-- Name: mod_images id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mod_images ALTER COLUMN id SET DEFAULT nextval('public.mod_images_id_seq'::regclass);


--
-- TOC entry 3306 (class 2604 OID 40975)
-- Name: mod_requirements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mod_requirements ALTER COLUMN id SET DEFAULT nextval('public.mod_requirements_id_seq'::regclass);


--
-- TOC entry 3275 (class 2604 OID 24633)
-- Name: mod_versions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mod_versions ALTER COLUMN id SET DEFAULT nextval('public.mod_versions_id_seq'::regclass);


--
-- TOC entry 3278 (class 2604 OID 24644)
-- Name: mods id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mods ALTER COLUMN id SET DEFAULT nextval('public.mods_id_seq'::regclass);


--
-- TOC entry 3308 (class 2604 OID 40985)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3290 (class 2604 OID 24661)
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- TOC entry 3293 (class 2604 OID 24672)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 3296 (class 2604 OID 24683)
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- TOC entry 3320 (class 2604 OID 65564)
-- Name: subscription_benefits id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_benefits ALTER COLUMN id SET DEFAULT nextval('public.subscription_benefits_id_seq'::regclass);


--
-- TOC entry 3312 (class 2604 OID 65548)
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- TOC entry 3298 (class 2604 OID 24695)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3510 (class 0 OID 24577)
-- Dependencies: 216
-- Data for Name: admin_activity_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

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

COPY public.cart_items (id, user_id, mod_id, added_at) FROM stdin;
1	3	25	2025-04-26 06:43:34.665
4	15	26	2025-06-17 02:34:12.144
\.


--
-- TOC entry 3514 (class 0 OID 24595)
-- Dependencies: 220
-- Data for Name: forum_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_categories (id, name, description, "order") FROM stdin;
1	Announcements	Official announcements from the JSD team	1
2	General Discussion	Talk about anything related to BeamNG mods	2
3	Mod Support	Get help with installing and using mods	3
4	Modding Tutorials	Tutorials and guides for creating your own mods	4
5	Showcase	Show off your mods and creations	5
\.


--
-- TOC entry 3516 (class 0 OID 24605)
-- Dependencies: 222
-- Data for Name: forum_replies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_replies (id, thread_id, user_id, content, created_at, updated_at) FROM stdin;
1	1	4	This is fantastic news! I've been following JSD's work on YouTube for ages and can't wait to try out these mods. The quality of your work has always been impressive. Are there any plans to release that drift Pessima you showcased last month?	2025-03-18 10:13:50.505	2025-03-18 10:13:50.505
2	1	5	Congrats on the launch! The site looks amazing. I've already picked up the offroad package and it's working flawlessly. The physics tuning is spot on - feels much more realistic than other mods I've tried.	2025-03-19 01:13:50.505	2025-03-19 01:13:50.505
3	1	1	Thanks for the kind words everyone! We're really excited about the launch. To answer your question about the drift Pessima - yes, it's coming very soon. We're just finalizing some suspension tuning to make sure the handling is perfect before release. Keep an eye on the Showcase section!	2025-03-19 04:13:50.505	2025-03-19 04:13:50.505
4	1	6	Just subscribed to premium and downloaded the exclusive Rally X mod. Absolutely blown away by the detail and handling! Worth every penny. The customization options are insane too - spent hours just tweaking setups.	2025-03-19 16:13:50.505	2025-03-19 16:13:50.505
5	2	7	This is a much-needed feature! Will definitely help separate the quality mods from the mediocre ones. Is there a way to sort by highest rated on the browse page?	2025-04-16 12:13:50.505	2025-04-16 12:13:50.505
6	2	2	Yes, we've added sorting by rating on the browse page! You can find it in the dropdown menu at the top of the listings. We're also planning to add a 'Top Rated' section to the homepage in the next update.	2025-04-19 02:13:50.505	2025-04-19 02:13:50.505
7	2	8	Left my first review on the Sunburst Drift mod. The system is really straightforward to use. One suggestion though - maybe add the ability to include screenshots in reviews? Would be helpful to show specific features or issues.	2025-04-17 22:13:50.505	2025-04-17 22:13:50.505
8	3	9	Thanks for the heads up. Will this affect users in different time zones or is it strictly during the times mentioned?	2025-03-15 11:13:50.505	2025-03-15 11:13:50.505
9	3	3	The maintenance will only happen during the specified UTC time frame. We chose this timing as it's typically when we have the lowest user activity globally. All services should be back to normal after 5:00 AM UTC.	2025-03-16 23:13:50.505	2025-03-16 23:13:50.505
10	4	3	This error usually means you need the latest Racing Parts Pack to use the Pessima Racing Edition. It's a separate download in your mod locker that contains shared assets used by several racing mods. Once you install both, it should work fine!	2025-04-25 03:13:50.505	2025-04-25 03:13:50.505
11	4	4	That worked perfectly! I didn't realize there was a core racing pack needed. Maybe this could be made clearer on the mod page? Anyway, thanks for the quick help!	2025-04-24 18:13:50.505	2025-04-24 18:13:50.505
12	4	3	Glad it worked! You're right about making the dependencies clearer - we'll update the product pages to show required core packs more prominently. Thanks for the feedback!	2025-04-24 03:13:50.505	2025-04-24 03:13:50.505
13	5	10	For manual installation, you need to extract the .zip files to your BeamNG mods folder. On Windows, it's usually at: C:\\Users\\YourUsername\\AppData\\Local\\BeamNG.drive\\0.26\\mods\n\nMake sure each mod has its own subfolder with the proper structure. The game should detect them next time you launch it.	2025-04-22 11:13:50.505	2025-04-22 11:13:50.505
14	5	5	Found it! Thanks for the help. For anyone else having this issue, you might need to create the mods folder if it doesn't exist yet. Everything's working perfectly now.	2025-04-23 20:13:50.505	2025-04-23 20:13:50.505
15	6	2	Sorry to hear you're having trouble with your subscription! I've checked your order number and the payment is indeed showing as pending in our system. This sometimes happens due to bank processing delays. I've manually activated your premium subscription now, so you should have full access. Please log out and back in to see the changes. Let me know if you have any further issues!	2025-03-06 16:13:50.505	2025-03-06 16:13:50.505
16	6	6	That fixed it! I can now access all the premium content. Thanks for the quick response and resolution!	2025-03-06 12:13:50.505	2025-03-06 12:13:50.505
17	7	11	I'm absolutely loving the Offroad Monster truck! The suspension articulation is incredible - you can crawl over almost anything. Plus, the detailed undercarriage with all the driveshafts and differentials visible is a nice touch. Worth every penny.	2025-03-09 03:13:50.505	2025-03-09 03:13:50.505
18	7	12	For me it's got to be the Compact Rally. It's not as flashy as some of the other mods, but the handling model is just perfect. Feels exactly like throwing around a 90s rally car, especially on gravel. The different setup options for tarmac vs dirt are super well implemented too.	2025-03-07 23:13:50.505	2025-03-07 23:13:50.505
19	7	7	The Compact Rally is definitely on my wishlist! I've seen some great videos of it in action. Has anyone tried the Hotrod V8? I'm curious if the engine sound is as good as it looks in the preview.	2025-03-08 21:13:50.505	2025-03-08 21:13:50.505
20	7	5	I've got the Hotrod V8 and can confirm the sound design is exceptional. They must have recorded a real engine because the idle rumble and high RPM roar are spot on. It's also got different exhaust options that actually change the sound profile. My only complaint is that it's a bit too tail-happy on keyboard controls, but with a wheel it's manageable.	2025-03-08 03:13:50.505	2025-03-08 03:13:50.505
21	8	1	We're definitely planning to expand into more track content! We have a mountain touge course in development right now that should be ready in about a month. It's inspired by Japanese mountain passes with tight hairpins and technical sections.\n\nWe're also working on a large airport/industrial area that can be configured for drift events, time attack, or drag racing. If there are specific types of environments you'd like to see, please let us know!	2025-04-04 16:13:50.505	2025-04-04 16:13:50.505
22	8	8	That sounds amazing! I'd love to see a dedicated rallycross track with mixed surfaces. Something with jumps, water splashes, and alternating tarmac/dirt sections would be perfect for testing the rally cars.	2025-04-03 15:13:50.505	2025-04-03 15:13:50.505
23	8	9	I'd pay good money for a proper recreation of some iconic real-world tracks. Something like Pikes Peak or Goodwood would be incredible for testing hillclimb builds.	2025-04-05 12:13:50.505	2025-04-05 12:13:50.505
24	9	6	Here's my JSD Velocity X on the coastal highway! [imagine a screenshot was linked here] The aerodynamic parts kit totally transforms the look. I'm running the Stage 3 performance package and it absolutely flies.	2025-03-10 20:13:50.505	2025-03-10 20:13:50.505
25	9	10	Check out this action shot of the Trophy Truck mid-jump! [imagine a screenshot was linked here] The suspension travel is incredible, landed this perfectly from about 30 feet up and kept going. The desert map is perfect for this beast.	2025-03-10 12:13:50.505	2025-03-10 12:13:50.505
26	9	9	Those are awesome shots! The Trophy Truck looks insane in mid-air. Here's another one of my Bandit at sunset with the new light bar mod: [imagine a screenshot was linked here] The volumetric dust effects really add to the atmosphere.	2025-03-09 17:13:50.505	2025-03-09 17:13:50.505
27	10	5	I would absolutely buy this! Kei cars are so underrepresented in racing games despite being super fun to drive. The tiny wheelbase and limited power makes them really rewarding when you get the most out of them.	2025-03-01 05:13:50.505	2025-03-01 05:13:50.505
28	10	2	Thanks for the suggestion! We've actually been considering a 90s Japanese Kei sports car for our next project. It's great to see there's interest in this. Would you prefer a more stock-focused accurate reproduction, or something with lots of modification options for engine swaps and wider body kits?	2025-02-27 16:13:50.505	2025-02-27 16:13:50.505
29	10	10	Personally, I'd love to see both! Start with an historically accurate base model that captures the essence of these quirky cars, but then also include some wild modification options. Part of the appeal of Kei cars is how people modify them far beyond their original specs while keeping the compact dimensions.	2025-02-28 03:13:50.505	2025-02-28 03:13:50.505
30	10	11	Another vote for this! I'd especially love to see some of the quirky features these cars had - like the Cappuccino's removable roof panels that could be stored in the trunk. The engineering that went into these tiny powerhouses is fascinating.	2025-03-02 03:13:50.505	2025-03-02 03:13:50.505
31	11	8	I've been wanting a proper muscle car pack for ages! Especially interested in seeing some Mopar representation - a good Challenger or Charger equivalent would be amazing. With authentic V8 sounds and visual customization options, this would be an instant buy.	2025-04-23 04:13:50.505	2025-04-23 04:13:50.505
32	11	1	We're definitely interested in creating some American muscle! It's a bit challenging to get the suspension dynamics right since these cars handle so differently from modern vehicles, but we're up for the challenge. I've added this to our development roadmap to explore after our current projects are complete. Thanks for the suggestion!	2025-04-22 00:13:50.505	2025-04-22 00:13:50.505
33	12	5	This looks incredible! The suspension travel in that preview video is insane. Will there be different livery options available? And please tell me we can adjust the anti-lag system for those sweet backfires!	2025-04-10 07:13:50.505	2025-04-10 07:13:50.505
34	12	2	Thanks for the excitement! Yes, we'll have 8 different livery options at launch, plus a customizable one where you can change the base colors. And the anti-lag is fully configurable - you can adjust timing, intensity, and even disable it completely if you prefer a cleaner sound. The backfire effects have dynamic lighting too!	2025-04-11 03:13:50.505	2025-04-11 03:13:50.505
35	12	10	Day one purchase for me! Will premium subscribers get any exclusive liveries or parts with this one? The suspension looks perfect for the rally scenarios I like to set up.	2025-04-10 22:13:50.505	2025-04-10 22:13:50.505
36	12	2	Premium subscribers will get an exclusive 'Championship Edition' livery with custom mudflaps and light pod configuration. They'll also receive a tuning preset file that we developed with the help of an actual rally driver for the perfect gravel setup. Hope you enjoy it!	2025-04-10 00:13:50.505	2025-04-10 00:13:50.505
37	13	12	Absolutely beautiful model! The attention to detail on the interior is outstanding. I'm a sucker for classic sports cars with their analog driving feel. Will we be able to toggle between original-spec performance and enhanced modern options?	2025-03-05 01:13:50.505	2025-03-05 01:13:50.505
38	13	1	Thank you for the kind words! Yes, we've implemented a unique system for this car where you can toggle between 'Classic' and 'Restomod' configurations. Classic gives you the authentic 60s driving experience with period-correct limitations, while Restomod maintains the vintage look but with modern suspension geometry, braking performance, and optional engine enhancements. You can even mix and match - like keeping the vintage engine but upgrading the suspension.	2025-03-03 22:13:50.505	2025-03-03 22:13:50.505
39	13	6	The sound in that showcase video is amazing! Did you record an actual vintage engine for this? The exhaust note has that perfect raspy tone that modern cars just don't have.	2025-03-03 12:13:50.505	2025-03-03 12:13:50.505
40	13	1	Good ear! We actually recorded a restored 1967 sports car with a similar engine configuration. We captured dozens of audio samples at different RPMs and load conditions to get that authentic sound. The in-game engine note dynamically changes based on load, RPM, and even exhaust configuration if you modify it.	2025-03-03 21:13:50.505	2025-03-03 21:13:50.505
41	14	12	This is incredibly helpful, thanks! I've been struggling with getting the suspension geometry right on my mod. One question - what's the best approach for modeling anti-roll bars in the Jbeam system? I've tried a few methods but can't get the right balance between roll stiffness and articulation.	2025-03-20 07:13:50.505	2025-03-20 07:13:50.505
42	14	3	Great question about anti-roll bars! The most effective method I've found is to use dedicated anti-roll bar beams with specific spring and damping values, rather than just stiffening the existing suspension beams. This allows for more natural articulation while still controlling body roll.\n\nYou'll want to create beams that connect the left and right suspension components (usually at the control arms) with carefully tuned beam properties. The key parameters to focus on are:\n\n- `springExpansion` and `springCompression`: These control the stiffness of the anti-roll effect\n- `dampExpansion` and `dampCompression`: Keep these relatively low to avoid affecting rapid suspension movements\n\nThe BeamNG Pickup is a good reference model to study - check out its anti-roll bar implementation in the Jbeam files.	2025-03-19 11:13:50.505	2025-03-19 11:13:50.505
43	14	10	I'm having trouble with wheels clipping through fenders during extreme compression. Is there a recommended way to set up collision properly between suspension components and body panels?	2025-03-19 19:13:50.505	2025-03-19 19:13:50.505
44	14	3	For wheel-to-fender collision, you need to ensure you have proper collision triangles defined on both the wheel well and the wheel itself. A common mistake is forgetting to add collision triangles to the inner fender surfaces.\n\nYou can also add 'stopped' beam properties to create hard stops for suspension travel before visual clipping occurs. Look for the `beamPrecompression` and `beamDeform` parameters - these can be tuned to create progressive stiffening as the suspension approaches maximum compression.\n\nIf you're still having issues, check that your wheel collision mesh isn't too simplified. Sometimes adding a few more collision triangles to represent the tire sidewall can solve persistent clipping problems.	2025-03-19 08:13:50.505	2025-03-19 08:13:50.505
45	15	9	I've had good results using a multi-tier LOD system with these general polygon targets:\n\n- Exterior (visible from distance): ~100k polys\n- Engine bay components: ~150k polys combined\n- Interior: ~120k polys\n- Undercarriage: ~80k polys\n\nThe key is being strategic about where you maintain detail. For example, cluster more polygons around complex curves and panel gaps, while simplified flat surfaces. Normal maps are essential for maintaining the appearance of small details like panel stamping and fabric textures.	2025-03-04 08:13:50.505	2025-03-04 08:13:50.505
46	15	3	Great question about optimization! Here's my approach:\n\n1. For mechanical parts like engine components, you can often reduce interior/hidden geometry substantially. Players rarely see the inside of an engine block or transmission case.\n\n2. Use normal maps aggressively for surface details like vents, grilles, and interior textures.\n\n3. For LOD strategy, I recommend 3 levels with approximately 60% and 30% of original poly count. LOD distance in BeamNG is quite generous.\n\n4. Texture resolution matters more than you might think - a well-textured lower-poly model often looks better than a high-poly model with basic textures. 2K textures for exteriors and 1K for smaller parts is usually sufficient.\n\n5. Look for redundant edge loops and n-gons in your model - these are often easy targets for optimization.\n\nHappy to review your model if you want to share some screenshots of the wireframe!	2025-03-04 10:13:50.505	2025-03-04 10:13:50.505
47	15	12	Thank you both for the detailed advice! I've started implementing a more aggressive LOD system and focusing my high-poly detail on the parts that are most visible during gameplay. The normal map suggestion was particularly helpful - I've managed to move a lot of small details like bolts and panel seams to normal maps instead of geometry.\n\nOne follow-up question: for transparent parts like headlights and glass, are there any special considerations for optimization? They seem particularly demanding on performance.	2025-03-02 11:13:50.505	2025-03-02 11:13:50.505
48	15	3	Excellent question about transparent parts! They do require special handling:\n\n1. Transparent materials are indeed more performance-heavy due to the rendering order requirements. Keep polygon count especially low for these parts.\n\n2. For headlights, model only the visible outer lens and reflector in detail. The interior bulb and housing can be much lower poly or even just textured.\n\n3. For glass, avoid double-sided materials when possible. It's better to model thin glass with single-sided faces than use double-sided materials.\n\n4. Limit overlapping transparent layers - each layer of transparency adds rendering cost.\n\n5. For complex headlight assemblies, consider using masked/cutout transparency instead of true transparency for internal details.\n\nImplementing these techniques can significantly improve performance without noticeable visual quality loss.	2025-03-03 05:13:50.505	2025-03-03 05:13:50.505
49	1	4	This is fantastic news! I've been following JSD's work on YouTube for ages and can't wait to try out these mods. The quality of your work has always been impressive. Are there any plans to release that drift Pessima you showcased last month?	2025-03-26 06:19:30.279903	2025-03-26 06:19:30.279903
50	1	5	Congrats on the launch! The site looks amazing. I've already picked up the offroad package and it's working flawlessly. The physics tuning is spot on - feels much more realistic than other mods I've tried.	2025-03-27 06:19:30.279903	2025-03-27 06:19:30.279903
51	1	1	Thanks for the kind words everyone! We're really excited about the launch. To answer your question about the drift Pessima - yes, it's coming very soon. We're just finalizing some suspension tuning to make sure the handling is perfect before release. Keep an eye on the Showcase section!	2025-03-28 06:19:30.279903	2025-03-28 06:19:30.279903
52	1	6	Just subscribed to premium and downloaded the exclusive Rally X mod. Absolutely blown away by the detail and handling! Worth every penny. The customization options are insane too - spent hours just tweaking setups.	2025-03-30 06:19:30.279903	2025-03-30 06:19:30.279903
53	2	7	This is a much-needed feature! Will definitely help separate the quality mods from the mediocre ones. Is there a way to sort by highest rated on the browse page?	2025-04-10 06:19:30.279903	2025-04-10 06:19:30.279903
54	2	2	Yes, we've added sorting by rating on the browse page! You can find it in the dropdown menu at the top of the listings. We're also planning to add a 'Top Rated' section to the homepage in the next update.	2025-04-11 06:19:30.279903	2025-04-11 06:19:30.279903
55	2	8	Left my first review on the Sunburst Drift mod. The system is really straightforward to use. One suggestion though - maybe add the ability to include screenshots in reviews? Would be helpful to show specific features or issues.	2025-04-14 06:19:30.279903	2025-04-14 06:19:30.279903
56	3	9	Thanks for the heads up. Will this affect users in different time zones or is it strictly during the times mentioned?	2025-04-17 06:19:30.279903	2025-04-17 06:19:30.279903
57	3	3	The maintenance will only happen during the specified UTC time frame. We chose this timing as it's typically when we have the lowest user activity globally. All services should be back to normal after 5:00 AM UTC.	2025-04-17 06:19:30.279903	2025-04-17 06:19:30.279903
58	4	3	This error usually means you need the latest Racing Parts Pack to use the Pessima Racing Edition. It's a separate download in your mod locker that contains shared assets used by several racing mods. Once you install both, it should work fine!	2025-04-10 06:19:30.279903	2025-04-10 06:19:30.279903
59	4	4	That worked perfectly! I didn't realize there was a core racing pack needed. Maybe this could be made clearer on the mod page? Anyway, thanks for the quick help!	2025-04-11 06:19:30.279903	2025-04-11 06:19:30.279903
60	4	3	Glad it worked! You're right about making the dependencies clearer - we'll update the product pages to show required core packs more prominently. Thanks for the feedback!	2025-04-11 06:19:30.279903	2025-04-11 06:19:30.279903
61	5	10	For manual installation, you need to extract the .zip files to your BeamNG mods folder. On Windows, it's usually at: C:\\\\Users\\\\YourUsername\\\\AppData\\\\Local\\\\BeamNG.drive\\\\0.26\\\\mods\\n\\nMake sure each mod has its own subfolder with the proper structure. The game should detect them next time you launch it.	2025-04-14 06:19:30.279903	2025-04-14 06:19:30.279903
62	5	5	Found it! Thanks for the help. For anyone else having this issue, you might need to create the mods folder if it doesn't exist yet. Everything's working perfectly now.	2025-04-15 06:19:30.279903	2025-04-15 06:19:30.279903
63	6	2	Sorry to hear you're having trouble with your subscription! I've checked your order number and the payment is indeed showing as pending in our system. This sometimes happens due to bank processing delays. I've manually activated your premium subscription now, so you should have full access. Please log out and back in to see the changes. Let me know if you have any further issues!	2025-04-21 06:19:30.279903	2025-04-21 06:19:30.279903
64	6	6	That fixed it! I can now access all the premium content. Thanks for the quick response and resolution!	2025-04-22 06:19:30.279903	2025-04-22 06:19:30.279903
65	7	11	I'm absolutely loving the Offroad Monster truck! The suspension articulation is incredible - you can crawl over almost anything. Plus, the detailed undercarriage with all the driveshafts and differentials visible is a nice touch. Worth every penny.	2025-03-31 06:19:30.279903	2025-03-31 06:19:30.279903
66	7	12	For me it's got to be the Compact Rally. It's not as flashy as some of the other mods, but the handling model is just perfect. Feels exactly like throwing around a 90s rally car, especially on gravel. The different setup options for tarmac vs dirt are super well implemented too.	2025-04-01 06:19:30.279903	2025-04-01 06:19:30.279903
67	7	7	The Compact Rally is definitely on my wishlist! I've seen some great videos of it in action. Has anyone tried the Hotrod V8? I'm curious if the engine sound is as good as it looks in the preview.	2025-04-02 06:19:30.279903	2025-04-02 06:19:30.279903
68	7	5	I've got the Hotrod V8 and can confirm the sound design is exceptional. They must have recorded a real engine because the idle rumble and high RPM roar are spot on. It's also got different exhaust options that actually change the sound profile. My only complaint is that it's a bit too tail-happy on keyboard controls, but with a wheel it's manageable.	2025-04-04 06:19:30.279903	2025-04-04 06:19:30.279903
69	8	1	We're definitely planning to expand into more track content! We have a mountain touge course in development right now that should be ready in about a month. It's inspired by Japanese mountain passes with tight hairpins and technical sections.\\n\\nWe're also working on a large airport/industrial area that can be configured for drift events, time attack, or drag racing. If there are specific types of environments you'd like to see, please let us know!	2025-04-13 06:19:30.279903	2025-04-13 06:19:30.279903
70	8	8	That sounds amazing! I'd love to see a dedicated rallycross track with mixed surfaces. Something with jumps, water splashes, and alternating tarmac/dirt sections would be perfect for testing the rally cars.	2025-04-14 06:19:30.279903	2025-04-14 06:19:30.279903
71	8	9	I'd pay good money for a proper recreation of some iconic real-world tracks. Something like Pikes Peak or Goodwood would be incredible for testing hillclimb builds.	2025-04-16 06:19:30.279903	2025-04-16 06:19:30.279903
72	9	6	Here's my JSD Velocity X on the coastal highway! [imagine a screenshot was linked here] The aerodynamic parts kit totally transforms the look. I'm running the Stage 3 performance package and it absolutely flies.	2025-04-07 06:19:30.279903	2025-04-07 06:19:30.279903
73	9	10	Check out this action shot of the Trophy Truck mid-jump! [imagine a screenshot was linked here] The suspension travel is incredible, landed this perfectly from about 30 feet up and kept going. The desert map is perfect for this beast.	2025-04-14 06:19:30.279903	2025-04-14 06:19:30.279903
74	9	9	Those are awesome shots! The Trophy Truck looks insane in mid-air. Here's another one of my Bandit at sunset with the new light bar mod: [imagine a screenshot was linked here] The volumetric dust effects really add to the atmosphere.	2025-04-22 06:19:30.279903	2025-04-22 06:19:30.279903
75	10	5	I would absolutely buy this! Kei cars are so underrepresented in racing games despite being super fun to drive. The tiny wheelbase and limited power makes them really rewarding when you get the most out of them.	2025-04-03 06:19:30.279903	2025-04-03 06:19:30.279903
76	10	2	Thanks for the suggestion! We've actually been considering a 90s Japanese Kei sports car for our next project. It's great to see there's interest in this. Would you prefer a more stock-focused accurate reproduction, or something with lots of modification options for engine swaps and wider body kits?	2025-04-05 06:19:30.279903	2025-04-05 06:19:30.279903
77	10	10	Personally, I'd love to see both! Start with an historically accurate base model that captures the essence of these quirky cars, but then also include some wild modification options. Part of the appeal of Kei cars is how people modify them far beyond their original specs while keeping the compact dimensions.	2025-04-06 06:19:30.279903	2025-04-06 06:19:30.279903
78	10	11	Another vote for this! I'd especially love to see some of the quirky features these cars had - like the Cappuccino's removable roof panels that could be stored in the trunk. The engineering that went into these tiny powerhouses is fascinating.	2025-04-09 06:19:30.279903	2025-04-09 06:19:30.279903
79	11	8	I've been wanting a proper muscle car pack for ages! Especially interested in seeing some Mopar representation - a good Challenger or Charger equivalent would be amazing. With authentic V8 sounds and visual customization options, this would be an instant buy.	2025-04-09 06:19:30.279903	2025-04-09 06:19:30.279903
80	11	1	We're definitely interested in creating some American muscle! It's a bit challenging to get the suspension dynamics right since these cars handle so differently from modern vehicles, but we're up for the challenge. I've added this to our development roadmap to explore after our current projects are complete. Thanks for the suggestion!	2025-04-10 06:19:30.279903	2025-04-10 06:19:30.279903
81	12	5	This looks incredible! The suspension travel in that preview video is insane. Will there be different livery options available? And please tell me we can adjust the anti-lag system for those sweet backfires!	2025-04-15 06:19:30.279903	2025-04-15 06:19:30.279903
82	12	2	Thanks for the excitement! Yes, we'll have 8 different livery options at launch, plus a customizable one where you can change the base colors. And the anti-lag is fully configurable - you can adjust timing, intensity, and even disable it completely if you prefer a cleaner sound. The backfire effects have dynamic lighting too!	2025-04-15 06:19:30.279903	2025-04-15 06:19:30.279903
83	12	10	Day one purchase for me! Will premium subscribers get any exclusive liveries or parts with this one? The suspension looks perfect for the rally scenarios I like to set up.	2025-04-17 06:19:30.279903	2025-04-17 06:19:30.279903
84	12	2	Premium subscribers will get an exclusive 'Championship Edition' livery with custom mudflaps and light pod configuration. They'll also receive a tuning preset file that we developed with the help of an actual rally driver for the perfect gravel setup. Hope you enjoy it!	2025-04-19 06:19:30.279903	2025-04-19 06:19:30.279903
85	13	12	Absolutely beautiful model! The attention to detail on the interior is outstanding. I'm a sucker for classic sports cars with their analog driving feel. Will we be able to toggle between original-spec performance and enhanced modern options?	2025-04-17 06:19:30.279903	2025-04-17 06:19:30.279903
86	13	1	Thank you for the kind words! Yes, we've implemented a unique system for this car where you can toggle between 'Classic' and 'Restomod' configurations. Classic gives you the authentic 60s driving experience with period-correct limitations, while Restomod maintains the vintage look but with modern suspension geometry, braking performance, and optional engine enhancements. You can even mix and match - like keeping the vintage engine but upgrading the suspension.	2025-04-17 06:19:30.279903	2025-04-17 06:19:30.279903
87	13	6	The sound in that showcase video is amazing! Did you record an actual vintage engine for this? The exhaust note has that perfect raspy tone that modern cars just don't have.	2025-04-19 06:19:30.279903	2025-04-19 06:19:30.279903
88	13	1	Good ear! We actually recorded a restored 1967 sports car with a similar engine configuration. We captured dozens of audio samples at different RPMs and load conditions to get that authentic sound. The in-game engine note dynamically changes based on load, RPM, and even exhaust configuration if you modify it.	2025-04-21 06:19:30.279903	2025-04-21 06:19:30.279903
89	14	12	This is incredibly helpful, thanks! I've been struggling with getting the suspension geometry right on my mod. One question - what's the best approach for modeling anti-roll bars in the Jbeam system? I've tried a few methods but can't get the right balance between roll stiffness and articulation.	2025-03-11 06:19:30.279903	2025-03-11 06:19:30.279903
90	14	3	Great question about anti-roll bars! The most effective method I've found is to use dedicated anti-roll bar beams with specific spring and damping values, rather than just stiffening the existing suspension beams. This allows for more natural articulation while still controlling body roll.\n\nYou'll want to create beams that connect the left and right suspension components (usually at the control arms) with carefully tuned beam properties. The key parameters to focus on are:\n\n- `springExpansion` and `springCompression`: These control the stiffness of the anti-roll effect\n- `dampExpansion` and `dampCompression`: Keep these relatively low to avoid affecting rapid suspension movements\n\nThe BeamNG Pickup is a good reference model to study - check out its anti-roll bar implementation in the Jbeam files.	2025-03-12 06:19:30.279903	2025-03-12 06:19:30.279903
91	14	10	I'm having trouble with wheels clipping through fenders during extreme compression. Is there a recommended way to set up collision properly between suspension components and body panels?	2025-03-15 06:19:30.279903	2025-03-15 06:19:30.279903
92	14	3	For wheel-to-fender collision, you need to ensure you have proper collision triangles defined on both the wheel well and the wheel itself. A common mistake is forgetting to add collision triangles to the inner fender surfaces.\n\nYou can also add 'stopped' beam properties to create hard stops for suspension travel before visual clipping occurs. Look for the `beamPrecompression` and `beamDeform` parameters - these can be tuned to create progressive stiffening as the suspension approaches maximum compression.\n\nIf you're still having issues, check that your wheel collision mesh isn't too simplified. Sometimes adding a few more collision triangles to represent the tire sidewall can solve persistent clipping problems.	2025-03-20 06:19:30.279903	2025-03-20 06:19:30.279903
93	15	9	I've had good results using a multi-tier LOD system with these general polygon targets:\n\n- Exterior (visible from distance): ~100k polys\n- Engine bay components: ~150k polys combined\n- Interior: ~120k polys\n- Undercarriage: ~80k polys\n\nThe key is being strategic about where you maintain detail. For example, cluster more polygons around complex curves and panel gaps, while simplified flat surfaces. Normal maps are essential for maintaining the appearance of small details like panel stamping and fabric textures.	2025-04-18 06:19:30.279903	2025-04-18 06:19:30.279903
94	15	3	Great question about optimization! Here's my approach:\n\n1. For mechanical parts like engine components, you can often reduce interior/hidden geometry substantially. Players rarely see the inside of an engine block or transmission case.\n\n2. Use normal maps aggressively for surface details like vents, grilles, and interior textures.\n\n3. For LOD strategy, I recommend 3 levels with approximately 60% and 30% of original poly count. LOD distance in BeamNG is quite generous.\n\n4. Texture resolution matters more than you might think - a well-textured lower-poly model often looks better than a high-poly model with basic textures. 2K textures for exteriors and 1K for smaller parts is usually sufficient.\n\n5. Look for redundant edge loops and n-gons in your model - these are often easy targets for optimization.\n\nHappy to review your model if you want to share some screenshots of the wireframe!	2025-04-19 06:19:30.279903	2025-04-19 06:19:30.279903
95	15	12	Thank you both for the detailed advice! I've started implementing a more aggressive LOD system and focusing my high-poly detail on the parts that are most visible during gameplay. The normal map suggestion was particularly helpful - I've managed to move a lot of small details like bolts and panel seams to normal maps instead of geometry.\n\nOne follow-up question: for transparent parts like headlights and glass, are there any special considerations for optimization? They seem particularly demanding on performance.	2025-04-21 06:19:30.279903	2025-04-21 06:19:30.279903
96	15	3	Excellent question about transparent parts! They do require special handling:\n\n1. Transparent materials are indeed more performance-heavy due to the rendering order requirements. Keep polygon count especially low for these parts.\n\n2. For headlights, model only the visible outer lens and reflector in detail. The interior bulb and housing can be much lower poly or even just textured.\n\n3. For glass, avoid double-sided materials when possible. It's better to model thin glass with single-sided faces than use double-sided materials.\n\n4. Limit overlapping transparent layers - each layer of transparency adds rendering cost.\n\n5. For complex headlight assemblies, consider using masked/cutout transparency instead of true transparency for internal details.\n\nImplementing these techniques can significantly improve performance without noticeable visual quality loss.	2025-04-22 06:19:30.279903	2025-04-22 06:19:30.279903
97	1	4	This is fantastic news! I've been following JSD's work on YouTube for ages and can't wait to try out these mods. The quality of your work has always been impressive. Are there any plans to release that drift Pessima you showcased last month?	2025-03-26 06:23:16.140811	2025-03-26 06:23:16.140811
98	1	5	Congrats on the launch! The site looks amazing. I've already picked up the offroad package and it's working flawlessly. The physics tuning is spot on - feels much more realistic than other mods I've tried.	2025-03-27 06:23:16.140811	2025-03-27 06:23:16.140811
99	1	1	Thanks for the kind words everyone! We're really excited about the launch. To answer your question about the drift Pessima - yes, it's coming very soon. We're just finalizing some suspension tuning to make sure the handling is perfect before release. Keep an eye on the Showcase section!	2025-03-28 06:23:16.140811	2025-03-28 06:23:16.140811
100	1	6	Just subscribed to premium and downloaded the exclusive Rally X mod. Absolutely blown away by the detail and handling! Worth every penny. The customization options are insane too - spent hours just tweaking setups.	2025-03-30 06:23:16.140811	2025-03-30 06:23:16.140811
101	2	7	This is a much-needed feature! Will definitely help separate the quality mods from the mediocre ones. Is there a way to sort by highest rated on the browse page?	2025-04-10 06:23:16.140811	2025-04-10 06:23:16.140811
102	2	2	Yes, we've added sorting by rating on the browse page! You can find it in the dropdown menu at the top of the listings. We're also planning to add a 'Top Rated' section to the homepage in the next update.	2025-04-11 06:23:16.140811	2025-04-11 06:23:16.140811
103	2	8	Left my first review on the Sunburst Drift mod. The system is really straightforward to use. One suggestion though - maybe add the ability to include screenshots in reviews? Would be helpful to show specific features or issues.	2025-04-14 06:23:16.140811	2025-04-14 06:23:16.140811
104	3	9	Thanks for the heads up. Will this affect users in different time zones or is it strictly during the times mentioned?	2025-04-17 06:23:16.140811	2025-04-17 06:23:16.140811
105	3	3	The maintenance will only happen during the specified UTC time frame. We chose this timing as it's typically when we have the lowest user activity globally. All services should be back to normal after 5:00 AM UTC.	2025-04-17 06:23:16.140811	2025-04-17 06:23:16.140811
106	4	3	This error usually means you need the latest Racing Parts Pack to use the Pessima Racing Edition. It's a separate download in your mod locker that contains shared assets used by several racing mods. Once you install both, it should work fine!	2025-04-10 06:23:54.827225	2025-04-10 06:23:54.827225
107	4	4	That worked perfectly! I didn't realize there was a core racing pack needed. Maybe this could be made clearer on the mod page? Anyway, thanks for the quick help!	2025-04-11 06:23:54.827225	2025-04-11 06:23:54.827225
108	4	3	Glad it worked! You're right about making the dependencies clearer - we'll update the product pages to show required core packs more prominently. Thanks for the feedback!	2025-04-11 06:23:54.827225	2025-04-11 06:23:54.827225
109	5	10	For manual installation, you need to extract the .zip files to your BeamNG mods folder. On Windows, it's usually at: C:\\\\Users\\\\YourUsername\\\\AppData\\\\Local\\\\BeamNG.drive\\\\0.26\\\\mods\\n\\nMake sure each mod has its own subfolder with the proper structure. The game should detect them next time you launch it.	2025-04-14 06:23:54.827225	2025-04-14 06:23:54.827225
110	5	5	Found it! Thanks for the help. For anyone else having this issue, you might need to create the mods folder if it doesn't exist yet. Everything's working perfectly now.	2025-04-15 06:23:54.827225	2025-04-15 06:23:54.827225
111	6	2	Sorry to hear you're having trouble with your subscription! I've checked your order number and the payment is indeed showing as pending in our system. This sometimes happens due to bank processing delays. I've manually activated your premium subscription now, so you should have full access. Please log out and back in to see the changes. Let me know if you have any further issues!	2025-04-21 06:23:54.827225	2025-04-21 06:23:54.827225
112	6	6	That fixed it! I can now access all the premium content. Thanks for the quick response and resolution!	2025-04-22 06:23:54.827225	2025-04-22 06:23:54.827225
113	7	11	I'm absolutely loving the Offroad Monster truck! The suspension articulation is incredible - you can crawl over almost anything. Plus, the detailed undercarriage with all the driveshafts and differentials visible is a nice touch. Worth every penny.	2025-03-31 06:23:54.827225	2025-03-31 06:23:54.827225
114	7	12	For me it's got to be the Compact Rally. It's not as flashy as some of the other mods, but the handling model is just perfect. Feels exactly like throwing around a 90s rally car, especially on gravel. The different setup options for tarmac vs dirt are super well implemented too.	2025-04-01 06:23:54.827225	2025-04-01 06:23:54.827225
115	7	7	The Compact Rally is definitely on my wishlist! I've seen some great videos of it in action. Has anyone tried the Hotrod V8? I'm curious if the engine sound is as good as it looks in the preview.	2025-04-02 06:24:20.837007	2025-04-02 06:24:20.837007
116	7	5	I've got the Hotrod V8 and can confirm the sound design is exceptional. They must have recorded a real engine because the idle rumble and high RPM roar are spot on. It's also got different exhaust options that actually change the sound profile. My only complaint is that it's a bit too tail-happy on keyboard controls, but with a wheel it's manageable.	2025-04-04 06:24:20.837007	2025-04-04 06:24:20.837007
117	8	1	We're definitely planning to expand into more track content! We have a mountain touge course in development right now that should be ready in about a month. It's inspired by Japanese mountain passes with tight hairpins and technical sections.\\n\\nWe're also working on a large airport/industrial area that can be configured for drift events, time attack, or drag racing. If there are specific types of environments you'd like to see, please let us know!	2025-04-13 06:24:20.837007	2025-04-13 06:24:20.837007
118	8	8	That sounds amazing! I'd love to see a dedicated rallycross track with mixed surfaces. Something with jumps, water splashes, and alternating tarmac/dirt sections would be perfect for testing the rally cars.	2025-04-14 06:24:20.837007	2025-04-14 06:24:20.837007
119	8	9	I'd pay good money for a proper recreation of some iconic real-world tracks. Something like Pikes Peak or Goodwood would be incredible for testing hillclimb builds.	2025-04-16 06:24:20.837007	2025-04-16 06:24:20.837007
120	9	6	Here's my JSD Velocity X on the coastal highway! [imagine a screenshot was linked here] The aerodynamic parts kit totally transforms the look. I'm running the Stage 3 performance package and it absolutely flies.	2025-04-07 06:24:20.837007	2025-04-07 06:24:20.837007
121	9	10	Check out this action shot of the Trophy Truck mid-jump! [imagine a screenshot was linked here] The suspension travel is incredible, landed this perfectly from about 30 feet up and kept going. The desert map is perfect for this beast.	2025-04-14 06:24:20.837007	2025-04-14 06:24:20.837007
122	9	9	Those are awesome shots! The Trophy Truck looks insane in mid-air. Here's another one of my Bandit at sunset with the new light bar mod: [imagine a screenshot was linked here] The volumetric dust effects really add to the atmosphere.	2025-04-22 06:24:20.837007	2025-04-22 06:24:20.837007
123	10	5	I would absolutely buy this! Kei cars are so underrepresented in racing games despite being super fun to drive. The tiny wheelbase and limited power makes them really rewarding when you get the most out of them.	2025-04-03 06:24:57.999857	2025-04-03 06:24:57.999857
124	10	2	Thanks for the suggestion! We've actually been considering a 90s Japanese Kei sports car for our next project. It's great to see there's interest in this. Would you prefer a more stock-focused accurate reproduction, or something with lots of modification options for engine swaps and wider body kits?	2025-04-05 06:24:57.999857	2025-04-05 06:24:57.999857
125	10	10	Personally, I'd love to see both! Start with an historically accurate base model that captures the essence of these quirky cars, but then also include some wild modification options. Part of the appeal of Kei cars is how people modify them far beyond their original specs while keeping the compact dimensions.	2025-04-06 06:24:57.999857	2025-04-06 06:24:57.999857
126	10	11	Another vote for this! I'd especially love to see some of the quirky features these cars had - like the Cappuccino's removable roof panels that could be stored in the trunk. The engineering that went into these tiny powerhouses is fascinating.	2025-04-09 06:24:57.999857	2025-04-09 06:24:57.999857
127	11	8	I've been wanting a proper muscle car pack for ages! Especially interested in seeing some Mopar representation - a good Challenger or Charger equivalent would be amazing. With authentic V8 sounds and visual customization options, this would be an instant buy.	2025-04-09 06:24:57.999857	2025-04-09 06:24:57.999857
128	11	1	We're definitely interested in creating some American muscle! It's a bit challenging to get the suspension dynamics right since these cars handle so differently from modern vehicles, but we're up for the challenge. I've added this to our development roadmap to explore after our current projects are complete. Thanks for the suggestion!	2025-04-10 06:24:57.999857	2025-04-10 06:24:57.999857
129	12	5	This looks incredible! The suspension travel in that preview video is insane. Will there be different livery options available? And please tell me we can adjust the anti-lag system for those sweet backfires!	2025-04-15 06:24:57.999857	2025-04-15 06:24:57.999857
130	12	2	Thanks for the excitement! Yes, we'll have 8 different livery options at launch, plus a customizable one where you can change the base colors. And the anti-lag is fully configurable - you can adjust timing, intensity, and even disable it completely if you prefer a cleaner sound. The backfire effects have dynamic lighting too!	2025-04-15 06:24:57.999857	2025-04-15 06:24:57.999857
131	12	10	Day one purchase for me! Will premium subscribers get any exclusive liveries or parts with this one? The suspension looks perfect for the rally scenarios I like to set up.	2025-04-17 06:24:57.999857	2025-04-17 06:24:57.999857
132	12	2	Premium subscribers will get an exclusive 'Championship Edition' livery with custom mudflaps and light pod configuration. They'll also receive a tuning preset file that we developed with the help of an actual rally driver for the perfect gravel setup. Hope you enjoy it!	2025-04-19 06:24:57.999857	2025-04-19 06:24:57.999857
133	13	12	Absolutely beautiful model! The attention to detail on the interior is outstanding. I'm a sucker for classic sports cars with their analog driving feel. Will we be able to toggle between original-spec performance and enhanced modern options?	2025-04-17 06:24:57.999857	2025-04-17 06:24:57.999857
134	13	1	Thank you for the kind words! Yes, we've implemented a unique system for this car where you can toggle between 'Classic' and 'Restomod' configurations. Classic gives you the authentic 60s driving experience with period-correct limitations, while Restomod maintains the vintage look but with modern suspension geometry, braking performance, and optional engine enhancements. You can even mix and match - like keeping the vintage engine but upgrading the suspension.	2025-04-17 06:24:57.999857	2025-04-17 06:24:57.999857
135	13	6	The sound in that showcase video is amazing! Did you record an actual vintage engine for this? The exhaust note has that perfect raspy tone that modern cars just don't have.	2025-04-19 06:25:47.663378	2025-04-19 06:25:47.663378
136	13	1	Good ear! We actually recorded a restored 1967 sports car with a similar engine configuration. We captured dozens of audio samples at different RPMs and load conditions to get that authentic sound. The in-game engine note dynamically changes based on load, RPM, and even exhaust configuration if you modify it.	2025-04-21 06:25:47.663378	2025-04-21 06:25:47.663378
137	14	12	This is incredibly helpful, thanks! I've been struggling with getting the suspension geometry right on my mod. One question - what's the best approach for modeling anti-roll bars in the Jbeam system? I've tried a few methods but can't get the right balance between roll stiffness and articulation.	2025-03-11 06:25:47.663378	2025-03-11 06:25:47.663378
138	14	3	Great question about anti-roll bars! The most effective method I've found is to use dedicated anti-roll bar beams with specific spring and damping values, rather than just stiffening the existing suspension beams. This allows for more natural articulation while still controlling body roll.\n\nYou'll want to create beams that connect the left and right suspension components (usually at the control arms) with carefully tuned beam properties. The key parameters to focus on are:\n\n- `springExpansion` and `springCompression`: These control the stiffness of the anti-roll effect\n- `dampExpansion` and `dampCompression`: Keep these relatively low to avoid affecting rapid suspension movements\n\nThe BeamNG Pickup is a good reference model to study - check out its anti-roll bar implementation in the Jbeam files.	2025-03-12 06:25:47.663378	2025-03-12 06:25:47.663378
139	14	10	I'm having trouble with wheels clipping through fenders during extreme compression. Is there a recommended way to set up collision properly between suspension components and body panels?	2025-03-15 06:25:47.663378	2025-03-15 06:25:47.663378
140	14	3	For wheel-to-fender collision, you need to ensure you have proper collision triangles defined on both the wheel well and the wheel itself. A common mistake is forgetting to add collision triangles to the inner fender surfaces.\n\nYou can also add 'stopped' beam properties to create hard stops for suspension travel before visual clipping occurs. Look for the `beamPrecompression` and `beamDeform` parameters - these can be tuned to create progressive stiffening as the suspension approaches maximum compression.\n\nIf you're still having issues, check that your wheel collision mesh isn't too simplified. Sometimes adding a few more collision triangles to represent the tire sidewall can solve persistent clipping problems.	2025-03-20 06:25:47.663378	2025-03-20 06:25:47.663378
141	15	9	I've had good results using a multi-tier LOD system with these general polygon targets:\n\n- Exterior (visible from distance): ~100k polys\n- Engine bay components: ~150k polys combined\n- Interior: ~120k polys\n- Undercarriage: ~80k polys\n\nThe key is being strategic about where you maintain detail. For example, cluster more polygons around complex curves and panel gaps, while simplified flat surfaces. Normal maps are essential for maintaining the appearance of small details like panel stamping and fabric textures.	2025-04-18 06:25:47.663378	2025-04-18 06:25:47.663378
142	15	3	Great question about optimization! Here's my approach:\n\n1. For mechanical parts like engine components, you can often reduce interior/hidden geometry substantially. Players rarely see the inside of an engine block or transmission case.\n\n2. Use normal maps aggressively for surface details like vents, grilles, and interior textures.\n\n3. For LOD strategy, I recommend 3 levels with approximately 60% and 30% of original poly count. LOD distance in BeamNG is quite generous.\n\n4. Texture resolution matters more than you might think - a well-textured lower-poly model often looks better than a high-poly model with basic textures. 2K textures for exteriors and 1K for smaller parts is usually sufficient.\n\n5. Look for redundant edge loops and n-gons in your model - these are often easy targets for optimization.\n\nHappy to review your model if you want to share some screenshots of the wireframe!	2025-04-19 06:25:47.663378	2025-04-19 06:25:47.663378
143	15	12	Thank you both for the detailed advice! I've started implementing a more aggressive LOD system and focusing my high-poly detail on the parts that are most visible during gameplay. The normal map suggestion was particularly helpful - I've managed to move a lot of small details like bolts and panel seams to normal maps instead of geometry.\n\nOne follow-up question: for transparent parts like headlights and glass, are there any special considerations for optimization? They seem particularly demanding on performance.	2025-04-21 06:25:47.663378	2025-04-21 06:25:47.663378
144	15	3	Excellent question about transparent parts! They do require special handling:\n\n1. Transparent materials are indeed more performance-heavy due to the rendering order requirements. Keep polygon count especially low for these parts.\n\n2. For headlights, model only the visible outer lens and reflector in detail. The interior bulb and housing can be much lower poly or even just textured.\n\n3. For glass, avoid double-sided materials when possible. It's better to model thin glass with single-sided faces than use double-sided materials.\n\n4. Limit overlapping transparent layers - each layer of transparency adds rendering cost.\n\n5. For complex headlight assemblies, consider using masked/cutout transparency instead of true transparency for internal details.\n\nImplementing these techniques can significantly improve performance without noticeable visual quality loss.	2025-04-22 06:25:47.663378	2025-04-22 06:25:47.663378
\.


--
-- TOC entry 3518 (class 0 OID 24616)
-- Dependencies: 224
-- Data for Name: forum_threads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_threads (id, category_id, user_id, title, content, is_pinned, is_locked, view_count, created_at, updated_at, reply_count) FROM stdin;
4	2	4	Getting 'Missing dependencies' error with Pessima racing mod	I just purchased the Pessima Racing Edition mod but I'm getting a 'Missing dependencies' error when trying to load it in the game. I've already installed the base game Pessima, but it's still not working.\n\nI'm using BeamNG.drive version 0.26.2.0 and have tried reinstalling both the base car and the mod. Any suggestions on what might be causing this issue?\n\nError log: 'Missing dependencies: required_mod_123'	f	f	137	2025-04-22 06:13:50.505	2025-04-25 03:13:50.505	9
18	1	3	Important: Payment System Maintenance - June 15th	We'll be performing scheduled maintenance on our payment system on June 15th from 2:00 AM to 5:00 AM UTC.\n\nDuring this time, you won't be able to make purchases or process subscription payments. Your existing mods and subscriptions will not be affected.\n\nThis maintenance is necessary to implement additional security features and improve overall payment processing speed.\n\nWe apologize for any inconvenience this might cause and appreciate your understanding as we work to improve the platform.\n\nIf you have any questions or concerns, please contact our support team.	t	t	317	2025-04-17 06:21:39.112341	2025-04-17 06:21:39.112341	0
26	4	11	Request: American Muscle Car Pack	I'd like to request a comprehensive American muscle car pack covering the golden era from the 60s and 70s.\n\nIt would be amazing to have 3-4 iconic models with historically accurate trim levels, engine options, and visual configurations. Proper sound design with those rumbling V8s would be essential!\n\nBonus points for including drag racing parts and options, as well as 'restomod' configurations with modern suspension and braking systems.\n\nIs there enough interest in classic American muscle to make this worth developing?	f	f	318	2025-04-08 06:22:48.39647	2025-04-10 06:22:48.39647	0
8	3	8	Will we see more track mods in the future?	Most of the mods I see on the marketplace are vehicles and parts, which is great, but I'm wondering if there are plans to release more track/map mods in the future?\n\nI'd love to see some technical tracks designed specifically for drifting or time attack. The stock maps are good, but I'm hungry for more variety.\n\nAnyone else interested in more track content? What kind of environments would you like to see?	f	f	274	2025-04-03 06:13:50.505	2025-04-16 06:24:20.837007	9
16	1	1	Welcome to JSD Mods - Official Marketplace Launch!	Hey everyone! We're thrilled to announce the official launch of the JSD Mods marketplace. After months of development and testing, we're finally ready to share our platform with all BeamNG enthusiasts.\n\nHere you'll find high-quality, thoroughly tested mods for BeamNG.drive. Whether you're looking for vehicles, parts, maps, or configurations, we've got you covered.\n\nMake sure to check out our premium subscription for exclusive early access to new releases and subscriber-only content.\n\nWe can't wait to see what you think of the marketplace. Feel free to share any feedback or suggestions in the appropriate forum categories.\n\nHappy driving!	t	f	843	2025-03-25 06:21:39.112341	2025-04-19 06:21:39.112341	0
17	1	2	New Feature: Rating System Now Available	We've just deployed a major update to the marketplace: a comprehensive rating and review system!\n\nYou can now rate any mod you've purchased on a 5-star scale and leave detailed feedback for other users and mod creators. This will help everyone find the best content and give creators valuable feedback on their work.\n\nThe review system includes:\n- 5-star rating system\n- Detailed written reviews\n- Helpful upvote system for reviews\n- Mod creator responses\n\nPlease keep all reviews constructive and respectful. Focus on the mod's quality, performance, and features rather than personal issues with creators.\n\nWe hope this new system enhances your experience on the marketplace!	t	f	412	2025-04-09 06:21:39.112341	2025-04-14 06:21:39.112341	0
19	2	4	Getting 'Missing dependencies' error with Pessima racing mod	I just purchased the Pessima Racing Edition mod but I'm getting a 'Missing dependencies' error when trying to load it in the game. I've already installed the base game Pessima, but it's still not working.\n\nI'm using BeamNG.drive version 0.26.2.0 and have tried reinstalling both the base car and the mod. Any suggestions on what might be causing this issue?\n\nError log: 'Missing dependencies: required_mod_123'	f	f	137	2025-04-10 06:22:06.346603	2025-04-11 06:22:06.346603	0
20	2	5	How to install mods manually if auto-installation fails?	The automatic installation isn't working for me - when I click the download button in my mod locker, the file downloads but nothing happens in the game.\n\nIs there a way to manually install these mods? Where should I place the files to get them working? I'm on Windows 11 if that matters.\n\nAny help would be appreciated!	f	f	214	2025-04-14 06:22:06.346603	2025-04-15 06:22:06.346603	0
21	2	6	Subscription payment showing as pending but no access	I subscribed to the premium plan yesterday, and the payment has gone through according to my bank statement, but my account still shows as not having an active subscription.\n\nI've tried logging out and back in, clearing my browser cache, and waiting for about 24 hours now. The payment is showing as 'pending' in my transaction history.\n\nIs there something else I need to do to activate my subscription? Order #JSD-SUB-8721	f	f	86	2025-04-21 06:22:06.346603	2025-04-22 06:22:06.346603	0
22	3	7	What's your favorite JSD mod so far?	Now that the marketplace has been up for a while, I'm curious to hear about everyone's favorite mods!\n\nPersonally, I'm loving the JSD Racer X - the physics are amazing and the detail on the model is incredible. The sound design alone makes it worth the purchase.\n\nWhat mods are you all enjoying the most? Any hidden gems I should check out?	f	f	453	2025-03-30 06:22:06.346603	2025-04-04 06:22:06.346603	0
23	3	8	Will we see more track mods in the future?	Most of the mods I see on the marketplace are vehicles and parts, which is great, but I'm wondering if there are plans to release more track/map mods in the future?\n\nI'd love to see some technical tracks designed specifically for drifting or time attack. The stock maps are good, but I'm hungry for more variety.\n\nAnyone else interested in more track content? What kind of environments would you like to see?	f	f	274	2025-04-12 06:22:06.346603	2025-04-16 06:22:06.346603	0
24	3	9	Show off your modded BeamNG screenshots!	I thought it would be fun to have a thread where we can all share screenshots of our JSD modded vehicles in BeamNG!\n\nI'll start - here's my modified Bandit with the JSD wide body kit and performance upgrades tearing up the desert track: [imagine a screenshot was linked here]\n\nThe lighting mod really makes a difference in the atmosphere, don't you think?\n\nLet's see what you've got!	f	f	892	2025-04-06 06:22:06.346603	2025-04-22 06:22:06.346603	0
25	4	10	Request: 90s Japanese Kei car (similar to Suzuki Cappuccino)	I would absolutely love to see a high-quality Kei car mod similar to the Suzuki Cappuccino or Honda Beat on the marketplace.\n\nThese tiny Japanese sports cars from the 90s have such a unique character and would be perfect for technical driving on narrow roads.\n\nIdeally, it would include:\n- Accurate dimensions and weight distribution\n- Detailed engine bay with tuning options\n- Multiple body options (hardtop, soft top, etc.)\n- Period-correct interior\n\nWould anyone else be interested in something like this? I'd be willing to pay a premium for a really well-done version.	f	f	236	2025-04-02 06:22:48.39647	2025-04-09 06:22:48.39647	0
27	5	2	[SHOWCASE] JSD Rally Monster - Coming Next Week!	Hey mod enthusiasts!\n\nI'm thrilled to give you a sneak peek at our upcoming release: the JSD Rally Monster!\n\nThis rally-inspired creation features:\n- Custom suspension geometry with 12+ inches of travel\n- Fully simulated AWD system with adjustable torque distribution\n- Detailed damage model including deformable body panels\n- Multiple engine options from a screaming 2.0L turbo to a monster 3.5L V6\n- Rally-specific parts including light pods, mud flaps, and skid plates\n\nWe've been testing this on everything from smooth tarmac to rough mountain trails, and it handles it all beautifully.\n\nHere's a short preview video: [imagine a video was linked here]\n\nRelease is scheduled for next Wednesday. Premium subscribers will get access 3 days early!\n\nLet me know what you think!	t	f	874	2025-04-14 06:22:48.39647	2025-04-19 06:22:48.39647	0
28	5	1	[SHOWCASE] JBX Classic - Vintage Sports Car	After months of development, I'm excited to showcase our latest creation: the JBX Classic!\n\nThis vintage-inspired sports car takes cues from the elegant European roadsters of the 1960s but with a unique JSD twist. We've focused on capturing the driving experience of these classic machines while adding options for modern performance upgrades.\n\nFeatures include:\n- Hand-crafted 3D model with over 300 unique parts\n- Historically accurate suspension and drivetrain simulation\n- Multiple engine options from docile 1.6L to fire-breathing 2.2L race spec\n- Open-top and hardtop variants with functioning convertible system\n- Period-correct interior with functional gauges and switches\n\nEach body panel deforms realistically, and we've put special attention into the progressive handling characteristics that make these classics so engaging to drive.\n\nLaunching this Friday at $12.99, or included with your premium subscription!\n\nCheck out the showcase video here: [imagine a video was linked here]	t	f	739	2025-04-16 06:22:48.39647	2025-04-21 06:22:48.39647	0
29	6	3	Understanding BeamNG's Jbeam physics system for modders	I've noticed some confusion about how BeamNG's physics system works, so I thought I'd start a technical thread to help modders understand the basics of the Jbeam system.\n\nAt its core, BeamNG uses a soft-body physics model where vehicles are constructed from nodes (points in 3D space) connected by beams (connections between nodes). This allows for realistic deformation and dynamic handling characteristics.\n\nKey concepts to understand:\n\n1. **Nodes**: Think of these as the 'joints' of your vehicle. They have mass and interact with the world.\n\n2. **Beams**: These connect nodes and have properties like strength, deformation limits, and spring/damping values.\n\n3. **Weight Balance**: Node placement and mass significantly affect handling. Always check weight distribution!\n\n4. **Collision Triangles**: These define the visible collision mesh for the vehicle.\n\nWhen creating mods, it's crucial to ensure your node setup accurately represents the structure of the vehicle. Improper node placement can lead to unrealistic deformation or poor handling characteristics.\n\nFor those looking to dive deeper, I recommend studying existing Jbeam files and using the in-game node/beam visualization tools.\n\nAny other technical questions about the physics system? Post them below and I'll try to answer!	t	f	362	2025-03-10 06:22:48.39647	2025-03-20 06:22:48.39647	0
30	6	12	Optimization techniques for high-poly vehicle models	I've been working on a highly detailed vehicle mod (approximately 2.4 million polygons in its raw form), and I'm struggling with optimization while maintaining visual quality.\n\nI've tried decimation in Blender, but I'm losing too much detail in critical areas like the engine bay and interior. What techniques are you all using to optimize high-poly models while preserving the important details?\n\nSome specific questions:\n\n1. What polygon count do you target for exterior body panels vs. mechanical components?\n\n2. Are there parts that can be lower poly without noticeable quality loss?\n\n3. Any specific LOD (Level of Detail) strategies that work well in BeamNG?\n\n4. How do you handle high-res textures - are you using normal maps to fake detail on lower-poly models?\n\nAny advice from experienced modders would be greatly appreciated!	f	f	204	2025-04-18 06:22:48.39647	2025-04-22 06:22:48.39647	0
1	1	1	Welcome to JSD Mods - Official Marketplace Launch!	Hey everyone! We're thrilled to announce the official launch of the JSD Mods marketplace. After months of development and testing, we're finally ready to share our platform with all BeamNG enthusiasts.\n\nHere you'll find high-quality, thoroughly tested mods for BeamNG.drive. Whether you're looking for vehicles, parts, maps, or configurations, we've got you covered.\n\nMake sure to check out our premium subscription for exclusive early access to new releases and subscriber-only content.\n\nWe can't wait to see what you think of the marketplace. Feel free to share any feedback or suggestions in the appropriate forum categories.\n\nHappy driving!	t	f	843	2025-03-17 06:13:50.505	2025-03-30 06:23:16.140811	12
2	1	2	New Feature: Rating System Now Available	We've just deployed a major update to the marketplace: a comprehensive rating and review system!\n\nYou can now rate any mod you've purchased on a 5-star scale and leave detailed feedback for other users and mod creators. This will help everyone find the best content and give creators valuable feedback on their work.\n\nThe review system includes:\n- 5-star rating system\n- Detailed written reviews\n- Helpful upvote system for reviews\n- Mod creator responses\n\nPlease keep all reviews constructive and respectful. Focus on the mod's quality, performance, and features rather than personal issues with creators.\n\nWe hope this new system enhances your experience on the marketplace!	t	f	412	2025-04-16 06:13:50.505	2025-04-19 02:13:50.505	9
3	1	3	Important: Payment System Maintenance - June 15th	We'll be performing scheduled maintenance on our payment system on June 15th from 2:00 AM to 5:00 AM UTC.\n\nDuring this time, you won't be able to make purchases or process subscription payments. Your existing mods and subscriptions will not be affected.\n\nThis maintenance is necessary to implement additional security features and improve overall payment processing speed.\n\nWe apologize for any inconvenience this might cause and appreciate your understanding as we work to improve the platform.\n\nIf you have any questions or concerns, please contact our support team.	t	t	317	2025-03-15 06:13:50.505	2025-04-17 06:23:16.140811	6
5	2	5	How to install mods manually if auto-installation fails?	The automatic installation isn't working for me - when I click the download button in my mod locker, the file downloads but nothing happens in the game.\n\nIs there a way to manually install these mods? Where should I place the files to get them working? I'm on Windows 11 if that matters.\n\nAny help would be appreciated!	f	f	214	2025-04-22 06:13:50.505	2025-04-23 20:13:50.505	6
6	2	6	Subscription payment showing as pending but no access	I subscribed to the premium plan yesterday, and the payment has gone through according to my bank statement, but my account still shows as not having an active subscription.\n\nI've tried logging out and back in, clearing my browser cache, and waiting for about 24 hours now. The payment is showing as 'pending' in my transaction history.\n\nIs there something else I need to do to activate my subscription? Order #JSD-SUB-8721	f	f	86	2025-03-06 06:13:50.505	2025-04-22 06:23:54.827225	6
7	3	7	What's your favorite JSD mod so far?	Now that the marketplace has been up for a while, I'm curious to hear about everyone's favorite mods!\n\nPersonally, I'm loving the JSD Racer X - the physics are amazing and the detail on the model is incredible. The sound design alone makes it worth the purchase.\n\nWhat mods are you all enjoying the most? Any hidden gems I should check out?	f	f	453	2025-03-06 06:13:50.505	2025-04-04 06:24:20.837007	12
9	3	9	Show off your modded BeamNG screenshots!	I thought it would be fun to have a thread where we can all share screenshots of our JSD modded vehicles in BeamNG!\n\nI'll start - here's my modified Bandit with the JSD wide body kit and performance upgrades tearing up the desert track: [imagine a screenshot was linked here]\n\nThe lighting mod really makes a difference in the atmosphere, don't you think?\n\nLet's see what you've got!	f	f	892	2025-03-09 06:13:50.505	2025-04-22 06:24:20.837007	9
10	4	10	Request: 90s Japanese Kei car (similar to Suzuki Cappuccino)	I would absolutely love to see a high-quality Kei car mod similar to the Suzuki Cappuccino or Honda Beat on the marketplace.\n\nThese tiny Japanese sports cars from the 90s have such a unique character and would be perfect for technical driving on narrow roads.\n\nIdeally, it would include:\n- Accurate dimensions and weight distribution\n- Detailed engine bay with tuning options\n- Multiple body options (hardtop, soft top, etc.)\n- Period-correct interior\n\nWould anyone else be interested in something like this? I'd be willing to pay a premium for a really well-done version.	f	f	236	2025-02-27 06:13:50.505	2025-04-09 06:24:57.999857	12
11	4	11	Request: American Muscle Car Pack	I'd like to request a comprehensive American muscle car pack covering the golden era from the 60s and 70s.\n\nIt would be amazing to have 3-4 iconic models with historically accurate trim levels, engine options, and visual configurations. Proper sound design with those rumbling V8s would be essential!\n\nBonus points for including drag racing parts and options, as well as 'restomod' configurations with modern suspension and braking systems.\n\nIs there enough interest in classic American muscle to make this worth developing?	f	f	318	2025-04-20 06:13:50.505	2025-04-23 04:13:50.505	6
12	5	2	[SHOWCASE] JSD Rally Monster - Coming Next Week!	Hey mod enthusiasts!\n\nI'm thrilled to give you a sneak peek at our upcoming release: the JSD Rally Monster!\n\nThis rally-inspired creation features:\n- Custom suspension geometry with 12+ inches of travel\n- Fully simulated AWD system with adjustable torque distribution\n- Detailed damage model including deformable body panels\n- Multiple engine options from a screaming 2.0L turbo to a monster 3.5L V6\n- Rally-specific parts including light pods, mud flaps, and skid plates\n\nWe've been testing this on everything from smooth tarmac to rough mountain trails, and it handles it all beautifully.\n\nHere's a short preview video: [imagine a video was linked here]\n\nRelease is scheduled for next Wednesday. Premium subscribers will get access 3 days early!\n\nLet me know what you think!	t	f	874	2025-04-09 06:13:50.505	2025-04-19 06:24:57.999857	12
13	5	1	[SHOWCASE] JBX Classic - Vintage Sports Car	After months of development, I'm excited to showcase our latest creation: the JBX Classic!\n\nThis vintage-inspired sports car takes cues from the elegant European roadsters of the 1960s but with a unique JSD twist. We've focused on capturing the driving experience of these classic machines while adding options for modern performance upgrades.\n\nFeatures include:\n- Hand-crafted 3D model with over 300 unique parts\n- Historically accurate suspension and drivetrain simulation\n- Multiple engine options from docile 1.6L to fire-breathing 2.2L race spec\n- Open-top and hardtop variants with functioning convertible system\n- Period-correct interior with functional gauges and switches\n\nEach body panel deforms realistically, and we've put special attention into the progressive handling characteristics that make these classics so engaging to drive.\n\nLaunching this Friday at $12.99, or included with your premium subscription!\n\nCheck out the showcase video here: [imagine a video was linked here]	t	f	739	2025-03-03 06:13:50.505	2025-04-21 06:25:47.663378	12
14	6	3	Understanding BeamNG's Jbeam physics system for modders	I've noticed some confusion about how BeamNG's physics system works, so I thought I'd start a technical thread to help modders understand the basics of the Jbeam system.\n\nAt its core, BeamNG uses a soft-body physics model where vehicles are constructed from nodes (points in 3D space) connected by beams (connections between nodes). This allows for realistic deformation and dynamic handling characteristics.\n\nKey concepts to understand:\n\n1. **Nodes**: Think of these as the 'joints' of your vehicle. They have mass and interact with the world.\n\n2. **Beams**: These connect nodes and have properties like strength, deformation limits, and spring/damping values.\n\n3. **Weight Balance**: Node placement and mass significantly affect handling. Always check weight distribution!\n\n4. **Collision Triangles**: These define the visible collision mesh for the vehicle.\n\nWhen creating mods, it's crucial to ensure your node setup accurately represents the structure of the vehicle. Improper node placement can lead to unrealistic deformation or poor handling characteristics.\n\nFor those looking to dive deeper, I recommend studying existing Jbeam files and using the in-game node/beam visualization tools.\n\nAny other technical questions about the physics system? Post them below and I'll try to answer!	t	f	362	2025-03-19 06:13:50.505	2025-03-20 07:13:50.505	12
15	6	12	Optimization techniques for high-poly vehicle models	I've been working on a highly detailed vehicle mod (approximately 2.4 million polygons in its raw form), and I'm struggling with optimization while maintaining visual quality.\n\nI've tried decimation in Blender, but I'm losing too much detail in critical areas like the engine bay and interior. What techniques are you all using to optimize high-poly models while preserving the important details?\n\nSome specific questions:\n\n1. What polygon count do you target for exterior body panels vs. mechanical components?\n\n2. Are there parts that can be lower poly without noticeable quality loss?\n\n3. Any specific LOD (Level of Detail) strategies that work well in BeamNG?\n\n4. How do you handle high-res textures - are you using normal maps to fake detail on lower-poly models?\n\nAny advice from experienced modders would be greatly appreciated!	f	f	204	2025-03-02 06:13:50.505	2025-04-22 06:25:47.663378	12
31	1	3	Test	test post for forum	f	f	0	2025-04-24 16:13:06.096138	2025-04-24 16:13:06.096138	0
\.


--
-- TOC entry 3532 (class 0 OID 40961)
-- Dependencies: 238
-- Data for Name: mod_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mod_images (id, mod_id, image_url, sort_order, caption, created_at) FROM stdin;
\.


--
-- TOC entry 3534 (class 0 OID 40972)
-- Dependencies: 240
-- Data for Name: mod_requirements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mod_requirements (id, mod_id, requirement, created_at) FROM stdin;
\.


--
-- TOC entry 3520 (class 0 OID 24630)
-- Dependencies: 226
-- Data for Name: mod_versions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mod_versions (id, mod_id, version, file_path, file_size, changelog, is_latest, release_date) FROM stdin;
2	26	1.0.0	/home/runner/workspace/uploads/mods/test-mod-26.zip	1024	Initial release with test content	t	2025-06-24 00:18:16.490286
1	25	1.2.0	/home/runner/workspace/uploads/mods/test-mod-25.zip	15728640	Updated physics engine and improved handling dynamics	f	2025-06-17 02:54:45.930209
3	25	1.0.0	https://drive.google.com/file/d/1czpCTxOEGq_p-QaypGdq0LJOMisNWe2s/view?usp=sharing	1048576	Fixed more stuff	t	2025-06-24 00:57:51.283
\.


--
-- TOC entry 3522 (class 0 OID 24641)
-- Dependencies: 228
-- Data for Name: mods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.mods (id, title, description, price, discount_price, preview_image_url, download_url, category, tags, is_featured, download_count, average_rating, is_subscription_only, version, release_notes, created_at, updated_at, features, is_published, changelog) FROM stdin;
25	Test	asdaqwecsdf	1	\N	https://i.imgur.com/3elqtuj.mp4	https://drive.google.com/file/d/1czpCTxOEGq_p-QaypGdq0LJOMisNWe2s/view?usp=sharing	sports	["CAR"]	f	3	0	f	1.0.0	dsdsdsd	2025-04-25 03:52:10.19536	2025-04-25 03:52:10.19536	[]	f	
17	JSD Rally X - Premium Edition	A premium subscriber exclusive, the JSD Rally X represents the pinnacle of rally car engineering in BeamNG.drive. This advanced rally machine features our most sophisticated physics model yet, with realistic weight transfer, suspension geometry, and drivetrain simulation. The Rally X includes exclusive tuning options not available in our standard mods, including advanced differential maps, progressive throttle response curves, and stage-specific suspension setups. Available only to premium subscribers.	0	0	https://placehold.co/600x400?text=Rally+X+Premium	\N	racing	["rally", "premium", "exclusive", "racing"]	t	943	5	t	1.0.0	\N	2025-03-25 06:29:20.322363	2025-03-25 06:29:20.322363	["Advanced physics model", "Stage-specific suspension setups", "Premium-only features", "Progressive throttle mapping"]	f	
27	JSD BBG ZADDY POOKS	dfvjkasGFbkalsjfghklSJbcljkaeswhgfvksdv cjklasdbfgvljDKXZfgc lkasEUFGH;KAS	666	\N	https://i.imgur.com/3elqtuj.mp4		muscle	["CAR"]	f	0	0	t	1.0.0		2025-04-25 04:08:32.818954	2025-04-25 04:08:32.818954	[]	f	
26	Test	saefsfsdfdsfsdfwse 	10	\N	https://i.imgur.com/3elqtuj.mp4	https://drive.google.com/uc?export=download&id=1another_example_id	vehicles	["CAR"]	f	0	0	f	1.0.0		2025-04-25 03:55:50.67347	2025-04-25 03:55:50.67347	[]	f	
\.


--
-- TOC entry 3536 (class 0 OID 40982)
-- Dependencies: 242
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 3524 (class 0 OID 24658)
-- Dependencies: 230
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

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

COPY public.reviews (id, user_id, mod_id, rating, comment, created_at, updated_at) FROM stdin;
9	11	11	5	This is hands down the best sports car mod I've ever used in BeamNG. The handling is spot on - feels like driving a real car. I especially love the different engine options that completely change the personality of the car. The Stage 3 package is my favorite for track use.	2025-03-05 06:31:21.225478	2025-03-05 06:31:21.225478
10	10	11	4	Excellent model and physics. The attention to detail is impressive - even the gauges react accurately to car behavior. My only small complaint is that the tire smoke effect could be a bit more pronounced for dramatic drifting. Otherwise, perfect!	2025-03-10 06:31:21.225478	2025-03-10 06:31:21.225478
11	7	11	5	As someone who drifts a lot in game, I was skeptical about how this sports car would handle sideways action - but I was blown away! Even though it's not primarily a drift car, the chassis balance is so well done that it's actually fantastic for technical drifting. The customization options are incredible too.	2025-03-15 06:31:21.225478	2025-03-15 06:31:21.225478
12	12	11	4	Great physics model and looks stunning. The cockpit view is incredibly detailed and the engine sounds are perfect. I've spent hours just fine-tuning different setups. Lost one star only because I wish there were more wheel options.	2025-03-25 06:31:21.225478	2025-03-25 06:31:21.225478
13	8	11	5	This mod has completely changed my BeamNG experience. The handling is so responsive and predictable that I've started using it for hotlapping practice that actually translates to my real-life track days. Worth every penny!	2025-04-04 06:31:21.225478	2025-04-04 06:31:21.225478
14	7	12	5	As my username suggests, I'm obsessed with drift cars, and this is by far the most authentic drift experience in BeamNG. The steering angle kit is perfectly implemented, and the way the car transitions between corners feels just like the real thing. The different power levels let you progress as your skills improve.	2025-02-03 06:31:21.225478	2025-02-03 06:31:21.225478
15	14	12	5	I've been looking for a proper drift car that doesn't feel arcade-like, and the JSD DriftKing delivers in every way. The suspension setup is perfect - you can really feel the weight transfer during transitions. The customization options are endless! I've created about 10 different builds from street-legal to competition spec.	2025-02-08 06:31:21.225478	2025-02-08 06:31:21.225478
16	6	12	4	Really great drift car with excellent physics. The engine sound is perfect - you can hear when you're about to lose traction just from the sound. Only reason for 4 stars is I would love to see more body kit options in a future update.	2025-02-23 06:31:21.225478	2025-02-23 06:31:21.225478
17	12	12	4	The handling model is incredibly realistic. You really need to master weight transfer and throttle control to get good drift angles. I especially appreciate how the different tire compounds actually make a significant difference in grip levels. Great work!	2025-03-10 06:31:21.225478	2025-03-10 06:31:21.225478
18	11	12	5	Even though I normally prefer grip driving, this mod converted me to drifting! The way it progressively breaks traction is so satisfying, and you can really feel when you've nailed a perfect transition. The visual customization options are amazing too.	2025-03-25 06:31:21.225478	2025-03-25 06:31:21.225478
19	9	13	5	This is exactly what I've been wanting in BeamNG! The suspension travel is insane, and the way it soaks up bumps at high speed is perfect. I can hit jumps that would destroy any other vehicle and just keep going. The detailed undercarriage with visible suspension components is a nice touch too.	2025-03-15 06:31:21.225478	2025-03-15 06:31:21.225478
20	13	13	5	As a dirt racing enthusiast, I couldn't be happier with this Trophy Truck. The way it handles rough terrain at speed is incredible - the suspension physics are spot on. I love how the different terrain types actually affect handling in realistic ways. The authentic engine sound gets your adrenaline pumping!	2025-03-20 06:31:21.225478	2025-03-20 06:31:21.225478
21	8	13	4	Excellent offroad vehicle with amazing capabilities. The long travel suspension is perfectly modeled and the truck feels properly weighted. The only reason I'm not giving 5 stars is because I wish it had a few more livery options.	2025-03-25 06:31:21.225478	2025-03-25 06:31:21.225478
22	14	13	5	Worth every penny! The attention to detail is incredible - from the suspension articulation to the way the body flexes slightly under stress. I was hesitant about the price, but after seeing the quality and how much work went into it, it's completely justified.	2025-04-04 06:31:21.225478	2025-04-04 06:31:21.225478
23	8	14	5	As a huge rally fan, I was looking for an authentic rally experience in BeamNG, and this mod delivers perfectly! The handling on different surfaces feels incredibly realistic - the way it slides on gravel but grips on tarmac is spot on. The anti-lag system and turbo sounds are just icing on the cake.	2025-02-13 06:31:59.804902	2025-02-13 06:31:59.804902
24	13	14	5	This is exactly what BeamNG was missing - a proper rally car with authentic handling characteristics. The different tuning options for various surfaces are incredibly well thought out. I love the historically accurate livery options too - brings back memories of the golden era of rally!	2025-02-23 06:31:59.804902	2025-02-23 06:31:59.804902
25	9	14	4	Great rally car with excellent physics. The turbo model is the most realistic I've experienced in any game - you can really feel the lag at low RPM and the surge of power when it spools up. My only minor complaint is that I wish there were a few more modern livery options.	2025-03-05 06:31:59.804902	2025-03-05 06:31:59.804902
26	11	14	5	This mod has changed how I play BeamNG! The handling is so satisfying - that perfect balance between grip and controllable slides. The attention to detail in the cockpit view is amazing, especially the working gauges. I've spent hours just creating different setups for different rally stages.	2025-03-15 06:31:59.804902	2025-03-15 06:31:59.804902
27	7	14	4	Even though I'm primarily a drift enthusiast, this rally car has become one of my favorites. The handling model is superb, and it's actually great for practicing techniques that carry over to drifting. The sounds are perfect too!	2025-03-25 06:31:59.804902	2025-03-25 06:31:59.804902
28	10	15	5	This is EXACTLY what I was looking for in a muscle car mod! The raw power and slightly wild handling captures the essence of classic American muscle perfectly. The engine sounds are absolutely spot-on - you can feel the rumble through your controller. The customization options let you build anything from a stock cruiser to a drag strip monster.	2025-01-04 06:31:59.804902	2025-01-04 06:31:59.804902
29	12	15	4	Great muscle car with authentic handling characteristics. It feels appropriately heavy yet powerful, and the slight understeer followed by easy power oversteer is exactly how these cars should behave. The different exhaust options affecting the sound is a nice touch! Lost one star only because I wish there were a few more wheel options.	2025-01-24 06:31:59.804902	2025-01-24 06:31:59.804902
30	6	15	5	As someone who owns a classic muscle car in real life, I'm impressed by how authentic this mod feels. The weight transfer, the way it squats under acceleration, and the progressive breakaway of the rear end are all perfectly modeled. The attention to detail in the engine bay is amazing too!	2025-02-13 06:31:59.804902	2025-02-13 06:31:59.804902
31	14	15	4	The sound design alone is worth the price! You can tell they recorded a real engine - the idle, acceleration, and deceleration all sound perfectly authentic. The handling model is great too - challenging but controllable once you get the hang of it.	2025-03-15 06:31:59.804902	2025-03-15 06:31:59.804902
32	9	16	5	This is the best offroad vehicle I've ever used in BeamNG, hands down! The articulation in the suspension is incredible - you can crawl over obstacles that would stop other vehicles dead. The different differential lock settings make a huge difference in capability, and the interior details are amazing. Worth every penny!	2025-01-24 06:31:59.804902	2025-01-24 06:31:59.804902
33	13	16	5	As someone who does a lot of rock crawling scenarios in BeamNG, this mod is absolutely perfect. The suspension flex is incredibly realistic, and the way the vehicle finds traction on uneven surfaces is exactly how it should be. The detailed underbody with visible drivetrain components is a nice touch too!	2025-02-03 06:31:59.804902	2025-02-03 06:31:59.804902
34	6	16	4	Great offroad vehicle with excellent capabilities. The multiple differential lock options give you so much control over how the vehicle behaves in different scenarios. The only reason I'm not giving 5 stars is that I wish there were more roof rack accessory options.	2025-02-23 06:31:59.804902	2025-02-23 06:31:59.804902
35	8	16	5	I was skeptical about the price, but after trying it, I can say it's absolutely worth it! The level of detail in both the visuals and the physics is outstanding. I especially love the functional interior with all the working gauges and switches. This has become my go-to vehicle for exploring the more remote areas of the maps.	2025-03-15 06:31:59.804902	2025-03-15 06:31:59.804902
36	11	17	5	As a premium subscriber, this exclusive Rally X mod is worth the subscription alone! The physics are on another level compared to standard mods - you can feel every subtle weight transfer and suspension movement. The stage-specific tuning options are incredibly useful and show the level of thought that went into this. Absolutely outstanding work!	2025-03-27 06:31:59.804902	2025-03-27 06:31:59.804902
37	7	17	5	This premium exclusive mod is simply incredible. The advanced physics model makes it feel so much more connected to the road, yet still lively and playful when you want it to be. The exclusive Championship Edition livery is gorgeous, and the tuning preset created with the rally driver input is perfectly balanced. This is the new standard for rally cars in BeamNG.	2025-03-30 06:31:59.804902	2025-03-30 06:31:59.804902
38	14	17	5	The Rally X is easily the most sophisticated rally car available for BeamNG. The progressive throttle mapping gives you so much control in technical sections, and the differential settings are incredibly detailed. The premium-exclusive features are well worth it - the tuning presets alone save hours of setup time. Absolutely phenomenal work!	2025-04-04 06:31:59.804902	2025-04-04 06:31:59.804902
39	9	17	5	I switched to a premium subscription specifically for this mod, and I don't regret it one bit! The handling is unbelievably good - it somehow manages to be both forgiving for beginners and deep enough for advanced users. The rally driver input really shows in how natural the car feels when pushed to the limit. Simply the best rally experience in BeamNG.	2025-04-09 06:31:59.804902	2025-04-09 06:31:59.804902
40	6	3	3	Decent mod with good visuals, but the handling feels a bit off. Too much understeer in corners. Worth the purchase if you're specifically looking for this type of vehicle, but there are better options available.	2025-03-10 06:32:38.930104	2025-03-10 06:32:38.930104
41	8	3	3	Mixed feelings about this one. The exterior modeling is excellent and the customization options are nice, but the suspension feels too stiff even on the softest settings. Also had some texture glitches on certain parts.	2025-03-15 06:32:38.930104	2025-03-15 06:32:38.930104
42	10	3	4	Pretty solid mod overall. The model is well-detailed and the physics are generally good. There's a small issue with the brake lights sometimes, but otherwise it performs well.	2025-03-20 06:32:38.930104	2025-03-20 06:32:38.930104
43	12	3	4	Really enjoying this mod. The handling is challenging in a fun way, and it looks fantastic. Only giving 4 stars because it's a bit demanding on system resources compared to similar mods.	2025-03-25 06:32:38.930104	2025-03-25 06:32:38.930104
44	7	3	5	Been using this for about a week now and it's become my go-to vehicle. The suspension tuning is spot on and it's visually stunning. Performs great even with my mid-range PC. Highly recommended!	2025-03-30 06:32:38.930104	2025-03-30 06:32:38.930104
\.


--
-- TOC entry 3537 (class 0 OID 65536)
-- Dependencies: 243
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
2b7VFtgs8rdvG9-kOui_c-9hUrcRtZx_	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-23T23:59:47.899Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-23 23:59:48
SjFtKcXTYyPuEndl1Ug8X2UCyfkyAirF	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T07:28:14.690Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 07:28:15
mWUEMqpooFM7bx6B-IQ5S446SG0DiBlq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T07:11:06.253Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 07:11:07
7IqeUYRvgE-kwMwQx15WbuAXQKNtPpKP	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T07:25:15.912Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 07:25:16
dikOr6BRp69aydGA0pYASf4zwaFz9vn7	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-24T00:05:29.546Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:05:30
9jirl-b_CmWEVRfWZ1Rzu5DSxy1a5ssq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T07:25:17.324Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 07:25:18
zaDgtNBgZnGbh0saaKRJYPe-9T58LckZ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T06:34:16.548Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:34:17
wmzTILJQQwXEx9UN0JHwt8d6xvUHE_Bv	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T03:18:06.132Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 03:18:07
oU9R0xAxlyNdSmq1UXGfY3rKiz7fuHYr	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:05:35.826Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:05:36
ch4X4qPwiKUIzL3hWfDD7_DNSEC3iomH	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-14T06:56:10.664Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:56:11
NANL7d4oSJr0HbufeYOM48M3nQI5ID16	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T06:53:39.717Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:53:40
JgVSUvfyD6xAS5Nsv4vNIpnDqnlea603	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T06:54:39.320Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:54:40
_7tJ32vlxN3KbNqaNLvG1nKJrklKVTvE	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:45:55.474Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:45:56
CSJiodSZ-ICHlfjMMiI87Rtc1wXMQvW4	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-23T23:57:46.666Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-23 23:57:47
hzuNTen-tXvKhQtIOAToWgrfY84lgIyd	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T06:55:18.114Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:55:19
pN_mYgtt6uDRNkpDO4mRP4h0qYN73mgJ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T06:34:20.497Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:34:21
Q-Og4l-u1F5snoRQqJ2cDAQ3jXsl0I6R	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T01:57:29.318Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 01:57:30
ziwi0ZiQldazY5pxyLUsJ206GwvZSQrz	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-14T07:12:17.530Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 07:12:18
nQMwIy5eGKg_9ncaY79tlgkNiTbtLcSi	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-14T06:48:26.086Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-14 06:48:27
Zc4gnhp4GI8I8aV-rtqteodc-r_FE_0Y	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T01:57:25.728Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 01:57:26
yqWRn0eV3aj6f7WLGm4mbnJF_1a20jcc	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T03:02:32.057Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 03:02:33
MrxNfOIGkn4sNH8AjMO6uIi7VpzzizR4	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T03:02:35.809Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 03:02:36
Rt9HDb3B9x89LAarNTZfGEolJGMQCzp6	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T03:02:35.811Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 03:02:36
5NRnD7ntFDRNXEIj1AXlG6MrSBI56IFc	{"cookie":{"originalMaxAge":2591999977,"expires":"2025-07-17T03:28:40.004Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":15}}	2025-07-17 03:28:41
5S6qhoM-mfNI1VM7I38zX3nnzJbHE2Ze	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-17T01:46:44.301Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 01:46:45
UQXIyRrOGBMpstw2EB1Cr5VdsPmfjFiv	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-17T02:55:03.443Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:55:04
X6bunR-MCq8ZHHlyxvXOXmJ06lHaK9Zk	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:40:20.504Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:40:21
ZCOUgg5cfGwbLwc2EgND_ni0c-jnI8q2	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:29:00.512Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:29:01
pESJpWAAvJ1163yI4a9OoX9unirmMc2_	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:29:03.123Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:29:04
FNsgZ9BDKLjXwe9v_bkabNR-CYq4PjPZ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:29:03.583Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:29:04
C8DU7qf1AKp2v5U6XRiL1w1tesjaDfCV	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:13:12.008Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:13:13
p9Gb-dyV7iNi98O_7lkjJ9inq-ICLgog	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:08:01.547Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:08:02
TGTs_ap7vazkWeK31IodmZBx_Bn_wauq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:51:41.323Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:51:42
zU6vbhthRoaCD8UUXL4ArjritLUl81cl	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:51:44.719Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:51:45
esWp-u0Dxvm323ggerJ4WBSEwAUDKSfQ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T02:51:45.727Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 02:51:46
i-LMUlLC2VKjxvmA6itkpCcI-fPgJpCc	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-17T01:32:02.850Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 01:32:03
HNc1ojdtsSP0WiQy5spzzk8SxH9szoMQ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:03:43.844Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:03:44
BnkkRPJL1mHqHrqCkNbFjLfjrRW-g_iq	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:29:24.041Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:29:25
3HybfFdzJrvbkd78NCl8Vt8kdJmDDU6M	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:04:00.502Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:04:01
iuOtyiifBbgTG_uGpBQWEo57W8S9ch1f	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:09:04.466Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:09:05
k4bbRll9UjYt6YKyFaqcgiwEXkRhpCb8	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:37:21.233Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:37:22
pF1fyWNZhOo5UrPQvd1ZJ2M3AgaXZlgG	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-23T23:59:50.582Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-23 23:59:51
zLNbL6rp0JJEjTuVcfR7Zq3c06gJ0Vx3	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-24T01:37:21.235Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:37:22
K0nNO_y7Sqj2l8LmD0igoqrF2-HobXff	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:35:08.500Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:35:09
EaZPdIhhjwn7voNx3r5W0fDZwKINJA6B	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-23T23:59:51.057Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-23 23:59:52
jUX5pJ2ZaXXdCRDxlHUP4dIxZAD-GDk0	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:18:30.506Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:18:31
bYpPh40KYhNnU47f6UFi3wkZfFWgMns7	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T06:36:38.972Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 06:36:39
mPbWtBByz1BDurmRHSDic9axvSJYMEWD	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:37:18.493Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:37:19
iA7nXhrOaJNjXxftfc4DHaFwFiGP9cUk	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:44:34.912Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:44:35
3jiJRfDpwxYUs7BrVT0eWGNigWIzWH85	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-17T03:03:57.389Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-17 03:03:58
I6wwp5PoIpKlKEzc3AhnR3vjqhI0UQCs	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:37:25.433Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:37:26
GcX83W0GAHbFgqzAUjqYXJ6LdgMQJOOu	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-23T23:59:54.897Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-23 23:59:55
VKtWjrhhKNRBPcG6w7PIXzCL4V4nN981	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:20:03.824Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:20:04
xlNQBjyr7M7iUqyU6qL-q7wNsC6iPeHB	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:55:38.370Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:55:39
Rp9dS449hVXWbwnV-qw41pslbHfWgO-u	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:47:48.278Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:47:49
-zaSVeqxcBC3LIUC_gMCFq01ouMh5TiV	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:47:47.894Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:47:48
rC760oc0FyXCPSND_pbfoB696tJVBOrL	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:20:17.309Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:20:18
KD_JcqZZDTRFL1ed3jw1_n7jUdU2E56V	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T06:36:45.035Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 06:36:46
EF_LgUrcFgDOgmxG36Jr-vTXJkDORpje	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T00:05:46.354Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:05:47
jGZqNBAel-FJ5IKpwhDVQBpBqO1iYDHT	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:24:35.782Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:24:36
TvUA9MMDF3Tu5l0PWPU6idLbn7JTsRFv	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T01:47:51.771Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 01:47:52
I_1k1b9okfu5C-mbC9sSjFTUUy8xywFP	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T06:35:12.887Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 06:35:13
hRayMSk1UYUaiFNANCO5kPQBiEiCrlu3	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-07-24T00:48:52.782Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 00:48:53
8eBhidhREspcZc4ANLCt_RPnSm5Iuf3o	{"cookie":{"originalMaxAge":2591999998,"expires":"2025-07-24T06:35:34.494Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 06:35:35
cCse6w_blOUUo36r-9s-aFBrE4q7JqPJ	{"cookie":{"originalMaxAge":2591999996,"expires":"2025-07-24T07:41:14.477Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":18}}	2025-07-24 07:41:15
UgO6_dZrzKZU-UIqg43K-eGXQNkqBTVY	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T06:36:23.822Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 06:36:24
-pcs0hzs-J8ROqVhmDTROx3LltcdnewL	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-24T07:25:15.604Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-07-24 07:25:16
3GMWP5nJDm78krmhQbrs9AdFELabPAOK	{"cookie":{"originalMaxAge":2591999994,"expires":"2025-07-25T12:34:02.430Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":17}}	2025-07-25 12:34:03
\.


--
-- TOC entry 3528 (class 0 OID 24680)
-- Dependencies: 234
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.site_settings (id, key, value, updated_at) FROM stdin;
1	totalDownloads	0	2025-04-23 05:06:24.197922
2	happyUsers	1000	2025-04-23 05:06:24.889095
3	modsCreated	0	2025-04-23 05:06:25.048358
4	maintenanceMode	false	2025-04-23 05:06:25.203349
5	siteTitle	JSD BeamNG Drive Mods	2025-04-23 05:06:25.35732
6	siteDescription	Premium BeamNG Drive mods by JSD	2025-04-23 05:06:25.511389
7	siteName	JSD Mods - BeamNG Drive Modifications	2025-04-24 01:25:16.242
8	contactEmail	contact@jsdmods.com	2025-04-24 01:25:16.47
9	maintenanceMessage	Site is under maintenance. Please check back later.	2025-04-24 01:25:16.7
10	activeModders	10+	2025-04-24 01:25:17.005
11	currency	USD	2025-04-24 01:25:17.158
12	defaultSubscriptionPrice	9.99	2025-04-24 01:25:17.31
13	enableStripe	true	2025-04-24 01:25:17.462
14	enableSubscriptions	true	2025-04-24 01:25:17.614
15	taxRate	0	2025-04-24 01:25:17.766
16	discordInviteLink	https://discord.gg/ctXrazHgbz	2025-04-24 01:25:17.918
17	youtubeChannelLink	https://www.youtube.com/channel/UCUNX0R4Lqvha7IDDMr09nHg	2025-04-24 01:25:18.07
\.


--
-- TOC entry 3541 (class 0 OID 65561)
-- Dependencies: 247
-- Data for Name: subscription_benefits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscription_benefits (id, title, description, icon, sort_order, created_at) FROM stdin;
1	Premium Mods Access	Access our entire library of premium quality BeamNG mods	Lock	1	2025-05-11 00:07:15.571853
2	Early Access	Get new mods before they're available to the public	Clock	2	2025-05-11 00:07:15.660371
3	Unlimited Downloads	No daily download limits for premium subscribers	Download	3	2025-05-11 00:07:15.74335
4	Priority Support	Get priority customer support and mod assistance	HeadphonesIcon	4	2025-05-11 00:07:15.822703
5	No Advertisements	Enjoy an ad-free browsing experience on our platform	Ban	5	2025-05-11 00:07:15.909355
6	Exclusive Content	Access to subscriber-only mod packs and special releases	Gift	6	2025-05-11 00:07:15.995527
\.


--
-- TOC entry 3539 (class 0 OID 65545)
-- Dependencies: 245
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

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

COPY public.users (id, username, email, discord_id, discord_username, discord_avatar, stripe_customer_id, stripe_subscription_id, is_admin, is_premium, is_banned, patreon_id, patreon_tier, created_at, last_login, password, premium_expires_at) FROM stdin;
1	JSD	jsd@example.com	\N	\N	\N	\N	\N	t	t	f	\N	\N	2025-04-23 05:06:25.669677	\N	\N	\N
2	Von	von@example.com	\N	\N	\N	\N	\N	t	t	f	\N	\N	2025-04-23 05:06:25.832783	\N	\N	\N
5	admin	admin@example.com	\N	\N	\N	\N	\N	t	f	f	\N	\N	2025-04-23 22:52:39.480465	\N	d969ed939256f1b5621a29ab18350d96ee3684e949a4a7b570bd9d03dc0b64916574b7399898021aaa136907af37681effc7e640a4254a902aee54784898ce8f.3febadab77e66de92acb288ab103e9fb	\N
6	testuser	test@example.com	\N	\N	\N	\N	\N	f	f	f	\N	\N	2025-04-24 00:03:05.907405	\N	28bc09199238d59cca225594b2cc56f22bb5654ada8be5427038878e5eebf316b71c0ba24b925ab639473bb21191f723175a4013c8339c5abc9d8b39886b6bea.be577d6e70ba0159f840ac9996c134f7	\N
15	Camoz	camoz@example.com	\N	\N	\N	\N	\N	t	f	f	\N	\N	2025-04-28 11:02:31.07	2025-06-17 01:30:05.647	c59a1eb359b776af3fa424dbda6bf819e48ccdcd36fa4dfb7e1effba0a090a0c362adfecb5059de3957182d03ef9a4d82bdf4476ac8cfa22f82969e5b443befc.c4388d86533a71865ef109223475e5f0	\N
16	Tester	tester@gmail.com	\N	\N	\N	\N	\N	f	f	f	\N	\N	2025-06-24 00:13:04.488414	2025-06-24 06:22:57.31	6642981449710d1927d186ede4b98348236f867ba1c41a1b36f97826b69ccbba22382da4ce8fc44b69d21326d0169145b60df987c40e3c8ef3069aa0a9db1dfd.a8acbe8619a3a348f4acb15c5039e775	\N
7	DriftKing88	driftking88@example.com	\N	\N	\N	\N	\N	f	t	f	\N	\N	2024-12-25 06:30:03.694514	\N	password_hash_placeholder	\N
8	RallyFan	rallyfan@example.com	\N	\N	\N	\N	\N	f	f	f	\N	\N	2025-01-24 06:30:03.694514	\N	password_hash_placeholder	\N
9	OffroadJunkie	offroadjunkie@example.com	\N	\N	\N	\N	\N	f	t	f	\N	\N	2025-01-29 06:30:03.694514	\N	password_hash_placeholder	\N
10	MuscleCarGuy	musclecar@example.com	\N	\N	\N	\N	\N	f	f	f	\N	\N	2025-02-08 06:30:03.694514	\N	password_hash_placeholder	\N
11	TrackDayHero	trackday@example.com	\N	\N	\N	\N	\N	f	t	f	\N	\N	2025-02-23 06:30:03.694514	\N	password_hash_placeholder	\N
13	DirtRacer	dirtracer@example.com	\N	\N	\N	\N	\N	f	f	f	\N	\N	2025-03-10 06:30:03.694514	\N	password_hash_placeholder	\N
14	TunerLife	tunerlife@example.com	\N	\N	\N	\N	\N	f	t	f	\N	\N	2025-03-25 06:30:03.694514	\N	password_hash_placeholder	\N
17	camoz.dev	freenitro.official1@gmail.com	1098202734156578917	camoz.dev	860480b836f93253caf2a08ed563a27c	\N	\N	t	f	f	\N	\N	2025-06-24 01:48:35.577095	2025-06-24 06:36:50.949	\N	\N
12	BeamNGPro	beamngpro@example.com	\N	\N	\N	\N	\N	f	f	t	\N	\N	2025-03-05 06:30:03.694514	\N	password_hash_placeholder	\N
18	jsd_beamng	shynejah07@gmail.com	534881305549340702	jsd_beamng	a_9820774822bd168376585a73af9a8ded	\N	\N	t	f	f	\N	\N	2025-06-24 06:36:45.493765	2025-06-24 06:36:45.458	\N	\N
3	Developer	dev@example.com	\N	\N	\N	\N	\N	t	t	f	\N	\N	2025-04-23 05:06:25.986494	2025-04-27 17:39:46.698	64641b802ef8f98ff196e4fa198436c50e176b9aa9124ee499c545d7a377e3ec59ed12f0d95db957818f59e074f56414c609dad54aba617e3b8dcac7eaa83400.592f3365a385c3256791e534a5d6b5b0	\N
\.


--
-- TOC entry 3565 (class 0 OID 0)
-- Dependencies: 215
-- Name: admin_activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_activity_log_id_seq', 24, true);


--
-- TOC entry 3566 (class 0 OID 0)
-- Dependencies: 217
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 6, true);


--
-- TOC entry 3567 (class 0 OID 0)
-- Dependencies: 219
-- Name: forum_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_categories_id_seq', 5, true);


--
-- TOC entry 3568 (class 0 OID 0)
-- Dependencies: 221
-- Name: forum_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_replies_id_seq', 144, true);


--
-- TOC entry 3569 (class 0 OID 0)
-- Dependencies: 223
-- Name: forum_threads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_threads_id_seq', 31, true);


--
-- TOC entry 3570 (class 0 OID 0)
-- Dependencies: 237
-- Name: mod_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.mod_images_id_seq', 1, false);


--
-- TOC entry 3571 (class 0 OID 0)
-- Dependencies: 239
-- Name: mod_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.mod_requirements_id_seq', 1, false);


--
-- TOC entry 3572 (class 0 OID 0)
-- Dependencies: 225
-- Name: mod_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.mod_versions_id_seq', 3, true);


--
-- TOC entry 3573 (class 0 OID 0)
-- Dependencies: 227
-- Name: mods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.mods_id_seq', 27, true);


--
-- TOC entry 3574 (class 0 OID 0)
-- Dependencies: 241
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 3575 (class 0 OID 0)
-- Dependencies: 229
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.purchases_id_seq', 4, true);


--
-- TOC entry 3576 (class 0 OID 0)
-- Dependencies: 231
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 44, true);


--
-- TOC entry 3577 (class 0 OID 0)
-- Dependencies: 233
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 17, true);


--
-- TOC entry 3578 (class 0 OID 0)
-- Dependencies: 246
-- Name: subscription_benefits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subscription_benefits_id_seq', 6, true);


--
-- TOC entry 3579 (class 0 OID 0)
-- Dependencies: 244
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 3, true);


--
-- TOC entry 3580 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 18, true);


--
-- TOC entry 3324 (class 2606 OID 24585)
-- Name: admin_activity_log admin_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_activity_log
    ADD CONSTRAINT admin_activity_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3326 (class 2606 OID 24593)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3328 (class 2606 OID 24603)
-- Name: forum_categories forum_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_categories
    ADD CONSTRAINT forum_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3330 (class 2606 OID 24614)
-- Name: forum_replies forum_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_pkey PRIMARY KEY (id);


--
-- TOC entry 3332 (class 2606 OID 24628)
-- Name: forum_threads forum_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_threads
    ADD CONSTRAINT forum_threads_pkey PRIMARY KEY (id);


--
-- TOC entry 3354 (class 2606 OID 40970)
-- Name: mod_images mod_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mod_images
    ADD CONSTRAINT mod_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3356 (class 2606 OID 40980)
-- Name: mod_requirements mod_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mod_requirements
    ADD CONSTRAINT mod_requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 3334 (class 2606 OID 24639)
-- Name: mod_versions mod_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mod_versions
    ADD CONSTRAINT mod_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3336 (class 2606 OID 24656)
-- Name: mods mods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.mods
    ADD CONSTRAINT mods_pkey PRIMARY KEY (id);


--
-- TOC entry 3358 (class 2606 OID 40992)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 24667)
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- TOC entry 3340 (class 2606 OID 24678)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 3361 (class 2606 OID 65542)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3342 (class 2606 OID 24690)
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- TOC entry 3344 (class 2606 OID 24688)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3365 (class 2606 OID 65570)
-- Name: subscription_benefits subscription_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_benefits
    ADD CONSTRAINT subscription_benefits_pkey PRIMARY KEY (id);


--
-- TOC entry 3363 (class 2606 OID 65559)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3346 (class 2606 OID 24707)
-- Name: users users_discord_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_discord_id_unique UNIQUE (discord_id);


--
-- TOC entry 3348 (class 2606 OID 24709)
-- Name: users users_patreon_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_patreon_id_unique UNIQUE (patreon_id);


--
-- TOC entry 3350 (class 2606 OID 24703)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3352 (class 2606 OID 24705)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 3359 (class 1259 OID 65543)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 3547
-- Name: DATABASE neondb; Type: ACL; Schema: -; Owner: neondb_owner
--

GRANT ALL ON DATABASE neondb TO neon_superuser;


--
-- TOC entry 2118 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2117 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-06-25 12:34:10 UTC

--
-- PostgreSQL database dump complete
--

