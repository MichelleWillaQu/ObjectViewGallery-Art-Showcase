--
-- PostgreSQL database dump
--

-- Dumped from database version 10.10 (Ubuntu 10.10-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.10 (Ubuntu 10.10-0ubuntu0.18.04.1)

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
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.follows (
    f_id integer NOT NULL,
    user_followed_id integer,
    follower_id integer
);


ALTER TABLE public.follows OWNER TO vagrant;

--
-- Name: follows_f_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.follows_f_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.follows_f_id_seq OWNER TO vagrant;

--
-- Name: follows_f_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.follows_f_id_seq OWNED BY public.follows.f_id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.likes (
    like_id integer NOT NULL,
    media_id integer,
    user_who_liked integer
);


ALTER TABLE public.likes OWNER TO vagrant;

--
-- Name: likes_like_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.likes_like_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.likes_like_id_seq OWNER TO vagrant;

--
-- Name: likes_like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.likes_like_id_seq OWNED BY public.likes.like_id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.media (
    media_id integer NOT NULL,
    media_name character varying(100),
    meta_info text,
    media_url text,
    is_downloadable boolean,
    date_created timestamp without time zone,
    thumb_url text,
    "order" integer,
    type_id integer,
    user_id integer
);


ALTER TABLE public.media OWNER TO vagrant;

--
-- Name: media_media_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.media_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_media_id_seq OWNER TO vagrant;

--
-- Name: media_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.media_media_id_seq OWNED BY public.media.media_id;


--
-- Name: mediatypes; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.mediatypes (
    type_id integer NOT NULL,
    media_ext character varying(5)
);


ALTER TABLE public.mediatypes OWNER TO vagrant;

--
-- Name: mediatypes_type_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.mediatypes_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mediatypes_type_id_seq OWNER TO vagrant;

--
-- Name: mediatypes_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.mediatypes_type_id_seq OWNED BY public.mediatypes.type_id;


--
-- Name: objtomtl; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.objtomtl (
    objtomtl_key integer NOT NULL,
    media_id integer,
    mtl_url text
);


ALTER TABLE public.objtomtl OWNER TO vagrant;

--
-- Name: objtomtl_objtomtl_key_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.objtomtl_objtomtl_key_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.objtomtl_objtomtl_key_seq OWNER TO vagrant;

--
-- Name: objtomtl_objtomtl_key_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.objtomtl_objtomtl_key_seq OWNED BY public.objtomtl.objtomtl_key;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.tags (
    tag_id integer NOT NULL,
    tag_name character varying(64)
);


ALTER TABLE public.tags OWNER TO vagrant;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.tags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_tag_id_seq OWNER TO vagrant;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.tags_tag_id_seq OWNED BY public.tags.tag_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(64),
    password bytea,
    info text,
    email character varying(254),
    da_name character varying(64),
    last_da_retrieval timestamp without time zone,
    avatar_url text,
    background_url text,
    folder_url text
);


ALTER TABLE public.users OWNER TO vagrant;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO vagrant;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: whichtags; Type: TABLE; Schema: public; Owner: vagrant
--

CREATE TABLE public.whichtags (
    wt_id integer NOT NULL,
    media_id integer,
    tag_id integer
);


ALTER TABLE public.whichtags OWNER TO vagrant;

--
-- Name: whichtags_wt_id_seq; Type: SEQUENCE; Schema: public; Owner: vagrant
--

CREATE SEQUENCE public.whichtags_wt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whichtags_wt_id_seq OWNER TO vagrant;

--
-- Name: whichtags_wt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vagrant
--

ALTER SEQUENCE public.whichtags_wt_id_seq OWNED BY public.whichtags.wt_id;


--
-- Name: follows f_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.follows ALTER COLUMN f_id SET DEFAULT nextval('public.follows_f_id_seq'::regclass);


--
-- Name: likes like_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.likes ALTER COLUMN like_id SET DEFAULT nextval('public.likes_like_id_seq'::regclass);


--
-- Name: media media_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.media ALTER COLUMN media_id SET DEFAULT nextval('public.media_media_id_seq'::regclass);


--
-- Name: mediatypes type_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.mediatypes ALTER COLUMN type_id SET DEFAULT nextval('public.mediatypes_type_id_seq'::regclass);


--
-- Name: objtomtl objtomtl_key; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.objtomtl ALTER COLUMN objtomtl_key SET DEFAULT nextval('public.objtomtl_objtomtl_key_seq'::regclass);


--
-- Name: tags tag_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.tags ALTER COLUMN tag_id SET DEFAULT nextval('public.tags_tag_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: whichtags wt_id; Type: DEFAULT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.whichtags ALTER COLUMN wt_id SET DEFAULT nextval('public.whichtags_wt_id_seq'::regclass);


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.follows (f_id, user_followed_id, follower_id) FROM stdin;
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.likes (like_id, media_id, user_who_liked) FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.media (media_id, media_name, meta_info, media_url, is_downloadable, date_created, thumb_url, "order", type_id, user_id) FROM stdin;
\.


--
-- Data for Name: mediatypes; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.mediatypes (type_id, media_ext) FROM stdin;
1	gif
2	jpg
3	jpeg
4	png
5	obj
6	gltf
7	webp
\.


--
-- Data for Name: objtomtl; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.objtomtl (objtomtl_key, media_id, mtl_url) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.tags (tag_id, tag_name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.users (user_id, username, password, info, email, da_name, last_da_retrieval, avatar_url, background_url, folder_url) FROM stdin;
\.


--
-- Data for Name: whichtags; Type: TABLE DATA; Schema: public; Owner: vagrant
--

COPY public.whichtags (wt_id, media_id, tag_id) FROM stdin;
\.


--
-- Name: follows_f_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.follows_f_id_seq', 1, false);


--
-- Name: likes_like_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.likes_like_id_seq', 1, false);


--
-- Name: media_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.media_media_id_seq', 1, false);


--
-- Name: mediatypes_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.mediatypes_type_id_seq', 7, true);


--
-- Name: objtomtl_objtomtl_key_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.objtomtl_objtomtl_key_seq', 1, false);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.tags_tag_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


--
-- Name: whichtags_wt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vagrant
--

SELECT pg_catalog.setval('public.whichtags_wt_id_seq', 1, false);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (f_id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (like_id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (media_id);


--
-- Name: mediatypes mediatypes_media_ext_key; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.mediatypes
    ADD CONSTRAINT mediatypes_media_ext_key UNIQUE (media_ext);


--
-- Name: mediatypes mediatypes_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.mediatypes
    ADD CONSTRAINT mediatypes_pkey PRIMARY KEY (type_id);


--
-- Name: objtomtl objtomtl_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.objtomtl
    ADD CONSTRAINT objtomtl_pkey PRIMARY KEY (objtomtl_key);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);


--
-- Name: tags tags_tag_name_key; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tag_name_key UNIQUE (tag_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: whichtags whichtags_pkey; Type: CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.whichtags
    ADD CONSTRAINT whichtags_pkey PRIMARY KEY (wt_id);


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(user_id);


--
-- Name: follows follows_user_followed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_user_followed_id_fkey FOREIGN KEY (user_followed_id) REFERENCES public.users(user_id);


--
-- Name: likes likes_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(media_id);


--
-- Name: likes likes_user_who_liked_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_who_liked_fkey FOREIGN KEY (user_who_liked) REFERENCES public.users(user_id);


--
-- Name: media media_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.mediatypes(type_id);


--
-- Name: media media_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: objtomtl objtomtl_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.objtomtl
    ADD CONSTRAINT objtomtl_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(media_id);


--
-- Name: whichtags whichtags_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.whichtags
    ADD CONSTRAINT whichtags_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(media_id);


--
-- Name: whichtags whichtags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vagrant
--

ALTER TABLE ONLY public.whichtags
    ADD CONSTRAINT whichtags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id);


--
-- PostgreSQL database dump complete
--

