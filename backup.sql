--
-- PostgreSQL database dump
--

\restrict sabWW2tLObuaHVJnFlUjPpY68iWaMJePkBDHxR7WlgrEBMHMgAQpOt8xUyp6zcv

-- Dumped from database version 17.9 (Ubuntu 17.9-0ubuntu0.25.10.1)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-0ubuntu0.25.10.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_event_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_event_entity (
    id character varying(36) NOT NULL,
    admin_event_time bigint,
    realm_id character varying(255),
    operation_type character varying(255),
    auth_realm_id character varying(255),
    auth_client_id character varying(255),
    auth_user_id character varying(255),
    ip_address character varying(255),
    resource_path character varying(2550),
    representation text,
    error character varying(255),
    resource_type character varying(64),
    details_json text
);


ALTER TABLE public.admin_event_entity OWNER TO postgres;

--
-- Name: associated_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.associated_policy (
    policy_id character varying(36) NOT NULL,
    associated_policy_id character varying(36) NOT NULL
);


ALTER TABLE public.associated_policy OWNER TO postgres;

--
-- Name: authentication_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_execution (
    id character varying(36) NOT NULL,
    alias character varying(255),
    authenticator character varying(36),
    realm_id character varying(36),
    flow_id character varying(36),
    requirement integer,
    priority integer,
    authenticator_flow boolean DEFAULT false NOT NULL,
    auth_flow_id character varying(36),
    auth_config character varying(36)
);


ALTER TABLE public.authentication_execution OWNER TO postgres;

--
-- Name: authentication_flow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_flow (
    id character varying(36) NOT NULL,
    alias character varying(255),
    description character varying(255),
    realm_id character varying(36),
    provider_id character varying(36) DEFAULT 'basic-flow'::character varying NOT NULL,
    top_level boolean DEFAULT false NOT NULL,
    built_in boolean DEFAULT false NOT NULL
);


ALTER TABLE public.authentication_flow OWNER TO postgres;

--
-- Name: authenticator_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authenticator_config (
    id character varying(36) NOT NULL,
    alias character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.authenticator_config OWNER TO postgres;

--
-- Name: authenticator_config_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authenticator_config_entry (
    authenticator_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.authenticator_config_entry OWNER TO postgres;

--
-- Name: broker_link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broker_link (
    identity_provider character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL,
    broker_user_id character varying(255),
    broker_username character varying(255),
    token text,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.broker_link OWNER TO postgres;

--
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    full_scope_allowed boolean DEFAULT false NOT NULL,
    client_id character varying(255),
    not_before integer,
    public_client boolean DEFAULT false NOT NULL,
    secret character varying(255),
    base_url character varying(255),
    bearer_only boolean DEFAULT false NOT NULL,
    management_url character varying(255),
    surrogate_auth_required boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    protocol character varying(255),
    node_rereg_timeout integer DEFAULT 0,
    frontchannel_logout boolean DEFAULT false NOT NULL,
    consent_required boolean DEFAULT false NOT NULL,
    name character varying(255),
    service_accounts_enabled boolean DEFAULT false NOT NULL,
    client_authenticator_type character varying(255),
    root_url character varying(255),
    description character varying(255),
    registration_token character varying(255),
    standard_flow_enabled boolean DEFAULT true NOT NULL,
    implicit_flow_enabled boolean DEFAULT false NOT NULL,
    direct_access_grants_enabled boolean DEFAULT false NOT NULL,
    always_display_in_console boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client OWNER TO postgres;

--
-- Name: client_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_attributes (
    client_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.client_attributes OWNER TO postgres;

--
-- Name: client_auth_flow_bindings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_auth_flow_bindings (
    client_id character varying(36) NOT NULL,
    flow_id character varying(36),
    binding_name character varying(255) NOT NULL
);


ALTER TABLE public.client_auth_flow_bindings OWNER TO postgres;

--
-- Name: client_initial_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_initial_access (
    id character varying(36) NOT NULL,
    realm_id character varying(36) NOT NULL,
    "timestamp" integer,
    expiration integer,
    count integer,
    remaining_count integer
);


ALTER TABLE public.client_initial_access OWNER TO postgres;

--
-- Name: client_node_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_node_registrations (
    client_id character varying(36) NOT NULL,
    value integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_node_registrations OWNER TO postgres;

--
-- Name: client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope (
    id character varying(36) NOT NULL,
    name character varying(255),
    realm_id character varying(36),
    description character varying(255),
    protocol character varying(255)
);


ALTER TABLE public.client_scope OWNER TO postgres;

--
-- Name: client_scope_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_attributes (
    scope_id character varying(36) NOT NULL,
    value character varying(2048),
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_scope_attributes OWNER TO postgres;

--
-- Name: client_scope_client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_client (
    client_id character varying(255) NOT NULL,
    scope_id character varying(255) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client_scope_client OWNER TO postgres;

--
-- Name: client_scope_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_scope_role_mapping (
    scope_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.client_scope_role_mapping OWNER TO postgres;

--
-- Name: component; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_id character varying(36),
    provider_id character varying(36),
    provider_type character varying(255),
    realm_id character varying(36),
    sub_type character varying(255)
);


ALTER TABLE public.component OWNER TO postgres;

--
-- Name: component_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.component_config (
    id character varying(36) NOT NULL,
    component_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.component_config OWNER TO postgres;

--
-- Name: composite_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.composite_role (
    composite character varying(36) NOT NULL,
    child_role character varying(36) NOT NULL
);


ALTER TABLE public.composite_role OWNER TO postgres;

--
-- Name: credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    user_id character varying(36),
    created_date bigint,
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer,
    version integer DEFAULT 0
);


ALTER TABLE public.credential OWNER TO postgres;

--
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO postgres;

--
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO postgres;

--
-- Name: default_client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.default_client_scope (
    realm_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.default_client_scope OWNER TO postgres;

--
-- Name: event_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_entity (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    details_json character varying(2550),
    error character varying(255),
    ip_address character varying(255),
    realm_id character varying(255),
    session_id character varying(255),
    event_time bigint,
    type character varying(255),
    user_id character varying(255),
    details_json_long_value text
);


ALTER TABLE public.event_entity OWNER TO postgres;

--
-- Name: fed_user_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_attribute (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    value character varying(2024),
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.fed_user_attribute OWNER TO postgres;

--
-- Name: fed_user_consent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.fed_user_consent OWNER TO postgres;

--
-- Name: fed_user_consent_cl_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_consent_cl_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.fed_user_consent_cl_scope OWNER TO postgres;

--
-- Name: fed_user_credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    created_date bigint,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer
);


ALTER TABLE public.fed_user_credential OWNER TO postgres;

--
-- Name: fed_user_group_membership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_group_membership OWNER TO postgres;

--
-- Name: fed_user_required_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_required_action (
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_required_action OWNER TO postgres;

--
-- Name: fed_user_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fed_user_role_mapping (
    role_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_role_mapping OWNER TO postgres;

--
-- Name: federated_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_identity (
    identity_provider character varying(255) NOT NULL,
    realm_id character varying(36),
    federated_user_id character varying(255),
    federated_username character varying(255),
    token text,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_identity OWNER TO postgres;

--
-- Name: federated_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_user (
    id character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_user OWNER TO postgres;

--
-- Name: group_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_attribute OWNER TO postgres;

--
-- Name: group_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_role_mapping (
    role_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_role_mapping OWNER TO postgres;

--
-- Name: identity_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider (
    internal_id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    provider_alias character varying(255),
    provider_id character varying(255),
    store_token boolean,
    authenticate_by_default boolean,
    realm_id character varying(36),
    add_token_role boolean,
    trust_email boolean,
    first_broker_login_flow_id character varying(36),
    post_broker_login_flow_id character varying(36),
    provider_display_name character varying(255),
    link_only boolean,
    organization_id character varying(255),
    hide_on_login boolean
);


ALTER TABLE public.identity_provider OWNER TO postgres;

--
-- Name: identity_provider_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider_config (
    identity_provider_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.identity_provider_config OWNER TO postgres;

--
-- Name: identity_provider_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identity_provider_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    idp_alias character varying(255) NOT NULL,
    idp_mapper_name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.identity_provider_mapper OWNER TO postgres;

--
-- Name: idp_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.idp_mapper_config (
    idp_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.idp_mapper_config OWNER TO postgres;

--
-- Name: jgroups_ping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jgroups_ping (
    address character varying(200) NOT NULL,
    name character varying(200),
    cluster_name character varying(200) NOT NULL,
    ip character varying(200) NOT NULL,
    coord boolean
);


ALTER TABLE public.jgroups_ping OWNER TO postgres;

--
-- Name: keycloak_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keycloak_group (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_group character varying(36) NOT NULL,
    realm_id character varying(36),
    type integer DEFAULT 0 NOT NULL,
    description character varying(255)
);


ALTER TABLE public.keycloak_group OWNER TO postgres;

--
-- Name: keycloak_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keycloak_role (
    id character varying(36) NOT NULL,
    client_realm_constraint character varying(255),
    client_role boolean DEFAULT false NOT NULL,
    description character varying(255),
    name character varying(255),
    realm_id character varying(255),
    client character varying(36),
    realm character varying(36)
);


ALTER TABLE public.keycloak_role OWNER TO postgres;

--
-- Name: migration_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migration_model (
    id character varying(36) NOT NULL,
    version character varying(36),
    update_time bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.migration_model OWNER TO postgres;

--
-- Name: offline_client_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_client_session (
    user_session_id character varying(36) NOT NULL,
    client_id character varying(255) NOT NULL,
    offline_flag character varying(4) NOT NULL,
    "timestamp" integer,
    data text,
    client_storage_provider character varying(36) DEFAULT 'local'::character varying NOT NULL,
    external_client_id character varying(255) DEFAULT 'local'::character varying NOT NULL,
    version integer DEFAULT 0
);


ALTER TABLE public.offline_client_session OWNER TO postgres;

--
-- Name: offline_user_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offline_user_session (
    user_session_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    created_on integer NOT NULL,
    offline_flag character varying(4) NOT NULL,
    data text,
    last_session_refresh integer DEFAULT 0 NOT NULL,
    broker_session_id character varying(1024),
    version integer DEFAULT 0,
    remember_me boolean
);


ALTER TABLE public.offline_user_session OWNER TO postgres;

--
-- Name: org; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org (
    id character varying(255) NOT NULL,
    enabled boolean NOT NULL,
    realm_id character varying(255) NOT NULL,
    group_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(4000),
    alias character varying(255) NOT NULL,
    redirect_url character varying(2048)
);


ALTER TABLE public.org OWNER TO postgres;

--
-- Name: org_domain; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_domain (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    verified boolean NOT NULL,
    org_id character varying(255) NOT NULL
);


ALTER TABLE public.org_domain OWNER TO postgres;

--
-- Name: org_invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_invitation (
    id character varying(36) NOT NULL,
    organization_id character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    created_at integer NOT NULL,
    expires_at integer,
    invite_link character varying(2048)
);


ALTER TABLE public.org_invitation OWNER TO postgres;

--
-- Name: policy_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policy_config (
    policy_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.policy_config OWNER TO postgres;

--
-- Name: protocol_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    protocol character varying(255) NOT NULL,
    protocol_mapper_name character varying(255) NOT NULL,
    client_id character varying(36),
    client_scope_id character varying(36)
);


ALTER TABLE public.protocol_mapper OWNER TO postgres;

--
-- Name: protocol_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol_mapper_config (
    protocol_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.protocol_mapper_config OWNER TO postgres;

--
-- Name: realm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm (
    id character varying(36) NOT NULL,
    access_code_lifespan integer,
    user_action_lifespan integer,
    access_token_lifespan integer,
    account_theme character varying(255),
    admin_theme character varying(255),
    email_theme character varying(255),
    enabled boolean DEFAULT false NOT NULL,
    events_enabled boolean DEFAULT false NOT NULL,
    events_expiration bigint,
    login_theme character varying(255),
    name character varying(255),
    not_before integer,
    password_policy character varying(2550),
    registration_allowed boolean DEFAULT false NOT NULL,
    remember_me boolean DEFAULT false NOT NULL,
    reset_password_allowed boolean DEFAULT false NOT NULL,
    social boolean DEFAULT false NOT NULL,
    ssl_required character varying(255),
    sso_idle_timeout integer,
    sso_max_lifespan integer,
    update_profile_on_soc_login boolean DEFAULT false NOT NULL,
    verify_email boolean DEFAULT false NOT NULL,
    master_admin_client character varying(36),
    login_lifespan integer,
    internationalization_enabled boolean DEFAULT false NOT NULL,
    default_locale character varying(255),
    reg_email_as_username boolean DEFAULT false NOT NULL,
    admin_events_enabled boolean DEFAULT false NOT NULL,
    admin_events_details_enabled boolean DEFAULT false NOT NULL,
    edit_username_allowed boolean DEFAULT false NOT NULL,
    otp_policy_counter integer DEFAULT 0,
    otp_policy_window integer DEFAULT 1,
    otp_policy_period integer DEFAULT 30,
    otp_policy_digits integer DEFAULT 6,
    otp_policy_alg character varying(36) DEFAULT 'HmacSHA1'::character varying,
    otp_policy_type character varying(36) DEFAULT 'totp'::character varying,
    browser_flow character varying(36),
    registration_flow character varying(36),
    direct_grant_flow character varying(36),
    reset_credentials_flow character varying(36),
    client_auth_flow character varying(36),
    offline_session_idle_timeout integer DEFAULT 0,
    revoke_refresh_token boolean DEFAULT false NOT NULL,
    access_token_life_implicit integer DEFAULT 0,
    login_with_email_allowed boolean DEFAULT true NOT NULL,
    duplicate_emails_allowed boolean DEFAULT false NOT NULL,
    docker_auth_flow character varying(36),
    refresh_token_max_reuse integer DEFAULT 0,
    allow_user_managed_access boolean DEFAULT false NOT NULL,
    sso_max_lifespan_remember_me integer DEFAULT 0 NOT NULL,
    sso_idle_timeout_remember_me integer DEFAULT 0 NOT NULL,
    default_role character varying(255)
);


ALTER TABLE public.realm OWNER TO postgres;

--
-- Name: realm_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_attribute (
    name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    value text
);


ALTER TABLE public.realm_attribute OWNER TO postgres;

--
-- Name: realm_default_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_default_groups (
    realm_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_default_groups OWNER TO postgres;

--
-- Name: realm_enabled_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_enabled_event_types (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_enabled_event_types OWNER TO postgres;

--
-- Name: realm_events_listeners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_events_listeners (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_events_listeners OWNER TO postgres;

--
-- Name: realm_localizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_localizations (
    realm_id character varying(255) NOT NULL,
    locale character varying(255) NOT NULL,
    texts text NOT NULL
);


ALTER TABLE public.realm_localizations OWNER TO postgres;

--
-- Name: realm_required_credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_required_credential (
    type character varying(255) NOT NULL,
    form_label character varying(255),
    input boolean DEFAULT false NOT NULL,
    secret boolean DEFAULT false NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_required_credential OWNER TO postgres;

--
-- Name: realm_smtp_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_smtp_config (
    realm_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.realm_smtp_config OWNER TO postgres;

--
-- Name: realm_supported_locales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realm_supported_locales (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_supported_locales OWNER TO postgres;

--
-- Name: redirect_uris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redirect_uris (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.redirect_uris OWNER TO postgres;

--
-- Name: required_action_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_action_config (
    required_action_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.required_action_config OWNER TO postgres;

--
-- Name: required_action_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.required_action_provider (
    id character varying(36) NOT NULL,
    alias character varying(255),
    name character varying(255),
    realm_id character varying(36),
    enabled boolean DEFAULT false NOT NULL,
    default_action boolean DEFAULT false NOT NULL,
    provider_id character varying(255),
    priority integer
);


ALTER TABLE public.required_action_provider OWNER TO postgres;

--
-- Name: resource_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    resource_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_attribute OWNER TO postgres;

--
-- Name: resource_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_policy (
    resource_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_policy OWNER TO postgres;

--
-- Name: resource_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_scope (
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_scope OWNER TO postgres;

--
-- Name: resource_server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server (
    id character varying(36) NOT NULL,
    allow_rs_remote_mgmt boolean DEFAULT false NOT NULL,
    policy_enforce_mode smallint NOT NULL,
    decision_strategy smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.resource_server OWNER TO postgres;

--
-- Name: resource_server_perm_ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_perm_ticket (
    id character varying(36) NOT NULL,
    owner character varying(255) NOT NULL,
    requester character varying(255) NOT NULL,
    created_timestamp bigint NOT NULL,
    granted_timestamp bigint,
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36),
    resource_server_id character varying(36) NOT NULL,
    policy_id character varying(36)
);


ALTER TABLE public.resource_server_perm_ticket OWNER TO postgres;

--
-- Name: resource_server_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_policy (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    type character varying(255) NOT NULL,
    decision_strategy smallint,
    logic smallint,
    resource_server_id character varying(36) NOT NULL,
    owner character varying(255)
);


ALTER TABLE public.resource_server_policy OWNER TO postgres;

--
-- Name: resource_server_resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_resource (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255),
    icon_uri character varying(255),
    owner character varying(255) NOT NULL,
    resource_server_id character varying(36) NOT NULL,
    owner_managed_access boolean DEFAULT false NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_resource OWNER TO postgres;

--
-- Name: resource_server_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_server_scope (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    icon_uri character varying(255),
    resource_server_id character varying(36) NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_scope OWNER TO postgres;

--
-- Name: resource_uris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_uris (
    resource_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.resource_uris OWNER TO postgres;

--
-- Name: revoked_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revoked_token (
    id character varying(255) NOT NULL,
    expire bigint NOT NULL
);


ALTER TABLE public.revoked_token OWNER TO postgres;

--
-- Name: role_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_attribute (
    id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255)
);


ALTER TABLE public.role_attribute OWNER TO postgres;

--
-- Name: scope_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope_mapping (
    client_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_mapping OWNER TO postgres;

--
-- Name: scope_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope_policy (
    scope_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_policy OWNER TO postgres;

--
-- Name: server_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_config (
    server_config_key character varying(255) NOT NULL,
    value text NOT NULL,
    version integer DEFAULT 0
);


ALTER TABLE public.server_config OWNER TO postgres;

--
-- Name: user_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_attribute (
    name character varying(255) NOT NULL,
    value character varying(255),
    user_id character varying(36) NOT NULL,
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.user_attribute OWNER TO postgres;

--
-- Name: user_consent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(36) NOT NULL,
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.user_consent OWNER TO postgres;

--
-- Name: user_consent_client_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_consent_client_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.user_consent_client_scope OWNER TO postgres;

--
-- Name: user_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_entity (
    id character varying(36) NOT NULL,
    email character varying(255),
    email_constraint character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    federation_link character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    realm_id character varying(255),
    username character varying(255),
    created_timestamp bigint,
    service_account_client_link character varying(255),
    not_before integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_entity OWNER TO postgres;

--
-- Name: user_federation_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_config (
    user_federation_provider_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_config OWNER TO postgres;

--
-- Name: user_federation_mapper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    federation_provider_id character varying(36) NOT NULL,
    federation_mapper_type character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.user_federation_mapper OWNER TO postgres;

--
-- Name: user_federation_mapper_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_mapper_config (
    user_federation_mapper_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_mapper_config OWNER TO postgres;

--
-- Name: user_federation_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_federation_provider (
    id character varying(36) NOT NULL,
    changed_sync_period integer,
    display_name character varying(255),
    full_sync_period integer,
    last_sync integer,
    priority integer,
    provider_name character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.user_federation_provider OWNER TO postgres;

--
-- Name: user_group_membership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    membership_type character varying(255) NOT NULL
);


ALTER TABLE public.user_group_membership OWNER TO postgres;

--
-- Name: user_required_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_required_action (
    user_id character varying(36) NOT NULL,
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL
);


ALTER TABLE public.user_required_action OWNER TO postgres;

--
-- Name: user_role_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role_mapping (
    role_id character varying(255) NOT NULL,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.user_role_mapping OWNER TO postgres;

--
-- Name: web_origins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.web_origins (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.web_origins OWNER TO postgres;

--
-- Name: workflow_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_state (
    execution_id character varying(255) NOT NULL,
    resource_id character varying(255) NOT NULL,
    workflow_id character varying(255) NOT NULL,
    resource_type character varying(255),
    scheduled_step_id character varying(255),
    scheduled_step_timestamp bigint
);


ALTER TABLE public.workflow_state OWNER TO postgres;

--
-- Data for Name: admin_event_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_event_entity (id, admin_event_time, realm_id, operation_type, auth_realm_id, auth_client_id, auth_user_id, ip_address, resource_path, representation, error, resource_type, details_json) FROM stdin;
\.


--
-- Data for Name: associated_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.associated_policy (policy_id, associated_policy_id) FROM stdin;
\.


--
-- Data for Name: authentication_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_execution (id, alias, authenticator, realm_id, flow_id, requirement, priority, authenticator_flow, auth_flow_id, auth_config) FROM stdin;
d4af30a2-173c-4354-b947-1419f802fa86	\N	auth-cookie	c36b20d9-63c7-4267-aa45-992c63e9c0a6	baedd61d-c0e7-4a19-aa70-5f43fa029239	2	10	f	\N	\N
a98f328c-71fb-402c-952c-4ee3c7150fbc	\N	auth-spnego	c36b20d9-63c7-4267-aa45-992c63e9c0a6	baedd61d-c0e7-4a19-aa70-5f43fa029239	3	20	f	\N	\N
a3a8ac8d-8df1-4342-a4ac-e51375df6279	\N	identity-provider-redirector	c36b20d9-63c7-4267-aa45-992c63e9c0a6	baedd61d-c0e7-4a19-aa70-5f43fa029239	2	25	f	\N	\N
2f1532c9-4e68-43f2-9e42-1d262ffdedd2	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	baedd61d-c0e7-4a19-aa70-5f43fa029239	2	30	t	d0fc9f56-cd5b-46ce-bf6c-31f355be8371	\N
87787033-a7d5-44d2-85b3-48beab126e47	\N	auth-username-password-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	d0fc9f56-cd5b-46ce-bf6c-31f355be8371	0	10	f	\N	\N
55769162-7c30-4158-a697-dfabaf3a7f44	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	d0fc9f56-cd5b-46ce-bf6c-31f355be8371	1	20	t	6728df5c-4a5e-4d15-903c-0d76eea91d0a	\N
4549a79c-1a6a-4b8b-b32e-127f691331ab	\N	conditional-user-configured	c36b20d9-63c7-4267-aa45-992c63e9c0a6	6728df5c-4a5e-4d15-903c-0d76eea91d0a	0	10	f	\N	\N
39b729f4-503a-43dc-9b4a-6347f0c99bd0	\N	conditional-credential	c36b20d9-63c7-4267-aa45-992c63e9c0a6	6728df5c-4a5e-4d15-903c-0d76eea91d0a	0	20	f	\N	b93934b4-91d9-490f-a3d6-fbe23565763b
f7437878-4aa3-4f62-9946-f6eea44c138e	\N	auth-otp-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	6728df5c-4a5e-4d15-903c-0d76eea91d0a	2	30	f	\N	\N
be7fb33f-6718-4c49-9f25-87c78b92c3ec	\N	webauthn-authenticator	c36b20d9-63c7-4267-aa45-992c63e9c0a6	6728df5c-4a5e-4d15-903c-0d76eea91d0a	3	40	f	\N	\N
2c35beaa-38c9-4df3-9d99-81f40ba060f5	\N	auth-recovery-authn-code-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	6728df5c-4a5e-4d15-903c-0d76eea91d0a	3	50	f	\N	\N
64d06f7e-32c7-4bf8-a10b-72468e033741	\N	direct-grant-validate-username	c36b20d9-63c7-4267-aa45-992c63e9c0a6	aab67545-d041-406b-9ded-ef3a7a2a4e68	0	10	f	\N	\N
a4bc7b26-864e-4cf5-84da-8862eaddb312	\N	direct-grant-validate-password	c36b20d9-63c7-4267-aa45-992c63e9c0a6	aab67545-d041-406b-9ded-ef3a7a2a4e68	0	20	f	\N	\N
e13171f4-2e5d-4bfb-bbae-74a044d659db	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	aab67545-d041-406b-9ded-ef3a7a2a4e68	1	30	t	e27b748f-b57e-4183-937a-89ee89df1593	\N
a05ddb87-205a-429b-9d2a-1cf574797d70	\N	conditional-user-configured	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e27b748f-b57e-4183-937a-89ee89df1593	0	10	f	\N	\N
f12e7871-9249-44ab-937a-8959ee6cfc8e	\N	direct-grant-validate-otp	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e27b748f-b57e-4183-937a-89ee89df1593	0	20	f	\N	\N
7ac39b98-49de-434c-a848-be5e4707417d	\N	registration-page-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	7aaccb66-801d-4723-9681-63eda55b8484	0	10	t	e3109ded-2e2b-439b-8b70-e12d6e18ca86	\N
88eb343d-a892-4107-8450-32cf44cf7a26	\N	registration-user-creation	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e3109ded-2e2b-439b-8b70-e12d6e18ca86	0	20	f	\N	\N
82f1ea3c-7ec9-41a5-ae79-f2c163b22674	\N	registration-password-action	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e3109ded-2e2b-439b-8b70-e12d6e18ca86	0	50	f	\N	\N
5d1c636f-db0e-4864-8c57-1173fdff4cd2	\N	registration-recaptcha-action	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e3109ded-2e2b-439b-8b70-e12d6e18ca86	3	60	f	\N	\N
7e8fb59b-6749-4b73-96ec-9010248a193b	\N	registration-terms-and-conditions	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e3109ded-2e2b-439b-8b70-e12d6e18ca86	3	70	f	\N	\N
65183930-3ad4-4d60-b55d-bd8bac8a6e9f	\N	reset-credentials-choose-user	c36b20d9-63c7-4267-aa45-992c63e9c0a6	a2439338-1549-4893-923d-47c9dec55918	0	10	f	\N	\N
bc424e82-34c7-4c8f-b02e-58d4ec3fa9b1	\N	reset-credential-email	c36b20d9-63c7-4267-aa45-992c63e9c0a6	a2439338-1549-4893-923d-47c9dec55918	0	20	f	\N	\N
29bd124c-4a9a-4b26-9df6-5c9d738718f2	\N	reset-password	c36b20d9-63c7-4267-aa45-992c63e9c0a6	a2439338-1549-4893-923d-47c9dec55918	0	30	f	\N	\N
ee6fb712-98b7-4925-8932-5d6271d66bf9	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	a2439338-1549-4893-923d-47c9dec55918	1	40	t	eadab9a9-4e6d-4b85-8b46-5477c59a9091	\N
185f6c91-825e-40c5-9d85-e1e5deee3900	\N	conditional-user-configured	c36b20d9-63c7-4267-aa45-992c63e9c0a6	eadab9a9-4e6d-4b85-8b46-5477c59a9091	0	10	f	\N	\N
33de2704-71d6-4a11-87fd-92f40fbb2eb3	\N	reset-otp	c36b20d9-63c7-4267-aa45-992c63e9c0a6	eadab9a9-4e6d-4b85-8b46-5477c59a9091	0	20	f	\N	\N
222635eb-436c-4a40-aeb6-ec78e17577fb	\N	client-secret	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4594b4d8-f967-4b5e-b39f-00cada80cebb	2	10	f	\N	\N
05a73120-5a6b-4d28-aa6a-6778dda3979a	\N	client-jwt	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4594b4d8-f967-4b5e-b39f-00cada80cebb	2	20	f	\N	\N
7ef6a5a3-6481-4f04-b46d-84006111376d	\N	client-secret-jwt	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4594b4d8-f967-4b5e-b39f-00cada80cebb	2	30	f	\N	\N
0bdb27e2-2583-490a-bb8b-232ccca7d653	\N	client-x509	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4594b4d8-f967-4b5e-b39f-00cada80cebb	2	40	f	\N	\N
5179389d-11cd-4054-8f7e-de652bbd3f0c	\N	idp-review-profile	c36b20d9-63c7-4267-aa45-992c63e9c0a6	32d9c70a-b1f1-4889-93aa-882bd77e4eed	0	10	f	\N	1a8b70b1-8f21-469b-98cb-a72a52aa21b0
cfb260c6-a07d-47f9-87c0-70e50ac92c0d	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	32d9c70a-b1f1-4889-93aa-882bd77e4eed	0	20	t	b60a0b30-43dc-4ccf-92e3-21cef997b8be	\N
138dd4b2-2a0f-431b-accf-50a5ad8bcef2	\N	idp-create-user-if-unique	c36b20d9-63c7-4267-aa45-992c63e9c0a6	b60a0b30-43dc-4ccf-92e3-21cef997b8be	2	10	f	\N	814bb950-f765-4c0b-b2b1-04644c7ceb36
4afd2adb-91d1-4fce-a2f3-3f1d74cc3538	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	b60a0b30-43dc-4ccf-92e3-21cef997b8be	2	20	t	e837e300-1219-4b32-948c-9f29d65f457f	\N
05a1cf29-af5e-45bb-9d16-09b5b5d4b520	\N	idp-confirm-link	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e837e300-1219-4b32-948c-9f29d65f457f	0	10	f	\N	\N
56d53902-b0e4-4abf-bd64-d78ef6d36e35	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e837e300-1219-4b32-948c-9f29d65f457f	0	20	t	b84e9d40-456e-4b35-8b4a-ba1a023082f6	\N
5c57e2bb-e4fe-46d1-813a-483ba8bde1cf	\N	idp-email-verification	c36b20d9-63c7-4267-aa45-992c63e9c0a6	b84e9d40-456e-4b35-8b4a-ba1a023082f6	2	10	f	\N	\N
cbc1827a-e5e7-439c-887d-3e5d04ea8db9	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	b84e9d40-456e-4b35-8b4a-ba1a023082f6	2	20	t	8150bb16-3706-4756-baaa-05d4fc92c9ed	\N
8f3f793a-fe74-4864-a6cf-0b21a8669e3c	\N	idp-username-password-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8150bb16-3706-4756-baaa-05d4fc92c9ed	0	10	f	\N	\N
53a77257-822c-4e2f-934e-696ad81f4838	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8150bb16-3706-4756-baaa-05d4fc92c9ed	1	20	t	8d5955a3-60a9-44cb-b610-f09e3149cd19	\N
540e22f0-f8ef-4e0f-93b2-80803a7bd1bf	\N	conditional-user-configured	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8d5955a3-60a9-44cb-b610-f09e3149cd19	0	10	f	\N	\N
7f439b02-2a6c-4ba9-ae2d-638e184cad76	\N	conditional-credential	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8d5955a3-60a9-44cb-b610-f09e3149cd19	0	20	f	\N	d8070a7c-7c3e-46aa-8f5f-5d51d92e908d
fb0210ad-928d-44bb-a134-def0db7517d7	\N	auth-otp-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8d5955a3-60a9-44cb-b610-f09e3149cd19	2	30	f	\N	\N
097f735b-d5b0-4846-9c7a-4933f8dea2a1	\N	webauthn-authenticator	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8d5955a3-60a9-44cb-b610-f09e3149cd19	3	40	f	\N	\N
0910fa04-d25c-4d1b-8397-6f4f661962bf	\N	auth-recovery-authn-code-form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	8d5955a3-60a9-44cb-b610-f09e3149cd19	3	50	f	\N	\N
7395e726-3fa7-447c-be18-4f9e5f504b9b	\N	http-basic-authenticator	c36b20d9-63c7-4267-aa45-992c63e9c0a6	382b1bfc-c757-4411-ba48-d5ea2d7e8da4	0	10	f	\N	\N
9010abf0-c605-4553-9817-2ab50bae3556	\N	docker-http-basic-authenticator	c36b20d9-63c7-4267-aa45-992c63e9c0a6	21fe009f-770d-4940-a9cb-4e3bab9b480e	0	10	f	\N	\N
ab58dcc2-3d4b-4a2a-9a9b-aefee35d7fa9	\N	auth-cookie	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	185161bf-0937-4982-b58f-92550451f533	2	10	f	\N	\N
14512235-c650-4580-b25f-870ae5921735	\N	auth-spnego	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	185161bf-0937-4982-b58f-92550451f533	3	20	f	\N	\N
fe06a007-e014-4e53-9a1c-fe6910c7c143	\N	identity-provider-redirector	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	185161bf-0937-4982-b58f-92550451f533	2	25	f	\N	\N
022a33e1-d083-4123-aa76-74e9ff04cfa1	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	185161bf-0937-4982-b58f-92550451f533	2	30	t	ef215f0b-5d32-4725-97e0-eafdc6511364	\N
ba40fd65-3d97-4d52-bc4c-9351f26466a6	\N	auth-username-password-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	ef215f0b-5d32-4725-97e0-eafdc6511364	0	10	f	\N	\N
b72d3e8c-0a66-44de-9e98-780878f6d7fc	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	ef215f0b-5d32-4725-97e0-eafdc6511364	1	20	t	a96b301f-e90a-4576-8075-f64371262722	\N
31b80011-78a1-474f-9c9d-a4ce0b6e09ca	\N	conditional-user-configured	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	a96b301f-e90a-4576-8075-f64371262722	0	10	f	\N	\N
f5b77c40-3b98-4f45-a7dd-be569d7a7554	\N	conditional-credential	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	a96b301f-e90a-4576-8075-f64371262722	0	20	f	\N	729f64b2-5fea-416d-9d8e-89db42b47e55
066eb2b3-98e9-4ba8-88c9-2cdf5cbf982a	\N	auth-otp-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	a96b301f-e90a-4576-8075-f64371262722	2	30	f	\N	\N
8a35a417-f3f6-4fa6-9aa8-d21bfabc8e62	\N	webauthn-authenticator	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	a96b301f-e90a-4576-8075-f64371262722	3	40	f	\N	\N
74612f7b-8bd6-4a1e-b415-efa794bc9d41	\N	auth-recovery-authn-code-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	a96b301f-e90a-4576-8075-f64371262722	3	50	f	\N	\N
0a188035-ecfc-4a0e-942b-0d70c6d8aaa6	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	185161bf-0937-4982-b58f-92550451f533	2	26	t	3076ae76-c1bd-4baf-b346-92b7b1f2b133	\N
b5f95228-5bb3-401f-a8ab-6187a039709d	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	3076ae76-c1bd-4baf-b346-92b7b1f2b133	1	10	t	96a05fbc-55a3-4230-a42c-5bb613337888	\N
bc9d9db1-ebdd-4442-b342-bcec04c8b8ac	\N	conditional-user-configured	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	96a05fbc-55a3-4230-a42c-5bb613337888	0	10	f	\N	\N
3834f494-c0b8-4ae2-8533-56118d5f3d78	\N	organization	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	96a05fbc-55a3-4230-a42c-5bb613337888	2	20	f	\N	\N
ddce4100-3287-4a9f-a0f9-1d39b95b531e	\N	direct-grant-validate-username	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	c9f67168-c625-42a0-aee9-c839a3857bf9	0	10	f	\N	\N
fd2bf218-3937-4cfa-9b00-83e57e035761	\N	direct-grant-validate-password	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	c9f67168-c625-42a0-aee9-c839a3857bf9	0	20	f	\N	\N
b84c5289-cd61-4be4-ade3-5cdc01431a08	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	c9f67168-c625-42a0-aee9-c839a3857bf9	1	30	t	dbb3fe6e-72cd-408f-aee9-0040c15c61be	\N
a1808f3d-7179-41d3-bb48-0de994bfb188	\N	conditional-user-configured	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	dbb3fe6e-72cd-408f-aee9-0040c15c61be	0	10	f	\N	\N
1f9e9cff-42db-4b21-beea-c06f63d4ec69	\N	direct-grant-validate-otp	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	dbb3fe6e-72cd-408f-aee9-0040c15c61be	0	20	f	\N	\N
75b83de2-b5bf-44d8-92ae-7a198cf53d72	\N	registration-page-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9d29bec7-2d8b-41b4-9f31-8f1329055c2a	0	10	t	8bcccd4c-0588-4bed-bddd-88b6c2e9a2e4	\N
bc5e5a52-5256-4752-8e9b-67ff07c6a184	\N	registration-user-creation	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	8bcccd4c-0588-4bed-bddd-88b6c2e9a2e4	0	20	f	\N	\N
a2e81453-e463-46a9-b6c4-8e7c5ef926b8	\N	registration-password-action	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	8bcccd4c-0588-4bed-bddd-88b6c2e9a2e4	0	50	f	\N	\N
143bc25d-f57d-4729-afd5-ffa15179b298	\N	registration-recaptcha-action	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	8bcccd4c-0588-4bed-bddd-88b6c2e9a2e4	3	60	f	\N	\N
9d4a17ce-0b70-47be-a431-359802555309	\N	registration-terms-and-conditions	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	8bcccd4c-0588-4bed-bddd-88b6c2e9a2e4	3	70	f	\N	\N
62ebcf6c-92cc-4cd6-9858-b8bf88b9b0a2	\N	reset-credentials-choose-user	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	628818dd-71c8-43ae-9001-46ee34b2c2c3	0	10	f	\N	\N
ad517766-1379-4cb1-b3fc-a238c8a58c62	\N	reset-credential-email	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	628818dd-71c8-43ae-9001-46ee34b2c2c3	0	20	f	\N	\N
3fb96e5f-0549-4e89-b439-df30ae0172e4	\N	reset-password	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	628818dd-71c8-43ae-9001-46ee34b2c2c3	0	30	f	\N	\N
c66e8017-2254-4972-9e11-1cccf705a90a	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	628818dd-71c8-43ae-9001-46ee34b2c2c3	1	40	t	0a0ebc64-e843-49e9-9221-1bd6db401bf2	\N
c952cb28-d7b5-4486-b6a7-908ea63da540	\N	conditional-user-configured	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0a0ebc64-e843-49e9-9221-1bd6db401bf2	0	10	f	\N	\N
f7fdf964-a0f8-412d-bc9f-90aff57561bd	\N	reset-otp	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0a0ebc64-e843-49e9-9221-1bd6db401bf2	0	20	f	\N	\N
bf9de0fc-498a-4175-9266-4e18652a4824	\N	client-secret	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	3d592605-a407-47ad-8658-9ac4ca381956	2	10	f	\N	\N
e9b7c746-0342-48ca-b8b6-3e4576f60f97	\N	client-jwt	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	3d592605-a407-47ad-8658-9ac4ca381956	2	20	f	\N	\N
ff709755-9d86-476a-8d4c-cc5a460d98a3	\N	client-secret-jwt	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	3d592605-a407-47ad-8658-9ac4ca381956	2	30	f	\N	\N
eac64c74-7292-4a6c-a83c-ee68fa5e2145	\N	client-x509	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	3d592605-a407-47ad-8658-9ac4ca381956	2	40	f	\N	\N
e635fc0e-0736-43ce-a149-f5c8ce223c79	\N	idp-review-profile	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9c8c4462-de90-4c5a-93ff-c90ed1d9219e	0	10	f	\N	436e27ce-9e80-43e0-99dd-8102f4b4fe16
606b536c-e59f-45dc-958d-86126b2f3f89	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9c8c4462-de90-4c5a-93ff-c90ed1d9219e	0	20	t	9c8b7675-48c0-44ed-bbc1-f6eb70c15f18	\N
ad10d187-bcf1-48c8-b551-6764ff185133	\N	idp-create-user-if-unique	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9c8b7675-48c0-44ed-bbc1-f6eb70c15f18	2	10	f	\N	949ae5be-c1ca-4c39-97b0-7483fd2a0b87
7c251a6b-94c9-4dc8-a47f-0e441067a421	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9c8b7675-48c0-44ed-bbc1-f6eb70c15f18	2	20	t	aab6d048-922c-4334-8420-f8b7103c0181	\N
8ffd5e2c-5888-4074-87d4-851e92d32dda	\N	idp-confirm-link	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	aab6d048-922c-4334-8420-f8b7103c0181	0	10	f	\N	\N
2a15e9c2-2b13-49d4-b15d-9231028798ff	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	aab6d048-922c-4334-8420-f8b7103c0181	0	20	t	e257f707-2e13-4235-bb04-2b18d2a0404c	\N
4d7d4d4b-c44e-47bf-a9bc-8ad8e8e86482	\N	idp-email-verification	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	e257f707-2e13-4235-bb04-2b18d2a0404c	2	10	f	\N	\N
42939846-99bb-4957-befa-84641063a305	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	e257f707-2e13-4235-bb04-2b18d2a0404c	2	20	t	c135eb9d-b6dc-49ce-bb62-1a98ca65409d	\N
d6d6dbe5-2401-402d-8dbe-1275468cd472	\N	idp-username-password-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	c135eb9d-b6dc-49ce-bb62-1a98ca65409d	0	10	f	\N	\N
fb35208a-2824-4ed6-ac6d-022205059aff	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	c135eb9d-b6dc-49ce-bb62-1a98ca65409d	1	20	t	64b8d694-b94b-4952-b17e-7d145ccb82f1	\N
4c3aac90-1983-4b6e-8a1d-8ab55fece0c7	\N	conditional-user-configured	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	64b8d694-b94b-4952-b17e-7d145ccb82f1	0	10	f	\N	\N
9f4e53bb-9731-40a9-b20f-364e070bd1da	\N	conditional-credential	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	64b8d694-b94b-4952-b17e-7d145ccb82f1	0	20	f	\N	840f8892-fb88-4474-9ad2-8514a68dd7d6
d17dbc53-ddd9-455b-bab8-179015413df3	\N	auth-otp-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	64b8d694-b94b-4952-b17e-7d145ccb82f1	2	30	f	\N	\N
f5f5e7fd-972e-42d1-adf3-4210b57b3190	\N	webauthn-authenticator	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	64b8d694-b94b-4952-b17e-7d145ccb82f1	3	40	f	\N	\N
2d648009-5171-4ee6-9c7c-f1278aa8084b	\N	auth-recovery-authn-code-form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	64b8d694-b94b-4952-b17e-7d145ccb82f1	3	50	f	\N	\N
c253f775-ba34-4560-a187-c1520ec2cef9	\N	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9c8c4462-de90-4c5a-93ff-c90ed1d9219e	1	60	t	acaf724e-555a-4b0f-856d-65c2da3a5a0c	\N
d8a13120-d65e-4dc8-910d-25607b9a63bf	\N	conditional-user-configured	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	acaf724e-555a-4b0f-856d-65c2da3a5a0c	0	10	f	\N	\N
acbe74ca-a336-4733-b3d0-82c80b1e9958	\N	idp-add-organization-member	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	acaf724e-555a-4b0f-856d-65c2da3a5a0c	0	20	f	\N	\N
f236e8f0-6c81-4e87-90e1-c8e7f54bc7d0	\N	http-basic-authenticator	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	111537aa-72b2-4e4a-ad96-348b5e1c9076	0	10	f	\N	\N
4be8e288-809c-4d75-9e75-8c4c243ff652	\N	docker-http-basic-authenticator	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	74719d9a-cf55-4b23-b822-a0b639b4763c	0	10	f	\N	\N
\.


--
-- Data for Name: authentication_flow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authentication_flow (id, alias, description, realm_id, provider_id, top_level, built_in) FROM stdin;
baedd61d-c0e7-4a19-aa70-5f43fa029239	browser	Browser based authentication	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
d0fc9f56-cd5b-46ce-bf6c-31f355be8371	forms	Username, password, otp and other auth forms.	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
6728df5c-4a5e-4d15-903c-0d76eea91d0a	Browser - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
aab67545-d041-406b-9ded-ef3a7a2a4e68	direct grant	OpenID Connect Resource Owner Grant	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
e27b748f-b57e-4183-937a-89ee89df1593	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
7aaccb66-801d-4723-9681-63eda55b8484	registration	Registration flow	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
e3109ded-2e2b-439b-8b70-e12d6e18ca86	registration form	Registration form	c36b20d9-63c7-4267-aa45-992c63e9c0a6	form-flow	f	t
a2439338-1549-4893-923d-47c9dec55918	reset credentials	Reset credentials for a user if they forgot their password or something	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
eadab9a9-4e6d-4b85-8b46-5477c59a9091	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
4594b4d8-f967-4b5e-b39f-00cada80cebb	clients	Base authentication for clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	client-flow	t	t
32d9c70a-b1f1-4889-93aa-882bd77e4eed	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
b60a0b30-43dc-4ccf-92e3-21cef997b8be	User creation or linking	Flow for the existing/non-existing user alternatives	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
e837e300-1219-4b32-948c-9f29d65f457f	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
b84e9d40-456e-4b35-8b4a-ba1a023082f6	Account verification options	Method with which to verify the existing account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
8150bb16-3706-4756-baaa-05d4fc92c9ed	Verify Existing Account by Re-authentication	Reauthentication of existing account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
8d5955a3-60a9-44cb-b610-f09e3149cd19	First broker login - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	f	t
382b1bfc-c757-4411-ba48-d5ea2d7e8da4	saml ecp	SAML ECP Profile Authentication Flow	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
21fe009f-770d-4940-a9cb-4e3bab9b480e	docker auth	Used by Docker clients to authenticate against the IDP	c36b20d9-63c7-4267-aa45-992c63e9c0a6	basic-flow	t	t
185161bf-0937-4982-b58f-92550451f533	browser	Browser based authentication	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
ef215f0b-5d32-4725-97e0-eafdc6511364	forms	Username, password, otp and other auth forms.	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
a96b301f-e90a-4576-8075-f64371262722	Browser - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
3076ae76-c1bd-4baf-b346-92b7b1f2b133	Organization	\N	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
96a05fbc-55a3-4230-a42c-5bb613337888	Browser - Conditional Organization	Flow to determine if the organization identity-first login is to be used	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
c9f67168-c625-42a0-aee9-c839a3857bf9	direct grant	OpenID Connect Resource Owner Grant	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
dbb3fe6e-72cd-408f-aee9-0040c15c61be	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
9d29bec7-2d8b-41b4-9f31-8f1329055c2a	registration	Registration flow	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
8bcccd4c-0588-4bed-bddd-88b6c2e9a2e4	registration form	Registration form	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	form-flow	f	t
628818dd-71c8-43ae-9001-46ee34b2c2c3	reset credentials	Reset credentials for a user if they forgot their password or something	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
0a0ebc64-e843-49e9-9221-1bd6db401bf2	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
3d592605-a407-47ad-8658-9ac4ca381956	clients	Base authentication for clients	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	client-flow	t	t
9c8c4462-de90-4c5a-93ff-c90ed1d9219e	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
9c8b7675-48c0-44ed-bbc1-f6eb70c15f18	User creation or linking	Flow for the existing/non-existing user alternatives	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
aab6d048-922c-4334-8420-f8b7103c0181	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
e257f707-2e13-4235-bb04-2b18d2a0404c	Account verification options	Method with which to verify the existing account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
c135eb9d-b6dc-49ce-bb62-1a98ca65409d	Verify Existing Account by Re-authentication	Reauthentication of existing account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
64b8d694-b94b-4952-b17e-7d145ccb82f1	First broker login - Conditional 2FA	Flow to determine if any 2FA is required for the authentication	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
acaf724e-555a-4b0f-856d-65c2da3a5a0c	First Broker Login - Conditional Organization	Flow to determine if the authenticator that adds organization members is to be used	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	f	t
111537aa-72b2-4e4a-ad96-348b5e1c9076	saml ecp	SAML ECP Profile Authentication Flow	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
74719d9a-cf55-4b23-b822-a0b639b4763c	docker auth	Used by Docker clients to authenticate against the IDP	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	basic-flow	t	t
\.


--
-- Data for Name: authenticator_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authenticator_config (id, alias, realm_id) FROM stdin;
b93934b4-91d9-490f-a3d6-fbe23565763b	browser-conditional-credential	c36b20d9-63c7-4267-aa45-992c63e9c0a6
1a8b70b1-8f21-469b-98cb-a72a52aa21b0	review profile config	c36b20d9-63c7-4267-aa45-992c63e9c0a6
814bb950-f765-4c0b-b2b1-04644c7ceb36	create unique user config	c36b20d9-63c7-4267-aa45-992c63e9c0a6
d8070a7c-7c3e-46aa-8f5f-5d51d92e908d	first-broker-login-conditional-credential	c36b20d9-63c7-4267-aa45-992c63e9c0a6
729f64b2-5fea-416d-9d8e-89db42b47e55	browser-conditional-credential	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d
436e27ce-9e80-43e0-99dd-8102f4b4fe16	review profile config	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d
949ae5be-c1ca-4c39-97b0-7483fd2a0b87	create unique user config	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d
840f8892-fb88-4474-9ad2-8514a68dd7d6	first-broker-login-conditional-credential	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d
\.


--
-- Data for Name: authenticator_config_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authenticator_config_entry (authenticator_id, value, name) FROM stdin;
1a8b70b1-8f21-469b-98cb-a72a52aa21b0	missing	update.profile.on.first.login
814bb950-f765-4c0b-b2b1-04644c7ceb36	false	require.password.update.after.registration
b93934b4-91d9-490f-a3d6-fbe23565763b	webauthn-passwordless	credentials
d8070a7c-7c3e-46aa-8f5f-5d51d92e908d	webauthn-passwordless	credentials
436e27ce-9e80-43e0-99dd-8102f4b4fe16	missing	update.profile.on.first.login
729f64b2-5fea-416d-9d8e-89db42b47e55	webauthn-passwordless	credentials
840f8892-fb88-4474-9ad2-8514a68dd7d6	webauthn-passwordless	credentials
949ae5be-c1ca-4c39-97b0-7483fd2a0b87	false	require.password.update.after.registration
\.


--
-- Data for Name: broker_link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broker_link (identity_provider, storage_provider_id, realm_id, broker_user_id, broker_username, token, user_id) FROM stdin;
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (id, enabled, full_scope_allowed, client_id, not_before, public_client, secret, base_url, bearer_only, management_url, surrogate_auth_required, realm_id, protocol, node_rereg_timeout, frontchannel_logout, consent_required, name, service_accounts_enabled, client_authenticator_type, root_url, description, registration_token, standard_flow_enabled, implicit_flow_enabled, direct_access_grants_enabled, always_display_in_console) FROM stdin;
42b87bb7-c41e-469d-838a-cfa73620dcec	t	f	master-realm	0	f	\N	\N	t	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	0	f	f	master Realm	f	client-secret	\N	\N	\N	t	f	f	f
1393c0d6-0918-4536-ab43-1121b68f9e00	t	f	account	0	t	\N	/realms/master/account/	f	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
a763a786-5146-4758-adcb-cabc363165c2	t	f	account-console	0	t	\N	/realms/master/account/	f	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	t	f	broker	0	f	\N	\N	t	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
e7b0ac03-2637-4526-94a8-17db9adc54b8	t	t	security-admin-console	0	t	\N	/admin/master/console/	f	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
ec93b826-29ed-4c7b-9e17-74cdf8224d53	t	t	admin-cli	0	t	\N	\N	f	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	t	t	cb-ashgate	0	t	\N	http://localhost:3001/	f	http://localhost:3001/	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	-1	t	f	Feda Cloud	f	client-secret	http://localhost:3001/	description 	\N	t	f	f	f
4cb807b4-7184-40d1-baf7-c07389d31937	t	f	ash-realm	0	f	\N	\N	t	\N	f	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	0	f	f	ash Realm	f	client-secret	\N	\N	\N	t	f	f	f
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	f	realm-management	0	f	\N	\N	t	\N	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	0	f	f	${client_realm-management}	f	client-secret	\N	\N	\N	t	f	f	f
00313095-7e92-4f2a-afec-9a93400821fc	t	f	account	0	t	\N	/realms/ash/account/	f	\N	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	t	f	account-console	0	t	\N	/realms/ash/account/	f	\N	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	t	f	broker	0	f	\N	\N	t	\N	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	t	t	security-admin-console	0	t	\N	/admin/ash/console/	f	\N	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
8706709e-7745-4dac-bcff-e5f169fc971e	t	t	admin-cli	0	t	\N	\N	f	\N	f	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
\.


--
-- Data for Name: client_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_attributes (client_id, name, value) FROM stdin;
1393c0d6-0918-4536-ab43-1121b68f9e00	post.logout.redirect.uris	+
a763a786-5146-4758-adcb-cabc363165c2	post.logout.redirect.uris	+
a763a786-5146-4758-adcb-cabc363165c2	pkce.code.challenge.method	S256
e7b0ac03-2637-4526-94a8-17db9adc54b8	post.logout.redirect.uris	+
e7b0ac03-2637-4526-94a8-17db9adc54b8	pkce.code.challenge.method	S256
e7b0ac03-2637-4526-94a8-17db9adc54b8	client.use.lightweight.access.token.enabled	true
ec93b826-29ed-4c7b-9e17-74cdf8224d53	client.use.lightweight.access.token.enabled	true
00313095-7e92-4f2a-afec-9a93400821fc	post.logout.redirect.uris	+
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	post.logout.redirect.uris	+
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	pkce.code.challenge.method	S256
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	post.logout.redirect.uris	+
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	pkce.code.challenge.method	S256
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	client.use.lightweight.access.token.enabled	true
8706709e-7745-4dac-bcff-e5f169fc971e	client.use.lightweight.access.token.enabled	true
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	standard.token.exchange.enabled	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	oauth2.device.authorization.grant.enabled	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	oidc.ciba.grant.enabled	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	dpop.bound.access.tokens	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	post.logout.redirect.uris	http://localhost:3001/*
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	backchannel.logout.session.required	true
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	backchannel.logout.revoke.offline.tokens	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	realm_client	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	display.on.consent.screen	false
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	frontchannel.logout.session.required	true
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	logout.confirmation.enabled	false
\.


--
-- Data for Name: client_auth_flow_bindings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_auth_flow_bindings (client_id, flow_id, binding_name) FROM stdin;
\.


--
-- Data for Name: client_initial_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_initial_access (id, realm_id, "timestamp", expiration, count, remaining_count) FROM stdin;
\.


--
-- Data for Name: client_node_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_node_registrations (client_id, value, name) FROM stdin;
\.


--
-- Data for Name: client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope (id, name, realm_id, description, protocol) FROM stdin;
8a87288a-46ac-4db3-acab-d08dfa807ae9	offline_access	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect built-in scope: offline_access	openid-connect
92d651e9-4c16-4aa8-8104-061d4f65d57d	role_list	c36b20d9-63c7-4267-aa45-992c63e9c0a6	SAML role list	saml
c57d6fa8-dd70-4898-9423-afb17d0abc30	saml_organization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	Organization Membership	saml
12e7c989-ebc0-4114-91e7-4134a85f0028	profile	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect built-in scope: profile	openid-connect
a92043fa-6a69-49a2-84ad-c14448033a0c	email	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect built-in scope: email	openid-connect
53f56bbf-92c4-4762-ae7c-fdd8b7688807	address	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect built-in scope: address	openid-connect
df758642-bf58-4c26-8e11-cdb7a82b2303	phone	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect built-in scope: phone	openid-connect
929366d0-3eaf-4fd9-aed0-70a816c9acaf	roles	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect scope for add user roles to the access token	openid-connect
31620d24-3d89-431e-b104-c91c7857187e	web-origins	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect scope for add allowed web origins to the access token	openid-connect
6344d328-3260-448d-b931-5d61753c6b3d	microprofile-jwt	c36b20d9-63c7-4267-aa45-992c63e9c0a6	Microprofile - JWT built-in scope	openid-connect
64b387b3-cda4-4072-bbbc-8052ea3587b6	acr	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
152544c4-2aee-482d-a919-3ea25f49592c	basic	c36b20d9-63c7-4267-aa45-992c63e9c0a6	OpenID Connect scope for add all basic claims to the token	openid-connect
719f3559-5c80-4e82-a72e-1d2231a53f6f	service_account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	Specific scope for a client enabled for service accounts	openid-connect
343e4222-ad85-4ffe-ae3f-f805771d6fcb	organization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	Additional claims about the organization a subject belongs to	openid-connect
f075a5d6-6cc0-4037-8176-67d9f3be42af	role_list	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	SAML role list	saml
f07f3379-bde4-4a6d-9f80-866e6707c8ac	saml_organization	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	Organization Membership	saml
3a28625e-3dff-4d39-a598-f99bcee55b45	profile	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect built-in scope: profile	openid-connect
6142e0a0-ce00-4176-bce0-347293ed9d90	email	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect built-in scope: email	openid-connect
b60a824d-1e49-4c4e-8cea-214f66a63360	address	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect built-in scope: address	openid-connect
f153873d-149d-43ea-932b-faa83d98911c	phone	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect built-in scope: phone	openid-connect
54c480b3-2980-4e48-bb98-53541e732b4f	roles	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect scope for add user roles to the access token	openid-connect
757089bf-6ff9-4a74-a6c1-c21120f30fd7	offline_access	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect built-in scope: offline_access	openid-connect
5df0996c-88a8-489f-9c87-51d08f44d26f	web-origins	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect scope for add allowed web origins to the access token	openid-connect
15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	microprofile-jwt	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	Microprofile - JWT built-in scope	openid-connect
9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	acr	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
c81bcae5-3d08-4400-9a2c-49f1396c53c7	basic	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	OpenID Connect scope for add all basic claims to the token	openid-connect
81a89c21-5e8d-41ce-bf9c-d4ba927d4859	service_account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	Specific scope for a client enabled for service accounts	openid-connect
fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	organization	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	Additional claims about the organization a subject belongs to	openid-connect
\.


--
-- Data for Name: client_scope_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_attributes (scope_id, value, name) FROM stdin;
8a87288a-46ac-4db3-acab-d08dfa807ae9	true	display.on.consent.screen
8a87288a-46ac-4db3-acab-d08dfa807ae9	${offlineAccessScopeConsentText}	consent.screen.text
92d651e9-4c16-4aa8-8104-061d4f65d57d	true	display.on.consent.screen
92d651e9-4c16-4aa8-8104-061d4f65d57d	${samlRoleListScopeConsentText}	consent.screen.text
c57d6fa8-dd70-4898-9423-afb17d0abc30	false	display.on.consent.screen
12e7c989-ebc0-4114-91e7-4134a85f0028	true	display.on.consent.screen
12e7c989-ebc0-4114-91e7-4134a85f0028	${profileScopeConsentText}	consent.screen.text
12e7c989-ebc0-4114-91e7-4134a85f0028	true	include.in.token.scope
a92043fa-6a69-49a2-84ad-c14448033a0c	true	display.on.consent.screen
a92043fa-6a69-49a2-84ad-c14448033a0c	${emailScopeConsentText}	consent.screen.text
a92043fa-6a69-49a2-84ad-c14448033a0c	true	include.in.token.scope
53f56bbf-92c4-4762-ae7c-fdd8b7688807	true	display.on.consent.screen
53f56bbf-92c4-4762-ae7c-fdd8b7688807	${addressScopeConsentText}	consent.screen.text
53f56bbf-92c4-4762-ae7c-fdd8b7688807	true	include.in.token.scope
df758642-bf58-4c26-8e11-cdb7a82b2303	true	display.on.consent.screen
df758642-bf58-4c26-8e11-cdb7a82b2303	${phoneScopeConsentText}	consent.screen.text
df758642-bf58-4c26-8e11-cdb7a82b2303	true	include.in.token.scope
929366d0-3eaf-4fd9-aed0-70a816c9acaf	true	display.on.consent.screen
929366d0-3eaf-4fd9-aed0-70a816c9acaf	${rolesScopeConsentText}	consent.screen.text
929366d0-3eaf-4fd9-aed0-70a816c9acaf	false	include.in.token.scope
31620d24-3d89-431e-b104-c91c7857187e	false	display.on.consent.screen
31620d24-3d89-431e-b104-c91c7857187e		consent.screen.text
31620d24-3d89-431e-b104-c91c7857187e	false	include.in.token.scope
6344d328-3260-448d-b931-5d61753c6b3d	false	display.on.consent.screen
6344d328-3260-448d-b931-5d61753c6b3d	true	include.in.token.scope
64b387b3-cda4-4072-bbbc-8052ea3587b6	false	display.on.consent.screen
64b387b3-cda4-4072-bbbc-8052ea3587b6	false	include.in.token.scope
152544c4-2aee-482d-a919-3ea25f49592c	false	display.on.consent.screen
152544c4-2aee-482d-a919-3ea25f49592c	false	include.in.token.scope
719f3559-5c80-4e82-a72e-1d2231a53f6f	false	display.on.consent.screen
719f3559-5c80-4e82-a72e-1d2231a53f6f	false	include.in.token.scope
343e4222-ad85-4ffe-ae3f-f805771d6fcb	true	display.on.consent.screen
343e4222-ad85-4ffe-ae3f-f805771d6fcb	${organizationScopeConsentText}	consent.screen.text
343e4222-ad85-4ffe-ae3f-f805771d6fcb	true	include.in.token.scope
757089bf-6ff9-4a74-a6c1-c21120f30fd7	true	display.on.consent.screen
757089bf-6ff9-4a74-a6c1-c21120f30fd7	${offlineAccessScopeConsentText}	consent.screen.text
f075a5d6-6cc0-4037-8176-67d9f3be42af	true	display.on.consent.screen
f075a5d6-6cc0-4037-8176-67d9f3be42af	${samlRoleListScopeConsentText}	consent.screen.text
f07f3379-bde4-4a6d-9f80-866e6707c8ac	false	display.on.consent.screen
3a28625e-3dff-4d39-a598-f99bcee55b45	true	display.on.consent.screen
3a28625e-3dff-4d39-a598-f99bcee55b45	${profileScopeConsentText}	consent.screen.text
3a28625e-3dff-4d39-a598-f99bcee55b45	true	include.in.token.scope
6142e0a0-ce00-4176-bce0-347293ed9d90	true	display.on.consent.screen
6142e0a0-ce00-4176-bce0-347293ed9d90	${emailScopeConsentText}	consent.screen.text
6142e0a0-ce00-4176-bce0-347293ed9d90	true	include.in.token.scope
b60a824d-1e49-4c4e-8cea-214f66a63360	true	display.on.consent.screen
b60a824d-1e49-4c4e-8cea-214f66a63360	${addressScopeConsentText}	consent.screen.text
b60a824d-1e49-4c4e-8cea-214f66a63360	true	include.in.token.scope
f153873d-149d-43ea-932b-faa83d98911c	true	display.on.consent.screen
f153873d-149d-43ea-932b-faa83d98911c	${phoneScopeConsentText}	consent.screen.text
f153873d-149d-43ea-932b-faa83d98911c	true	include.in.token.scope
54c480b3-2980-4e48-bb98-53541e732b4f	true	display.on.consent.screen
54c480b3-2980-4e48-bb98-53541e732b4f	${rolesScopeConsentText}	consent.screen.text
54c480b3-2980-4e48-bb98-53541e732b4f	false	include.in.token.scope
5df0996c-88a8-489f-9c87-51d08f44d26f	false	display.on.consent.screen
5df0996c-88a8-489f-9c87-51d08f44d26f		consent.screen.text
5df0996c-88a8-489f-9c87-51d08f44d26f	false	include.in.token.scope
15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	false	display.on.consent.screen
15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	true	include.in.token.scope
9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	false	display.on.consent.screen
9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	false	include.in.token.scope
c81bcae5-3d08-4400-9a2c-49f1396c53c7	false	display.on.consent.screen
c81bcae5-3d08-4400-9a2c-49f1396c53c7	false	include.in.token.scope
81a89c21-5e8d-41ce-bf9c-d4ba927d4859	false	display.on.consent.screen
81a89c21-5e8d-41ce-bf9c-d4ba927d4859	false	include.in.token.scope
fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	true	display.on.consent.screen
fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	${organizationScopeConsentText}	consent.screen.text
fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	true	include.in.token.scope
\.


--
-- Data for Name: client_scope_client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_client (client_id, scope_id, default_scope) FROM stdin;
1393c0d6-0918-4536-ab43-1121b68f9e00	152544c4-2aee-482d-a919-3ea25f49592c	t
1393c0d6-0918-4536-ab43-1121b68f9e00	31620d24-3d89-431e-b104-c91c7857187e	t
1393c0d6-0918-4536-ab43-1121b68f9e00	12e7c989-ebc0-4114-91e7-4134a85f0028	t
1393c0d6-0918-4536-ab43-1121b68f9e00	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
1393c0d6-0918-4536-ab43-1121b68f9e00	a92043fa-6a69-49a2-84ad-c14448033a0c	t
1393c0d6-0918-4536-ab43-1121b68f9e00	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
1393c0d6-0918-4536-ab43-1121b68f9e00	df758642-bf58-4c26-8e11-cdb7a82b2303	f
1393c0d6-0918-4536-ab43-1121b68f9e00	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
1393c0d6-0918-4536-ab43-1121b68f9e00	6344d328-3260-448d-b931-5d61753c6b3d	f
1393c0d6-0918-4536-ab43-1121b68f9e00	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
1393c0d6-0918-4536-ab43-1121b68f9e00	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
a763a786-5146-4758-adcb-cabc363165c2	152544c4-2aee-482d-a919-3ea25f49592c	t
a763a786-5146-4758-adcb-cabc363165c2	31620d24-3d89-431e-b104-c91c7857187e	t
a763a786-5146-4758-adcb-cabc363165c2	12e7c989-ebc0-4114-91e7-4134a85f0028	t
a763a786-5146-4758-adcb-cabc363165c2	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
a763a786-5146-4758-adcb-cabc363165c2	a92043fa-6a69-49a2-84ad-c14448033a0c	t
a763a786-5146-4758-adcb-cabc363165c2	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
a763a786-5146-4758-adcb-cabc363165c2	df758642-bf58-4c26-8e11-cdb7a82b2303	f
a763a786-5146-4758-adcb-cabc363165c2	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
a763a786-5146-4758-adcb-cabc363165c2	6344d328-3260-448d-b931-5d61753c6b3d	f
a763a786-5146-4758-adcb-cabc363165c2	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
a763a786-5146-4758-adcb-cabc363165c2	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
ec93b826-29ed-4c7b-9e17-74cdf8224d53	152544c4-2aee-482d-a919-3ea25f49592c	t
ec93b826-29ed-4c7b-9e17-74cdf8224d53	31620d24-3d89-431e-b104-c91c7857187e	t
ec93b826-29ed-4c7b-9e17-74cdf8224d53	12e7c989-ebc0-4114-91e7-4134a85f0028	t
ec93b826-29ed-4c7b-9e17-74cdf8224d53	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
ec93b826-29ed-4c7b-9e17-74cdf8224d53	a92043fa-6a69-49a2-84ad-c14448033a0c	t
ec93b826-29ed-4c7b-9e17-74cdf8224d53	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
ec93b826-29ed-4c7b-9e17-74cdf8224d53	df758642-bf58-4c26-8e11-cdb7a82b2303	f
ec93b826-29ed-4c7b-9e17-74cdf8224d53	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
ec93b826-29ed-4c7b-9e17-74cdf8224d53	6344d328-3260-448d-b931-5d61753c6b3d	f
ec93b826-29ed-4c7b-9e17-74cdf8224d53	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
ec93b826-29ed-4c7b-9e17-74cdf8224d53	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	152544c4-2aee-482d-a919-3ea25f49592c	t
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	31620d24-3d89-431e-b104-c91c7857187e	t
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	12e7c989-ebc0-4114-91e7-4134a85f0028	t
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	a92043fa-6a69-49a2-84ad-c14448033a0c	t
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	df758642-bf58-4c26-8e11-cdb7a82b2303	f
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	6344d328-3260-448d-b931-5d61753c6b3d	f
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
e5570e91-3ab7-407b-8dc5-f62d162eaf0b	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
42b87bb7-c41e-469d-838a-cfa73620dcec	152544c4-2aee-482d-a919-3ea25f49592c	t
42b87bb7-c41e-469d-838a-cfa73620dcec	31620d24-3d89-431e-b104-c91c7857187e	t
42b87bb7-c41e-469d-838a-cfa73620dcec	12e7c989-ebc0-4114-91e7-4134a85f0028	t
42b87bb7-c41e-469d-838a-cfa73620dcec	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
42b87bb7-c41e-469d-838a-cfa73620dcec	a92043fa-6a69-49a2-84ad-c14448033a0c	t
42b87bb7-c41e-469d-838a-cfa73620dcec	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
42b87bb7-c41e-469d-838a-cfa73620dcec	df758642-bf58-4c26-8e11-cdb7a82b2303	f
42b87bb7-c41e-469d-838a-cfa73620dcec	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
42b87bb7-c41e-469d-838a-cfa73620dcec	6344d328-3260-448d-b931-5d61753c6b3d	f
42b87bb7-c41e-469d-838a-cfa73620dcec	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
42b87bb7-c41e-469d-838a-cfa73620dcec	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
e7b0ac03-2637-4526-94a8-17db9adc54b8	152544c4-2aee-482d-a919-3ea25f49592c	t
e7b0ac03-2637-4526-94a8-17db9adc54b8	31620d24-3d89-431e-b104-c91c7857187e	t
e7b0ac03-2637-4526-94a8-17db9adc54b8	12e7c989-ebc0-4114-91e7-4134a85f0028	t
e7b0ac03-2637-4526-94a8-17db9adc54b8	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
e7b0ac03-2637-4526-94a8-17db9adc54b8	a92043fa-6a69-49a2-84ad-c14448033a0c	t
e7b0ac03-2637-4526-94a8-17db9adc54b8	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
e7b0ac03-2637-4526-94a8-17db9adc54b8	df758642-bf58-4c26-8e11-cdb7a82b2303	f
e7b0ac03-2637-4526-94a8-17db9adc54b8	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
e7b0ac03-2637-4526-94a8-17db9adc54b8	6344d328-3260-448d-b931-5d61753c6b3d	f
e7b0ac03-2637-4526-94a8-17db9adc54b8	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
e7b0ac03-2637-4526-94a8-17db9adc54b8	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	54c480b3-2980-4e48-bb98-53541e732b4f	t
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	5df0996c-88a8-489f-9c87-51d08f44d26f	t
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	6142e0a0-ce00-4176-bce0-347293ed9d90	t
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	3a28625e-3dff-4d39-a598-f99bcee55b45	t
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	b60a824d-1e49-4c4e-8cea-214f66a63360	f
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	f153873d-149d-43ea-932b-faa83d98911c	f
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
00313095-7e92-4f2a-afec-9a93400821fc	54c480b3-2980-4e48-bb98-53541e732b4f	t
00313095-7e92-4f2a-afec-9a93400821fc	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
00313095-7e92-4f2a-afec-9a93400821fc	5df0996c-88a8-489f-9c87-51d08f44d26f	t
00313095-7e92-4f2a-afec-9a93400821fc	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
00313095-7e92-4f2a-afec-9a93400821fc	6142e0a0-ce00-4176-bce0-347293ed9d90	t
00313095-7e92-4f2a-afec-9a93400821fc	3a28625e-3dff-4d39-a598-f99bcee55b45	t
00313095-7e92-4f2a-afec-9a93400821fc	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
00313095-7e92-4f2a-afec-9a93400821fc	b60a824d-1e49-4c4e-8cea-214f66a63360	f
00313095-7e92-4f2a-afec-9a93400821fc	f153873d-149d-43ea-932b-faa83d98911c	f
00313095-7e92-4f2a-afec-9a93400821fc	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
00313095-7e92-4f2a-afec-9a93400821fc	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	54c480b3-2980-4e48-bb98-53541e732b4f	t
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	5df0996c-88a8-489f-9c87-51d08f44d26f	t
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	6142e0a0-ce00-4176-bce0-347293ed9d90	t
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	3a28625e-3dff-4d39-a598-f99bcee55b45	t
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	b60a824d-1e49-4c4e-8cea-214f66a63360	f
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	f153873d-149d-43ea-932b-faa83d98911c	f
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
8706709e-7745-4dac-bcff-e5f169fc971e	54c480b3-2980-4e48-bb98-53541e732b4f	t
8706709e-7745-4dac-bcff-e5f169fc971e	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
8706709e-7745-4dac-bcff-e5f169fc971e	5df0996c-88a8-489f-9c87-51d08f44d26f	t
8706709e-7745-4dac-bcff-e5f169fc971e	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
8706709e-7745-4dac-bcff-e5f169fc971e	6142e0a0-ce00-4176-bce0-347293ed9d90	t
8706709e-7745-4dac-bcff-e5f169fc971e	3a28625e-3dff-4d39-a598-f99bcee55b45	t
8706709e-7745-4dac-bcff-e5f169fc971e	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
8706709e-7745-4dac-bcff-e5f169fc971e	b60a824d-1e49-4c4e-8cea-214f66a63360	f
8706709e-7745-4dac-bcff-e5f169fc971e	f153873d-149d-43ea-932b-faa83d98911c	f
8706709e-7745-4dac-bcff-e5f169fc971e	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
8706709e-7745-4dac-bcff-e5f169fc971e	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	54c480b3-2980-4e48-bb98-53541e732b4f	t
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	5df0996c-88a8-489f-9c87-51d08f44d26f	t
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	6142e0a0-ce00-4176-bce0-347293ed9d90	t
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	3a28625e-3dff-4d39-a598-f99bcee55b45	t
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	b60a824d-1e49-4c4e-8cea-214f66a63360	f
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	f153873d-149d-43ea-932b-faa83d98911c	f
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	54c480b3-2980-4e48-bb98-53541e732b4f	t
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	5df0996c-88a8-489f-9c87-51d08f44d26f	t
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	6142e0a0-ce00-4176-bce0-347293ed9d90	t
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	3a28625e-3dff-4d39-a598-f99bcee55b45	t
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	b60a824d-1e49-4c4e-8cea-214f66a63360	f
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	f153873d-149d-43ea-932b-faa83d98911c	f
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
2393cb2a-e46a-4fc0-89b9-f01a80548e7e	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	54c480b3-2980-4e48-bb98-53541e732b4f	t
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	5df0996c-88a8-489f-9c87-51d08f44d26f	t
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	6142e0a0-ce00-4176-bce0-347293ed9d90	t
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	3a28625e-3dff-4d39-a598-f99bcee55b45	t
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	b60a824d-1e49-4c4e-8cea-214f66a63360	f
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	f153873d-149d-43ea-932b-faa83d98911c	f
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
\.


--
-- Data for Name: client_scope_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_scope_role_mapping (scope_id, role_id) FROM stdin;
8a87288a-46ac-4db3-acab-d08dfa807ae9	94d7a71c-3edf-4306-b3ce-c0255b61a8e5
757089bf-6ff9-4a74-a6c1-c21120f30fd7	77a9032f-e51b-4ff9-ae56-b3dbcb343782
\.


--
-- Data for Name: component; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component (id, name, parent_id, provider_id, provider_type, realm_id, sub_type) FROM stdin;
fde2f9a5-c645-4fc6-859d-9963ed2593c3	Trusted Hosts	c36b20d9-63c7-4267-aa45-992c63e9c0a6	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
dd13f54b-ac67-4f4d-bd3c-735e087d4c3c	Consent Required	c36b20d9-63c7-4267-aa45-992c63e9c0a6	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
f8e4c0f4-c0a0-41b8-b0e1-ae029c5e31b7	Full Scope Disabled	c36b20d9-63c7-4267-aa45-992c63e9c0a6	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
00452621-61c1-4747-bf77-d9b8b8d7d0d8	Max Clients Limit	c36b20d9-63c7-4267-aa45-992c63e9c0a6	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
3e42156a-bf86-4d73-bb3e-4fa7f18b525c	Allowed Protocol Mapper Types	c36b20d9-63c7-4267-aa45-992c63e9c0a6	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
917b7132-a27e-42a8-bef9-e0453c516bd2	Allowed Client Scopes	c36b20d9-63c7-4267-aa45-992c63e9c0a6	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
b08170a5-2a08-4e65-99e0-65e44559ab93	Allowed Registration Web Origins	c36b20d9-63c7-4267-aa45-992c63e9c0a6	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	anonymous
f5680220-2123-4579-a9ee-beb212535a41	Allowed Protocol Mapper Types	c36b20d9-63c7-4267-aa45-992c63e9c0a6	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	authenticated
4100e095-3fd9-48db-8a75-08022979ad24	Allowed Client Scopes	c36b20d9-63c7-4267-aa45-992c63e9c0a6	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	authenticated
579bd2ac-dd13-4da8-888a-1e05568025db	Allowed Registration Web Origins	c36b20d9-63c7-4267-aa45-992c63e9c0a6	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	authenticated
4984de93-cd3b-4fdd-aa9b-22b55d729ff5	rsa-generated	c36b20d9-63c7-4267-aa45-992c63e9c0a6	rsa-generated	org.keycloak.keys.KeyProvider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N
9b6c6e28-00b4-46d6-878c-8d783d787124	rsa-enc-generated	c36b20d9-63c7-4267-aa45-992c63e9c0a6	rsa-enc-generated	org.keycloak.keys.KeyProvider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N
32ec5dab-cf8b-4209-99b2-bd1b29175244	hmac-generated-hs512	c36b20d9-63c7-4267-aa45-992c63e9c0a6	hmac-generated	org.keycloak.keys.KeyProvider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N
73d706f3-3a6d-4b22-bf6b-fa9c3840f1b3	aes-generated	c36b20d9-63c7-4267-aa45-992c63e9c0a6	aes-generated	org.keycloak.keys.KeyProvider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N
388b29c5-af2d-4183-86e5-10a15bbc0c31	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	declarative-user-profile	org.keycloak.userprofile.UserProfileProvider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N
6c727287-f50b-4941-b3ac-025895e027d6	rsa-generated	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	rsa-generated	org.keycloak.keys.KeyProvider	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N
0878e206-dbeb-4b5c-8216-9739bc896300	rsa-enc-generated	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	rsa-enc-generated	org.keycloak.keys.KeyProvider	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N
c4dc5a17-ebc7-4640-bf04-3d778797fe9d	hmac-generated-hs512	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	hmac-generated	org.keycloak.keys.KeyProvider	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N
7ac598fd-1a87-428a-860c-af78563dcda5	aes-generated	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	aes-generated	org.keycloak.keys.KeyProvider	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N
f8bb4078-59b9-4e58-818c-a12a728d9673	Trusted Hosts	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
791d4515-19b4-46d0-87e7-84965d96fc56	Consent Required	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
9b0fb7eb-8b6c-4398-bb60-69ed31ac4ffc	Full Scope Disabled	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
91117b62-35c8-4664-84ed-257768a1a6c1	Max Clients Limit	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
50edd19e-8d52-43df-839a-6a20fba5e853	Allowed Protocol Mapper Types	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
e2cfd18d-d042-406d-8218-d613dbd8c781	Allowed Client Scopes	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
a783d50c-7c7a-40aa-badc-aacb611a43c6	Allowed Registration Web Origins	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	anonymous
299a6c3d-841c-4146-88ac-21c84336006a	Allowed Protocol Mapper Types	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	authenticated
79b35da9-1a2e-49d2-987b-d9d5b9db96e4	Allowed Client Scopes	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	authenticated
0eea14a5-aa00-45a5-851f-0f962a29b2d0	Allowed Registration Web Origins	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	registration-web-origins	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	authenticated
\.


--
-- Data for Name: component_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.component_config (id, component_id, name, value) FROM stdin;
f01e52f4-f2b4-4d7a-8f6f-782eca0b79e4	fde2f9a5-c645-4fc6-859d-9963ed2593c3	client-uris-must-match	true
767f460b-abcd-4df1-b50d-e7628fcfe0de	fde2f9a5-c645-4fc6-859d-9963ed2593c3	host-sending-registration-request-must-match	true
84e6100d-f6fa-4ead-b887-07d27df843f4	4100e095-3fd9-48db-8a75-08022979ad24	allow-default-scopes	true
08cad29f-be04-47e6-a077-6e6555fec778	00452621-61c1-4747-bf77-d9b8b8d7d0d8	max-clients	200
ca89036e-b717-48b0-99a8-5c544def6958	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
18cf1d16-5ba7-4124-8d3b-2bc474275a99	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
d356e271-2498-42c7-8967-974c1ac2c44f	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	oidc-full-name-mapper
1078cbb7-9cd0-43b8-a81a-720d75e7416c	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	saml-user-attribute-mapper
cffe715b-4a14-4894-ac7e-84c04e813918	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
092fc20a-5e96-4c05-8d0c-08b36afe02b4	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	oidc-address-mapper
3c5494fa-d020-41a6-abf2-bebb75ed0599	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	saml-role-list-mapper
a488ff3b-5944-4c14-aa07-0228d4cbdf03	f5680220-2123-4579-a9ee-beb212535a41	allowed-protocol-mapper-types	saml-user-property-mapper
7c7f013e-f6f8-47ec-9347-464dee36a923	917b7132-a27e-42a8-bef9-e0453c516bd2	allow-default-scopes	true
293113df-c7a8-41de-b78f-816e44d767ce	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
57181e09-abc5-432b-b819-ffc59b803f38	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	saml-role-list-mapper
ee0cdba5-04f1-4670-aa5f-516da2bd08bd	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
0487c920-20d4-43de-b168-95e013dd633a	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	saml-user-attribute-mapper
61f4f0ee-1e17-4931-9a00-3ae06bea5409	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	oidc-full-name-mapper
a3b8a01d-fba4-4be2-ab6b-6ad98dcbf673	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	saml-user-property-mapper
6212ee94-de06-48a3-864b-7d81e565870a	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
a7be1776-52fd-42af-9d9f-d527d73b49f4	3e42156a-bf86-4d73-bb3e-4fa7f18b525c	allowed-protocol-mapper-types	oidc-address-mapper
2860c9aa-6e22-4084-9965-f6ae0b79b09b	32ec5dab-cf8b-4209-99b2-bd1b29175244	secret	k3pXjmlSIgm5-4SkQz1r39RPFIwj4G0XhBatq-e6XbmXb_tVGLXLWFocauakZEZgIxLc8yqWkVJ-UfXMvQzpQD0Bwg9tp9fGNSh9woKBP4wsDrVLo1uNMlof0ua3ZplfE4XyB1LfBYmNKQ95iZ9TgZ-O3KClHmhAa_d81P6BNoY
db3fd57a-bdb4-4098-8593-87f2da055470	32ec5dab-cf8b-4209-99b2-bd1b29175244	priority	100
23dd78e4-b3e0-4843-bbb1-ac841ef9bc7c	32ec5dab-cf8b-4209-99b2-bd1b29175244	algorithm	HS512
07e9ace7-4d88-4376-97e0-00431b0ca1d5	32ec5dab-cf8b-4209-99b2-bd1b29175244	kid	af3fcdb0-f1c4-4fe8-aa54-522431dcc06f
da2da882-b29b-4f48-8871-6a4b6ba62a3c	388b29c5-af2d-4183-86e5-10a15bbc0c31	kc.user.profile.config	{"attributes":[{"name":"username","displayName":"${username}","validations":{"length":{"min":3,"max":255},"username-prohibited-characters":{},"up-username-not-idn-homograph":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"email","displayName":"${email}","validations":{"email":{},"length":{"max":255}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"firstName","displayName":"${firstName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"lastName","displayName":"${lastName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false}],"groups":[{"name":"user-metadata","displayHeader":"User metadata","displayDescription":"Attributes, which refer to user metadata"}]}
305bdd49-53f4-4db5-bd96-8348b7a10963	73d706f3-3a6d-4b22-bf6b-fa9c3840f1b3	secret	qnMduo0sVOIrqgLhiQlQvg
48e82b9e-5ec9-4807-9d51-a3f5d6a1c78d	73d706f3-3a6d-4b22-bf6b-fa9c3840f1b3	kid	ab973d60-d427-43bb-bfbd-4f2efe222a69
d2368c6a-bc7c-4e06-bf41-a3c1864d0927	73d706f3-3a6d-4b22-bf6b-fa9c3840f1b3	priority	100
671d7560-3744-4eaf-a052-3833a23cc325	9b6c6e28-00b4-46d6-878c-8d783d787124	keyUse	ENC
5480cbdc-9793-492c-a513-544cfe2773c8	9b6c6e28-00b4-46d6-878c-8d783d787124	certificate	MIICmzCCAYMCBgGc4q9mujANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjYwMzEyMTUzMjUxWhcNMzYwMzEyMTUzNDMxWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDB8GUpa/zmNmiSqSc18Ug2UVGugwtLbAGyKQinAC2pnOpveP8g+CBX/mCsAyDodsKlo/rrWCX+esi9Re7VgRUCxORvsIYE4EpFrTcZriuZYH9SW1qvIvG6tVGBP/0I2ZonyPN3W5mtylD7D7ODlyYze6ma9nwal/oe84I6gDKT3UsmRbDJjMfmcYhasaWEGL0HLmqwSlc2xWn6GxYX+1hp7+FQhyXu92AqClEKDOhkyWrYnvL90sCSAeWjC4+dPyoIzJUtfXgwPYYTQcNr7VBGYtOvrKgfPI1+ZSp54sSNVwOwTiayUJKyidB9zHLZXo3uM6GG+hrFs3KhFVT3KR/NAgMBAAEwDQYJKoZIhvcNAQELBQADggEBACrn+JEcpDwFnA76vXfUgHwB7eN1tfGTS6HgG7iEIem24+1ioN4DEYipjxI0CiahtZppap3kpb8dTkICRsaCbDWc6FWSttNBrP76wFtmie9hUcyT7CUX3s0kIXesSUf6GAcWh828VDO4PeVWpnhVfGO5fjRtASIpeqiFObuJ/RD3sks26DasOGpSJ2d6lMwm6NphBYlsVMnYfvn9e2X3ILLaaIMBiYFJibbvLGDZW9PXO8C1Vl531iFXC2c8lLC3PHpUw2eqzcwJ4uanZCraNRA8bhB6lwT1JMU1Qhzb9jD0bj0x2baQ/+ySxdoT2A5s2kprU/JLJFsrzCUSRSFWiDk=
693dac0f-71f6-4510-a7b2-e32fb17a032c	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
f4930666-03cd-43ff-bea6-b235ffa4929e	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
fb6155f9-6def-4af2-be67-064d5a175a22	e2cfd18d-d042-406d-8218-d613dbd8c781	allow-default-scopes	true
df6fddff-ff13-443f-9d1d-165976d84109	79b35da9-1a2e-49d2-987b-d9d5b9db96e4	allow-default-scopes	true
085c9b8e-8093-4287-b048-d955bc3de3fc	9b6c6e28-00b4-46d6-878c-8d783d787124	privateKey	MIIEowIBAAKCAQEAwfBlKWv85jZokqknNfFINlFRroMLS2wBsikIpwAtqZzqb3j/IPggV/5grAMg6HbCpaP661gl/nrIvUXu1YEVAsTkb7CGBOBKRa03Ga4rmWB/UltaryLxurVRgT/9CNmaJ8jzd1uZrcpQ+w+zg5cmM3upmvZ8Gpf6HvOCOoAyk91LJkWwyYzH5nGIWrGlhBi9By5qsEpXNsVp+hsWF/tYae/hUIcl7vdgKgpRCgzoZMlq2J7y/dLAkgHlowuPnT8qCMyVLX14MD2GE0HDa+1QRmLTr6yoHzyNfmUqeeLEjVcDsE4mslCSsonQfcxy2V6N7jOhhvoaxbNyoRVU9ykfzQIDAQABAoIBABaadEvm2l+hdUAsp1WF5Nbx1N2MR+d3M95mImxGXMwRLhCmb0PSL4DZ9L3vkmkNmGOSUFcYG7uEZ3uJ2Et5gy+ir4Yl8oTEeFuVE+AyGMJESSqZ26CgZ8CNS+3OvajHpcwfw2KEok1rUFNmkdNTLUBgWBTnx/CYiG4Njv7O/LYXZv1gJg93VwOeDW5kC7IgNSC6GQOz1z+xYqbAxFiyttrhCGQWS1mNihLEmWdKLByCcAsWYlHQ1XskTCVle/P5GOQtpX7sOvE9kq+TxsWn55BUYgU3JEBFUNzgjMBpSrNansuEB0F1jhXpmRwzzxoLK/o7RdF/4EHpbHher2h+gYkCgYEA/gC3XVBs9AJ3vvbNUJptu8KHJvv0I+NblKcLN8/mxkpy62sorkiRWSTa6P/H7HV6KmIBy45/8Qu3kgdhm9SEpbJHvzUGykK7/7GEBtT1bj8zFvpbZACbIY06PqCkA+1B1RdZvPe5lVT/vTFp+fiyW8OCmOxpQ6WMdp/4l0/IFCUCgYEAw3bGta/CCyRup1lErXR+GBG+fbON0BGGmEeYEnMcvQlYtFXob6limKKLDqhtPVWSe3ECxrgWxBi6JDo0aPSw3nf/6Er4o/DsjQVuqW3ynztuO1wz3Z+r5i75JXrY4NQwSoUNbFoUba92QAxdRF9CkAwIf8R6k9EXaXkVk3GBeIkCgYByi/olT+bCp/Y+nWh8CBiiixiOISO5p4eeYzKw6cYl+F8ZActnxXwe2nsKhocvgM8mG+q5VLsoBmOzrDZ9ovprCxpGBXDZd/z2U6S5vAIuxLuSijb6wzcyi1EP+zvcNXvx0ET87i64RIvMU2N6gohUz7eupTbXdeoBeSUPf8A4LQKBgFGPNCcHqX4gu5NUqlV+MEc20Dd/PoM9bN4JsaixI6K1TbAh0JUXJq7t0/xPxxU6qZ6cbz4f/k/gyXroVooc39hUVhHFhq5Rj0Lgq2ZDHGPY1owqUvH8+CtaGlfLRMe7glL15b36cF+8QSlEf35SCWI1wy4c+9DGBHDcN2aIjC+RAoGBAJ2XncEnuY+jEcp+xmjBQ8C4Asxp0QHMbIZTQGX4gH+39nJq1lpOMUUVjyVoXZJUB2VnKt1kDvq9D7Wf9mCp+WDWe1oejGG/B/X+1UhixTR+SxBkI+6ZV9mTwI3m8+x+itjlqjD2k56ZnmdYcAalSQhfdCxIathVP7DrzpdToZ0W
4ef6ae2b-ac17-405b-b735-a911175c2fbc	9b6c6e28-00b4-46d6-878c-8d783d787124	priority	100
05073651-610d-4310-a613-fc043c11dc9e	9b6c6e28-00b4-46d6-878c-8d783d787124	algorithm	RSA-OAEP
5579ca31-b4b7-4eae-a1be-85c988429377	4984de93-cd3b-4fdd-aa9b-22b55d729ff5	priority	100
253f2f02-5087-4720-ba0a-3ca8e77e1ba3	4984de93-cd3b-4fdd-aa9b-22b55d729ff5	certificate	MIICmzCCAYMCBgGc4q9lWjANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjYwMzEyMTUzMjUxWhcNMzYwMzEyMTUzNDMxWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCdqNH8WqsSk43TRAantJF/lGMhjYhYz77Xr/4ciQgYE920cB5i2GliET4pmelA0rq1JC960yegun4T7XjiUkHK0b72wIwfYyeB/gsd21GfuI53R+cQAIBREsDq+S8pd/wNYLpFM5m1/bpNno/HO/JEcDIyfC44RqZCHvMnuCxHRDHh6HphkZMtHNlnJTy4xOSyLaFzkHDim9zXZgVS0nDjB1ZoxsJrZDdk1YBGKdbMlYKr81Bdr6XwuCPXWLXV6Mipxzb6pyTs4dvR1MVKmskj6rhUXuo+q2u7IIhzlsle1zVLZGsHnYoOKQUlZneUDAlQd3IRCTn20qhJbWUJj/BpAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAIZI7AbqFx0oIQp67IusyAkpzsNVuFeP1CXAOaBn8eOAnIqiWXkvCsWIFQI5ECKl5uyDKGSPxY+zhroj2fK4BP8iqjJKHr1yjzj4eV9iNZGSn5fMnbGgxibsA3sUFI59SdEYtSbfXiKbOLYO/nQT8QUMVBw8z6k0iCQuvm9ehqOCtEAWxxtC+/5fgeU1izkNBXzV4yhOD1uJ0jiLfNblgkTX1Ss9fM1iTBRPGfx/pt4BR2udcn/nFvtdomAuQuPGqOcv8oarExGQDxMNo+vSlZmqlJjF/SJedF1oUlBUb7AjRm1qjJXxqDK3e+DFLgCDqA+xxI5RtOFHZyG772bgFpQ=
925a472e-ec2d-493f-b2e1-081fbd78527b	4984de93-cd3b-4fdd-aa9b-22b55d729ff5	keyUse	SIG
9eba98ef-c186-4ebd-9cab-6b340c7ff468	4984de93-cd3b-4fdd-aa9b-22b55d729ff5	privateKey	MIIEogIBAAKCAQEAnajR/FqrEpON00QGp7SRf5RjIY2IWM++16/+HIkIGBPdtHAeYthpYhE+KZnpQNK6tSQvetMnoLp+E+144lJBytG+9sCMH2Mngf4LHdtRn7iOd0fnEACAURLA6vkvKXf8DWC6RTOZtf26TZ6PxzvyRHAyMnwuOEamQh7zJ7gsR0Qx4eh6YZGTLRzZZyU8uMTksi2hc5Bw4pvc12YFUtJw4wdWaMbCa2Q3ZNWARinWzJWCq/NQXa+l8Lgj11i11ejIqcc2+qck7OHb0dTFSprJI+q4VF7qPqtruyCIc5bJXtc1S2RrB52KDikFJWZ3lAwJUHdyEQk59tKoSW1lCY/waQIDAQABAoIBAA78u2l33QdZC4Rn1RIgMiykmH/aCnoW1Zd/XXKs/B391XePqPPQisQNy5D81pWY8rLBi9nrNLssv0t5qaIqG6MCKVsflrJtJJZQ5hGihbHfQ3vHVAnLYmdSlxA/O+J/S3CiH1Lwws3wHsO+LQDNjAxBdiQidepXnPpwIsFF2r+zb65JDLaN82LRW67uF5pSknqdwalAd+d+kphXIfqxSD2mXf7oyazwfyoGXC/mU85wCXvfwBKTy/8Mb+ufGpT5y0SJ+lwjZfEwSO801ctfG+9hPVpz+cUiavPMeaIZvc5PvXRY3D2HH469D9pcQ2Wq4d+CfIEi3ncPOE/B5ljDbFkCgYEAzQoa4xo/Bsi8wT1QQ0QPaZnqA+3WgWHCIS1Q4aV2dgFXVX6/fDyyUl1qjHnXS8g1iYP3E7edPXvukVA38xboWu8dmDUF1okWanJQspZpd9L8PgUDRHKrHcT0q6Ggt05GN3UAllpnMNS992XPv8fb16to4Zau3l3JS+JPXPmT5vsCgYEAxNgaD/CCi7P66BMTk3Mj5t658opSv5eYeeFnJRTbp210rpi3nWPHLP/1bAVrILkaCezYUzxOyfkAg1JTDGD4CTSnMzCPYxNpEJUb0uvgJjtu+1mThd1AfGLXPMlGiBPKSF+0bZprJciONCbOSJtcLkJXIaDsKrOtQnmZjFmMOOsCgYBw17LcccFmFmvrXbcijf59e7uS1f5LzmVspOfyh4GeiDZsUwlHcpAhTFArZ5LZniH4wKvmKhNbly1AxAlGu8C86wQ6lFPWMjQn+Sn4X1dEHtW7vD6EGSebhp2xJ46v02BJfRcJqE9KTIsP8PRY88FF/IwIO0maD7uNC8vpu2FuqQKBgHAnIFJMmlS2qxJnLBQq2h3EcPW70gHPgdSPlJEQHUZ7mquP364RF36QJ2jwfWUbkbZt96MVDV8OPDiWQzMeXLQCB/GmjUvJ12bXTg8SzZd67XTQSLlQolk8h53eoA0QGYS64rY/8SSJ7FvScF32BsNkkPhcE7MQxHrHhbDtpHMZAoGAakhtaHgPbp8uc1qW/sZD4B8HSuIu5wvN9n6VM0YQV+b+InHijPe6ZvofLOTzrzzNJe1bocSf2AXCZp6NqTy9NECrTF4fuchjZcGSW6KQKZnZVfVlwUbt9wJgC9qz6l/M3JWKHHdDYktvDAdBFfZUZc930bLR8WYP2YHMgvY2zYA=
b1779d01-2b6f-4c28-9ce2-83a0732dc69f	c4dc5a17-ebc7-4640-bf04-3d778797fe9d	algorithm	HS512
2800c935-01b0-4bce-bbd6-1109093c261c	c4dc5a17-ebc7-4640-bf04-3d778797fe9d	secret	a5Od6SZQDsN47uu3256e_2W_WfhbNKYbaUplBtOKQ_JfPjBS1cksP_UDlEb57P7N28KLUY7Mwl4CDI_OgIBVcEEVXsIEzQR1zoP1K2YxAHOvjVjg-23bouGnGFjxB9k_ZciROKrGf9BESXbV6J0TiuUbWYJ3tx6BcPv6LMPLRDQ
e1bb01b3-330e-468f-bf5a-f4d07bb14f1f	c4dc5a17-ebc7-4640-bf04-3d778797fe9d	kid	940b4b99-1660-458c-bcf0-6ae115b5e34d
6b350b5a-d140-49c7-a256-c30484901def	c4dc5a17-ebc7-4640-bf04-3d778797fe9d	priority	100
20688f6d-2768-4516-bf57-f1c03f2ee737	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	saml-user-property-mapper
66e2ec02-8b6e-49ca-bdd8-c00b54ea16fb	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
eb5ee7b0-81ac-4d1b-bc19-2977e4a798a2	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	oidc-full-name-mapper
0a728bf9-61ac-49d7-9ba9-990d3217bfda	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	oidc-address-mapper
08972b52-a958-40c3-97bd-09fff92dbdde	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	saml-role-list-mapper
c66aa7c0-8d79-4fdb-93a8-dd80eef17876	299a6c3d-841c-4146-88ac-21c84336006a	allowed-protocol-mapper-types	saml-user-attribute-mapper
7c18d3bb-a809-48a6-9690-31d10da3bcbd	6c727287-f50b-4941-b3ac-025895e027d6	privateKey	MIIEogIBAAKCAQEAqU+MEMuQeWAcTkTT6jVcmThZrytKkCF2LJBG3Zv2SqVYRXQmNv0xZFojXL4bujoOHyPJHVj58165AEFdgLK8hAbKwbgp0a3PlFah6FVpLK47ubaAcR0tEZEKoBui4MM5TaiIPw0mWNnnzGo+11MPHuI6wTd48jS2+B2doUN1Bv4tafdXEDOfCweYh38jiLIAAHUgqo0Zwo93MjhB2lMuBF6cDLgFmPaMcP6nTkHdpZxerV/wm5ZrLVKXSv4aiZJgJ2p/3VInbjrbhJDarINV4eLhOC9Mt10CjUKtru302YWny6Vdk0cASVIFM9rUAVuP7JXgeg3fL6i0RTDLyDe45QIDAQABAoIBAAiEq0ocB8aHhp0MevH1YdWGn4J/5dY3DMREtQAIzP0n8Pc7lwGcvvuqyk0r9map7ZR0/zUWCStMqHeiEkN7mp703YYeDyKQwVkX+7jd9TbthC09iJxISMBxwOxZv5nZ0Jv+3u33Kib9vZsL/GHmeKQH40dd1FyxOMRmbwwSQgTKN2xPk6ay+JuL2RwOwwN/1Vq81kYSRWU5Ri4s10cjkGj3AU1rt22z0gbRI2nL1L8FRBQgCG8g0mUbBErCQSiv/Lq3iGUrFa8q5iFgfnjF9ARSSSm9Zv3qqmQgB2x2sckVkn5F6XqhbVeQcVffCPGxKak+29M167l7o/CDxjB8+ZECgYEA5vlLkxLjozLaegQp7UeGU+NwO3TOfR22VqzG7bCUoB7fyHM39sKqiEcNBhbP/IyeUizPvhOylQo2oSnSMOHZBG20cl2QmIMTfH6YbsFgU1LvvsBr2g8BR/nxtyX2LaKKSbuskXkDY8iAbEADz8F52I7nZeLPs2qkxM9HLrvgwhECgYEAu6famupqufwMsTPbwd7jv/Hp7w7X3fWZuL1Dt/iwFwbURL82bXyzLsIlKkbHfneJwVDdLF2EaiAgffCuc75EazfgPdp7A5K7+KcBpzIWKEos9WVCs7cKH8vJVzyeZQlDQahyF0ZQHROTbx5ldl0HA7aKHkVaFnb6UGH2NtVldZUCgYB7N68bjM4nt+9ZfHMphCijBAhRj6TAlmM5pf6RusvvB8l2VBEc8QisnsrR3sWiAxpK2GETE8sHO2WdYIQjU7jEZgoHoOaMlhCFL7v+CedrTCld56UhtTOHxE0w2W2VNsrzPs125cnrJ4FrPlNKN/rajpHfhrorCs9PtwxQYCYtIQKBgDgClLwSZcKXWY52hQwro9zBruo8iu/kA3rhetnpb12gGzFdxTgOtUiqh/9DWv4DXemGYk2AqCoo5qnQcbF4Q+GgrtynXnoljNdduZ+W0og6A4tHKw6K/omZAMJ6BGjxx9JMHamWwgi7tBDBiNU4VQSlsjnwxz/XSUU+yAd70Cm1AoGAMmXyk73K98MofdT7JVEMyGDi/RjoWx9uukHe0hpv8MoFUZm9nrSuI1oLy5L6Y38mBP/TW0v+opBSUyPOAqFxLWIZZt90Y69WzLsEdICoggr8ONvGUAa4mtl5MT+UwSeD2ABsciZeHllNl+CRJE4IY8zBhSkzH4xzrLGoB0cSBQc=
36b0a150-5fb5-461d-b6d5-bb7b0d3c5423	6c727287-f50b-4941-b3ac-025895e027d6	keyUse	SIG
013af21f-bbff-46e6-97f9-bd501db99492	6c727287-f50b-4941-b3ac-025895e027d6	certificate	MIIClTCCAX0CBgGc5zHWjDANBgkqhkiG9w0BAQsFADAOMQwwCgYDVQQDDANhc2gwHhcNMjYwMzEzMTIzMzQ5WhcNMzYwMzEzMTIzNTI5WjAOMQwwCgYDVQQDDANhc2gwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCpT4wQy5B5YBxORNPqNVyZOFmvK0qQIXYskEbdm/ZKpVhFdCY2/TFkWiNcvhu6Og4fI8kdWPnzXrkAQV2AsryEBsrBuCnRrc+UVqHoVWksrju5toBxHS0RkQqgG6LgwzlNqIg/DSZY2efMaj7XUw8e4jrBN3jyNLb4HZ2hQ3UG/i1p91cQM58LB5iHfyOIsgAAdSCqjRnCj3cyOEHaUy4EXpwMuAWY9oxw/qdOQd2lnF6tX/CblmstUpdK/hqJkmAnan/dUiduOtuEkNqsg1Xh4uE4L0y3XQKNQq2u7fTZhafLpV2TRwBJUgUz2tQBW4/sleB6Dd8vqLRFMMvIN7jlAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAD/fNPk144BDI3F8VGF2FnUiAIAN52YiG+iIsKfAANF66muPmP1+G/80MlaApwuLpsSHUvhr53XHUYEVc63X5vW/74A2xMkaqlTDprhBKGGjbBlr+2HqAehDsLLxZFwytbwGiP9zIyGSLaakW7z/u40D0YevZg4IuQelTEVK7wQrPJn3TjPiYh7LQrE3obFlNZSKXWPtRpiTsly5RSHv4357e5jYQJJJfSqvt9/n7Zvxxcy302/IfsVMPOdJq8ktHhtWC0Bp3+OkRtU6ltsS2x9TVZ19Bi4fglf8z+ug7JoZf6JEOgSS5ZHGHlbJXM6dVwcb5zLD56uFvQoQFRWEWMg=
2c546e39-4ca3-45d4-8302-ccafdb582dc8	6c727287-f50b-4941-b3ac-025895e027d6	priority	100
4c13cacd-29ca-4b46-9373-4a23a01eff2f	7ac598fd-1a87-428a-860c-af78563dcda5	kid	7bf319b8-ed05-49a5-8feb-f9228565806f
53055b03-f8cd-4867-9ddb-ad268a81dffe	7ac598fd-1a87-428a-860c-af78563dcda5	priority	100
96963706-b940-4bc1-b18b-ed8a4248871a	7ac598fd-1a87-428a-860c-af78563dcda5	secret	K45eq7tpM9hvpFTDYFygEw
29782e90-c9f0-4800-beb5-3ad299c48aac	0878e206-dbeb-4b5c-8216-9739bc896300	privateKey	MIIEowIBAAKCAQEAs0aeSwPnAewxaML5xtono6MPLiuo4uJiTYmwBH8o8uJSUFYypczhhrY3g9QnudiXZL8J9S5hqMU0fhpYrR2h6PNdVrERTPY1NAbeBi8FXGxLIgsgM5GDeQHHiTDRQNjo0i70ZGOqjD4Zu7ahlP3LIiJKLpern70xjVWdX9lfhJ5kh5F7l91m687WdB6WqmSW7KJOcDFjElu7nL0/nW8g9IFje30PSVZ4hTxhhOMONwP2WP5gBb/0JyvRcWvmgVhbjzMv5mFjmSLGmHvbbZku4MNOJufd1O8bv4LcaxTFxzBSV8bQFQjF8g6gFwWUORiPSTjnzfGoPcAj2AMBiYVH4QIDAQABAoIBAAIBfANoWYUQvLPInK1QIwnmaOTSGbtiH4nxDK5cMtvW0udxs3Ld8jcE4mWf8crXRMhch9K9sFuIS1BO4KedMYLO+EAgTop/JbS9j+3fSE7SqluI5tUU33Ty42XiTTENzDsPye22nMGhbz3FqxSk60koO46+ZS3uGrgTWWWpY7Ny4mhJ4io1xOA7z87kVieUkOmLroTZuKvbarUionFUITjvoAKayOnITkIKgMKHQzRUEgjrKWBeHFFjUvFW0uzl3HymE/2TfRVDbQxMTiTF8rzstLgv+u1zdQs0v0wAaPVEUZdpv/MURunpU6hc3WQ2td8OV3dQFCsR7GSJj5WWNXECgYEA7nQNIAqODFYSr0rgmfwueBvP9w+IE6QlNPmuVwCKU8IB/WOBPkqOQ1mmT56sNdRwfQHl07W83ZUy80ib8C4diSGOJhaVlRpk3bXAMgihMNUyWc+d2oQQQ7yxSYXnDSEKDC7UH+p79juzS8aHqG5qPUolVwBDsENSonmvMOndTikCgYEAwHfKX+Ir+XA5ppwkkk/efb1/1jAitnvitkZrUFFIHIOi8Q4EidYehCCVs/jiiUZ2XoxbZBCmPe9m/YYy74bjZ62ZpJjnEg0Yv980p+IZl56oNWdd343VgaGooyFU1oZ04L5uamZYyxuboe4Heh9PPWRWVEM7z0CohXwFCyOGcvkCgYAQkrpSzsj+rIDR9CdWLIPiTzSOHGM90jvPycbHPz9eAO74eJEEDlSC89kuUX3wo9pJpfceVtRQpk0LQbGs6Neer1lc5lbxLQtzqW05TQY/CaJdQaPcCy/CNXww+wCLFg/Htv2BVl/VRmL40kyddUcnCV89A8SwnI1Cw6hcgvShuQKBgQClTv4Z5qeAYbySdnAO3typQPaon8Vg2Pz7M3Z+kKGQJBvyUOji/m5Na7NI1c60uzl1sbXZN1ehwJrDy9y50DBHX1qkfdORtH/6ZJrUSyVSDapJ3BNLrIWiBphSLJGyg9+lHMq3RlqjcH320fvID1Y+04w2aVzYgJ99ruyiCYwz+QKBgFrLwueVTSgfua6cuIGgEzpC/aAWy/WZ0n/NMCxiE2HiH0SMlBMfZt/EN6V6+DhlUFKAWtaIjbXoB/mfq0HBHt3zHF7IoHt0Oe0lRU2N7DwoXsY+FJMxPqR39Frgd4SDqj3tQCQGRtEKjNeQkHRavRyQrY2LfhrSb81myiRqZLFj
d972f8d5-158b-46c2-a434-e6f56ab4992f	0878e206-dbeb-4b5c-8216-9739bc896300	keyUse	ENC
74af0647-1620-4abe-8e1f-ff661e087de2	0878e206-dbeb-4b5c-8216-9739bc896300	algorithm	RSA-OAEP
283879c2-1bd2-41f3-bfbc-86e20db34cfd	0878e206-dbeb-4b5c-8216-9739bc896300	certificate	MIIClTCCAX0CBgGc5zHXOjANBgkqhkiG9w0BAQsFADAOMQwwCgYDVQQDDANhc2gwHhcNMjYwMzEzMTIzMzQ5WhcNMzYwMzEzMTIzNTI5WjAOMQwwCgYDVQQDDANhc2gwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCzRp5LA+cB7DFowvnG2iejow8uK6ji4mJNibAEfyjy4lJQVjKlzOGGtjeD1Ce52Jdkvwn1LmGoxTR+GlitHaHo811WsRFM9jU0Bt4GLwVcbEsiCyAzkYN5AceJMNFA2OjSLvRkY6qMPhm7tqGU/csiIkoul6ufvTGNVZ1f2V+EnmSHkXuX3WbrztZ0HpaqZJbsok5wMWMSW7ucvT+dbyD0gWN7fQ9JVniFPGGE4w43A/ZY/mAFv/QnK9Fxa+aBWFuPMy/mYWOZIsaYe9ttmS7gw04m593U7xu/gtxrFMXHMFJXxtAVCMXyDqAXBZQ5GI9JOOfN8ag9wCPYAwGJhUfhAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAD6c5omJJktN99qgILGvCFbCixkE9vsc1GFVOX0UTCUm2X6/iFz57YypaMbyDewqF8F10aP6VFVMrHUC0O0PYUr2TSe9AiHw4mE0dq/+cWOu5JRanIcZtfR1YrEkKb+G9Sf71onn78MOOG9E/aLFkpgUWq4erO5PkmNOHBryv7LcV3o9cwrxwXEg0o9/xAw9Ztvxk/UvjJkpGFR6n/ys0EkDAh2OyG3jpw8aMGIWUefAm86AtTWQbrDptSyTBGbVQ8qcuGVQW8yikMb9ATD3HkFJ0CR62Yo2U5CDvxFtyxvfplINbOK7rk1qtHOFdaTp9tc9QsMms0wpcNVX1TDIqS0=
08e9e8e6-9268-489f-aadc-6c5eed9534fb	0878e206-dbeb-4b5c-8216-9739bc896300	priority	100
97b1492f-9164-4613-90dc-715e0cdbd4f1	91117b62-35c8-4664-84ed-257768a1a6c1	max-clients	200
fcc77789-8a36-490e-b967-1cef4007b9a0	f8bb4078-59b9-4e58-818c-a12a728d9673	host-sending-registration-request-must-match	true
ba173ca7-10aa-455d-a3d9-94aa06bed5d8	f8bb4078-59b9-4e58-818c-a12a728d9673	client-uris-must-match	true
378f7105-8a7a-4eb8-83e1-bae38af2a693	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	saml-user-attribute-mapper
2425eb55-e730-433e-ba55-1b3b9057f58c	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
e0a648c0-04ee-4f3b-93ea-2618dc1047c7	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	saml-role-list-mapper
a216efbb-6ba6-46ca-a98b-fd06ca888179	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	oidc-address-mapper
a6881c8b-a9d1-4afd-8908-b3cab703640b	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
523c3463-249e-4307-b1f9-b1621358815d	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	saml-user-property-mapper
f0c35e0e-979f-43cf-9850-b1b8efccb1d8	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	oidc-full-name-mapper
442b95e7-2410-41fd-9ca6-fe0bcb7aad3b	50edd19e-8d52-43df-839a-6a20fba5e853	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
\.


--
-- Data for Name: composite_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.composite_role (composite, child_role) FROM stdin;
f569cd43-b362-406c-aff0-f1232d37312a	985a22a7-c7b1-4344-9841-9a8d1365bbf0
f569cd43-b362-406c-aff0-f1232d37312a	ed986c89-6d27-46cd-9b69-6f7835bd40df
f569cd43-b362-406c-aff0-f1232d37312a	b0819daa-5eb2-4c64-9ceb-800edd2fab10
f569cd43-b362-406c-aff0-f1232d37312a	06a9e887-3ba2-407c-baae-d3d025aa16c3
f569cd43-b362-406c-aff0-f1232d37312a	91297db0-8173-480c-b1aa-4150f1c2ca6d
f569cd43-b362-406c-aff0-f1232d37312a	9d4e8d8f-f9a5-41a0-81ab-066e7e45e437
f569cd43-b362-406c-aff0-f1232d37312a	47b32038-0d2a-4c97-9b49-f43a8d613b80
f569cd43-b362-406c-aff0-f1232d37312a	d1d03f0e-2878-40c1-a168-3e6e15485bbc
f569cd43-b362-406c-aff0-f1232d37312a	a4d06b16-c038-4f38-bd68-5f9eea53ffd9
f569cd43-b362-406c-aff0-f1232d37312a	ca1b165e-6006-4664-ac48-760a2aa731b9
f569cd43-b362-406c-aff0-f1232d37312a	5fa34aca-f86d-4bae-9cd3-0ecffe9b3097
f569cd43-b362-406c-aff0-f1232d37312a	b0d395d1-4ba6-4807-838b-9e429dc19a0d
f569cd43-b362-406c-aff0-f1232d37312a	125b1a5a-6d5e-401a-a213-b00694b75894
f569cd43-b362-406c-aff0-f1232d37312a	2be3b142-2b28-4892-91b9-1e53a0e749d3
f569cd43-b362-406c-aff0-f1232d37312a	501ed480-8bfa-46e0-9132-36bc92ec99b0
f569cd43-b362-406c-aff0-f1232d37312a	468f4e60-3db0-47c4-8fd5-5c6460785551
f569cd43-b362-406c-aff0-f1232d37312a	fe5ccb27-8c8c-4ec3-b2e4-3559503ea2ac
f569cd43-b362-406c-aff0-f1232d37312a	b23a8048-e55f-4e33-ab45-f64f4edd7ae9
91297db0-8173-480c-b1aa-4150f1c2ca6d	468f4e60-3db0-47c4-8fd5-5c6460785551
06a9e887-3ba2-407c-baae-d3d025aa16c3	501ed480-8bfa-46e0-9132-36bc92ec99b0
06a9e887-3ba2-407c-baae-d3d025aa16c3	b23a8048-e55f-4e33-ab45-f64f4edd7ae9
e2a1fb6d-4257-4c9b-b108-7eacc839df2b	0b0b490e-f20b-45db-a42a-91a0fd491a50
e2a1fb6d-4257-4c9b-b108-7eacc839df2b	fa441f8c-f42c-4f4e-a79c-e819d5583a5e
fa441f8c-f42c-4f4e-a79c-e819d5583a5e	f286a642-e77b-40d5-bd7e-aced48c410b7
f0c2e9a2-ebbb-4e61-b61d-73e5106003ee	79cf03d8-3c9d-46c6-af7f-ef813c72c092
f569cd43-b362-406c-aff0-f1232d37312a	7d75f303-347e-4b7c-9113-d1f64d304f6e
e2a1fb6d-4257-4c9b-b108-7eacc839df2b	94d7a71c-3edf-4306-b3ce-c0255b61a8e5
e2a1fb6d-4257-4c9b-b108-7eacc839df2b	a7f90d51-eacd-48e9-b55f-65c3854c1b46
f569cd43-b362-406c-aff0-f1232d37312a	1ffe82f2-f8cf-4667-822c-a01837efb2ac
f569cd43-b362-406c-aff0-f1232d37312a	5d7afb49-f9c3-4e31-ae68-8fe57ee674d3
f569cd43-b362-406c-aff0-f1232d37312a	3e013eee-1cde-4de4-8cdb-569dcdb1c1af
f569cd43-b362-406c-aff0-f1232d37312a	8f621387-1cf1-4222-b500-04100ebdc015
f569cd43-b362-406c-aff0-f1232d37312a	7b0b5323-e68a-413e-9431-9af75cd612a0
f569cd43-b362-406c-aff0-f1232d37312a	14270bc3-e755-4809-9209-a5da2ba994cc
f569cd43-b362-406c-aff0-f1232d37312a	ab382691-2d6a-482e-9b2c-f708314a9787
f569cd43-b362-406c-aff0-f1232d37312a	b3a91663-47ed-4aa8-913f-f229b8e41cae
f569cd43-b362-406c-aff0-f1232d37312a	05088128-795b-4bc1-bce0-31bdac35dce1
f569cd43-b362-406c-aff0-f1232d37312a	384d36cd-2c9d-48eb-81a5-15db45918d02
f569cd43-b362-406c-aff0-f1232d37312a	6427a28f-0846-489a-9b61-1a00f3e70cad
f569cd43-b362-406c-aff0-f1232d37312a	6c78780b-d6ef-4dff-ba92-fd6848cd831f
f569cd43-b362-406c-aff0-f1232d37312a	0726d1b2-cfe0-44bf-ac57-e3862527d557
f569cd43-b362-406c-aff0-f1232d37312a	9e6b1128-6d5b-4106-936d-f1c6519eb121
f569cd43-b362-406c-aff0-f1232d37312a	78542b0d-41a3-4d50-9ef0-a550cc52771d
f569cd43-b362-406c-aff0-f1232d37312a	eef4cb44-63f4-42c7-982a-1e727b24fae8
f569cd43-b362-406c-aff0-f1232d37312a	fec5b18c-aa8a-4d5f-b586-e75124d68e55
8f621387-1cf1-4222-b500-04100ebdc015	78542b0d-41a3-4d50-9ef0-a550cc52771d
3e013eee-1cde-4de4-8cdb-569dcdb1c1af	9e6b1128-6d5b-4106-936d-f1c6519eb121
3e013eee-1cde-4de4-8cdb-569dcdb1c1af	fec5b18c-aa8a-4d5f-b586-e75124d68e55
9338202c-5461-4446-a311-447e269b81e2	9431d646-de22-47dc-a2a3-155ee5f139f1
9338202c-5461-4446-a311-447e269b81e2	33be7424-ae4c-4dfb-88fd-83274224f5ce
9338202c-5461-4446-a311-447e269b81e2	b64fd68f-e9bc-4d16-b2bd-824e33382567
9338202c-5461-4446-a311-447e269b81e2	3fe13273-a22b-44a6-965c-89dadd2bfce6
9338202c-5461-4446-a311-447e269b81e2	8fa0134d-39b2-4891-a3cd-bcf5b3a34518
9338202c-5461-4446-a311-447e269b81e2	bb1e89bb-92ca-472f-8705-d78418b3c497
9338202c-5461-4446-a311-447e269b81e2	8153f918-ff4e-4558-baff-f250727d0383
9338202c-5461-4446-a311-447e269b81e2	b87ee67f-bfcc-4891-be74-b34bd0856772
9338202c-5461-4446-a311-447e269b81e2	2723ee00-ea0a-4784-9b7a-87a86981e89d
9338202c-5461-4446-a311-447e269b81e2	42bb5eda-3efe-46cd-a046-fba57a46974f
9338202c-5461-4446-a311-447e269b81e2	c8f062f8-ae2d-4473-8512-8792534050ba
9338202c-5461-4446-a311-447e269b81e2	d2c22ff3-3628-4988-8bd9-44dfa23319e4
9338202c-5461-4446-a311-447e269b81e2	69e4a620-9df1-464b-9970-5e971a2df399
9338202c-5461-4446-a311-447e269b81e2	0e0f854a-1910-4b49-9b11-eff371de16e2
9338202c-5461-4446-a311-447e269b81e2	2fca4e30-0866-482f-80d2-0c3143ce7e82
9338202c-5461-4446-a311-447e269b81e2	85e2b296-fb64-4db2-8641-6e3925ad682a
9338202c-5461-4446-a311-447e269b81e2	61833ac2-eea4-4997-852c-bc90ffa3ad2c
3fe13273-a22b-44a6-965c-89dadd2bfce6	2fca4e30-0866-482f-80d2-0c3143ce7e82
b64fd68f-e9bc-4d16-b2bd-824e33382567	0e0f854a-1910-4b49-9b11-eff371de16e2
b64fd68f-e9bc-4d16-b2bd-824e33382567	61833ac2-eea4-4997-852c-bc90ffa3ad2c
cc18f194-5ba2-42f3-b648-0f87e18af2cf	4f998070-c0f8-423b-9914-e795012eaec6
cc18f194-5ba2-42f3-b648-0f87e18af2cf	73da43a9-9874-4864-97fc-1baae1fc6df4
73da43a9-9874-4864-97fc-1baae1fc6df4	c07c9573-e6a4-4b24-9131-fdfee8181c4b
c32d3ffe-95a1-474c-9d16-e959d10156c3	068f4c42-043b-401e-b22f-58f0b8cd2712
f569cd43-b362-406c-aff0-f1232d37312a	40631f1e-0abd-49ad-8a2f-fb15143a9ca2
9338202c-5461-4446-a311-447e269b81e2	f0fc4195-0391-4cdc-8c56-cd605be7aad3
cc18f194-5ba2-42f3-b648-0f87e18af2cf	77a9032f-e51b-4ff9-ae56-b3dbcb343782
cc18f194-5ba2-42f3-b648-0f87e18af2cf	daf04d94-4e86-4db9-ab20-cdac39e2fd79
\.


--
-- Data for Name: credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credential (id, salt, type, user_id, created_date, user_label, secret_data, credential_data, priority, version) FROM stdin;
1aadd3e6-dd3b-4069-a014-e5b7dc5238e8	\N	password	567e3de5-aa09-43bc-bc89-e4dad92f133a	1773329672347	\N	{"value":"tFfjplNdTFEDFs6t/LC5jDnlOiMem3sNIwE3hcja/Cs=","salt":"rLGUGcmR3x/WT4ngFQXEkQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	0
0c35563d-64ee-4802-9356-ad0c54f9d356	\N	password	b4ba82f3-989d-40f0-8045-227c3a1dab51	1773405541525	\N	{"value":"Mj//9ip+PTeEXsVcDWDu2WGPiFTBNGZq0QsNpDeK3tA=","salt":"+uzuvSoN1Ru0VVubjICvFg==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10	0
\.


--
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/jpa-changelog-1.0.0.Final.xml	2026-03-12 15:34:18.170379	1	EXECUTED	9:6f1016664e21e16d26517a4418f5e3df	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.33.0	\N	\N	3329651799
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/db2-jpa-changelog-1.0.0.Final.xml	2026-03-12 15:34:18.19465	2	MARK_RAN	9:828775b1596a07d1200ba1d49e5e3941	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.33.0	\N	\N	3329651799
1.1.0.Beta1	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Beta1.xml	2026-03-12 15:34:18.233799	3	EXECUTED	9:5f090e44a7d595883c1fb61f4b41fd38	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=CLIENT_ATTRIBUTES; createTable tableName=CLIENT_SESSION_NOTE; createTable tableName=APP_NODE_REGISTRATIONS; addColumn table...		\N	4.33.0	\N	\N	3329651799
1.1.0.Final	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Final.xml	2026-03-12 15:34:18.238682	4	EXECUTED	9:c07e577387a3d2c04d1adc9aaad8730e	renameColumn newColumnName=EVENT_TIME, oldColumnName=TIME, tableName=EVENT_ENTITY		\N	4.33.0	\N	\N	3329651799
1.2.0.Beta1	psilva@redhat.com	META-INF/jpa-changelog-1.2.0.Beta1.xml	2026-03-12 15:34:18.34108	5	EXECUTED	9:b68ce996c655922dbcd2fe6b6ae72686	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.33.0	\N	\N	3329651799
1.2.0.Beta1	psilva@redhat.com	META-INF/db2-jpa-changelog-1.2.0.Beta1.xml	2026-03-12 15:34:18.350023	6	MARK_RAN	9:543b5c9989f024fe35c6f6c5a97de88e	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.33.0	\N	\N	3329651799
1.2.0.RC1	bburke@redhat.com	META-INF/jpa-changelog-1.2.0.CR1.xml	2026-03-12 15:34:18.45486	7	EXECUTED	9:765afebbe21cf5bbca048e632df38336	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.33.0	\N	\N	3329651799
1.2.0.RC1	bburke@redhat.com	META-INF/db2-jpa-changelog-1.2.0.CR1.xml	2026-03-12 15:34:18.49566	8	MARK_RAN	9:db4a145ba11a6fdaefb397f6dbf829a1	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.33.0	\N	\N	3329651799
1.2.0.Final	keycloak	META-INF/jpa-changelog-1.2.0.Final.xml	2026-03-12 15:34:18.505758	9	EXECUTED	9:9d05c7be10cdb873f8bcb41bc3a8ab23	update tableName=CLIENT; update tableName=CLIENT; update tableName=CLIENT		\N	4.33.0	\N	\N	3329651799
1.3.0	bburke@redhat.com	META-INF/jpa-changelog-1.3.0.xml	2026-03-12 15:34:18.608028	10	EXECUTED	9:18593702353128d53111f9b1ff0b82b8	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=ADMI...		\N	4.33.0	\N	\N	3329651799
1.4.0	bburke@redhat.com	META-INF/jpa-changelog-1.4.0.xml	2026-03-12 15:34:18.671617	11	EXECUTED	9:6122efe5f090e41a85c0f1c9e52cbb62	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.33.0	\N	\N	3329651799
1.4.0	bburke@redhat.com	META-INF/db2-jpa-changelog-1.4.0.xml	2026-03-12 15:34:18.679767	12	MARK_RAN	9:e1ff28bf7568451453f844c5d54bb0b5	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.33.0	\N	\N	3329651799
1.5.0	bburke@redhat.com	META-INF/jpa-changelog-1.5.0.xml	2026-03-12 15:34:18.709432	13	EXECUTED	9:7af32cd8957fbc069f796b61217483fd	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.33.0	\N	\N	3329651799
1.6.1_from15	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2026-03-12 15:34:18.731734	14	EXECUTED	9:6005e15e84714cd83226bf7879f54190	addColumn tableName=REALM; addColumn tableName=KEYCLOAK_ROLE; addColumn tableName=CLIENT; createTable tableName=OFFLINE_USER_SESSION; createTable tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_US_SES_PK2, tableName=...		\N	4.33.0	\N	\N	3329651799
1.6.1_from16-pre	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2026-03-12 15:34:18.734093	15	MARK_RAN	9:bf656f5a2b055d07f314431cae76f06c	delete tableName=OFFLINE_CLIENT_SESSION; delete tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
1.6.1_from16	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2026-03-12 15:34:18.738515	16	MARK_RAN	9:f8dadc9284440469dcf71e25ca6ab99b	dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_US_SES_PK, tableName=OFFLINE_USER_SESSION; dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_CL_SES_PK, tableName=OFFLINE_CLIENT_SESSION; addColumn tableName=OFFLINE_USER_SESSION; update tableName=OF...		\N	4.33.0	\N	\N	3329651799
1.6.1	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2026-03-12 15:34:18.743116	17	EXECUTED	9:d41d8cd98f00b204e9800998ecf8427e	empty		\N	4.33.0	\N	\N	3329651799
1.7.0	bburke@redhat.com	META-INF/jpa-changelog-1.7.0.xml	2026-03-12 15:34:18.798116	18	EXECUTED	9:3368ff0be4c2855ee2dd9ca813b38d8e	createTable tableName=KEYCLOAK_GROUP; createTable tableName=GROUP_ROLE_MAPPING; createTable tableName=GROUP_ATTRIBUTE; createTable tableName=USER_GROUP_MEMBERSHIP; createTable tableName=REALM_DEFAULT_GROUPS; addColumn tableName=IDENTITY_PROVIDER; ...		\N	4.33.0	\N	\N	3329651799
1.8.0	mposolda@redhat.com	META-INF/jpa-changelog-1.8.0.xml	2026-03-12 15:34:18.846107	19	EXECUTED	9:8ac2fb5dd030b24c0570a763ed75ed20	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.33.0	\N	\N	3329651799
1.8.0-2	keycloak	META-INF/jpa-changelog-1.8.0.xml	2026-03-12 15:34:18.85208	20	EXECUTED	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.33.0	\N	\N	3329651799
22.0.5-24031	keycloak	META-INF/jpa-changelog-22.0.0.xml	2026-03-12 15:34:24.078335	119	MARK_RAN	9:a60d2d7b315ec2d3eba9e2f145f9df28	customChange		\N	4.33.0	\N	\N	3329651799
1.8.0	mposolda@redhat.com	META-INF/db2-jpa-changelog-1.8.0.xml	2026-03-12 15:34:18.856745	21	MARK_RAN	9:831e82914316dc8a57dc09d755f23c51	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.33.0	\N	\N	3329651799
1.8.0-2	keycloak	META-INF/db2-jpa-changelog-1.8.0.xml	2026-03-12 15:34:18.860561	22	MARK_RAN	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.33.0	\N	\N	3329651799
1.9.0	mposolda@redhat.com	META-INF/jpa-changelog-1.9.0.xml	2026-03-12 15:34:18.986316	23	EXECUTED	9:bc3d0f9e823a69dc21e23e94c7a94bb1	update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=REALM; update tableName=REALM; customChange; dr...		\N	4.33.0	\N	\N	3329651799
1.9.1	keycloak	META-INF/jpa-changelog-1.9.1.xml	2026-03-12 15:34:18.993184	24	EXECUTED	9:c9999da42f543575ab790e76439a2679	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=PUBLIC_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.33.0	\N	\N	3329651799
1.9.1	keycloak	META-INF/db2-jpa-changelog-1.9.1.xml	2026-03-12 15:34:18.995017	25	MARK_RAN	9:0d6c65c6f58732d81569e77b10ba301d	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.33.0	\N	\N	3329651799
1.9.2	keycloak	META-INF/jpa-changelog-1.9.2.xml	2026-03-12 15:34:19.507676	26	EXECUTED	9:fc576660fc016ae53d2d4778d84d86d0	createIndex indexName=IDX_USER_EMAIL, tableName=USER_ENTITY; createIndex indexName=IDX_USER_ROLE_MAPPING, tableName=USER_ROLE_MAPPING; createIndex indexName=IDX_USER_GROUP_MAPPING, tableName=USER_GROUP_MEMBERSHIP; createIndex indexName=IDX_USER_CO...		\N	4.33.0	\N	\N	3329651799
authz-2.0.0	psilva@redhat.com	META-INF/jpa-changelog-authz-2.0.0.xml	2026-03-12 15:34:19.571509	27	EXECUTED	9:43ed6b0da89ff77206289e87eaa9c024	createTable tableName=RESOURCE_SERVER; addPrimaryKey constraintName=CONSTRAINT_FARS, tableName=RESOURCE_SERVER; addUniqueConstraint constraintName=UK_AU8TT6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER; createTable tableName=RESOURCE_SERVER_RESOU...		\N	4.33.0	\N	\N	3329651799
authz-2.5.1	psilva@redhat.com	META-INF/jpa-changelog-authz-2.5.1.xml	2026-03-12 15:34:19.577425	28	EXECUTED	9:44bae577f551b3738740281eceb4ea70	update tableName=RESOURCE_SERVER_POLICY		\N	4.33.0	\N	\N	3329651799
2.1.0-KEYCLOAK-5461	bburke@redhat.com	META-INF/jpa-changelog-2.1.0.xml	2026-03-12 15:34:19.628656	29	EXECUTED	9:bd88e1f833df0420b01e114533aee5e8	createTable tableName=BROKER_LINK; createTable tableName=FED_USER_ATTRIBUTE; createTable tableName=FED_USER_CONSENT; createTable tableName=FED_USER_CONSENT_ROLE; createTable tableName=FED_USER_CONSENT_PROT_MAPPER; createTable tableName=FED_USER_CR...		\N	4.33.0	\N	\N	3329651799
2.2.0	bburke@redhat.com	META-INF/jpa-changelog-2.2.0.xml	2026-03-12 15:34:19.642715	30	EXECUTED	9:a7022af5267f019d020edfe316ef4371	addColumn tableName=ADMIN_EVENT_ENTITY; createTable tableName=CREDENTIAL_ATTRIBUTE; createTable tableName=FED_CREDENTIAL_ATTRIBUTE; modifyDataType columnName=VALUE, tableName=CREDENTIAL; addForeignKeyConstraint baseTableName=FED_CREDENTIAL_ATTRIBU...		\N	4.33.0	\N	\N	3329651799
2.3.0	bburke@redhat.com	META-INF/jpa-changelog-2.3.0.xml	2026-03-12 15:34:19.664786	31	EXECUTED	9:fc155c394040654d6a79227e56f5e25a	createTable tableName=FEDERATED_USER; addPrimaryKey constraintName=CONSTR_FEDERATED_USER, tableName=FEDERATED_USER; dropDefaultValue columnName=TOTP, tableName=USER_ENTITY; dropColumn columnName=TOTP, tableName=USER_ENTITY; addColumn tableName=IDE...		\N	4.33.0	\N	\N	3329651799
2.4.0	bburke@redhat.com	META-INF/jpa-changelog-2.4.0.xml	2026-03-12 15:34:19.67107	32	EXECUTED	9:eac4ffb2a14795e5dc7b426063e54d88	customChange		\N	4.33.0	\N	\N	3329651799
2.5.0	bburke@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2026-03-12 15:34:19.678066	33	EXECUTED	9:54937c05672568c4c64fc9524c1e9462	customChange; modifyDataType columnName=USER_ID, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
2.5.0-unicode-oracle	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2026-03-12 15:34:19.680772	34	MARK_RAN	9:f9753208029f582525ed12011a19d054	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.33.0	\N	\N	3329651799
2.5.0-unicode-other-dbs	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2026-03-12 15:34:19.709217	35	EXECUTED	9:33d72168746f81f98ae3a1e8e0ca3554	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.33.0	\N	\N	3329651799
2.5.0-duplicate-email-support	slawomir@dabek.name	META-INF/jpa-changelog-2.5.0.xml	2026-03-12 15:34:19.71623	36	EXECUTED	9:61b6d3d7a4c0e0024b0c839da283da0c	addColumn tableName=REALM		\N	4.33.0	\N	\N	3329651799
2.5.0-unique-group-names	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2026-03-12 15:34:19.722047	37	EXECUTED	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.33.0	\N	\N	3329651799
2.5.1	bburke@redhat.com	META-INF/jpa-changelog-2.5.1.xml	2026-03-12 15:34:19.727674	38	EXECUTED	9:a2b870802540cb3faa72098db5388af3	addColumn tableName=FED_USER_CONSENT		\N	4.33.0	\N	\N	3329651799
3.0.0	bburke@redhat.com	META-INF/jpa-changelog-3.0.0.xml	2026-03-12 15:34:19.732479	39	EXECUTED	9:132a67499ba24bcc54fb5cbdcfe7e4c0	addColumn tableName=IDENTITY_PROVIDER		\N	4.33.0	\N	\N	3329651799
3.2.0-fix	keycloak	META-INF/jpa-changelog-3.2.0.xml	2026-03-12 15:34:19.734536	40	MARK_RAN	9:938f894c032f5430f2b0fafb1a243462	addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS		\N	4.33.0	\N	\N	3329651799
3.2.0-fix-with-keycloak-5416	keycloak	META-INF/jpa-changelog-3.2.0.xml	2026-03-12 15:34:19.737839	41	MARK_RAN	9:845c332ff1874dc5d35974b0babf3006	dropIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS; addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS; createIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS		\N	4.33.0	\N	\N	3329651799
3.2.0-fix-offline-sessions	hmlnarik	META-INF/jpa-changelog-3.2.0.xml	2026-03-12 15:34:19.744661	42	EXECUTED	9:fc86359c079781adc577c5a217e4d04c	customChange		\N	4.33.0	\N	\N	3329651799
3.2.0-fixed	keycloak	META-INF/jpa-changelog-3.2.0.xml	2026-03-12 15:34:21.888733	43	EXECUTED	9:59a64800e3c0d09b825f8a3b444fa8f4	addColumn tableName=REALM; dropPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_PK2, tableName=OFFLINE_CLIENT_SESSION; dropColumn columnName=CLIENT_SESSION_ID, tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_P...		\N	4.33.0	\N	\N	3329651799
3.3.0	keycloak	META-INF/jpa-changelog-3.3.0.xml	2026-03-12 15:34:21.89262	44	EXECUTED	9:d48d6da5c6ccf667807f633fe489ce88	addColumn tableName=USER_ENTITY		\N	4.33.0	\N	\N	3329651799
authz-3.4.0.CR1-resource-server-pk-change-part1	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2026-03-12 15:34:21.898103	45	EXECUTED	9:dde36f7973e80d71fceee683bc5d2951	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_RESOURCE; addColumn tableName=RESOURCE_SERVER_SCOPE		\N	4.33.0	\N	\N	3329651799
authz-3.4.0.CR1-resource-server-pk-change-part2-KEYCLOAK-6095	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2026-03-12 15:34:21.903287	46	EXECUTED	9:b855e9b0a406b34fa323235a0cf4f640	customChange		\N	4.33.0	\N	\N	3329651799
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2026-03-12 15:34:21.904941	47	MARK_RAN	9:51abbacd7b416c50c4421a8cabf7927e	dropIndex indexName=IDX_RES_SERV_POL_RES_SERV, tableName=RESOURCE_SERVER_POLICY; dropIndex indexName=IDX_RES_SRV_RES_RES_SRV, tableName=RESOURCE_SERVER_RESOURCE; dropIndex indexName=IDX_RES_SRV_SCOPE_RES_SRV, tableName=RESOURCE_SERVER_SCOPE		\N	4.33.0	\N	\N	3329651799
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed-nodropindex	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2026-03-12 15:34:22.049214	48	EXECUTED	9:bdc99e567b3398bac83263d375aad143	addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_POLICY; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_RESOURCE; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, ...		\N	4.33.0	\N	\N	3329651799
authn-3.4.0.CR1-refresh-token-max-reuse	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2026-03-12 15:34:22.054139	49	EXECUTED	9:d198654156881c46bfba39abd7769e69	addColumn tableName=REALM		\N	4.33.0	\N	\N	3329651799
3.4.0	keycloak	META-INF/jpa-changelog-3.4.0.xml	2026-03-12 15:34:22.077385	50	EXECUTED	9:cfdd8736332ccdd72c5256ccb42335db	addPrimaryKey constraintName=CONSTRAINT_REALM_DEFAULT_ROLES, tableName=REALM_DEFAULT_ROLES; addPrimaryKey constraintName=CONSTRAINT_COMPOSITE_ROLE, tableName=COMPOSITE_ROLE; addPrimaryKey constraintName=CONSTR_REALM_DEFAULT_GROUPS, tableName=REALM...		\N	4.33.0	\N	\N	3329651799
3.4.0-KEYCLOAK-5230	hmlnarik@redhat.com	META-INF/jpa-changelog-3.4.0.xml	2026-03-12 15:34:22.476316	51	EXECUTED	9:7c84de3d9bd84d7f077607c1a4dcb714	createIndex indexName=IDX_FU_ATTRIBUTE, tableName=FED_USER_ATTRIBUTE; createIndex indexName=IDX_FU_CONSENT, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CONSENT_RU, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CREDENTIAL, t...		\N	4.33.0	\N	\N	3329651799
3.4.1	psilva@redhat.com	META-INF/jpa-changelog-3.4.1.xml	2026-03-12 15:34:22.479672	52	EXECUTED	9:5a6bb36cbefb6a9d6928452c0852af2d	modifyDataType columnName=VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
3.4.2	keycloak	META-INF/jpa-changelog-3.4.2.xml	2026-03-12 15:34:22.482838	53	EXECUTED	9:8f23e334dbc59f82e0a328373ca6ced0	update tableName=REALM		\N	4.33.0	\N	\N	3329651799
3.4.2-KEYCLOAK-5172	mkanis@redhat.com	META-INF/jpa-changelog-3.4.2.xml	2026-03-12 15:34:22.485528	54	EXECUTED	9:9156214268f09d970cdf0e1564d866af	update tableName=CLIENT		\N	4.33.0	\N	\N	3329651799
4.0.0-KEYCLOAK-6335	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2026-03-12 15:34:22.4906	55	EXECUTED	9:db806613b1ed154826c02610b7dbdf74	createTable tableName=CLIENT_AUTH_FLOW_BINDINGS; addPrimaryKey constraintName=C_CLI_FLOW_BIND, tableName=CLIENT_AUTH_FLOW_BINDINGS		\N	4.33.0	\N	\N	3329651799
4.0.0-CLEANUP-UNUSED-TABLE	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2026-03-12 15:34:22.495667	56	EXECUTED	9:229a041fb72d5beac76bb94a5fa709de	dropTable tableName=CLIENT_IDENTITY_PROV_MAPPING		\N	4.33.0	\N	\N	3329651799
4.0.0-KEYCLOAK-6228	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2026-03-12 15:34:22.547545	57	EXECUTED	9:079899dade9c1e683f26b2aa9ca6ff04	dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; dropNotNullConstraint columnName=CLIENT_ID, tableName=USER_CONSENT; addColumn tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHO...		\N	4.33.0	\N	\N	3329651799
4.0.0-KEYCLOAK-5579-fixed	mposolda@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2026-03-12 15:34:23.07241	58	EXECUTED	9:139b79bcbbfe903bb1c2d2a4dbf001d9	dropForeignKeyConstraint baseTableName=CLIENT_TEMPLATE_ATTRIBUTES, constraintName=FK_CL_TEMPL_ATTR_TEMPL; renameTable newTableName=CLIENT_SCOPE_ATTRIBUTES, oldTableName=CLIENT_TEMPLATE_ATTRIBUTES; renameColumn newColumnName=SCOPE_ID, oldColumnName...		\N	4.33.0	\N	\N	3329651799
authz-4.0.0.CR1	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.CR1.xml	2026-03-12 15:34:23.09375	59	EXECUTED	9:b55738ad889860c625ba2bf483495a04	createTable tableName=RESOURCE_SERVER_PERM_TICKET; addPrimaryKey constraintName=CONSTRAINT_FAPMT, tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRHO213XCX4WNKOG82SSPMT...		\N	4.33.0	\N	\N	3329651799
authz-4.0.0.Beta3	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.Beta3.xml	2026-03-12 15:34:23.099585	60	EXECUTED	9:e0057eac39aa8fc8e09ac6cfa4ae15fe	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRPO2128CX4WNKOG82SSRFY, referencedTableName=RESOURCE_SERVER_POLICY		\N	4.33.0	\N	\N	3329651799
authz-4.2.0.Final	mhajas@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2026-03-12 15:34:23.107597	61	EXECUTED	9:42a33806f3a0443fe0e7feeec821326c	createTable tableName=RESOURCE_URIS; addForeignKeyConstraint baseTableName=RESOURCE_URIS, constraintName=FK_RESOURCE_SERVER_URIS, referencedTableName=RESOURCE_SERVER_RESOURCE; customChange; dropColumn columnName=URI, tableName=RESOURCE_SERVER_RESO...		\N	4.33.0	\N	\N	3329651799
authz-4.2.0.Final-KEYCLOAK-9944	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2026-03-12 15:34:23.111471	62	EXECUTED	9:9968206fca46eecc1f51db9c024bfe56	addPrimaryKey constraintName=CONSTRAINT_RESOUR_URIS_PK, tableName=RESOURCE_URIS		\N	4.33.0	\N	\N	3329651799
4.2.0-KEYCLOAK-6313	wadahiro@gmail.com	META-INF/jpa-changelog-4.2.0.xml	2026-03-12 15:34:23.115186	63	EXECUTED	9:92143a6daea0a3f3b8f598c97ce55c3d	addColumn tableName=REQUIRED_ACTION_PROVIDER		\N	4.33.0	\N	\N	3329651799
4.3.0-KEYCLOAK-7984	wadahiro@gmail.com	META-INF/jpa-changelog-4.3.0.xml	2026-03-12 15:34:23.118466	64	EXECUTED	9:82bab26a27195d889fb0429003b18f40	update tableName=REQUIRED_ACTION_PROVIDER		\N	4.33.0	\N	\N	3329651799
4.6.0-KEYCLOAK-7950	psilva@redhat.com	META-INF/jpa-changelog-4.6.0.xml	2026-03-12 15:34:23.121809	65	EXECUTED	9:e590c88ddc0b38b0ae4249bbfcb5abc3	update tableName=RESOURCE_SERVER_RESOURCE		\N	4.33.0	\N	\N	3329651799
4.6.0-KEYCLOAK-8377	keycloak	META-INF/jpa-changelog-4.6.0.xml	2026-03-12 15:34:23.175031	66	EXECUTED	9:5c1f475536118dbdc38d5d7977950cc0	createTable tableName=ROLE_ATTRIBUTE; addPrimaryKey constraintName=CONSTRAINT_ROLE_ATTRIBUTE_PK, tableName=ROLE_ATTRIBUTE; addForeignKeyConstraint baseTableName=ROLE_ATTRIBUTE, constraintName=FK_ROLE_ATTRIBUTE_ID, referencedTableName=KEYCLOAK_ROLE...		\N	4.33.0	\N	\N	3329651799
4.6.0-KEYCLOAK-8555	gideonray@gmail.com	META-INF/jpa-changelog-4.6.0.xml	2026-03-12 15:34:23.223653	67	EXECUTED	9:e7c9f5f9c4d67ccbbcc215440c718a17	createIndex indexName=IDX_COMPONENT_PROVIDER_TYPE, tableName=COMPONENT		\N	4.33.0	\N	\N	3329651799
4.7.0-KEYCLOAK-1267	sguilhen@redhat.com	META-INF/jpa-changelog-4.7.0.xml	2026-03-12 15:34:23.229589	68	EXECUTED	9:88e0bfdda924690d6f4e430c53447dd5	addColumn tableName=REALM		\N	4.33.0	\N	\N	3329651799
4.7.0-KEYCLOAK-7275	keycloak	META-INF/jpa-changelog-4.7.0.xml	2026-03-12 15:34:23.289245	69	EXECUTED	9:f53177f137e1c46b6a88c59ec1cb5218	renameColumn newColumnName=CREATED_ON, oldColumnName=LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION; addNotNullConstraint columnName=CREATED_ON, tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_USER_SESSION; customChange; createIn...		\N	4.33.0	\N	\N	3329651799
4.8.0-KEYCLOAK-8835	sguilhen@redhat.com	META-INF/jpa-changelog-4.8.0.xml	2026-03-12 15:34:23.295656	70	EXECUTED	9:a74d33da4dc42a37ec27121580d1459f	addNotNullConstraint columnName=SSO_MAX_LIFESPAN_REMEMBER_ME, tableName=REALM; addNotNullConstraint columnName=SSO_IDLE_TIMEOUT_REMEMBER_ME, tableName=REALM		\N	4.33.0	\N	\N	3329651799
authz-7.0.0-KEYCLOAK-10443	psilva@redhat.com	META-INF/jpa-changelog-authz-7.0.0.xml	2026-03-12 15:34:23.300364	71	EXECUTED	9:fd4ade7b90c3b67fae0bfcfcb42dfb5f	addColumn tableName=RESOURCE_SERVER		\N	4.33.0	\N	\N	3329651799
8.0.0-adding-credential-columns	keycloak	META-INF/jpa-changelog-8.0.0.xml	2026-03-12 15:34:23.308784	72	EXECUTED	9:aa072ad090bbba210d8f18781b8cebf4	addColumn tableName=CREDENTIAL; addColumn tableName=FED_USER_CREDENTIAL		\N	4.33.0	\N	\N	3329651799
8.0.0-updating-credential-data-not-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2026-03-12 15:34:23.318008	73	EXECUTED	9:1ae6be29bab7c2aa376f6983b932be37	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.33.0	\N	\N	3329651799
8.0.0-updating-credential-data-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2026-03-12 15:34:23.320712	74	MARK_RAN	9:14706f286953fc9a25286dbd8fb30d97	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.33.0	\N	\N	3329651799
8.0.0-credential-cleanup-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2026-03-12 15:34:23.342365	75	EXECUTED	9:2b9cc12779be32c5b40e2e67711a218b	dropDefaultValue columnName=COUNTER, tableName=CREDENTIAL; dropDefaultValue columnName=DIGITS, tableName=CREDENTIAL; dropDefaultValue columnName=PERIOD, tableName=CREDENTIAL; dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; dropColumn ...		\N	4.33.0	\N	\N	3329651799
8.0.0-resource-tag-support	keycloak	META-INF/jpa-changelog-8.0.0.xml	2026-03-12 15:34:23.386668	76	EXECUTED	9:91fa186ce7a5af127a2d7a91ee083cc5	addColumn tableName=MIGRATION_MODEL; createIndex indexName=IDX_UPDATE_TIME, tableName=MIGRATION_MODEL		\N	4.33.0	\N	\N	3329651799
9.0.0-always-display-client	keycloak	META-INF/jpa-changelog-9.0.0.xml	2026-03-12 15:34:23.390122	77	EXECUTED	9:6335e5c94e83a2639ccd68dd24e2e5ad	addColumn tableName=CLIENT		\N	4.33.0	\N	\N	3329651799
9.0.0-drop-constraints-for-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2026-03-12 15:34:23.391465	78	MARK_RAN	9:6bdb5658951e028bfe16fa0a8228b530	dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5PMT, tableName=RESOURCE_SERVER_PERM_TICKET; dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER_RESOURCE; dropPrimaryKey constraintName=CONSTRAINT_O...		\N	4.33.0	\N	\N	3329651799
9.0.0-increase-column-size-federated-fk	keycloak	META-INF/jpa-changelog-9.0.0.xml	2026-03-12 15:34:23.408879	79	EXECUTED	9:d5bc15a64117ccad481ce8792d4c608f	modifyDataType columnName=CLIENT_ID, tableName=FED_USER_CONSENT; modifyDataType columnName=CLIENT_REALM_CONSTRAINT, tableName=KEYCLOAK_ROLE; modifyDataType columnName=OWNER, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=CLIENT_ID, ta...		\N	4.33.0	\N	\N	3329651799
9.0.0-recreate-constraints-after-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2026-03-12 15:34:23.410755	80	MARK_RAN	9:077cba51999515f4d3e7ad5619ab592c	addNotNullConstraint columnName=CLIENT_ID, tableName=OFFLINE_CLIENT_SESSION; addNotNullConstraint columnName=OWNER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNullConstraint columnName=REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNull...		\N	4.33.0	\N	\N	3329651799
9.0.1-add-index-to-client.client_id	keycloak	META-INF/jpa-changelog-9.0.1.xml	2026-03-12 15:34:23.448041	81	EXECUTED	9:be969f08a163bf47c6b9e9ead8ac2afb	createIndex indexName=IDX_CLIENT_ID, tableName=CLIENT		\N	4.33.0	\N	\N	3329651799
9.0.1-KEYCLOAK-12579-drop-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2026-03-12 15:34:23.449997	82	MARK_RAN	9:6d3bb4408ba5a72f39bd8a0b301ec6e3	dropUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.33.0	\N	\N	3329651799
9.0.1-KEYCLOAK-12579-add-not-null-constraint	keycloak	META-INF/jpa-changelog-9.0.1.xml	2026-03-12 15:34:23.454988	83	EXECUTED	9:966bda61e46bebf3cc39518fbed52fa7	addNotNullConstraint columnName=PARENT_GROUP, tableName=KEYCLOAK_GROUP		\N	4.33.0	\N	\N	3329651799
9.0.1-KEYCLOAK-12579-recreate-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2026-03-12 15:34:23.45675	84	MARK_RAN	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.33.0	\N	\N	3329651799
9.0.1-add-index-to-events	keycloak	META-INF/jpa-changelog-9.0.1.xml	2026-03-12 15:34:23.502179	85	EXECUTED	9:7d93d602352a30c0c317e6a609b56599	createIndex indexName=IDX_EVENT_TIME, tableName=EVENT_ENTITY		\N	4.33.0	\N	\N	3329651799
map-remove-ri	keycloak	META-INF/jpa-changelog-11.0.0.xml	2026-03-12 15:34:23.507896	86	EXECUTED	9:71c5969e6cdd8d7b6f47cebc86d37627	dropForeignKeyConstraint baseTableName=REALM, constraintName=FK_TRAF444KK6QRKMS7N56AIWQ5Y; dropForeignKeyConstraint baseTableName=KEYCLOAK_ROLE, constraintName=FK_KJHO5LE2C0RAL09FL8CM9WFW9		\N	4.33.0	\N	\N	3329651799
map-remove-ri	keycloak	META-INF/jpa-changelog-12.0.0.xml	2026-03-12 15:34:23.516505	87	EXECUTED	9:a9ba7d47f065f041b7da856a81762021	dropForeignKeyConstraint baseTableName=REALM_DEFAULT_GROUPS, constraintName=FK_DEF_GROUPS_GROUP; dropForeignKeyConstraint baseTableName=REALM_DEFAULT_ROLES, constraintName=FK_H4WPD7W4HSOOLNI3H0SW7BTJE; dropForeignKeyConstraint baseTableName=CLIENT...		\N	4.33.0	\N	\N	3329651799
12.1.0-add-realm-localization-table	keycloak	META-INF/jpa-changelog-12.0.0.xml	2026-03-12 15:34:23.522529	88	EXECUTED	9:fffabce2bc01e1a8f5110d5278500065	createTable tableName=REALM_LOCALIZATIONS; addPrimaryKey tableName=REALM_LOCALIZATIONS		\N	4.33.0	\N	\N	3329651799
default-roles	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.528864	89	EXECUTED	9:fa8a5b5445e3857f4b010bafb5009957	addColumn tableName=REALM; customChange		\N	4.33.0	\N	\N	3329651799
default-roles-cleanup	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.535094	90	EXECUTED	9:67ac3241df9a8582d591c5ed87125f39	dropTable tableName=REALM_DEFAULT_ROLES; dropTable tableName=CLIENT_DEFAULT_ROLES		\N	4.33.0	\N	\N	3329651799
13.0.0-KEYCLOAK-16844	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.573451	91	EXECUTED	9:ad1194d66c937e3ffc82386c050ba089	createIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
map-remove-ri-13.0.0	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.580708	92	EXECUTED	9:d9be619d94af5a2f5d07b9f003543b91	dropForeignKeyConstraint baseTableName=DEFAULT_CLIENT_SCOPE, constraintName=FK_R_DEF_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SCOPE_CLIENT, constraintName=FK_C_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SC...		\N	4.33.0	\N	\N	3329651799
13.0.0-KEYCLOAK-17992-drop-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.582516	93	MARK_RAN	9:544d201116a0fcc5a5da0925fbbc3bde	dropPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CLSCOPE_CL, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CL_CLSCOPE, tableName=CLIENT_SCOPE_CLIENT		\N	4.33.0	\N	\N	3329651799
13.0.0-increase-column-size-federated	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.589429	94	EXECUTED	9:43c0c1055b6761b4b3e89de76d612ccf	modifyDataType columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; modifyDataType columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT		\N	4.33.0	\N	\N	3329651799
13.0.0-KEYCLOAK-17992-recreate-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.591472	95	MARK_RAN	9:8bd711fd0330f4fe980494ca43ab1139	addNotNullConstraint columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; addNotNullConstraint columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT; addPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; createIndex indexName=...		\N	4.33.0	\N	\N	3329651799
json-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-13.0.0.xml	2026-03-12 15:34:23.598537	96	EXECUTED	9:e07d2bc0970c348bb06fb63b1f82ddbf	addColumn tableName=REALM_ATTRIBUTE; update tableName=REALM_ATTRIBUTE; dropColumn columnName=VALUE, tableName=REALM_ATTRIBUTE; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=REALM_ATTRIBUTE		\N	4.33.0	\N	\N	3329651799
14.0.0-KEYCLOAK-11019	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.706932	97	EXECUTED	9:24fb8611e97f29989bea412aa38d12b7	createIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USER, tableName=OFFLINE_USER_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
14.0.0-KEYCLOAK-18286	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.708706	98	MARK_RAN	9:259f89014ce2506ee84740cbf7163aa7	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
14.0.0-KEYCLOAK-18286-revert	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.718665	99	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
14.0.0-KEYCLOAK-18286-supported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.760082	100	EXECUTED	9:60ca84a0f8c94ec8c3504a5a3bc88ee8	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
14.0.0-KEYCLOAK-18286-unsupported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.761992	101	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
KEYCLOAK-17267-add-index-to-user-attributes	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.818461	102	EXECUTED	9:0b305d8d1277f3a89a0a53a659ad274c	createIndex indexName=IDX_USER_ATTRIBUTE_NAME, tableName=USER_ATTRIBUTE		\N	4.33.0	\N	\N	3329651799
KEYCLOAK-18146-add-saml-art-binding-identifier	keycloak	META-INF/jpa-changelog-14.0.0.xml	2026-03-12 15:34:23.823279	103	EXECUTED	9:2c374ad2cdfe20e2905a84c8fac48460	customChange		\N	4.33.0	\N	\N	3329651799
15.0.0-KEYCLOAK-18467	keycloak	META-INF/jpa-changelog-15.0.0.xml	2026-03-12 15:34:23.829493	104	EXECUTED	9:47a760639ac597360a8219f5b768b4de	addColumn tableName=REALM_LOCALIZATIONS; update tableName=REALM_LOCALIZATIONS; dropColumn columnName=TEXTS, tableName=REALM_LOCALIZATIONS; renameColumn newColumnName=TEXTS, oldColumnName=TEXTS_NEW, tableName=REALM_LOCALIZATIONS; addNotNullConstrai...		\N	4.33.0	\N	\N	3329651799
17.0.0-9562	keycloak	META-INF/jpa-changelog-17.0.0.xml	2026-03-12 15:34:23.869262	105	EXECUTED	9:a6272f0576727dd8cad2522335f5d99e	createIndex indexName=IDX_USER_SERVICE_ACCOUNT, tableName=USER_ENTITY		\N	4.33.0	\N	\N	3329651799
18.0.0-10625-IDX_ADMIN_EVENT_TIME	keycloak	META-INF/jpa-changelog-18.0.0.xml	2026-03-12 15:34:23.908451	106	EXECUTED	9:015479dbd691d9cc8669282f4828c41d	createIndex indexName=IDX_ADMIN_EVENT_TIME, tableName=ADMIN_EVENT_ENTITY		\N	4.33.0	\N	\N	3329651799
18.0.15-30992-index-consent	keycloak	META-INF/jpa-changelog-18.0.15.xml	2026-03-12 15:34:23.954521	107	EXECUTED	9:80071ede7a05604b1f4906f3bf3b00f0	createIndex indexName=IDX_USCONSENT_SCOPE_ID, tableName=USER_CONSENT_CLIENT_SCOPE		\N	4.33.0	\N	\N	3329651799
19.0.0-10135	keycloak	META-INF/jpa-changelog-19.0.0.xml	2026-03-12 15:34:23.959081	108	EXECUTED	9:9518e495fdd22f78ad6425cc30630221	customChange		\N	4.33.0	\N	\N	3329651799
20.0.0-12964-supported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2026-03-12 15:34:24.000763	109	EXECUTED	9:e5f243877199fd96bcc842f27a1656ac	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.33.0	\N	\N	3329651799
20.0.0-12964-supported-dbs-edb-migration	keycloak	META-INF/jpa-changelog-20.0.0.xml	2026-03-12 15:34:24.044431	110	EXECUTED	9:a6b18a8e38062df5793edbe064f4aecd	dropIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE; createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.33.0	\N	\N	3329651799
20.0.0-12964-unsupported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2026-03-12 15:34:24.045869	111	MARK_RAN	9:1a6fcaa85e20bdeae0a9ce49b41946a5	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.33.0	\N	\N	3329651799
client-attributes-string-accomodation-fixed-pre-drop-index	keycloak	META-INF/jpa-changelog-20.0.0.xml	2026-03-12 15:34:24.04951	112	EXECUTED	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
client-attributes-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-20.0.0.xml	2026-03-12 15:34:24.054123	113	EXECUTED	9:3f332e13e90739ed0c35b0b25b7822ca	addColumn tableName=CLIENT_ATTRIBUTES; update tableName=CLIENT_ATTRIBUTES; dropColumn columnName=VALUE, tableName=CLIENT_ATTRIBUTES; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
client-attributes-string-accomodation-fixed-post-create-index	keycloak	META-INF/jpa-changelog-20.0.0.xml	2026-03-12 15:34:24.055792	114	MARK_RAN	9:bd2bd0fc7768cf0845ac96a8786fa735	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
21.0.2-17277	keycloak	META-INF/jpa-changelog-21.0.2.xml	2026-03-12 15:34:24.060366	115	EXECUTED	9:7ee1f7a3fb8f5588f171fb9a6ab623c0	customChange		\N	4.33.0	\N	\N	3329651799
21.1.0-19404	keycloak	META-INF/jpa-changelog-21.1.0.xml	2026-03-12 15:34:24.069449	116	EXECUTED	9:3d7e830b52f33676b9d64f7f2b2ea634	modifyDataType columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=LOGIC, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=POLICY_ENFORCE_MODE, tableName=RESOURCE_SERVER		\N	4.33.0	\N	\N	3329651799
21.1.0-19404-2	keycloak	META-INF/jpa-changelog-21.1.0.xml	2026-03-12 15:34:24.07217	117	MARK_RAN	9:627d032e3ef2c06c0e1f73d2ae25c26c	addColumn tableName=RESOURCE_SERVER_POLICY; update tableName=RESOURCE_SERVER_POLICY; dropColumn columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; renameColumn newColumnName=DECISION_STRATEGY, oldColumnName=DECISION_STRATEGY_NEW, tabl...		\N	4.33.0	\N	\N	3329651799
22.0.0-17484-updated	keycloak	META-INF/jpa-changelog-22.0.0.xml	2026-03-12 15:34:24.076993	118	EXECUTED	9:90af0bfd30cafc17b9f4d6eccd92b8b3	customChange		\N	4.33.0	\N	\N	3329651799
23.0.0-12062	keycloak	META-INF/jpa-changelog-23.0.0.xml	2026-03-12 15:34:24.083671	120	EXECUTED	9:2168fbe728fec46ae9baf15bf80927b8	addColumn tableName=COMPONENT_CONFIG; update tableName=COMPONENT_CONFIG; dropColumn columnName=VALUE, tableName=COMPONENT_CONFIG; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=COMPONENT_CONFIG		\N	4.33.0	\N	\N	3329651799
23.0.0-17258	keycloak	META-INF/jpa-changelog-23.0.0.xml	2026-03-12 15:34:24.086871	121	EXECUTED	9:36506d679a83bbfda85a27ea1864dca8	addColumn tableName=EVENT_ENTITY		\N	4.33.0	\N	\N	3329651799
24.0.0-9758	keycloak	META-INF/jpa-changelog-24.0.0.xml	2026-03-12 15:34:24.245986	122	EXECUTED	9:502c557a5189f600f0f445a9b49ebbce	addColumn tableName=USER_ATTRIBUTE; addColumn tableName=FED_USER_ATTRIBUTE; createIndex indexName=USER_ATTR_LONG_VALUES, tableName=USER_ATTRIBUTE; createIndex indexName=FED_USER_ATTR_LONG_VALUES, tableName=FED_USER_ATTRIBUTE; createIndex indexName...		\N	4.33.0	\N	\N	3329651799
24.0.0-9758-2	keycloak	META-INF/jpa-changelog-24.0.0.xml	2026-03-12 15:34:24.249946	123	EXECUTED	9:bf0fdee10afdf597a987adbf291db7b2	customChange		\N	4.33.0	\N	\N	3329651799
24.0.0-26618-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.0.xml	2026-03-12 15:34:24.255304	124	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
24.0.0-26618-reindex	keycloak	META-INF/jpa-changelog-24.0.0.xml	2026-03-12 15:34:24.293385	125	EXECUTED	9:08707c0f0db1cef6b352db03a60edc7f	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
24.0.0-26618-edb-migration	keycloak	META-INF/jpa-changelog-24.0.0.xml	2026-03-12 15:34:24.335859	126	EXECUTED	9:2f684b29d414cd47efe3a3599f390741	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES; createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
24.0.2-27228	keycloak	META-INF/jpa-changelog-24.0.2.xml	2026-03-12 15:34:24.340349	127	EXECUTED	9:eaee11f6b8aa25d2cc6a84fb86fc6238	customChange		\N	4.33.0	\N	\N	3329651799
24.0.2-27967-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.2.xml	2026-03-12 15:34:24.34195	128	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
24.0.2-27967-reindex	keycloak	META-INF/jpa-changelog-24.0.2.xml	2026-03-12 15:34:24.343963	129	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-tables	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.349012	130	EXECUTED	9:deda2df035df23388af95bbd36c17cef	addColumn tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_CLIENT_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.388659	131	EXECUTED	9:3e96709818458ae49f3c679ae58d263a	createIndex indexName=IDX_OFFLINE_USS_BY_LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-cleanup-uss-createdon	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.396165	132	EXECUTED	9:78ab4fc129ed5e8265dbcc3485fba92f	dropIndex indexName=IDX_OFFLINE_USS_CREATEDON, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-cleanup-uss-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.403337	133	EXECUTED	9:de5f7c1f7e10994ed8b62e621d20eaab	dropIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-cleanup-uss-by-usersess	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.411099	134	EXECUTED	9:6eee220d024e38e89c799417ec33667f	dropIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-cleanup-css-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.418641	135	EXECUTED	9:5411d2fb2891d3e8d63ddb55dfa3c0c9	dropIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-2-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.420283	136	MARK_RAN	9:b7ef76036d3126bb83c2423bf4d449d6	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-28265-index-2-not-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.463093	137	EXECUTED	9:23396cf51ab8bc1ae6f0cac7f9f6fcf7	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
25.0.0-org	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.472452	138	EXECUTED	9:5c859965c2c9b9c72136c360649af157	createTable tableName=ORG; addUniqueConstraint constraintName=UK_ORG_NAME, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_GROUP, tableName=ORG; createTable tableName=ORG_DOMAIN		\N	4.33.0	\N	\N	3329651799
unique-consentuser	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.480307	139	EXECUTED	9:5857626a2ea8767e9a6c66bf3a2cb32f	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.33.0	\N	\N	3329651799
unique-consentuser-edb-migration	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.487043	140	MARK_RAN	9:5857626a2ea8767e9a6c66bf3a2cb32f	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.33.0	\N	\N	3329651799
unique-consentuser-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.48926	141	MARK_RAN	9:b79478aad5adaa1bc428e31563f55e8e	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.33.0	\N	\N	3329651799
25.0.0-28861-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2026-03-12 15:34:24.582011	142	EXECUTED	9:b9acb58ac958d9ada0fe12a5d4794ab1	createIndex indexName=IDX_PERM_TICKET_REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; createIndex indexName=IDX_PERM_TICKET_OWNER, tableName=RESOURCE_SERVER_PERM_TICKET		\N	4.33.0	\N	\N	3329651799
26.0.0-org-alias	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.588164	143	EXECUTED	9:6ef7d63e4412b3c2d66ed179159886a4	addColumn tableName=ORG; update tableName=ORG; addNotNullConstraint columnName=ALIAS, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_ALIAS, tableName=ORG		\N	4.33.0	\N	\N	3329651799
26.0.0-org-group	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.596532	144	EXECUTED	9:da8e8087d80ef2ace4f89d8c5b9ca223	addColumn tableName=KEYCLOAK_GROUP; update tableName=KEYCLOAK_GROUP; addNotNullConstraint columnName=TYPE, tableName=KEYCLOAK_GROUP; customChange		\N	4.33.0	\N	\N	3329651799
26.0.0-org-indexes	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.642641	145	EXECUTED	9:79b05dcd610a8c7f25ec05135eec0857	createIndex indexName=IDX_ORG_DOMAIN_ORG_ID, tableName=ORG_DOMAIN		\N	4.33.0	\N	\N	3329651799
26.0.0-org-group-membership	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.648487	146	EXECUTED	9:a6ace2ce583a421d89b01ba2a28dc2d4	addColumn tableName=USER_GROUP_MEMBERSHIP; update tableName=USER_GROUP_MEMBERSHIP; addNotNullConstraint columnName=MEMBERSHIP_TYPE, tableName=USER_GROUP_MEMBERSHIP		\N	4.33.0	\N	\N	3329651799
31296-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.654246	147	EXECUTED	9:64ef94489d42a358e8304b0e245f0ed4	createTable tableName=REVOKED_TOKEN; addPrimaryKey constraintName=CONSTRAINT_RT, tableName=REVOKED_TOKEN		\N	4.33.0	\N	\N	3329651799
31725-index-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.704883	148	EXECUTED	9:b994246ec2bf7c94da881e1d28782c7b	createIndex indexName=IDX_REV_TOKEN_ON_EXPIRE, tableName=REVOKED_TOKEN		\N	4.33.0	\N	\N	3329651799
26.0.0-idps-for-login	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.779182	149	EXECUTED	9:51f5fffadf986983d4bd59582c6c1604	addColumn tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_REALM_ORG, tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_FOR_LOGIN, tableName=IDENTITY_PROVIDER; customChange		\N	4.33.0	\N	\N	3329651799
26.0.0-32583-drop-redundant-index-on-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.785891	150	EXECUTED	9:24972d83bf27317a055d234187bb4af9	dropIndex indexName=IDX_US_SESS_ID_ON_CL_SESS, tableName=OFFLINE_CLIENT_SESSION		\N	4.33.0	\N	\N	3329651799
26.0.0.32582-remove-tables-user-session-user-session-note-and-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.798132	151	EXECUTED	9:febdc0f47f2ed241c59e60f58c3ceea5	dropTable tableName=CLIENT_SESSION_ROLE; dropTable tableName=CLIENT_SESSION_NOTE; dropTable tableName=CLIENT_SESSION_PROT_MAPPER; dropTable tableName=CLIENT_SESSION_AUTH_STATUS; dropTable tableName=CLIENT_USER_SESSION_NOTE; dropTable tableName=CLI...		\N	4.33.0	\N	\N	3329651799
26.0.0-33201-org-redirect-url	keycloak	META-INF/jpa-changelog-26.0.0.xml	2026-03-12 15:34:24.801731	152	EXECUTED	9:4d0e22b0ac68ebe9794fa9cb752ea660	addColumn tableName=ORG		\N	4.33.0	\N	\N	3329651799
29399-jdbc-ping-default	keycloak	META-INF/jpa-changelog-26.1.0.xml	2026-03-12 15:34:24.807372	153	EXECUTED	9:007dbe99d7203fca403b89d4edfdf21e	createTable tableName=JGROUPS_PING; addPrimaryKey constraintName=CONSTRAINT_JGROUPS_PING, tableName=JGROUPS_PING		\N	4.33.0	\N	\N	3329651799
26.1.0-34013	keycloak	META-INF/jpa-changelog-26.1.0.xml	2026-03-12 15:34:24.812485	154	EXECUTED	9:e6b686a15759aef99a6d758a5c4c6a26	addColumn tableName=ADMIN_EVENT_ENTITY		\N	4.33.0	\N	\N	3329651799
26.1.0-34380	keycloak	META-INF/jpa-changelog-26.1.0.xml	2026-03-12 15:34:24.816251	155	EXECUTED	9:ac8b9edb7c2b6c17a1c7a11fcf5ccf01	dropTable tableName=USERNAME_LOGIN_FAILURE		\N	4.33.0	\N	\N	3329651799
26.2.0-36750	keycloak	META-INF/jpa-changelog-26.2.0.xml	2026-03-12 15:34:24.821166	156	EXECUTED	9:b49ce951c22f7eb16480ff085640a33a	createTable tableName=SERVER_CONFIG		\N	4.33.0	\N	\N	3329651799
26.2.0-26106	keycloak	META-INF/jpa-changelog-26.2.0.xml	2026-03-12 15:34:24.824915	157	EXECUTED	9:b5877d5dab7d10ff3a9d209d7beb6680	addColumn tableName=CREDENTIAL		\N	4.33.0	\N	\N	3329651799
26.2.6-39866-duplicate	keycloak	META-INF/jpa-changelog-26.2.6.xml	2026-03-12 15:34:24.829221	158	EXECUTED	9:1dc67ccee24f30331db2cba4f372e40e	customChange		\N	4.33.0	\N	\N	3329651799
26.2.6-39866-uk	keycloak	META-INF/jpa-changelog-26.2.6.xml	2026-03-12 15:34:24.832752	159	EXECUTED	9:b70b76f47210cf0a5f4ef0e219eac7cd	addUniqueConstraint constraintName=UK_MIGRATION_VERSION, tableName=MIGRATION_MODEL		\N	4.33.0	\N	\N	3329651799
26.2.6-40088-duplicate	keycloak	META-INF/jpa-changelog-26.2.6.xml	2026-03-12 15:34:24.836957	160	EXECUTED	9:cc7e02ed69ab31979afb1982f9670e8f	customChange		\N	4.33.0	\N	\N	3329651799
26.2.6-40088-uk	keycloak	META-INF/jpa-changelog-26.2.6.xml	2026-03-12 15:34:24.840546	161	EXECUTED	9:5bb848128da7bc4595cc507383325241	addUniqueConstraint constraintName=UK_MIGRATION_UPDATE_TIME, tableName=MIGRATION_MODEL		\N	4.33.0	\N	\N	3329651799
26.3.0-groups-description	keycloak	META-INF/jpa-changelog-26.3.0.xml	2026-03-12 15:34:24.84434	162	EXECUTED	9:e1a3c05574326fb5b246b73b9a4c4d49	addColumn tableName=KEYCLOAK_GROUP		\N	4.33.0	\N	\N	3329651799
26.4.0-40933-saml-encryption-attributes	keycloak	META-INF/jpa-changelog-26.4.0.xml	2026-03-12 15:34:24.848307	163	EXECUTED	9:7e9eaba362ca105efdda202303a4fe49	customChange		\N	4.33.0	\N	\N	3329651799
26.4.0-51321	keycloak	META-INF/jpa-changelog-26.4.0.xml	2026-03-12 15:34:24.884515	164	EXECUTED	9:34bab2bc56f75ffd7e347c580874e306	createIndex indexName=IDX_EVENT_ENTITY_USER_ID_TYPE, tableName=EVENT_ENTITY		\N	4.33.0	\N	\N	3329651799
40343-workflow-state-table	keycloak	META-INF/jpa-changelog-26.4.0.xml	2026-03-12 15:34:24.960202	165	EXECUTED	9:ed3ab4723ceed210e5b5e60ac4562106	createTable tableName=WORKFLOW_STATE; addPrimaryKey constraintName=PK_WORKFLOW_STATE, tableName=WORKFLOW_STATE; addUniqueConstraint constraintName=UQ_WORKFLOW_RESOURCE, tableName=WORKFLOW_STATE; createIndex indexName=IDX_WORKFLOW_STATE_STEP, table...		\N	4.33.0	\N	\N	3329651799
26.5.0-index-offline-css-by-client	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:24.999315	166	EXECUTED	9:383e981ce95d16e32af757b7998820f7	createIndex indexName=IDX_OFFLINE_CSS_BY_CLIENT, tableName=OFFLINE_CLIENT_SESSION		\N	4.33.0	\N	\N	3329651799
26.5.0-index-offline-css-by-client-storage-provider	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.038551	167	EXECUTED	9:f5bc200e6fa7d7e483854dee535ca425	createIndex indexName=IDX_OFFLINE_CSS_BY_CLIENT_STORAGE_PROVIDER, tableName=OFFLINE_CLIENT_SESSION		\N	4.33.0	\N	\N	3329651799
26.5.0-idp-config-allow-null-fixed-drop-mssql-index	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.040189	168	MARK_RAN	9:50c51d2c98cd1d624eb1c485c3cf1f75	dropIndex indexName=IDX_IDP_FOR_LOGIN, tableName=IDENTITY_PROVIDER		\N	4.33.0	\N	\N	3329651799
26.5.0-idp-config-allow-null	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.049583	169	EXECUTED	9:b667fb087874303b324c1af7fae4f606	dropDefaultValue columnName=TRUST_EMAIL, tableName=IDENTITY_PROVIDER; dropNotNullConstraint columnName=TRUST_EMAIL, tableName=IDENTITY_PROVIDER; dropNotNullConstraint columnName=STORE_TOKEN, tableName=IDENTITY_PROVIDER; dropDefaultValue columnName...		\N	4.33.0	\N	\N	3329651799
26.5.0-idp-config-allow-null-fixed-create-mssql-index	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.051295	170	MARK_RAN	9:dcbbb24c151c3b0b59f12fede23cc94d	createIndex indexName=IDX_IDP_FOR_LOGIN, tableName=IDENTITY_PROVIDER		\N	4.33.0	\N	\N	3329651799
26.5.0-remove-workflow-provider-id-column	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.096116	171	EXECUTED	9:d8eeb324484d45e946d03b953e168b21	dropIndex indexName=IDX_WORKFLOW_STATE_PROVIDER, tableName=WORKFLOW_STATE; createIndex indexName=IDX_WORKFLOW_STATE_PROVIDER, tableName=WORKFLOW_STATE; dropColumn columnName=WORKFLOW_PROVIDER_ID, tableName=WORKFLOW_STATE		\N	4.33.0	\N	\N	3329651799
26.5.0-add-remember-me	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.101269	172	EXECUTED	9:a7273ea8b21bd2f674c9c49141999f05	addColumn tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
26.5.0-add-sess-refresh-idx	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.150202	173	EXECUTED	9:ce49383d317ccbcd3434d1f21172b0b7	createIndex indexName=IDX_USER_SESSION_EXPIRATION_CREATED, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
26.5.0-add-sess-create-idx	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.198475	174	EXECUTED	9:aaee09e23a4d8468fbc5c51b7b314c58	createIndex indexName=IDX_USER_SESSION_EXPIRATION_LAST_REFRESH, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
26.5.0-drop-sess-refresh-idx	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.205706	175	EXECUTED	9:f0082210b6ccbbaf81287c27aa23753c	dropIndex indexName=IDX_OFFLINE_USS_BY_LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION		\N	4.33.0	\N	\N	3329651799
26.5.0-mysql-mariadb-default-charset-collation	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.20742	176	MARK_RAN	9:1b383fa60d2db0a8952b365e725f9d16	customChange		\N	4.33.0	\N	\N	3329651799
26.5.0-invitations-table-fixed2	keycloak	META-INF/jpa-changelog-26.5.0.xml	2026-03-12 15:34:25.377092	177	EXECUTED	9:322cb11fc03181903dcd67a54f8b3cf0	createTable tableName=ORG_INVITATION; addForeignKeyConstraint baseTableName=ORG_INVITATION, constraintName=FK_ORG_INVITATION_ORG, referencedTableName=ORG; createIndex indexName=IDX_ORG_INVITATION_ORG_ID, tableName=ORG_INVITATION; createIndex index...		\N	4.33.0	\N	\N	3329651799
26.6.0-45009-broker-link-user-id	keycloak	META-INF/jpa-changelog-26.6.0.xml	2026-03-12 15:34:25.428477	178	EXECUTED	9:05026bbbc8d2ead5afcbda2f5fdf3a2b	createIndex indexName=IDX_BROKER_LINK_USER_ID, tableName=BROKER_LINK		\N	4.33.0	\N	\N	3329651799
26.6.0-45009-broker-link-identity-provider	keycloak	META-INF/jpa-changelog-26.6.0.xml	2026-03-12 15:34:25.477956	179	EXECUTED	9:7d9a0253c9de7be754efef8bba4265bd	createIndex indexName=IDX_BROKER_LINK_IDENTITY_PROVIDER, tableName=BROKER_LINK		\N	4.33.0	\N	\N	3329651799
\.


--
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
1000	f	\N	\N
\.


--
-- Data for Name: default_client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.default_client_scope (realm_id, scope_id, default_scope) FROM stdin;
c36b20d9-63c7-4267-aa45-992c63e9c0a6	8a87288a-46ac-4db3-acab-d08dfa807ae9	f
c36b20d9-63c7-4267-aa45-992c63e9c0a6	92d651e9-4c16-4aa8-8104-061d4f65d57d	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	c57d6fa8-dd70-4898-9423-afb17d0abc30	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	12e7c989-ebc0-4114-91e7-4134a85f0028	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	a92043fa-6a69-49a2-84ad-c14448033a0c	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	53f56bbf-92c4-4762-ae7c-fdd8b7688807	f
c36b20d9-63c7-4267-aa45-992c63e9c0a6	df758642-bf58-4c26-8e11-cdb7a82b2303	f
c36b20d9-63c7-4267-aa45-992c63e9c0a6	929366d0-3eaf-4fd9-aed0-70a816c9acaf	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	31620d24-3d89-431e-b104-c91c7857187e	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	6344d328-3260-448d-b931-5d61753c6b3d	f
c36b20d9-63c7-4267-aa45-992c63e9c0a6	64b387b3-cda4-4072-bbbc-8052ea3587b6	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	152544c4-2aee-482d-a919-3ea25f49592c	t
c36b20d9-63c7-4267-aa45-992c63e9c0a6	343e4222-ad85-4ffe-ae3f-f805771d6fcb	f
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	757089bf-6ff9-4a74-a6c1-c21120f30fd7	f
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f075a5d6-6cc0-4037-8176-67d9f3be42af	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f07f3379-bde4-4a6d-9f80-866e6707c8ac	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	3a28625e-3dff-4d39-a598-f99bcee55b45	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	6142e0a0-ce00-4176-bce0-347293ed9d90	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	b60a824d-1e49-4c4e-8cea-214f66a63360	f
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f153873d-149d-43ea-932b-faa83d98911c	f
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	54c480b3-2980-4e48-bb98-53541e732b4f	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	5df0996c-88a8-489f-9c87-51d08f44d26f	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4	f
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	c81bcae5-3d08-4400-9a2c-49f1396c53c7	t
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc	f
\.


--
-- Data for Name: event_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_entity (id, client_id, details_json, error, ip_address, realm_id, session_id, event_time, type, user_id, details_json_long_value) FROM stdin;
\.


--
-- Data for Name: fed_user_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_attribute (id, name, user_id, realm_id, storage_provider_id, value, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
\.


--
-- Data for Name: fed_user_consent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_consent (id, client_id, user_id, realm_id, storage_provider_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- Data for Name: fed_user_consent_cl_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_consent_cl_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- Data for Name: fed_user_credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_credential (id, salt, type, created_date, user_id, realm_id, storage_provider_id, user_label, secret_data, credential_data, priority) FROM stdin;
\.


--
-- Data for Name: fed_user_group_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_group_membership (group_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- Data for Name: fed_user_required_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_required_action (required_action, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- Data for Name: fed_user_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fed_user_role_mapping (role_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- Data for Name: federated_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_identity (identity_provider, realm_id, federated_user_id, federated_username, token, user_id) FROM stdin;
\.


--
-- Data for Name: federated_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_user (id, storage_provider_id, realm_id) FROM stdin;
\.


--
-- Data for Name: group_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_attribute (id, name, value, group_id) FROM stdin;
\.


--
-- Data for Name: group_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_role_mapping (role_id, group_id) FROM stdin;
\.


--
-- Data for Name: identity_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider (internal_id, enabled, provider_alias, provider_id, store_token, authenticate_by_default, realm_id, add_token_role, trust_email, first_broker_login_flow_id, post_broker_login_flow_id, provider_display_name, link_only, organization_id, hide_on_login) FROM stdin;
\.


--
-- Data for Name: identity_provider_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider_config (identity_provider_id, value, name) FROM stdin;
\.


--
-- Data for Name: identity_provider_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identity_provider_mapper (id, name, idp_alias, idp_mapper_name, realm_id) FROM stdin;
\.


--
-- Data for Name: idp_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.idp_mapper_config (idp_mapper_id, value, name) FROM stdin;
\.


--
-- Data for Name: jgroups_ping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jgroups_ping (address, name, cluster_name, ip, coord) FROM stdin;
\.


--
-- Data for Name: keycloak_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keycloak_group (id, name, parent_group, realm_id, type, description) FROM stdin;
\.


--
-- Data for Name: keycloak_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keycloak_role (id, client_realm_constraint, client_role, description, name, realm_id, client, realm) FROM stdin;
e2a1fb6d-4257-4c9b-b108-7eacc839df2b	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	${role_default-roles}	default-roles-master	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	\N
985a22a7-c7b1-4344-9841-9a8d1365bbf0	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	${role_create-realm}	create-realm	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	\N
f569cd43-b362-406c-aff0-f1232d37312a	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	${role_admin}	admin	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	\N
ed986c89-6d27-46cd-9b69-6f7835bd40df	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_create-client}	create-client	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
b0819daa-5eb2-4c64-9ceb-800edd2fab10	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_view-realm}	view-realm	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
06a9e887-3ba2-407c-baae-d3d025aa16c3	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_view-users}	view-users	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
91297db0-8173-480c-b1aa-4150f1c2ca6d	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_view-clients}	view-clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
9d4e8d8f-f9a5-41a0-81ab-066e7e45e437	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_view-events}	view-events	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
47b32038-0d2a-4c97-9b49-f43a8d613b80	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_view-identity-providers}	view-identity-providers	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
d1d03f0e-2878-40c1-a168-3e6e15485bbc	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_view-authorization}	view-authorization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
a4d06b16-c038-4f38-bd68-5f9eea53ffd9	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_manage-realm}	manage-realm	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
ca1b165e-6006-4664-ac48-760a2aa731b9	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_manage-users}	manage-users	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
5fa34aca-f86d-4bae-9cd3-0ecffe9b3097	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_manage-clients}	manage-clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
b0d395d1-4ba6-4807-838b-9e429dc19a0d	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_manage-events}	manage-events	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
125b1a5a-6d5e-401a-a213-b00694b75894	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_manage-identity-providers}	manage-identity-providers	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
2be3b142-2b28-4892-91b9-1e53a0e749d3	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_manage-authorization}	manage-authorization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
501ed480-8bfa-46e0-9132-36bc92ec99b0	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_query-users}	query-users	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
468f4e60-3db0-47c4-8fd5-5c6460785551	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_query-clients}	query-clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
fe5ccb27-8c8c-4ec3-b2e4-3559503ea2ac	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_query-realms}	query-realms	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
b23a8048-e55f-4e33-ab45-f64f4edd7ae9	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_query-groups}	query-groups	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
0b0b490e-f20b-45db-a42a-91a0fd491a50	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_view-profile}	view-profile	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
fa441f8c-f42c-4f4e-a79c-e819d5583a5e	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_manage-account}	manage-account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
f286a642-e77b-40d5-bd7e-aced48c410b7	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_manage-account-links}	manage-account-links	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
a8a2f9c0-e48f-46f5-8200-85638b2142d6	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_view-applications}	view-applications	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
79cf03d8-3c9d-46c6-af7f-ef813c72c092	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_view-consent}	view-consent	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
f0c2e9a2-ebbb-4e61-b61d-73e5106003ee	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_manage-consent}	manage-consent	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
f22f73de-5497-469b-9294-4d23d06f68cf	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_view-groups}	view-groups	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
edbaa499-2d27-485c-948b-44a3c12540d0	1393c0d6-0918-4536-ab43-1121b68f9e00	t	${role_delete-account}	delete-account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1393c0d6-0918-4536-ab43-1121b68f9e00	\N
5008fbaf-fc91-49a5-b2b1-0fcc9cf75f55	e5570e91-3ab7-407b-8dc5-f62d162eaf0b	t	${role_read-token}	read-token	c36b20d9-63c7-4267-aa45-992c63e9c0a6	e5570e91-3ab7-407b-8dc5-f62d162eaf0b	\N
7d75f303-347e-4b7c-9113-d1f64d304f6e	42b87bb7-c41e-469d-838a-cfa73620dcec	t	${role_impersonation}	impersonation	c36b20d9-63c7-4267-aa45-992c63e9c0a6	42b87bb7-c41e-469d-838a-cfa73620dcec	\N
94d7a71c-3edf-4306-b3ce-c0255b61a8e5	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	${role_offline-access}	offline_access	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	\N
a7f90d51-eacd-48e9-b55f-65c3854c1b46	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	${role_uma_authorization}	uma_authorization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	\N	\N
ab382691-2d6a-482e-9b2c-f708314a9787	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_view-authorization}	view-authorization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
b3a91663-47ed-4aa8-913f-f229b8e41cae	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_manage-realm}	manage-realm	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
05088128-795b-4bc1-bce0-31bdac35dce1	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_manage-users}	manage-users	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
384d36cd-2c9d-48eb-81a5-15db45918d02	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_manage-clients}	manage-clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
6427a28f-0846-489a-9b61-1a00f3e70cad	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_manage-events}	manage-events	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
6c78780b-d6ef-4dff-ba92-fd6848cd831f	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_manage-identity-providers}	manage-identity-providers	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
0726d1b2-cfe0-44bf-ac57-e3862527d557	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_manage-authorization}	manage-authorization	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
9e6b1128-6d5b-4106-936d-f1c6519eb121	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_query-users}	query-users	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
78542b0d-41a3-4d50-9ef0-a550cc52771d	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_query-clients}	query-clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
cc18f194-5ba2-42f3-b648-0f87e18af2cf	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f	${role_default-roles}	default-roles-ash	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N	\N
1ffe82f2-f8cf-4667-822c-a01837efb2ac	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_create-client}	create-client	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
5d7afb49-f9c3-4e31-ae68-8fe57ee674d3	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_view-realm}	view-realm	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
3e013eee-1cde-4de4-8cdb-569dcdb1c1af	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_view-users}	view-users	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
8f621387-1cf1-4222-b500-04100ebdc015	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_view-clients}	view-clients	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
7b0b5323-e68a-413e-9431-9af75cd612a0	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_view-events}	view-events	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
14270bc3-e755-4809-9209-a5da2ba994cc	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_view-identity-providers}	view-identity-providers	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
eef4cb44-63f4-42c7-982a-1e727b24fae8	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_query-realms}	query-realms	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
fec5b18c-aa8a-4d5f-b586-e75124d68e55	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_query-groups}	query-groups	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
9338202c-5461-4446-a311-447e269b81e2	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_realm-admin}	realm-admin	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
9431d646-de22-47dc-a2a3-155ee5f139f1	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_create-client}	create-client	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
33be7424-ae4c-4dfb-88fd-83274224f5ce	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_view-realm}	view-realm	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
b64fd68f-e9bc-4d16-b2bd-824e33382567	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_view-users}	view-users	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
3fe13273-a22b-44a6-965c-89dadd2bfce6	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_view-clients}	view-clients	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
8fa0134d-39b2-4891-a3cd-bcf5b3a34518	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_view-events}	view-events	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
bb1e89bb-92ca-472f-8705-d78418b3c497	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_view-identity-providers}	view-identity-providers	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
8153f918-ff4e-4558-baff-f250727d0383	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_view-authorization}	view-authorization	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
b87ee67f-bfcc-4891-be74-b34bd0856772	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_manage-realm}	manage-realm	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
2723ee00-ea0a-4784-9b7a-87a86981e89d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_manage-users}	manage-users	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
42bb5eda-3efe-46cd-a046-fba57a46974f	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_manage-clients}	manage-clients	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
c8f062f8-ae2d-4473-8512-8792534050ba	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_manage-events}	manage-events	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
d2c22ff3-3628-4988-8bd9-44dfa23319e4	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_manage-identity-providers}	manage-identity-providers	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
69e4a620-9df1-464b-9970-5e971a2df399	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_manage-authorization}	manage-authorization	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
0e0f854a-1910-4b49-9b11-eff371de16e2	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_query-users}	query-users	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
2fca4e30-0866-482f-80d2-0c3143ce7e82	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_query-clients}	query-clients	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
85e2b296-fb64-4db2-8641-6e3925ad682a	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_query-realms}	query-realms	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
61833ac2-eea4-4997-852c-bc90ffa3ad2c	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_query-groups}	query-groups	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
4f998070-c0f8-423b-9914-e795012eaec6	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_view-profile}	view-profile	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
73da43a9-9874-4864-97fc-1baae1fc6df4	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_manage-account}	manage-account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
c07c9573-e6a4-4b24-9131-fdfee8181c4b	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_manage-account-links}	manage-account-links	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
e3a8e3f2-fbdf-433c-946b-0405b23e4a01	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_view-applications}	view-applications	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
068f4c42-043b-401e-b22f-58f0b8cd2712	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_view-consent}	view-consent	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
c32d3ffe-95a1-474c-9d16-e959d10156c3	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_manage-consent}	manage-consent	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
0b841103-371c-4673-83ac-81a0c6e75645	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_view-groups}	view-groups	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
5d1edb9c-d603-4d9f-b427-073eef03562d	00313095-7e92-4f2a-afec-9a93400821fc	t	${role_delete-account}	delete-account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	00313095-7e92-4f2a-afec-9a93400821fc	\N
40631f1e-0abd-49ad-8a2f-fb15143a9ca2	4cb807b4-7184-40d1-baf7-c07389d31937	t	${role_impersonation}	impersonation	c36b20d9-63c7-4267-aa45-992c63e9c0a6	4cb807b4-7184-40d1-baf7-c07389d31937	\N
f0fc4195-0391-4cdc-8c56-cd605be7aad3	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	t	${role_impersonation}	impersonation	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	2393cb2a-e46a-4fc0-89b9-f01a80548e7e	\N
ac6e7686-74e8-4e73-aaad-7242548e2a89	cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	t	${role_read-token}	read-token	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	cab3bb8a-b447-47c9-ae83-ed81cc20bf0f	\N
77a9032f-e51b-4ff9-ae56-b3dbcb343782	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f	${role_offline-access}	offline_access	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N	\N
daf04d94-4e86-4db9-ab20-cdac39e2fd79	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f	${role_uma_authorization}	uma_authorization	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	\N	\N
\.


--
-- Data for Name: migration_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migration_model (id, version, update_time) FROM stdin;
sys9f	26.5.4	1773329669
\.


--
-- Data for Name: offline_client_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_client_session (user_session_id, client_id, offline_flag, "timestamp", data, client_storage_provider, external_client_id, version) FROM stdin;
xHpvoXAhE_NxdrlI3Nav1HhB	1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	0	1776771666	{"authMethod":"openid-connect","redirectUri":"http://localhost:3001/dashboard","notes":{"clientId":"1bc6c6a0-5b07-44e2-80e9-da1180bdb98c","iss":"http://localhost:8080/realms/ash","startedAt":"1776760123","response_type":"code","level-of-authentication":"-1","code_challenge_method":"S256","nonce":"cd30e731-45a1-4c62-b635-50d59d7845b7","response_mode":"fragment","scope":"openid","userSessionStartedAt":"1776760123","redirect_uri":"http://localhost:3001/dashboard","state":"fb8ea0cb-eb3f-41d4-9c98-53bff615b72d","code_challenge":"KW_D2BIn4K1l_t8GWGhw5X81hJ6a0PDQoQIbh2CvXqk"}}	local	local	49
\.


--
-- Data for Name: offline_user_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offline_user_session (user_session_id, user_id, realm_id, created_on, offline_flag, data, last_session_refresh, broker_session_id, version, remember_me) FROM stdin;
xHpvoXAhE_NxdrlI3Nav1HhB	b4ba82f3-989d-40f0-8045-227c3a1dab51	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	1776760123	0	{"ipAddress":"172.17.0.1","authMethod":"openid-connect","rememberMe":false,"started":0,"notes":{"KC_DEVICE_NOTE":"eyJpcEFkZHJlc3MiOiIxNzIuMTcuMC4xIiwib3MiOiJVYnVudHUiLCJvc1ZlcnNpb24iOiJVbmtub3duIiwiYnJvd3NlciI6IkZpcmVmb3gvMTQ5LjAiLCJkZXZpY2UiOiJPdGhlciIsImxhc3RBY2Nlc3MiOjAsIm1vYmlsZSI6ZmFsc2V9","AUTH_TIME":"1776760123","authenticators-completed":"{\\"ba40fd65-3d97-4d52-bc4c-9351f26466a6\\":1776760123}"},"state":"LOGGED_IN"}	1776771666	\N	49	f
\.


--
-- Data for Name: org; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org (id, enabled, realm_id, group_id, name, description, alias, redirect_url) FROM stdin;
\.


--
-- Data for Name: org_domain; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_domain (id, name, verified, org_id) FROM stdin;
\.


--
-- Data for Name: org_invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_invitation (id, organization_id, email, first_name, last_name, created_at, expires_at, invite_link) FROM stdin;
\.


--
-- Data for Name: policy_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policy_config (policy_id, name, value) FROM stdin;
\.


--
-- Data for Name: protocol_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol_mapper (id, name, protocol, protocol_mapper_name, client_id, client_scope_id) FROM stdin;
e3be3117-0410-4854-bb5e-c0bc0eaf65bf	audience resolve	openid-connect	oidc-audience-resolve-mapper	a763a786-5146-4758-adcb-cabc363165c2	\N
e323a631-706c-4583-9453-5a1985dcb29b	locale	openid-connect	oidc-usermodel-attribute-mapper	e7b0ac03-2637-4526-94a8-17db9adc54b8	\N
9a87ff38-e8ef-4d42-b4d5-1747f28efdcb	role list	saml	saml-role-list-mapper	\N	92d651e9-4c16-4aa8-8104-061d4f65d57d
3f99dade-596c-4bc0-b695-0cd2b551094c	organization	saml	saml-organization-membership-mapper	\N	c57d6fa8-dd70-4898-9423-afb17d0abc30
c9130f74-449b-47aa-b0f6-f5f4e1eee8ac	full name	openid-connect	oidc-full-name-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
25c17384-cc44-49c4-a5b7-f28d7d0b2620	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
2f23569a-2fae-4779-8ed6-dcfe438d6e43	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
467ff733-f7af-4c16-9846-6fda7a498e9e	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
515e9cf4-f90e-46ba-805d-9ae62efbce98	username	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
95d7ed7a-7163-4c9d-9b36-088b823d5473	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
e918b04a-fc98-4682-b7cd-b570b1e52227	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
c9078ba0-c556-4a90-b053-475b9f543bcc	website	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
a0f06b38-2d10-47b8-a3b9-3331b413b460	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
a998dcdb-0353-4489-b2aa-2815035aa6a0	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
511ea50e-b9c4-4480-abf8-8949c97a2eb3	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	12e7c989-ebc0-4114-91e7-4134a85f0028
de88e0a3-d51e-4145-b836-8e40420d455a	email	openid-connect	oidc-usermodel-attribute-mapper	\N	a92043fa-6a69-49a2-84ad-c14448033a0c
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	email verified	openid-connect	oidc-usermodel-property-mapper	\N	a92043fa-6a69-49a2-84ad-c14448033a0c
88541c1e-7638-4204-af7a-52e05bde2042	address	openid-connect	oidc-address-mapper	\N	53f56bbf-92c4-4762-ae7c-fdd8b7688807
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	df758642-bf58-4c26-8e11-cdb7a82b2303
224716d4-3a22-4419-958d-9a4d37a8aaec	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	df758642-bf58-4c26-8e11-cdb7a82b2303
66cb0d3c-3709-4618-ae80-824efcc82283	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	929366d0-3eaf-4fd9-aed0-70a816c9acaf
4f664521-aa50-45e0-bd55-b25d4fc82a79	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	929366d0-3eaf-4fd9-aed0-70a816c9acaf
5b743059-e733-45b7-8eb3-78c3650c3e5e	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	929366d0-3eaf-4fd9-aed0-70a816c9acaf
a62a2849-086c-4d2a-b363-e471aaf06194	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	31620d24-3d89-431e-b104-c91c7857187e
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	6344d328-3260-448d-b931-5d61753c6b3d
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	6344d328-3260-448d-b931-5d61753c6b3d
3bf27de1-d1f7-45c2-955d-d990cc25d8bc	acr loa level	openid-connect	oidc-acr-mapper	\N	64b387b3-cda4-4072-bbbc-8052ea3587b6
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	152544c4-2aee-482d-a919-3ea25f49592c
18665e58-bc32-4daf-bc0e-12e4629a1082	sub	openid-connect	oidc-sub-mapper	\N	152544c4-2aee-482d-a919-3ea25f49592c
7aca2732-5cd0-4768-8348-5775be3d0a61	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	\N	719f3559-5c80-4e82-a72e-1d2231a53f6f
50a20746-46cc-4360-874c-9a11054a79af	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	\N	719f3559-5c80-4e82-a72e-1d2231a53f6f
643a0d9b-e7d7-406c-a716-e9f222f54b42	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	\N	719f3559-5c80-4e82-a72e-1d2231a53f6f
d815c49b-9043-4429-b7c4-b8855add07ff	organization	openid-connect	oidc-organization-membership-mapper	\N	343e4222-ad85-4ffe-ae3f-f805771d6fcb
c39d65f8-8c12-4106-8501-8e1cbe371592	audience resolve	openid-connect	oidc-audience-resolve-mapper	3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	\N
417e5b1e-3f18-45ff-acee-56d9b4c987e9	role list	saml	saml-role-list-mapper	\N	f075a5d6-6cc0-4037-8176-67d9f3be42af
4c4a0e08-d410-40d6-b0c7-ed8163464980	organization	saml	saml-organization-membership-mapper	\N	f07f3379-bde4-4a6d-9f80-866e6707c8ac
311a3a78-354b-4223-9ea6-235e5a199795	full name	openid-connect	oidc-full-name-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
2e029f7e-221a-402b-b973-b9e0637e57ae	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
93796863-89d3-4c57-be51-fdaff77603fb	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
9c90b90c-1513-45ad-83fb-d9d081c21e46	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
cbacd455-6dd3-4067-aafb-d6d99357a99c	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
ca088261-004f-48ba-9666-55679c289a58	username	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
2a064d6f-3ab3-4789-8794-a7cce477f67c	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
7a977e14-4da0-4556-ba36-b02322507d82	website	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
68257fd1-e5fd-4aa2-a819-e80402af5e10	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
8f5b2e18-550d-4bc4-b440-32b01ea58f08	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
dc683e1d-27e8-4215-88e1-4122f18bceaa	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	3a28625e-3dff-4d39-a598-f99bcee55b45
9e1f8e11-7cef-4870-9ca3-42acd387772a	email	openid-connect	oidc-usermodel-attribute-mapper	\N	6142e0a0-ce00-4176-bce0-347293ed9d90
4a484b5a-0b24-4ae3-b408-6a55fa33172f	email verified	openid-connect	oidc-usermodel-property-mapper	\N	6142e0a0-ce00-4176-bce0-347293ed9d90
66a6a090-5b3d-4212-bfa0-bb6241068249	address	openid-connect	oidc-address-mapper	\N	b60a824d-1e49-4c4e-8cea-214f66a63360
669ab072-c627-46fa-a10b-894631a1146f	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	f153873d-149d-43ea-932b-faa83d98911c
717ef61f-2535-4dd1-9d23-71c32f472e75	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	f153873d-149d-43ea-932b-faa83d98911c
7d376474-d054-4eab-a7c0-3f263f0b8cfa	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	54c480b3-2980-4e48-bb98-53541e732b4f
c78712c1-89fb-4252-a0ad-590da3b61652	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	54c480b3-2980-4e48-bb98-53541e732b4f
8fafa340-bc14-4575-ab77-cf708c7491f3	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	54c480b3-2980-4e48-bb98-53541e732b4f
4f6f95ed-2b20-4724-9c09-5c6ecbcac62b	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	5df0996c-88a8-489f-9c87-51d08f44d26f
b416458a-e9c7-4266-9b4a-227cf3ed15ee	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4
1d565db4-500a-4581-87f3-380e1450c77d	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	15d47cbd-e9cf-4784-a9d6-9fc28f7758e4
83f754a7-7423-43ad-bd31-5d02ca65eee4	acr loa level	openid-connect	oidc-acr-mapper	\N	9a2826a9-6c62-49ad-a6f1-4f9e7a4740e0
5012c320-2615-42f6-9301-70afdbe6dc5d	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	c81bcae5-3d08-4400-9a2c-49f1396c53c7
2ef0a370-f836-4525-b6c7-9b35374fac99	sub	openid-connect	oidc-sub-mapper	\N	c81bcae5-3d08-4400-9a2c-49f1396c53c7
c53cc5c8-9136-4668-9d75-4b49fd0cae05	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	\N	81a89c21-5e8d-41ce-bf9c-d4ba927d4859
da5ebeee-9fd3-4889-acf4-2f447b708d3b	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	\N	81a89c21-5e8d-41ce-bf9c-d4ba927d4859
4af9046b-b4d6-43d4-a531-b703cbf4633f	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	\N	81a89c21-5e8d-41ce-bf9c-d4ba927d4859
bc276167-6067-47f2-abd5-590dd4dbf65c	organization	openid-connect	oidc-organization-membership-mapper	\N	fdc42ee2-ec44-47eb-90cf-ace11cc26cbc
e7e358c5-c9b5-446d-9d26-5d81ca57e153	locale	openid-connect	oidc-usermodel-attribute-mapper	9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	\N
\.


--
-- Data for Name: protocol_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol_mapper_config (protocol_mapper_id, value, name) FROM stdin;
e323a631-706c-4583-9453-5a1985dcb29b	true	introspection.token.claim
e323a631-706c-4583-9453-5a1985dcb29b	true	userinfo.token.claim
e323a631-706c-4583-9453-5a1985dcb29b	locale	user.attribute
e323a631-706c-4583-9453-5a1985dcb29b	true	id.token.claim
e323a631-706c-4583-9453-5a1985dcb29b	true	access.token.claim
e323a631-706c-4583-9453-5a1985dcb29b	locale	claim.name
e323a631-706c-4583-9453-5a1985dcb29b	String	jsonType.label
9a87ff38-e8ef-4d42-b4d5-1747f28efdcb	false	single
9a87ff38-e8ef-4d42-b4d5-1747f28efdcb	Basic	attribute.nameformat
9a87ff38-e8ef-4d42-b4d5-1747f28efdcb	Role	attribute.name
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	true	introspection.token.claim
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	true	userinfo.token.claim
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	birthdate	user.attribute
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	true	id.token.claim
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	true	access.token.claim
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	birthdate	claim.name
0ef897a0-0d3e-4e51-a4f6-92533f0bba1f	String	jsonType.label
25c17384-cc44-49c4-a5b7-f28d7d0b2620	true	introspection.token.claim
25c17384-cc44-49c4-a5b7-f28d7d0b2620	true	userinfo.token.claim
25c17384-cc44-49c4-a5b7-f28d7d0b2620	lastName	user.attribute
25c17384-cc44-49c4-a5b7-f28d7d0b2620	true	id.token.claim
25c17384-cc44-49c4-a5b7-f28d7d0b2620	true	access.token.claim
25c17384-cc44-49c4-a5b7-f28d7d0b2620	family_name	claim.name
25c17384-cc44-49c4-a5b7-f28d7d0b2620	String	jsonType.label
2f23569a-2fae-4779-8ed6-dcfe438d6e43	true	introspection.token.claim
2f23569a-2fae-4779-8ed6-dcfe438d6e43	true	userinfo.token.claim
2f23569a-2fae-4779-8ed6-dcfe438d6e43	firstName	user.attribute
2f23569a-2fae-4779-8ed6-dcfe438d6e43	true	id.token.claim
2f23569a-2fae-4779-8ed6-dcfe438d6e43	true	access.token.claim
2f23569a-2fae-4779-8ed6-dcfe438d6e43	given_name	claim.name
2f23569a-2fae-4779-8ed6-dcfe438d6e43	String	jsonType.label
467ff733-f7af-4c16-9846-6fda7a498e9e	true	introspection.token.claim
467ff733-f7af-4c16-9846-6fda7a498e9e	true	userinfo.token.claim
467ff733-f7af-4c16-9846-6fda7a498e9e	middleName	user.attribute
467ff733-f7af-4c16-9846-6fda7a498e9e	true	id.token.claim
467ff733-f7af-4c16-9846-6fda7a498e9e	true	access.token.claim
467ff733-f7af-4c16-9846-6fda7a498e9e	middle_name	claim.name
467ff733-f7af-4c16-9846-6fda7a498e9e	String	jsonType.label
511ea50e-b9c4-4480-abf8-8949c97a2eb3	true	introspection.token.claim
511ea50e-b9c4-4480-abf8-8949c97a2eb3	true	userinfo.token.claim
511ea50e-b9c4-4480-abf8-8949c97a2eb3	updatedAt	user.attribute
511ea50e-b9c4-4480-abf8-8949c97a2eb3	true	id.token.claim
511ea50e-b9c4-4480-abf8-8949c97a2eb3	true	access.token.claim
511ea50e-b9c4-4480-abf8-8949c97a2eb3	updated_at	claim.name
511ea50e-b9c4-4480-abf8-8949c97a2eb3	long	jsonType.label
515e9cf4-f90e-46ba-805d-9ae62efbce98	true	introspection.token.claim
515e9cf4-f90e-46ba-805d-9ae62efbce98	true	userinfo.token.claim
515e9cf4-f90e-46ba-805d-9ae62efbce98	username	user.attribute
515e9cf4-f90e-46ba-805d-9ae62efbce98	true	id.token.claim
515e9cf4-f90e-46ba-805d-9ae62efbce98	true	access.token.claim
515e9cf4-f90e-46ba-805d-9ae62efbce98	preferred_username	claim.name
515e9cf4-f90e-46ba-805d-9ae62efbce98	String	jsonType.label
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	true	introspection.token.claim
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	true	userinfo.token.claim
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	gender	user.attribute
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	true	id.token.claim
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	true	access.token.claim
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	gender	claim.name
5ab7b9bf-5aa2-4fa7-a915-88040032a5e0	String	jsonType.label
95d7ed7a-7163-4c9d-9b36-088b823d5473	true	introspection.token.claim
95d7ed7a-7163-4c9d-9b36-088b823d5473	true	userinfo.token.claim
95d7ed7a-7163-4c9d-9b36-088b823d5473	profile	user.attribute
95d7ed7a-7163-4c9d-9b36-088b823d5473	true	id.token.claim
95d7ed7a-7163-4c9d-9b36-088b823d5473	true	access.token.claim
95d7ed7a-7163-4c9d-9b36-088b823d5473	profile	claim.name
95d7ed7a-7163-4c9d-9b36-088b823d5473	String	jsonType.label
a0f06b38-2d10-47b8-a3b9-3331b413b460	true	introspection.token.claim
a0f06b38-2d10-47b8-a3b9-3331b413b460	true	userinfo.token.claim
a0f06b38-2d10-47b8-a3b9-3331b413b460	zoneinfo	user.attribute
a0f06b38-2d10-47b8-a3b9-3331b413b460	true	id.token.claim
a0f06b38-2d10-47b8-a3b9-3331b413b460	true	access.token.claim
a0f06b38-2d10-47b8-a3b9-3331b413b460	zoneinfo	claim.name
a0f06b38-2d10-47b8-a3b9-3331b413b460	String	jsonType.label
a998dcdb-0353-4489-b2aa-2815035aa6a0	true	introspection.token.claim
a998dcdb-0353-4489-b2aa-2815035aa6a0	true	userinfo.token.claim
a998dcdb-0353-4489-b2aa-2815035aa6a0	locale	user.attribute
a998dcdb-0353-4489-b2aa-2815035aa6a0	true	id.token.claim
a998dcdb-0353-4489-b2aa-2815035aa6a0	true	access.token.claim
a998dcdb-0353-4489-b2aa-2815035aa6a0	locale	claim.name
a998dcdb-0353-4489-b2aa-2815035aa6a0	String	jsonType.label
c9078ba0-c556-4a90-b053-475b9f543bcc	true	introspection.token.claim
c9078ba0-c556-4a90-b053-475b9f543bcc	true	userinfo.token.claim
c9078ba0-c556-4a90-b053-475b9f543bcc	website	user.attribute
c9078ba0-c556-4a90-b053-475b9f543bcc	true	id.token.claim
c9078ba0-c556-4a90-b053-475b9f543bcc	true	access.token.claim
c9078ba0-c556-4a90-b053-475b9f543bcc	website	claim.name
c9078ba0-c556-4a90-b053-475b9f543bcc	String	jsonType.label
c9130f74-449b-47aa-b0f6-f5f4e1eee8ac	true	introspection.token.claim
c9130f74-449b-47aa-b0f6-f5f4e1eee8ac	true	userinfo.token.claim
c9130f74-449b-47aa-b0f6-f5f4e1eee8ac	true	id.token.claim
c9130f74-449b-47aa-b0f6-f5f4e1eee8ac	true	access.token.claim
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	true	introspection.token.claim
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	true	userinfo.token.claim
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	nickname	user.attribute
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	true	id.token.claim
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	true	access.token.claim
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	nickname	claim.name
cfb65819-8a0f-4e0b-a5d5-f295ef28b5d7	String	jsonType.label
e918b04a-fc98-4682-b7cd-b570b1e52227	true	introspection.token.claim
e918b04a-fc98-4682-b7cd-b570b1e52227	true	userinfo.token.claim
e918b04a-fc98-4682-b7cd-b570b1e52227	picture	user.attribute
e918b04a-fc98-4682-b7cd-b570b1e52227	true	id.token.claim
e918b04a-fc98-4682-b7cd-b570b1e52227	true	access.token.claim
e918b04a-fc98-4682-b7cd-b570b1e52227	picture	claim.name
e918b04a-fc98-4682-b7cd-b570b1e52227	String	jsonType.label
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	true	introspection.token.claim
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	true	userinfo.token.claim
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	emailVerified	user.attribute
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	true	id.token.claim
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	true	access.token.claim
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	email_verified	claim.name
8d96ecc2-8f1c-448f-a43e-eeeb199718ef	boolean	jsonType.label
de88e0a3-d51e-4145-b836-8e40420d455a	true	introspection.token.claim
de88e0a3-d51e-4145-b836-8e40420d455a	true	userinfo.token.claim
de88e0a3-d51e-4145-b836-8e40420d455a	email	user.attribute
de88e0a3-d51e-4145-b836-8e40420d455a	true	id.token.claim
de88e0a3-d51e-4145-b836-8e40420d455a	true	access.token.claim
de88e0a3-d51e-4145-b836-8e40420d455a	email	claim.name
de88e0a3-d51e-4145-b836-8e40420d455a	String	jsonType.label
88541c1e-7638-4204-af7a-52e05bde2042	formatted	user.attribute.formatted
88541c1e-7638-4204-af7a-52e05bde2042	country	user.attribute.country
88541c1e-7638-4204-af7a-52e05bde2042	true	introspection.token.claim
88541c1e-7638-4204-af7a-52e05bde2042	postal_code	user.attribute.postal_code
88541c1e-7638-4204-af7a-52e05bde2042	true	userinfo.token.claim
88541c1e-7638-4204-af7a-52e05bde2042	street	user.attribute.street
88541c1e-7638-4204-af7a-52e05bde2042	true	id.token.claim
88541c1e-7638-4204-af7a-52e05bde2042	region	user.attribute.region
88541c1e-7638-4204-af7a-52e05bde2042	true	access.token.claim
88541c1e-7638-4204-af7a-52e05bde2042	locality	user.attribute.locality
224716d4-3a22-4419-958d-9a4d37a8aaec	true	introspection.token.claim
224716d4-3a22-4419-958d-9a4d37a8aaec	true	userinfo.token.claim
224716d4-3a22-4419-958d-9a4d37a8aaec	phoneNumberVerified	user.attribute
224716d4-3a22-4419-958d-9a4d37a8aaec	true	id.token.claim
224716d4-3a22-4419-958d-9a4d37a8aaec	true	access.token.claim
224716d4-3a22-4419-958d-9a4d37a8aaec	phone_number_verified	claim.name
224716d4-3a22-4419-958d-9a4d37a8aaec	boolean	jsonType.label
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	true	introspection.token.claim
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	true	userinfo.token.claim
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	phoneNumber	user.attribute
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	true	id.token.claim
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	true	access.token.claim
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	phone_number	claim.name
ca52e1c1-8cdb-440b-a792-7b3b5b0e82b6	String	jsonType.label
4f664521-aa50-45e0-bd55-b25d4fc82a79	true	introspection.token.claim
4f664521-aa50-45e0-bd55-b25d4fc82a79	true	multivalued
4f664521-aa50-45e0-bd55-b25d4fc82a79	foo	user.attribute
4f664521-aa50-45e0-bd55-b25d4fc82a79	true	access.token.claim
4f664521-aa50-45e0-bd55-b25d4fc82a79	resource_access.${client_id}.roles	claim.name
4f664521-aa50-45e0-bd55-b25d4fc82a79	String	jsonType.label
5b743059-e733-45b7-8eb3-78c3650c3e5e	true	introspection.token.claim
5b743059-e733-45b7-8eb3-78c3650c3e5e	true	access.token.claim
66cb0d3c-3709-4618-ae80-824efcc82283	true	introspection.token.claim
66cb0d3c-3709-4618-ae80-824efcc82283	true	multivalued
66cb0d3c-3709-4618-ae80-824efcc82283	foo	user.attribute
66cb0d3c-3709-4618-ae80-824efcc82283	true	access.token.claim
66cb0d3c-3709-4618-ae80-824efcc82283	realm_access.roles	claim.name
66cb0d3c-3709-4618-ae80-824efcc82283	String	jsonType.label
a62a2849-086c-4d2a-b363-e471aaf06194	true	introspection.token.claim
a62a2849-086c-4d2a-b363-e471aaf06194	true	access.token.claim
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	true	introspection.token.claim
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	true	multivalued
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	foo	user.attribute
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	true	id.token.claim
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	true	access.token.claim
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	groups	claim.name
0b62e001-5383-4c96-bf7e-2bc4df46e6ad	String	jsonType.label
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	true	introspection.token.claim
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	true	userinfo.token.claim
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	username	user.attribute
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	true	id.token.claim
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	true	access.token.claim
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	upn	claim.name
2cbacd44-2eca-4c11-b62a-1f11ca9d64b7	String	jsonType.label
3bf27de1-d1f7-45c2-955d-d990cc25d8bc	true	introspection.token.claim
3bf27de1-d1f7-45c2-955d-d990cc25d8bc	true	id.token.claim
3bf27de1-d1f7-45c2-955d-d990cc25d8bc	true	access.token.claim
18665e58-bc32-4daf-bc0e-12e4629a1082	true	introspection.token.claim
18665e58-bc32-4daf-bc0e-12e4629a1082	true	access.token.claim
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	AUTH_TIME	user.session.note
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	true	introspection.token.claim
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	true	id.token.claim
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	true	access.token.claim
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	auth_time	claim.name
3e7e0b9f-0e70-40b1-bd2f-0d736dc27fa6	long	jsonType.label
50a20746-46cc-4360-874c-9a11054a79af	clientHost	user.session.note
50a20746-46cc-4360-874c-9a11054a79af	true	introspection.token.claim
50a20746-46cc-4360-874c-9a11054a79af	true	id.token.claim
50a20746-46cc-4360-874c-9a11054a79af	true	access.token.claim
50a20746-46cc-4360-874c-9a11054a79af	clientHost	claim.name
50a20746-46cc-4360-874c-9a11054a79af	String	jsonType.label
643a0d9b-e7d7-406c-a716-e9f222f54b42	clientAddress	user.session.note
643a0d9b-e7d7-406c-a716-e9f222f54b42	true	introspection.token.claim
643a0d9b-e7d7-406c-a716-e9f222f54b42	true	id.token.claim
643a0d9b-e7d7-406c-a716-e9f222f54b42	true	access.token.claim
643a0d9b-e7d7-406c-a716-e9f222f54b42	clientAddress	claim.name
643a0d9b-e7d7-406c-a716-e9f222f54b42	String	jsonType.label
7aca2732-5cd0-4768-8348-5775be3d0a61	client_id	user.session.note
7aca2732-5cd0-4768-8348-5775be3d0a61	true	introspection.token.claim
7aca2732-5cd0-4768-8348-5775be3d0a61	true	id.token.claim
7aca2732-5cd0-4768-8348-5775be3d0a61	true	access.token.claim
7aca2732-5cd0-4768-8348-5775be3d0a61	client_id	claim.name
7aca2732-5cd0-4768-8348-5775be3d0a61	String	jsonType.label
d815c49b-9043-4429-b7c4-b8855add07ff	true	introspection.token.claim
d815c49b-9043-4429-b7c4-b8855add07ff	true	multivalued
d815c49b-9043-4429-b7c4-b8855add07ff	true	id.token.claim
d815c49b-9043-4429-b7c4-b8855add07ff	true	access.token.claim
d815c49b-9043-4429-b7c4-b8855add07ff	organization	claim.name
d815c49b-9043-4429-b7c4-b8855add07ff	String	jsonType.label
417e5b1e-3f18-45ff-acee-56d9b4c987e9	false	single
417e5b1e-3f18-45ff-acee-56d9b4c987e9	Basic	attribute.nameformat
417e5b1e-3f18-45ff-acee-56d9b4c987e9	Role	attribute.name
2a064d6f-3ab3-4789-8794-a7cce477f67c	true	introspection.token.claim
2a064d6f-3ab3-4789-8794-a7cce477f67c	true	userinfo.token.claim
2a064d6f-3ab3-4789-8794-a7cce477f67c	picture	user.attribute
2a064d6f-3ab3-4789-8794-a7cce477f67c	true	id.token.claim
2a064d6f-3ab3-4789-8794-a7cce477f67c	true	access.token.claim
2a064d6f-3ab3-4789-8794-a7cce477f67c	picture	claim.name
2a064d6f-3ab3-4789-8794-a7cce477f67c	String	jsonType.label
2e029f7e-221a-402b-b973-b9e0637e57ae	true	introspection.token.claim
2e029f7e-221a-402b-b973-b9e0637e57ae	true	userinfo.token.claim
2e029f7e-221a-402b-b973-b9e0637e57ae	lastName	user.attribute
2e029f7e-221a-402b-b973-b9e0637e57ae	true	id.token.claim
2e029f7e-221a-402b-b973-b9e0637e57ae	true	access.token.claim
2e029f7e-221a-402b-b973-b9e0637e57ae	family_name	claim.name
2e029f7e-221a-402b-b973-b9e0637e57ae	String	jsonType.label
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	true	introspection.token.claim
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	true	userinfo.token.claim
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	profile	user.attribute
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	true	id.token.claim
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	true	access.token.claim
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	profile	claim.name
30cdb85a-f93b-4f02-9d2e-7f354a57fe07	String	jsonType.label
311a3a78-354b-4223-9ea6-235e5a199795	true	introspection.token.claim
311a3a78-354b-4223-9ea6-235e5a199795	true	userinfo.token.claim
311a3a78-354b-4223-9ea6-235e5a199795	true	id.token.claim
311a3a78-354b-4223-9ea6-235e5a199795	true	access.token.claim
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	true	introspection.token.claim
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	true	userinfo.token.claim
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	updatedAt	user.attribute
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	true	id.token.claim
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	true	access.token.claim
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	updated_at	claim.name
471a6cd2-7ca1-4d07-9e2c-a78ac78a2e54	long	jsonType.label
68257fd1-e5fd-4aa2-a819-e80402af5e10	true	introspection.token.claim
68257fd1-e5fd-4aa2-a819-e80402af5e10	true	userinfo.token.claim
68257fd1-e5fd-4aa2-a819-e80402af5e10	gender	user.attribute
68257fd1-e5fd-4aa2-a819-e80402af5e10	true	id.token.claim
68257fd1-e5fd-4aa2-a819-e80402af5e10	true	access.token.claim
68257fd1-e5fd-4aa2-a819-e80402af5e10	gender	claim.name
68257fd1-e5fd-4aa2-a819-e80402af5e10	String	jsonType.label
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	true	introspection.token.claim
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	true	userinfo.token.claim
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	locale	user.attribute
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	true	id.token.claim
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	true	access.token.claim
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	locale	claim.name
6ce1c423-d8ae-4a88-bba6-ba4556ebc7c5	String	jsonType.label
7a977e14-4da0-4556-ba36-b02322507d82	true	introspection.token.claim
7a977e14-4da0-4556-ba36-b02322507d82	true	userinfo.token.claim
7a977e14-4da0-4556-ba36-b02322507d82	website	user.attribute
7a977e14-4da0-4556-ba36-b02322507d82	true	id.token.claim
7a977e14-4da0-4556-ba36-b02322507d82	true	access.token.claim
7a977e14-4da0-4556-ba36-b02322507d82	website	claim.name
7a977e14-4da0-4556-ba36-b02322507d82	String	jsonType.label
8f5b2e18-550d-4bc4-b440-32b01ea58f08	true	introspection.token.claim
8f5b2e18-550d-4bc4-b440-32b01ea58f08	true	userinfo.token.claim
8f5b2e18-550d-4bc4-b440-32b01ea58f08	birthdate	user.attribute
8f5b2e18-550d-4bc4-b440-32b01ea58f08	true	id.token.claim
8f5b2e18-550d-4bc4-b440-32b01ea58f08	true	access.token.claim
8f5b2e18-550d-4bc4-b440-32b01ea58f08	birthdate	claim.name
8f5b2e18-550d-4bc4-b440-32b01ea58f08	String	jsonType.label
93796863-89d3-4c57-be51-fdaff77603fb	true	introspection.token.claim
93796863-89d3-4c57-be51-fdaff77603fb	true	userinfo.token.claim
93796863-89d3-4c57-be51-fdaff77603fb	firstName	user.attribute
93796863-89d3-4c57-be51-fdaff77603fb	true	id.token.claim
93796863-89d3-4c57-be51-fdaff77603fb	true	access.token.claim
93796863-89d3-4c57-be51-fdaff77603fb	given_name	claim.name
93796863-89d3-4c57-be51-fdaff77603fb	String	jsonType.label
9c90b90c-1513-45ad-83fb-d9d081c21e46	true	introspection.token.claim
9c90b90c-1513-45ad-83fb-d9d081c21e46	true	userinfo.token.claim
9c90b90c-1513-45ad-83fb-d9d081c21e46	middleName	user.attribute
9c90b90c-1513-45ad-83fb-d9d081c21e46	true	id.token.claim
9c90b90c-1513-45ad-83fb-d9d081c21e46	true	access.token.claim
9c90b90c-1513-45ad-83fb-d9d081c21e46	middle_name	claim.name
9c90b90c-1513-45ad-83fb-d9d081c21e46	String	jsonType.label
ca088261-004f-48ba-9666-55679c289a58	true	introspection.token.claim
ca088261-004f-48ba-9666-55679c289a58	true	userinfo.token.claim
ca088261-004f-48ba-9666-55679c289a58	username	user.attribute
ca088261-004f-48ba-9666-55679c289a58	true	id.token.claim
ca088261-004f-48ba-9666-55679c289a58	true	access.token.claim
ca088261-004f-48ba-9666-55679c289a58	preferred_username	claim.name
ca088261-004f-48ba-9666-55679c289a58	String	jsonType.label
cbacd455-6dd3-4067-aafb-d6d99357a99c	true	introspection.token.claim
cbacd455-6dd3-4067-aafb-d6d99357a99c	true	userinfo.token.claim
cbacd455-6dd3-4067-aafb-d6d99357a99c	nickname	user.attribute
cbacd455-6dd3-4067-aafb-d6d99357a99c	true	id.token.claim
cbacd455-6dd3-4067-aafb-d6d99357a99c	true	access.token.claim
cbacd455-6dd3-4067-aafb-d6d99357a99c	nickname	claim.name
cbacd455-6dd3-4067-aafb-d6d99357a99c	String	jsonType.label
dc683e1d-27e8-4215-88e1-4122f18bceaa	true	introspection.token.claim
dc683e1d-27e8-4215-88e1-4122f18bceaa	true	userinfo.token.claim
dc683e1d-27e8-4215-88e1-4122f18bceaa	zoneinfo	user.attribute
dc683e1d-27e8-4215-88e1-4122f18bceaa	true	id.token.claim
dc683e1d-27e8-4215-88e1-4122f18bceaa	true	access.token.claim
dc683e1d-27e8-4215-88e1-4122f18bceaa	zoneinfo	claim.name
dc683e1d-27e8-4215-88e1-4122f18bceaa	String	jsonType.label
4a484b5a-0b24-4ae3-b408-6a55fa33172f	true	introspection.token.claim
4a484b5a-0b24-4ae3-b408-6a55fa33172f	true	userinfo.token.claim
4a484b5a-0b24-4ae3-b408-6a55fa33172f	emailVerified	user.attribute
4a484b5a-0b24-4ae3-b408-6a55fa33172f	true	id.token.claim
4a484b5a-0b24-4ae3-b408-6a55fa33172f	true	access.token.claim
4a484b5a-0b24-4ae3-b408-6a55fa33172f	email_verified	claim.name
4a484b5a-0b24-4ae3-b408-6a55fa33172f	boolean	jsonType.label
9e1f8e11-7cef-4870-9ca3-42acd387772a	true	introspection.token.claim
9e1f8e11-7cef-4870-9ca3-42acd387772a	true	userinfo.token.claim
9e1f8e11-7cef-4870-9ca3-42acd387772a	email	user.attribute
9e1f8e11-7cef-4870-9ca3-42acd387772a	true	id.token.claim
9e1f8e11-7cef-4870-9ca3-42acd387772a	true	access.token.claim
9e1f8e11-7cef-4870-9ca3-42acd387772a	email	claim.name
9e1f8e11-7cef-4870-9ca3-42acd387772a	String	jsonType.label
66a6a090-5b3d-4212-bfa0-bb6241068249	formatted	user.attribute.formatted
66a6a090-5b3d-4212-bfa0-bb6241068249	country	user.attribute.country
66a6a090-5b3d-4212-bfa0-bb6241068249	true	introspection.token.claim
66a6a090-5b3d-4212-bfa0-bb6241068249	postal_code	user.attribute.postal_code
66a6a090-5b3d-4212-bfa0-bb6241068249	true	userinfo.token.claim
66a6a090-5b3d-4212-bfa0-bb6241068249	street	user.attribute.street
66a6a090-5b3d-4212-bfa0-bb6241068249	true	id.token.claim
66a6a090-5b3d-4212-bfa0-bb6241068249	region	user.attribute.region
66a6a090-5b3d-4212-bfa0-bb6241068249	true	access.token.claim
66a6a090-5b3d-4212-bfa0-bb6241068249	locality	user.attribute.locality
669ab072-c627-46fa-a10b-894631a1146f	true	introspection.token.claim
669ab072-c627-46fa-a10b-894631a1146f	true	userinfo.token.claim
669ab072-c627-46fa-a10b-894631a1146f	phoneNumber	user.attribute
669ab072-c627-46fa-a10b-894631a1146f	true	id.token.claim
669ab072-c627-46fa-a10b-894631a1146f	true	access.token.claim
669ab072-c627-46fa-a10b-894631a1146f	phone_number	claim.name
669ab072-c627-46fa-a10b-894631a1146f	String	jsonType.label
717ef61f-2535-4dd1-9d23-71c32f472e75	true	introspection.token.claim
717ef61f-2535-4dd1-9d23-71c32f472e75	true	userinfo.token.claim
717ef61f-2535-4dd1-9d23-71c32f472e75	phoneNumberVerified	user.attribute
717ef61f-2535-4dd1-9d23-71c32f472e75	true	id.token.claim
717ef61f-2535-4dd1-9d23-71c32f472e75	true	access.token.claim
717ef61f-2535-4dd1-9d23-71c32f472e75	phone_number_verified	claim.name
717ef61f-2535-4dd1-9d23-71c32f472e75	boolean	jsonType.label
7d376474-d054-4eab-a7c0-3f263f0b8cfa	true	introspection.token.claim
7d376474-d054-4eab-a7c0-3f263f0b8cfa	true	multivalued
7d376474-d054-4eab-a7c0-3f263f0b8cfa	foo	user.attribute
7d376474-d054-4eab-a7c0-3f263f0b8cfa	true	access.token.claim
7d376474-d054-4eab-a7c0-3f263f0b8cfa	realm_access.roles	claim.name
7d376474-d054-4eab-a7c0-3f263f0b8cfa	String	jsonType.label
8fafa340-bc14-4575-ab77-cf708c7491f3	true	introspection.token.claim
8fafa340-bc14-4575-ab77-cf708c7491f3	true	access.token.claim
c78712c1-89fb-4252-a0ad-590da3b61652	true	introspection.token.claim
c78712c1-89fb-4252-a0ad-590da3b61652	true	multivalued
c78712c1-89fb-4252-a0ad-590da3b61652	foo	user.attribute
c78712c1-89fb-4252-a0ad-590da3b61652	true	access.token.claim
c78712c1-89fb-4252-a0ad-590da3b61652	resource_access.${client_id}.roles	claim.name
c78712c1-89fb-4252-a0ad-590da3b61652	String	jsonType.label
4f6f95ed-2b20-4724-9c09-5c6ecbcac62b	true	introspection.token.claim
4f6f95ed-2b20-4724-9c09-5c6ecbcac62b	true	access.token.claim
1d565db4-500a-4581-87f3-380e1450c77d	true	introspection.token.claim
1d565db4-500a-4581-87f3-380e1450c77d	true	multivalued
1d565db4-500a-4581-87f3-380e1450c77d	foo	user.attribute
1d565db4-500a-4581-87f3-380e1450c77d	true	id.token.claim
1d565db4-500a-4581-87f3-380e1450c77d	true	access.token.claim
1d565db4-500a-4581-87f3-380e1450c77d	groups	claim.name
1d565db4-500a-4581-87f3-380e1450c77d	String	jsonType.label
b416458a-e9c7-4266-9b4a-227cf3ed15ee	true	introspection.token.claim
b416458a-e9c7-4266-9b4a-227cf3ed15ee	true	userinfo.token.claim
b416458a-e9c7-4266-9b4a-227cf3ed15ee	username	user.attribute
b416458a-e9c7-4266-9b4a-227cf3ed15ee	true	id.token.claim
b416458a-e9c7-4266-9b4a-227cf3ed15ee	true	access.token.claim
b416458a-e9c7-4266-9b4a-227cf3ed15ee	upn	claim.name
b416458a-e9c7-4266-9b4a-227cf3ed15ee	String	jsonType.label
83f754a7-7423-43ad-bd31-5d02ca65eee4	true	introspection.token.claim
83f754a7-7423-43ad-bd31-5d02ca65eee4	true	id.token.claim
83f754a7-7423-43ad-bd31-5d02ca65eee4	true	access.token.claim
2ef0a370-f836-4525-b6c7-9b35374fac99	true	introspection.token.claim
2ef0a370-f836-4525-b6c7-9b35374fac99	true	access.token.claim
5012c320-2615-42f6-9301-70afdbe6dc5d	AUTH_TIME	user.session.note
5012c320-2615-42f6-9301-70afdbe6dc5d	true	introspection.token.claim
5012c320-2615-42f6-9301-70afdbe6dc5d	true	id.token.claim
5012c320-2615-42f6-9301-70afdbe6dc5d	true	access.token.claim
5012c320-2615-42f6-9301-70afdbe6dc5d	auth_time	claim.name
5012c320-2615-42f6-9301-70afdbe6dc5d	long	jsonType.label
4af9046b-b4d6-43d4-a531-b703cbf4633f	clientAddress	user.session.note
4af9046b-b4d6-43d4-a531-b703cbf4633f	true	introspection.token.claim
4af9046b-b4d6-43d4-a531-b703cbf4633f	true	id.token.claim
4af9046b-b4d6-43d4-a531-b703cbf4633f	true	access.token.claim
4af9046b-b4d6-43d4-a531-b703cbf4633f	clientAddress	claim.name
4af9046b-b4d6-43d4-a531-b703cbf4633f	String	jsonType.label
c53cc5c8-9136-4668-9d75-4b49fd0cae05	client_id	user.session.note
c53cc5c8-9136-4668-9d75-4b49fd0cae05	true	introspection.token.claim
c53cc5c8-9136-4668-9d75-4b49fd0cae05	true	id.token.claim
c53cc5c8-9136-4668-9d75-4b49fd0cae05	true	access.token.claim
c53cc5c8-9136-4668-9d75-4b49fd0cae05	client_id	claim.name
c53cc5c8-9136-4668-9d75-4b49fd0cae05	String	jsonType.label
da5ebeee-9fd3-4889-acf4-2f447b708d3b	clientHost	user.session.note
da5ebeee-9fd3-4889-acf4-2f447b708d3b	true	introspection.token.claim
da5ebeee-9fd3-4889-acf4-2f447b708d3b	true	id.token.claim
da5ebeee-9fd3-4889-acf4-2f447b708d3b	true	access.token.claim
da5ebeee-9fd3-4889-acf4-2f447b708d3b	clientHost	claim.name
da5ebeee-9fd3-4889-acf4-2f447b708d3b	String	jsonType.label
bc276167-6067-47f2-abd5-590dd4dbf65c	true	introspection.token.claim
bc276167-6067-47f2-abd5-590dd4dbf65c	true	multivalued
bc276167-6067-47f2-abd5-590dd4dbf65c	true	id.token.claim
bc276167-6067-47f2-abd5-590dd4dbf65c	true	access.token.claim
bc276167-6067-47f2-abd5-590dd4dbf65c	organization	claim.name
bc276167-6067-47f2-abd5-590dd4dbf65c	String	jsonType.label
e7e358c5-c9b5-446d-9d26-5d81ca57e153	true	introspection.token.claim
e7e358c5-c9b5-446d-9d26-5d81ca57e153	true	userinfo.token.claim
e7e358c5-c9b5-446d-9d26-5d81ca57e153	locale	user.attribute
e7e358c5-c9b5-446d-9d26-5d81ca57e153	true	id.token.claim
e7e358c5-c9b5-446d-9d26-5d81ca57e153	true	access.token.claim
e7e358c5-c9b5-446d-9d26-5d81ca57e153	locale	claim.name
e7e358c5-c9b5-446d-9d26-5d81ca57e153	String	jsonType.label
\.


--
-- Data for Name: realm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm (id, access_code_lifespan, user_action_lifespan, access_token_lifespan, account_theme, admin_theme, email_theme, enabled, events_enabled, events_expiration, login_theme, name, not_before, password_policy, registration_allowed, remember_me, reset_password_allowed, social, ssl_required, sso_idle_timeout, sso_max_lifespan, update_profile_on_soc_login, verify_email, master_admin_client, login_lifespan, internationalization_enabled, default_locale, reg_email_as_username, admin_events_enabled, admin_events_details_enabled, edit_username_allowed, otp_policy_counter, otp_policy_window, otp_policy_period, otp_policy_digits, otp_policy_alg, otp_policy_type, browser_flow, registration_flow, direct_grant_flow, reset_credentials_flow, client_auth_flow, offline_session_idle_timeout, revoke_refresh_token, access_token_life_implicit, login_with_email_allowed, duplicate_emails_allowed, docker_auth_flow, refresh_token_max_reuse, allow_user_managed_access, sso_max_lifespan_remember_me, sso_idle_timeout_remember_me, default_role) FROM stdin;
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	60	300	300	\N	\N	\N	t	f	0	\N	ash	0	\N	t	t	t	f	EXTERNAL	1800	36000	f	f	4cb807b4-7184-40d1-baf7-c07389d31937	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	185161bf-0937-4982-b58f-92550451f533	9d29bec7-2d8b-41b4-9f31-8f1329055c2a	c9f67168-c625-42a0-aee9-c839a3857bf9	628818dd-71c8-43ae-9001-46ee34b2c2c3	3d592605-a407-47ad-8658-9ac4ca381956	2592000	f	900	t	f	74719d9a-cf55-4b23-b822-a0b639b4763c	0	f	0	0	cc18f194-5ba2-42f3-b648-0f87e18af2cf
c36b20d9-63c7-4267-aa45-992c63e9c0a6	60	300	60	\N	\N	\N	t	f	0	\N	master	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	42b87bb7-c41e-469d-838a-cfa73620dcec	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	baedd61d-c0e7-4a19-aa70-5f43fa029239	7aaccb66-801d-4723-9681-63eda55b8484	aab67545-d041-406b-9ded-ef3a7a2a4e68	a2439338-1549-4893-923d-47c9dec55918	4594b4d8-f967-4b5e-b39f-00cada80cebb	2592000	f	900	t	f	21fe009f-770d-4940-a9cb-4e3bab9b480e	0	f	0	0	e2a1fb6d-4257-4c9b-b108-7eacc839df2b
\.


--
-- Data for Name: realm_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_attribute (name, realm_id, value) FROM stdin;
_browser_header.contentSecurityPolicyReportOnly	c36b20d9-63c7-4267-aa45-992c63e9c0a6	
_browser_header.xContentTypeOptions	c36b20d9-63c7-4267-aa45-992c63e9c0a6	nosniff
_browser_header.referrerPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	no-referrer
_browser_header.xRobotsTag	c36b20d9-63c7-4267-aa45-992c63e9c0a6	none
_browser_header.xFrameOptions	c36b20d9-63c7-4267-aa45-992c63e9c0a6	SAMEORIGIN
_browser_header.contentSecurityPolicy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.strictTransportSecurity	c36b20d9-63c7-4267-aa45-992c63e9c0a6	max-age=31536000; includeSubDomains
bruteForceProtected	c36b20d9-63c7-4267-aa45-992c63e9c0a6	false
permanentLockout	c36b20d9-63c7-4267-aa45-992c63e9c0a6	false
maxTemporaryLockouts	c36b20d9-63c7-4267-aa45-992c63e9c0a6	0
bruteForceStrategy	c36b20d9-63c7-4267-aa45-992c63e9c0a6	MULTIPLE
maxFailureWaitSeconds	c36b20d9-63c7-4267-aa45-992c63e9c0a6	900
minimumQuickLoginWaitSeconds	c36b20d9-63c7-4267-aa45-992c63e9c0a6	60
waitIncrementSeconds	c36b20d9-63c7-4267-aa45-992c63e9c0a6	60
quickLoginCheckMilliSeconds	c36b20d9-63c7-4267-aa45-992c63e9c0a6	1000
maxDeltaTimeSeconds	c36b20d9-63c7-4267-aa45-992c63e9c0a6	43200
failureFactor	c36b20d9-63c7-4267-aa45-992c63e9c0a6	30
realmReusableOtpCode	c36b20d9-63c7-4267-aa45-992c63e9c0a6	false
firstBrokerLoginFlowId	c36b20d9-63c7-4267-aa45-992c63e9c0a6	32d9c70a-b1f1-4889-93aa-882bd77e4eed
displayName	c36b20d9-63c7-4267-aa45-992c63e9c0a6	Keycloak
displayNameHtml	c36b20d9-63c7-4267-aa45-992c63e9c0a6	<div class="kc-logo-text"><span>Keycloak</span></div>
defaultSignatureAlgorithm	c36b20d9-63c7-4267-aa45-992c63e9c0a6	RS256
offlineSessionMaxLifespanEnabled	c36b20d9-63c7-4267-aa45-992c63e9c0a6	false
offlineSessionMaxLifespan	c36b20d9-63c7-4267-aa45-992c63e9c0a6	5184000
_browser_header.contentSecurityPolicyReportOnly	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	
_browser_header.xContentTypeOptions	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	nosniff
_browser_header.referrerPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	no-referrer
_browser_header.xRobotsTag	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	none
_browser_header.xFrameOptions	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	SAMEORIGIN
_browser_header.contentSecurityPolicy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.strictTransportSecurity	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	max-age=31536000; includeSubDomains
bruteForceProtected	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
permanentLockout	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
maxTemporaryLockouts	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
bruteForceStrategy	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	MULTIPLE
maxFailureWaitSeconds	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	900
minimumQuickLoginWaitSeconds	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	60
waitIncrementSeconds	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	60
quickLoginCheckMilliSeconds	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	1000
maxDeltaTimeSeconds	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	43200
failureFactor	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	30
realmReusableOtpCode	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
defaultSignatureAlgorithm	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	RS256
offlineSessionMaxLifespanEnabled	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
offlineSessionMaxLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	5184000
actionTokenGeneratedByAdminLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	43200
actionTokenGeneratedByUserLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	300
oauth2DeviceCodeLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	600
oauth2DevicePollingInterval	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	5
webAuthnPolicyRpEntityName	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	keycloak
webAuthnPolicySignatureAlgorithms	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	ES256,RS256
webAuthnPolicyRpId	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	
webAuthnPolicyAttestationConveyancePreference	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	not specified
webAuthnPolicyAuthenticatorAttachment	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	not specified
webAuthnPolicyRequireResidentKey	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	not specified
webAuthnPolicyUserVerificationRequirement	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	not specified
webAuthnPolicyCreateTimeout	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
webAuthnPolicyAvoidSameAuthenticatorRegister	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
webAuthnPolicyRpEntityNamePasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	keycloak
webAuthnPolicySignatureAlgorithmsPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	ES256,RS256
webAuthnPolicyRpIdPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	
webAuthnPolicyAttestationConveyancePreferencePasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	not specified
webAuthnPolicyAuthenticatorAttachmentPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	not specified
webAuthnPolicyRequireResidentKeyPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	Yes
webAuthnPolicyUserVerificationRequirementPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	required
webAuthnPolicyCreateTimeoutPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
webAuthnPolicyAvoidSameAuthenticatorRegisterPasswordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
cibaBackchannelTokenDeliveryMode	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	poll
cibaExpiresIn	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	120
cibaInterval	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	5
cibaAuthRequestedUserHint	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	login_hint
parRequestUriLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	60
firstBrokerLoginFlowId	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	9c8c4462-de90-4c5a-93ff-c90ed1d9219e
organizationsEnabled	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
adminPermissionsEnabled	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
verifiableCredentialsEnabled	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	false
clientSessionIdleTimeout	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
clientSessionMaxLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
clientOfflineSessionIdleTimeout	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
clientOfflineSessionMaxLifespan	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	0
client-policies.profiles	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	{"profiles":[]}
client-policies.policies	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	{"policies":[]}
\.


--
-- Data for Name: realm_default_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_default_groups (realm_id, group_id) FROM stdin;
\.


--
-- Data for Name: realm_enabled_event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_enabled_event_types (realm_id, value) FROM stdin;
\.


--
-- Data for Name: realm_events_listeners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_events_listeners (realm_id, value) FROM stdin;
c36b20d9-63c7-4267-aa45-992c63e9c0a6	jboss-logging
d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	jboss-logging
\.


--
-- Data for Name: realm_localizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_localizations (realm_id, locale, texts) FROM stdin;
\.


--
-- Data for Name: realm_required_credential; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_required_credential (type, form_label, input, secret, realm_id) FROM stdin;
password	password	t	t	c36b20d9-63c7-4267-aa45-992c63e9c0a6
password	password	t	t	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d
\.


--
-- Data for Name: realm_smtp_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_smtp_config (realm_id, value, name) FROM stdin;
\.


--
-- Data for Name: realm_supported_locales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.realm_supported_locales (realm_id, value) FROM stdin;
\.


--
-- Data for Name: redirect_uris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redirect_uris (client_id, value) FROM stdin;
1393c0d6-0918-4536-ab43-1121b68f9e00	/realms/master/account/*
a763a786-5146-4758-adcb-cabc363165c2	/realms/master/account/*
e7b0ac03-2637-4526-94a8-17db9adc54b8	/admin/master/console/*
00313095-7e92-4f2a-afec-9a93400821fc	/realms/ash/account/*
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	/realms/ash/account/*
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	/admin/ash/console/*
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	http://localhost:3001/*
\.


--
-- Data for Name: required_action_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_action_config (required_action_id, value, name) FROM stdin;
\.


--
-- Data for Name: required_action_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.required_action_provider (id, alias, name, realm_id, enabled, default_action, provider_id, priority) FROM stdin;
1e276b8c-fa05-4d9a-b709-b8046592700c	VERIFY_EMAIL	Verify Email	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	VERIFY_EMAIL	50
f1e60334-dc62-4813-ae97-24743bfc2438	UPDATE_PROFILE	Update Profile	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	UPDATE_PROFILE	40
8d9ea702-56f1-4bb0-9c7b-a6f85a485224	CONFIGURE_TOTP	Configure OTP	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	CONFIGURE_TOTP	10
a7a234f2-d518-4007-9371-36ac963c9a2e	UPDATE_PASSWORD	Update Password	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	UPDATE_PASSWORD	30
a53962e3-865c-4fbf-aeea-d9ef2d4132c7	TERMS_AND_CONDITIONS	Terms and Conditions	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	f	TERMS_AND_CONDITIONS	20
cfec8a20-741b-4b6a-a74d-6dc266f26bed	delete_account	Delete Account	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	f	delete_account	60
d7908401-6f32-4bcb-acc4-4fbe539c2e65	delete_credential	Delete Credential	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	delete_credential	110
45b3be8e-ab54-462b-959b-bee5ba1c174a	update_user_locale	Update User Locale	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	update_user_locale	1000
12f55a7b-3798-49ee-a459-193d106482fc	UPDATE_EMAIL	Update Email	c36b20d9-63c7-4267-aa45-992c63e9c0a6	f	f	UPDATE_EMAIL	70
38075cea-cbd6-43b6-98cf-17e1ac65a704	CONFIGURE_RECOVERY_AUTHN_CODES	Recovery Authentication Codes	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	CONFIGURE_RECOVERY_AUTHN_CODES	130
df7a1f00-55b1-4d41-8217-591a62f2778f	webauthn-register	Webauthn Register	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	webauthn-register	80
30b4d98d-4d70-431d-98c1-b7847a919b22	webauthn-register-passwordless	Webauthn Register Passwordless	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	webauthn-register-passwordless	90
49e131cf-2dc9-42f7-a1a0-95bef557744d	VERIFY_PROFILE	Verify Profile	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	VERIFY_PROFILE	100
888181d6-b6cc-4117-84c3-ea8c5ee2cc01	idp_link	Linking Identity Provider	c36b20d9-63c7-4267-aa45-992c63e9c0a6	t	f	idp_link	120
3d3d5925-d4fb-4d41-9113-14ac789d0896	VERIFY_EMAIL	Verify Email	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	VERIFY_EMAIL	50
41873c42-f448-4538-bd03-802a2a221486	UPDATE_PROFILE	Update Profile	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	UPDATE_PROFILE	40
3b698c48-e5a3-4c4a-a65f-be324a187ead	CONFIGURE_TOTP	Configure OTP	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	CONFIGURE_TOTP	10
939fca35-3a21-46ff-99d2-60a1fa04ed1e	UPDATE_PASSWORD	Update Password	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	UPDATE_PASSWORD	30
ae0a9779-ec24-483d-a3c8-a01c0de463c9	TERMS_AND_CONDITIONS	Terms and Conditions	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f	f	TERMS_AND_CONDITIONS	20
604122b0-a189-47a6-8b6d-74148b8d5d75	delete_account	Delete Account	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f	f	delete_account	60
609e170a-60f3-4b0b-b9e2-ef935aee93d9	delete_credential	Delete Credential	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	delete_credential	110
e40f0c76-8089-4f6b-8161-6370c65624b2	update_user_locale	Update User Locale	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	update_user_locale	1000
bba4e0c3-5a1d-4e44-96d1-c1756d021468	UPDATE_EMAIL	Update Email	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	f	f	UPDATE_EMAIL	70
5feb6bad-9447-41fa-b9f9-d41bd7eb873d	CONFIGURE_RECOVERY_AUTHN_CODES	Recovery Authentication Codes	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	CONFIGURE_RECOVERY_AUTHN_CODES	130
bbfdcc1a-a6c8-4ba0-8f2f-52a38bcdd5b2	webauthn-register	Webauthn Register	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	webauthn-register	80
99ee6413-1618-417b-bdea-9f6f3cbb171b	webauthn-register-passwordless	Webauthn Register Passwordless	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	webauthn-register-passwordless	90
d1040cc4-2f9b-4ba6-a20e-6429ba1de6af	VERIFY_PROFILE	Verify Profile	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	VERIFY_PROFILE	100
62de7a07-e8df-4adc-9c09-e5a1e1236bf5	idp_link	Linking Identity Provider	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	t	f	idp_link	120
\.


--
-- Data for Name: resource_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_attribute (id, name, value, resource_id) FROM stdin;
\.


--
-- Data for Name: resource_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_policy (resource_id, policy_id) FROM stdin;
\.


--
-- Data for Name: resource_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_scope (resource_id, scope_id) FROM stdin;
\.


--
-- Data for Name: resource_server; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server (id, allow_rs_remote_mgmt, policy_enforce_mode, decision_strategy) FROM stdin;
\.


--
-- Data for Name: resource_server_perm_ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_perm_ticket (id, owner, requester, created_timestamp, granted_timestamp, resource_id, scope_id, resource_server_id, policy_id) FROM stdin;
\.


--
-- Data for Name: resource_server_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_policy (id, name, description, type, decision_strategy, logic, resource_server_id, owner) FROM stdin;
\.


--
-- Data for Name: resource_server_resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_resource (id, name, type, icon_uri, owner, resource_server_id, owner_managed_access, display_name) FROM stdin;
\.


--
-- Data for Name: resource_server_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_server_scope (id, name, icon_uri, resource_server_id, display_name) FROM stdin;
\.


--
-- Data for Name: resource_uris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_uris (resource_id, value) FROM stdin;
\.


--
-- Data for Name: revoked_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revoked_token (id, expire) FROM stdin;
\.


--
-- Data for Name: role_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_attribute (id, role_id, name, value) FROM stdin;
\.


--
-- Data for Name: scope_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope_mapping (client_id, role_id) FROM stdin;
a763a786-5146-4758-adcb-cabc363165c2	fa441f8c-f42c-4f4e-a79c-e819d5583a5e
a763a786-5146-4758-adcb-cabc363165c2	f22f73de-5497-469b-9294-4d23d06f68cf
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	73da43a9-9874-4864-97fc-1baae1fc6df4
3d1de6a6-e0ba-4008-8fc2-aa20aaa4f1c9	0b841103-371c-4673-83ac-81a0c6e75645
\.


--
-- Data for Name: scope_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope_policy (scope_id, policy_id) FROM stdin;
\.


--
-- Data for Name: server_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.server_config (server_config_key, value, version) FROM stdin;
\.


--
-- Data for Name: user_attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_attribute (name, value, user_id, id, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
is_temporary_admin	true	567e3de5-aa09-43bc-bc89-e4dad92f133a	a069d1dd-3771-4ccd-a633-35860c528087	\N	\N	\N
\.


--
-- Data for Name: user_consent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_consent (id, client_id, user_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- Data for Name: user_consent_client_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_consent_client_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- Data for Name: user_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_entity (id, email, email_constraint, email_verified, enabled, federation_link, first_name, last_name, realm_id, username, created_timestamp, service_account_client_link, not_before) FROM stdin;
567e3de5-aa09-43bc-bc89-e4dad92f133a	\N	29262c02-cff7-494f-8518-ea7231356fa2	f	t	\N	\N	\N	c36b20d9-63c7-4267-aa45-992c63e9c0a6	admin	1773329672014	\N	0
b4ba82f3-989d-40f0-8045-227c3a1dab51	georges.ayeni@epitech.eu	georges.ayeni@epitech.eu	f	t	\N	Georges	AYENI	d64d2eb6-9e54-4a4f-98f4-47bb9f16106d	georges	1773405541454	\N	0
\.


--
-- Data for Name: user_federation_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_config (user_federation_provider_id, value, name) FROM stdin;
\.


--
-- Data for Name: user_federation_mapper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_mapper (id, name, federation_provider_id, federation_mapper_type, realm_id) FROM stdin;
\.


--
-- Data for Name: user_federation_mapper_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_mapper_config (user_federation_mapper_id, value, name) FROM stdin;
\.


--
-- Data for Name: user_federation_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_federation_provider (id, changed_sync_period, display_name, full_sync_period, last_sync, priority, provider_name, realm_id) FROM stdin;
\.


--
-- Data for Name: user_group_membership; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_group_membership (group_id, user_id, membership_type) FROM stdin;
\.


--
-- Data for Name: user_required_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_required_action (user_id, required_action) FROM stdin;
\.


--
-- Data for Name: user_role_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role_mapping (role_id, user_id) FROM stdin;
e2a1fb6d-4257-4c9b-b108-7eacc839df2b	567e3de5-aa09-43bc-bc89-e4dad92f133a
f569cd43-b362-406c-aff0-f1232d37312a	567e3de5-aa09-43bc-bc89-e4dad92f133a
cc18f194-5ba2-42f3-b648-0f87e18af2cf	b4ba82f3-989d-40f0-8045-227c3a1dab51
\.


--
-- Data for Name: web_origins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.web_origins (client_id, value) FROM stdin;
e7b0ac03-2637-4526-94a8-17db9adc54b8	+
9c69ff2a-d5f5-4c20-bfa7-aea3754b9ba0	+
1bc6c6a0-5b07-44e2-80e9-da1180bdb98c	+
\.


--
-- Data for Name: workflow_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_state (execution_id, resource_id, workflow_id, resource_type, scheduled_step_id, scheduled_step_timestamp) FROM stdin;
\.


--
-- Name: org_domain ORG_DOMAIN_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_domain
    ADD CONSTRAINT "ORG_DOMAIN_pkey" PRIMARY KEY (id, name);


--
-- Name: org ORG_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT "ORG_pkey" PRIMARY KEY (id);


--
-- Name: server_config SERVER_CONFIG_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_config
    ADD CONSTRAINT "SERVER_CONFIG_pkey" PRIMARY KEY (server_config_key);


--
-- Name: keycloak_role UK_J3RWUVD56ONTGSUHOGM184WW2-2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT "UK_J3RWUVD56ONTGSUHOGM184WW2-2" UNIQUE (name, client_realm_constraint);


--
-- Name: client_auth_flow_bindings c_cli_flow_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_auth_flow_bindings
    ADD CONSTRAINT c_cli_flow_bind PRIMARY KEY (client_id, binding_name);


--
-- Name: client_scope_client c_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_client
    ADD CONSTRAINT c_cli_scope_bind PRIMARY KEY (client_id, scope_id);


--
-- Name: client_initial_access cnstr_client_init_acc_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT cnstr_client_init_acc_pk PRIMARY KEY (id);


--
-- Name: realm_default_groups con_group_id_def_groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT con_group_id_def_groups UNIQUE (group_id);


--
-- Name: broker_link constr_broker_link_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broker_link
    ADD CONSTRAINT constr_broker_link_pk PRIMARY KEY (identity_provider, user_id);


--
-- Name: component_config constr_component_config_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT constr_component_config_pk PRIMARY KEY (id);


--
-- Name: component constr_component_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT constr_component_pk PRIMARY KEY (id);


--
-- Name: fed_user_required_action constr_fed_required_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_required_action
    ADD CONSTRAINT constr_fed_required_action PRIMARY KEY (required_action, user_id);


--
-- Name: fed_user_attribute constr_fed_user_attr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_attribute
    ADD CONSTRAINT constr_fed_user_attr_pk PRIMARY KEY (id);


--
-- Name: fed_user_consent constr_fed_user_consent_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_consent
    ADD CONSTRAINT constr_fed_user_consent_pk PRIMARY KEY (id);


--
-- Name: fed_user_credential constr_fed_user_cred_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_credential
    ADD CONSTRAINT constr_fed_user_cred_pk PRIMARY KEY (id);


--
-- Name: fed_user_group_membership constr_fed_user_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_group_membership
    ADD CONSTRAINT constr_fed_user_group PRIMARY KEY (group_id, user_id);


--
-- Name: fed_user_role_mapping constr_fed_user_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_role_mapping
    ADD CONSTRAINT constr_fed_user_role PRIMARY KEY (role_id, user_id);


--
-- Name: federated_user constr_federated_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_user
    ADD CONSTRAINT constr_federated_user PRIMARY KEY (id);


--
-- Name: realm_default_groups constr_realm_default_groups; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT constr_realm_default_groups PRIMARY KEY (realm_id, group_id);


--
-- Name: realm_enabled_event_types constr_realm_enabl_event_types; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT constr_realm_enabl_event_types PRIMARY KEY (realm_id, value);


--
-- Name: realm_events_listeners constr_realm_events_listeners; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT constr_realm_events_listeners PRIMARY KEY (realm_id, value);


--
-- Name: realm_supported_locales constr_realm_supported_locales; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT constr_realm_supported_locales PRIMARY KEY (realm_id, value);


--
-- Name: identity_provider constraint_2b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT constraint_2b PRIMARY KEY (internal_id);


--
-- Name: client_attributes constraint_3c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT constraint_3c PRIMARY KEY (client_id, name);


--
-- Name: event_entity constraint_4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_entity
    ADD CONSTRAINT constraint_4 PRIMARY KEY (id);


--
-- Name: federated_identity constraint_40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT constraint_40 PRIMARY KEY (identity_provider, user_id);


--
-- Name: realm constraint_4a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT constraint_4a PRIMARY KEY (id);


--
-- Name: user_federation_provider constraint_5c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT constraint_5c PRIMARY KEY (id);


--
-- Name: client constraint_7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT constraint_7 PRIMARY KEY (id);


--
-- Name: scope_mapping constraint_81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT constraint_81 PRIMARY KEY (client_id, role_id);


--
-- Name: client_node_registrations constraint_84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT constraint_84 PRIMARY KEY (client_id, name);


--
-- Name: realm_attribute constraint_9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT constraint_9 PRIMARY KEY (name, realm_id);


--
-- Name: realm_required_credential constraint_92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT constraint_92 PRIMARY KEY (realm_id, type);


--
-- Name: keycloak_role constraint_a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT constraint_a PRIMARY KEY (id);


--
-- Name: admin_event_entity constraint_admin_event_entity; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_event_entity
    ADD CONSTRAINT constraint_admin_event_entity PRIMARY KEY (id);


--
-- Name: authenticator_config_entry constraint_auth_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config_entry
    ADD CONSTRAINT constraint_auth_cfg_pk PRIMARY KEY (authenticator_id, name);


--
-- Name: authentication_execution constraint_auth_exec_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT constraint_auth_exec_pk PRIMARY KEY (id);


--
-- Name: authentication_flow constraint_auth_flow_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT constraint_auth_flow_pk PRIMARY KEY (id);


--
-- Name: authenticator_config constraint_auth_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT constraint_auth_pk PRIMARY KEY (id);


--
-- Name: user_role_mapping constraint_c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT constraint_c PRIMARY KEY (role_id, user_id);


--
-- Name: composite_role constraint_composite_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT constraint_composite_role PRIMARY KEY (composite, child_role);


--
-- Name: identity_provider_config constraint_d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT constraint_d PRIMARY KEY (identity_provider_id, name);


--
-- Name: policy_config constraint_dpc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT constraint_dpc PRIMARY KEY (policy_id, name);


--
-- Name: realm_smtp_config constraint_e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT constraint_e PRIMARY KEY (realm_id, name);


--
-- Name: credential constraint_f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT constraint_f PRIMARY KEY (id);


--
-- Name: user_federation_config constraint_f9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT constraint_f9 PRIMARY KEY (user_federation_provider_id, name);


--
-- Name: resource_server_perm_ticket constraint_fapmt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT constraint_fapmt PRIMARY KEY (id);


--
-- Name: resource_server_resource constraint_farsr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT constraint_farsr PRIMARY KEY (id);


--
-- Name: resource_server_policy constraint_farsrp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT constraint_farsrp PRIMARY KEY (id);


--
-- Name: associated_policy constraint_farsrpap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT constraint_farsrpap PRIMARY KEY (policy_id, associated_policy_id);


--
-- Name: resource_policy constraint_farsrpp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT constraint_farsrpp PRIMARY KEY (resource_id, policy_id);


--
-- Name: resource_server_scope constraint_farsrs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT constraint_farsrs PRIMARY KEY (id);


--
-- Name: resource_scope constraint_farsrsp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT constraint_farsrsp PRIMARY KEY (resource_id, scope_id);


--
-- Name: scope_policy constraint_farsrsps; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT constraint_farsrsps PRIMARY KEY (scope_id, policy_id);


--
-- Name: user_entity constraint_fb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT constraint_fb PRIMARY KEY (id);


--
-- Name: user_federation_mapper_config constraint_fedmapper_cfg_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT constraint_fedmapper_cfg_pm PRIMARY KEY (user_federation_mapper_id, name);


--
-- Name: user_federation_mapper constraint_fedmapperpm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT constraint_fedmapperpm PRIMARY KEY (id);


--
-- Name: fed_user_consent_cl_scope constraint_fgrntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fed_user_consent_cl_scope
    ADD CONSTRAINT constraint_fgrntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- Name: user_consent_client_scope constraint_grntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT constraint_grntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- Name: user_consent constraint_grntcsnt_pm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT constraint_grntcsnt_pm PRIMARY KEY (id);


--
-- Name: keycloak_group constraint_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT constraint_group PRIMARY KEY (id);


--
-- Name: group_attribute constraint_group_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT constraint_group_attribute_pk PRIMARY KEY (id);


--
-- Name: group_role_mapping constraint_group_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT constraint_group_role PRIMARY KEY (role_id, group_id);


--
-- Name: identity_provider_mapper constraint_idpm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT constraint_idpm PRIMARY KEY (id);


--
-- Name: idp_mapper_config constraint_idpmconfig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT constraint_idpmconfig PRIMARY KEY (idp_mapper_id, name);


--
-- Name: jgroups_ping constraint_jgroups_ping; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jgroups_ping
    ADD CONSTRAINT constraint_jgroups_ping PRIMARY KEY (address);


--
-- Name: migration_model constraint_migmod; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_model
    ADD CONSTRAINT constraint_migmod PRIMARY KEY (id);


--
-- Name: offline_client_session constraint_offl_cl_ses_pk3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_client_session
    ADD CONSTRAINT constraint_offl_cl_ses_pk3 PRIMARY KEY (user_session_id, client_id, client_storage_provider, external_client_id, offline_flag);


--
-- Name: offline_user_session constraint_offl_us_ses_pk2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offline_user_session
    ADD CONSTRAINT constraint_offl_us_ses_pk2 PRIMARY KEY (user_session_id, offline_flag);


--
-- Name: org_invitation constraint_org_invitation; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_invitation
    ADD CONSTRAINT constraint_org_invitation PRIMARY KEY (id);


--
-- Name: protocol_mapper constraint_pcm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT constraint_pcm PRIMARY KEY (id);


--
-- Name: protocol_mapper_config constraint_pmconfig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT constraint_pmconfig PRIMARY KEY (protocol_mapper_id, name);


--
-- Name: redirect_uris constraint_redirect_uris; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT constraint_redirect_uris PRIMARY KEY (client_id, value);


--
-- Name: required_action_config constraint_req_act_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_config
    ADD CONSTRAINT constraint_req_act_cfg_pk PRIMARY KEY (required_action_id, name);


--
-- Name: required_action_provider constraint_req_act_prv_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT constraint_req_act_prv_pk PRIMARY KEY (id);


--
-- Name: user_required_action constraint_required_action; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT constraint_required_action PRIMARY KEY (required_action, user_id);


--
-- Name: resource_uris constraint_resour_uris_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT constraint_resour_uris_pk PRIMARY KEY (resource_id, value);


--
-- Name: role_attribute constraint_role_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT constraint_role_attribute_pk PRIMARY KEY (id);


--
-- Name: revoked_token constraint_rt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revoked_token
    ADD CONSTRAINT constraint_rt PRIMARY KEY (id);


--
-- Name: user_attribute constraint_user_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT constraint_user_attribute_pk PRIMARY KEY (id);


--
-- Name: user_group_membership constraint_user_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT constraint_user_group PRIMARY KEY (group_id, user_id);


--
-- Name: web_origins constraint_web_origins; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT constraint_web_origins PRIMARY KEY (client_id, value);


--
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- Name: client_scope_attributes pk_cl_tmpl_attr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT pk_cl_tmpl_attr PRIMARY KEY (scope_id, name);


--
-- Name: client_scope pk_cli_template; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT pk_cli_template PRIMARY KEY (id);


--
-- Name: resource_server pk_resource_server; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server
    ADD CONSTRAINT pk_resource_server PRIMARY KEY (id);


--
-- Name: client_scope_role_mapping pk_template_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT pk_template_scope PRIMARY KEY (scope_id, role_id);


--
-- Name: workflow_state pk_workflow_state; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_state
    ADD CONSTRAINT pk_workflow_state PRIMARY KEY (execution_id);


--
-- Name: default_client_scope r_def_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT r_def_cli_scope_bind PRIMARY KEY (realm_id, scope_id);


--
-- Name: realm_localizations realm_localizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_localizations
    ADD CONSTRAINT realm_localizations_pkey PRIMARY KEY (realm_id, locale);


--
-- Name: resource_attribute res_attr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT res_attr_pk PRIMARY KEY (id);


--
-- Name: keycloak_group sibling_names; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT sibling_names UNIQUE (realm_id, parent_group, name);


--
-- Name: identity_provider uk_2daelwnibji49avxsrtuf6xj33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT uk_2daelwnibji49avxsrtuf6xj33 UNIQUE (provider_alias, realm_id);


--
-- Name: client uk_b71cjlbenv945rb6gcon438at; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT uk_b71cjlbenv945rb6gcon438at UNIQUE (realm_id, client_id);


--
-- Name: client_scope uk_cli_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT uk_cli_scope UNIQUE (realm_id, name);


--
-- Name: user_entity uk_dykn684sl8up1crfei6eckhd7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_dykn684sl8up1crfei6eckhd7 UNIQUE (realm_id, email_constraint);


--
-- Name: user_consent uk_external_consent; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_external_consent UNIQUE (client_storage_provider, external_client_id, user_id);


--
-- Name: resource_server_resource uk_frsr6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5ha6 UNIQUE (name, owner, resource_server_id);


--
-- Name: resource_server_perm_ticket uk_frsr6t700s9v50bu18ws5pmt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5pmt UNIQUE (owner, requester, resource_server_id, resource_id, scope_id);


--
-- Name: resource_server_policy uk_frsrpt700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT uk_frsrpt700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- Name: resource_server_scope uk_frsrst700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT uk_frsrst700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- Name: user_consent uk_local_consent; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_local_consent UNIQUE (client_id, user_id);


--
-- Name: migration_model uk_migration_update_time; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_model
    ADD CONSTRAINT uk_migration_update_time UNIQUE (update_time);


--
-- Name: migration_model uk_migration_version; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_model
    ADD CONSTRAINT uk_migration_version UNIQUE (version);


--
-- Name: org uk_org_alias; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_alias UNIQUE (realm_id, alias);


--
-- Name: org uk_org_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_group UNIQUE (group_id);


--
-- Name: org_invitation uk_org_invitation_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_invitation
    ADD CONSTRAINT uk_org_invitation_email UNIQUE (organization_id, email);


--
-- Name: org uk_org_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_name UNIQUE (realm_id, name);


--
-- Name: realm uk_orvsdmla56612eaefiq6wl5oi; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT uk_orvsdmla56612eaefiq6wl5oi UNIQUE (name);


--
-- Name: user_entity uk_ru8tt6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_ru8tt6t700s9v50bu18ws5ha6 UNIQUE (realm_id, username);


--
-- Name: workflow_state uq_workflow_resource; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_state
    ADD CONSTRAINT uq_workflow_resource UNIQUE (workflow_id, resource_id);


--
-- Name: fed_user_attr_long_values; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fed_user_attr_long_values ON public.fed_user_attribute USING btree (long_value_hash, name);


--
-- Name: fed_user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fed_user_attr_long_values_lower_case ON public.fed_user_attribute USING btree (long_value_hash_lower_case, name);


--
-- Name: idx_admin_event_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_event_time ON public.admin_event_entity USING btree (realm_id, admin_event_time);


--
-- Name: idx_assoc_pol_assoc_pol_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assoc_pol_assoc_pol_id ON public.associated_policy USING btree (associated_policy_id);


--
-- Name: idx_auth_config_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_config_realm ON public.authenticator_config USING btree (realm_id);


--
-- Name: idx_auth_exec_flow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_exec_flow ON public.authentication_execution USING btree (flow_id);


--
-- Name: idx_auth_exec_realm_flow; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_exec_realm_flow ON public.authentication_execution USING btree (realm_id, flow_id);


--
-- Name: idx_auth_flow_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_flow_realm ON public.authentication_flow USING btree (realm_id);


--
-- Name: idx_broker_link_identity_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_broker_link_identity_provider ON public.broker_link USING btree (realm_id, identity_provider, broker_user_id);


--
-- Name: idx_broker_link_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_broker_link_user_id ON public.broker_link USING btree (user_id);


--
-- Name: idx_cl_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cl_clscope ON public.client_scope_client USING btree (scope_id);


--
-- Name: idx_client_att_by_name_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_att_by_name_value ON public.client_attributes USING btree (name, substr(value, 1, 255));


--
-- Name: idx_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_id ON public.client USING btree (client_id);


--
-- Name: idx_client_init_acc_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_init_acc_realm ON public.client_initial_access USING btree (realm_id);


--
-- Name: idx_clscope_attrs; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_attrs ON public.client_scope_attributes USING btree (scope_id);


--
-- Name: idx_clscope_cl; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_cl ON public.client_scope_client USING btree (client_id);


--
-- Name: idx_clscope_protmap; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_protmap ON public.protocol_mapper USING btree (client_scope_id);


--
-- Name: idx_clscope_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clscope_role ON public.client_scope_role_mapping USING btree (scope_id);


--
-- Name: idx_compo_config_compo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_compo_config_compo ON public.component_config USING btree (component_id);


--
-- Name: idx_component_provider_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_provider_type ON public.component USING btree (provider_type);


--
-- Name: idx_component_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_component_realm ON public.component USING btree (realm_id);


--
-- Name: idx_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_composite ON public.composite_role USING btree (composite);


--
-- Name: idx_composite_child; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_composite_child ON public.composite_role USING btree (child_role);


--
-- Name: idx_defcls_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_defcls_realm ON public.default_client_scope USING btree (realm_id);


--
-- Name: idx_defcls_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_defcls_scope ON public.default_client_scope USING btree (scope_id);


--
-- Name: idx_event_entity_user_id_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_entity_user_id_type ON public.event_entity USING btree (user_id, type, event_time);


--
-- Name: idx_event_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_time ON public.event_entity USING btree (realm_id, event_time);


--
-- Name: idx_fedidentity_feduser; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fedidentity_feduser ON public.federated_identity USING btree (federated_user_id);


--
-- Name: idx_fedidentity_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fedidentity_user ON public.federated_identity USING btree (user_id);


--
-- Name: idx_fu_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_attribute ON public.fed_user_attribute USING btree (user_id, realm_id, name);


--
-- Name: idx_fu_cnsnt_ext; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_cnsnt_ext ON public.fed_user_consent USING btree (user_id, client_storage_provider, external_client_id);


--
-- Name: idx_fu_consent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_consent ON public.fed_user_consent USING btree (user_id, client_id);


--
-- Name: idx_fu_consent_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_consent_ru ON public.fed_user_consent USING btree (realm_id, user_id);


--
-- Name: idx_fu_credential; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_credential ON public.fed_user_credential USING btree (user_id, type);


--
-- Name: idx_fu_credential_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_credential_ru ON public.fed_user_credential USING btree (realm_id, user_id);


--
-- Name: idx_fu_group_membership; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_group_membership ON public.fed_user_group_membership USING btree (user_id, group_id);


--
-- Name: idx_fu_group_membership_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_group_membership_ru ON public.fed_user_group_membership USING btree (realm_id, user_id);


--
-- Name: idx_fu_required_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_required_action ON public.fed_user_required_action USING btree (user_id, required_action);


--
-- Name: idx_fu_required_action_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_required_action_ru ON public.fed_user_required_action USING btree (realm_id, user_id);


--
-- Name: idx_fu_role_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_role_mapping ON public.fed_user_role_mapping USING btree (user_id, role_id);


--
-- Name: idx_fu_role_mapping_ru; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fu_role_mapping_ru ON public.fed_user_role_mapping USING btree (realm_id, user_id);


--
-- Name: idx_group_att_by_name_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_att_by_name_value ON public.group_attribute USING btree (name, ((value)::character varying(250)));


--
-- Name: idx_group_attr_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_attr_group ON public.group_attribute USING btree (group_id);


--
-- Name: idx_group_role_mapp_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_group_role_mapp_group ON public.group_role_mapping USING btree (group_id);


--
-- Name: idx_id_prov_mapp_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_id_prov_mapp_realm ON public.identity_provider_mapper USING btree (realm_id);


--
-- Name: idx_ident_prov_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ident_prov_realm ON public.identity_provider USING btree (realm_id);


--
-- Name: idx_idp_for_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idp_for_login ON public.identity_provider USING btree (realm_id, enabled, link_only, hide_on_login, organization_id);


--
-- Name: idx_idp_realm_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_idp_realm_org ON public.identity_provider USING btree (realm_id, organization_id);


--
-- Name: idx_keycloak_role_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keycloak_role_client ON public.keycloak_role USING btree (client);


--
-- Name: idx_keycloak_role_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keycloak_role_realm ON public.keycloak_role USING btree (realm);


--
-- Name: idx_offline_css_by_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_css_by_client ON public.offline_client_session USING btree (client_id, offline_flag) WHERE ((client_id)::text <> 'external'::text);


--
-- Name: idx_offline_css_by_client_storage_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_css_by_client_storage_provider ON public.offline_client_session USING btree (client_storage_provider, external_client_id, offline_flag) WHERE ((client_storage_provider)::text <> 'internal'::text);


--
-- Name: idx_offline_uss_by_broker_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_broker_session_id ON public.offline_user_session USING btree (broker_session_id, realm_id);


--
-- Name: idx_offline_uss_by_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offline_uss_by_user ON public.offline_user_session USING btree (user_id, realm_id, offline_flag);


--
-- Name: idx_org_domain_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_domain_org_id ON public.org_domain USING btree (org_id);


--
-- Name: idx_org_invitation_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_invitation_email ON public.org_invitation USING btree (email);


--
-- Name: idx_org_invitation_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_invitation_expires ON public.org_invitation USING btree (expires_at);


--
-- Name: idx_org_invitation_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_invitation_org_id ON public.org_invitation USING btree (organization_id);


--
-- Name: idx_perm_ticket_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perm_ticket_owner ON public.resource_server_perm_ticket USING btree (owner);


--
-- Name: idx_perm_ticket_requester; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perm_ticket_requester ON public.resource_server_perm_ticket USING btree (requester);


--
-- Name: idx_protocol_mapper_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_protocol_mapper_client ON public.protocol_mapper USING btree (client_id);


--
-- Name: idx_realm_attr_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_attr_realm ON public.realm_attribute USING btree (realm_id);


--
-- Name: idx_realm_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_clscope ON public.client_scope USING btree (realm_id);


--
-- Name: idx_realm_def_grp_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_def_grp_realm ON public.realm_default_groups USING btree (realm_id);


--
-- Name: idx_realm_evt_list_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_evt_list_realm ON public.realm_events_listeners USING btree (realm_id);


--
-- Name: idx_realm_evt_types_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_evt_types_realm ON public.realm_enabled_event_types USING btree (realm_id);


--
-- Name: idx_realm_master_adm_cli; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_master_adm_cli ON public.realm USING btree (master_admin_client);


--
-- Name: idx_realm_supp_local_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_realm_supp_local_realm ON public.realm_supported_locales USING btree (realm_id);


--
-- Name: idx_redir_uri_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_redir_uri_client ON public.redirect_uris USING btree (client_id);


--
-- Name: idx_req_act_prov_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_req_act_prov_realm ON public.required_action_provider USING btree (realm_id);


--
-- Name: idx_res_policy_policy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_policy_policy ON public.resource_policy USING btree (policy_id);


--
-- Name: idx_res_scope_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_scope_scope ON public.resource_scope USING btree (scope_id);


--
-- Name: idx_res_serv_pol_res_serv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_serv_pol_res_serv ON public.resource_server_policy USING btree (resource_server_id);


--
-- Name: idx_res_srv_res_res_srv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_srv_res_res_srv ON public.resource_server_resource USING btree (resource_server_id);


--
-- Name: idx_res_srv_scope_res_srv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_srv_scope_res_srv ON public.resource_server_scope USING btree (resource_server_id);


--
-- Name: idx_rev_token_on_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rev_token_on_expire ON public.revoked_token USING btree (expire);


--
-- Name: idx_role_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_attribute ON public.role_attribute USING btree (role_id);


--
-- Name: idx_role_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_clscope ON public.client_scope_role_mapping USING btree (role_id);


--
-- Name: idx_scope_mapping_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scope_mapping_role ON public.scope_mapping USING btree (role_id);


--
-- Name: idx_scope_policy_policy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scope_policy_policy ON public.scope_policy USING btree (policy_id);


--
-- Name: idx_update_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_update_time ON public.migration_model USING btree (update_time);


--
-- Name: idx_usconsent_clscope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usconsent_clscope ON public.user_consent_client_scope USING btree (user_consent_id);


--
-- Name: idx_usconsent_scope_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usconsent_scope_id ON public.user_consent_client_scope USING btree (scope_id);


--
-- Name: idx_user_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_attribute ON public.user_attribute USING btree (user_id);


--
-- Name: idx_user_attribute_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_attribute_name ON public.user_attribute USING btree (name, value);


--
-- Name: idx_user_consent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_consent ON public.user_consent USING btree (user_id);


--
-- Name: idx_user_credential; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_credential ON public.credential USING btree (user_id);


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_email ON public.user_entity USING btree (email);


--
-- Name: idx_user_group_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_group_mapping ON public.user_group_membership USING btree (user_id);


--
-- Name: idx_user_reqactions; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_reqactions ON public.user_required_action USING btree (user_id);


--
-- Name: idx_user_role_mapping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_role_mapping ON public.user_role_mapping USING btree (user_id);


--
-- Name: idx_user_service_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_service_account ON public.user_entity USING btree (realm_id, service_account_client_link);


--
-- Name: idx_user_session_expiration_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_session_expiration_created ON public.offline_user_session USING btree (realm_id, offline_flag, remember_me, created_on, user_session_id, user_id);


--
-- Name: idx_user_session_expiration_last_refresh; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_session_expiration_last_refresh ON public.offline_user_session USING btree (realm_id, offline_flag, remember_me, last_session_refresh, user_session_id, user_id);


--
-- Name: idx_usr_fed_map_fed_prv; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_map_fed_prv ON public.user_federation_mapper USING btree (federation_provider_id);


--
-- Name: idx_usr_fed_map_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_map_realm ON public.user_federation_mapper USING btree (realm_id);


--
-- Name: idx_usr_fed_prv_realm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usr_fed_prv_realm ON public.user_federation_provider USING btree (realm_id);


--
-- Name: idx_web_orig_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_web_orig_client ON public.web_origins USING btree (client_id);


--
-- Name: idx_workflow_state_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_state_provider ON public.workflow_state USING btree (resource_id);


--
-- Name: idx_workflow_state_step; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflow_state_step ON public.workflow_state USING btree (workflow_id, scheduled_step_id);


--
-- Name: user_attr_long_values; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_attr_long_values ON public.user_attribute USING btree (long_value_hash, name);


--
-- Name: user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_attr_long_values_lower_case ON public.user_attribute USING btree (long_value_hash_lower_case, name);


--
-- Name: identity_provider fk2b4ebc52ae5c3b34; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT fk2b4ebc52ae5c3b34 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: client_attributes fk3c47c64beacca966; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT fk3c47c64beacca966 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: federated_identity fk404288b92ef007a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT fk404288b92ef007a6 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: client_node_registrations fk4129723ba992f594; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT fk4129723ba992f594 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: redirect_uris fk_1burs8pb4ouj97h5wuppahv9f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT fk_1burs8pb4ouj97h5wuppahv9f FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: user_federation_provider fk_1fj32f6ptolw2qy60cd8n01e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT fk_1fj32f6ptolw2qy60cd8n01e8 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_required_credential fk_5hg65lybevavkqfki3kponh9v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT fk_5hg65lybevavkqfki3kponh9v FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: resource_attribute fk_5hrm2vlf9ql5fu022kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu022kqepovbr FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: user_attribute fk_5hrm2vlf9ql5fu043kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu043kqepovbr FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: user_required_action fk_6qj3w1jw9cvafhe19bwsiuvmd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT fk_6qj3w1jw9cvafhe19bwsiuvmd FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: keycloak_role fk_6vyqfe4cn4wlq8r6kt5vdsj5c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT fk_6vyqfe4cn4wlq8r6kt5vdsj5c FOREIGN KEY (realm) REFERENCES public.realm(id);


--
-- Name: realm_smtp_config fk_70ej8xdxgxd0b9hh6180irr0o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT fk_70ej8xdxgxd0b9hh6180irr0o FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_attribute fk_8shxd6l3e9atqukacxgpffptw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT fk_8shxd6l3e9atqukacxgpffptw FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: composite_role fk_a63wvekftu8jo1pnj81e7mce2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_a63wvekftu8jo1pnj81e7mce2 FOREIGN KEY (composite) REFERENCES public.keycloak_role(id);


--
-- Name: authentication_execution fk_auth_exec_flow; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_flow FOREIGN KEY (flow_id) REFERENCES public.authentication_flow(id);


--
-- Name: authentication_execution fk_auth_exec_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: authentication_flow fk_auth_flow_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT fk_auth_flow_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: authenticator_config fk_auth_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT fk_auth_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: user_role_mapping fk_c4fqv34p1mbylloxang7b1q3l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT fk_c4fqv34p1mbylloxang7b1q3l FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: client_scope_attributes fk_cl_scope_attr_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT fk_cl_scope_attr_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- Name: client_scope_role_mapping fk_cl_scope_rm_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT fk_cl_scope_rm_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- Name: protocol_mapper fk_cli_scope_mapper; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_cli_scope_mapper FOREIGN KEY (client_scope_id) REFERENCES public.client_scope(id);


--
-- Name: client_initial_access fk_client_init_acc_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT fk_client_init_acc_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: component_config fk_component_config; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT fk_component_config FOREIGN KEY (component_id) REFERENCES public.component(id);


--
-- Name: component fk_component_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT fk_component_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_default_groups fk_def_groups_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT fk_def_groups_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: user_federation_mapper_config fk_fedmapper_cfg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT fk_fedmapper_cfg FOREIGN KEY (user_federation_mapper_id) REFERENCES public.user_federation_mapper(id);


--
-- Name: user_federation_mapper fk_fedmapperpm_fedprv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_fedprv FOREIGN KEY (federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- Name: user_federation_mapper fk_fedmapperpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: associated_policy fk_frsr5s213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsr5s213xcx4wnkog82ssrfy FOREIGN KEY (associated_policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: scope_policy fk_frsrasp13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrasp13xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog82sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82sspmt FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: resource_server_resource fk_frsrho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog83sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog83sspmt FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog84sspmt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog84sspmt FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- Name: associated_policy fk_frsrpas14xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsrpas14xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: scope_policy fk_frsrpass3xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrpass3xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- Name: resource_server_perm_ticket fk_frsrpo2128cx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrpo2128cx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: resource_server_policy fk_frsrpo213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT fk_frsrpo213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: resource_scope fk_frsrpos13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrpos13xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: resource_policy fk_frsrpos53xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpos53xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: resource_policy fk_frsrpp213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpp213xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: resource_scope fk_frsrps213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrps213xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- Name: resource_server_scope fk_frsrso213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT fk_frsrso213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: composite_role fk_gr7thllb9lu8q4vqa4524jjy8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_gr7thllb9lu8q4vqa4524jjy8 FOREIGN KEY (child_role) REFERENCES public.keycloak_role(id);


--
-- Name: user_consent_client_scope fk_grntcsnt_clsc_usc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT fk_grntcsnt_clsc_usc FOREIGN KEY (user_consent_id) REFERENCES public.user_consent(id);


--
-- Name: user_consent fk_grntcsnt_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT fk_grntcsnt_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: group_attribute fk_group_attribute_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT fk_group_attribute_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- Name: group_role_mapping fk_group_role_group; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT fk_group_role_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- Name: realm_enabled_event_types fk_h846o4h0w8epx5nwedrf5y69j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT fk_h846o4h0w8epx5nwedrf5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_events_listeners fk_h846o4h0w8epx5nxev9f5y69j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT fk_h846o4h0w8epx5nxev9f5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: identity_provider_mapper fk_idpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT fk_idpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: idp_mapper_config fk_idpmconfig; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT fk_idpmconfig FOREIGN KEY (idp_mapper_id) REFERENCES public.identity_provider_mapper(id);


--
-- Name: web_origins fk_lojpho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT fk_lojpho213xcx4wnkog82ssrfy FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: org_invitation fk_org_invitation_org; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_invitation
    ADD CONSTRAINT fk_org_invitation_org FOREIGN KEY (organization_id) REFERENCES public.org(id) ON DELETE CASCADE;


--
-- Name: scope_mapping fk_ouse064plmlr732lxjcn1q5f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT fk_ouse064plmlr732lxjcn1q5f1 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: protocol_mapper fk_pcm_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_pcm_realm FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: credential fk_pfyr0glasqyl0dei3kl69r6v0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT fk_pfyr0glasqyl0dei3kl69r6v0 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: protocol_mapper_config fk_pmconfig; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT fk_pmconfig FOREIGN KEY (protocol_mapper_id) REFERENCES public.protocol_mapper(id);


--
-- Name: default_client_scope fk_r_def_cli_scope_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT fk_r_def_cli_scope_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: required_action_provider fk_req_act_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT fk_req_act_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: resource_uris fk_resource_server_uris; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT fk_resource_server_uris FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: role_attribute fk_role_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT fk_role_attribute_id FOREIGN KEY (role_id) REFERENCES public.keycloak_role(id);


--
-- Name: realm_supported_locales fk_supported_locales_realm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT fk_supported_locales_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: user_federation_config fk_t13hpu1j94r2ebpekr39x5eu5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT fk_t13hpu1j94r2ebpekr39x5eu5 FOREIGN KEY (user_federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- Name: user_group_membership fk_user_group_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: policy_config fkdc34197cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT fkdc34197cf864c4e43 FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: identity_provider_config fkdc4897cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT fkdc4897cf864c4e43 FOREIGN KEY (identity_provider_id) REFERENCES public.identity_provider(internal_id);


--
-- PostgreSQL database dump complete
--

\unrestrict sabWW2tLObuaHVJnFlUjPpY68iWaMJePkBDHxR7WlgrEBMHMgAQpOt8xUyp6zcv

