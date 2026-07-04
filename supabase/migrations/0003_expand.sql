-- =====================================================================
-- InSilico Collab — Ekspansi skema (metode, tool, reprodusibilitas,
-- referensi, lampiran, komentar, notifikasi, manuskrip, activity log)
-- Jalankan SETELAH 0002_rls.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- ENUM baru & perluasan enum lama
-- ---------------------------------------------------------------------
create type stage_status      as enum ('not_started', 'in_progress', 'done', 'blocked');
create type task_priority     as enum ('low', 'medium', 'high');
create type manuscript_status as enum ('draft', 'submitted', 'revision', 'accepted', 'rejected');

-- Perluas member_role (owner/member) menjadi + co_lead/viewer
alter type member_role add value if not exists 'co_lead';
alter type member_role add value if not exists 'viewer';

-- ---------------------------------------------------------------------
-- Perluas research_stages
-- ---------------------------------------------------------------------
alter table research_stages
  add column if not exists status          stage_status not null default 'not_started',
  add column if not exists method_key      text,
  add column if not exists suggested_tools text[] not null default '{}',
  add column if not exists param_checklist jsonb  not null default '[]'::jsonb;

-- Selaraskan status dengan is_done yang sudah ada
update research_stages set status = 'done' where is_done = true and status = 'not_started';

-- ---------------------------------------------------------------------
-- Perluas tasks (prioritas & urutan kanban)
-- ---------------------------------------------------------------------
alter table tasks
  add column if not exists priority task_priority not null default 'medium',
  add column if not exists position int not null default 0;

-- ---------------------------------------------------------------------
-- METHOD TEMPLATES (katalog metode in silico)
-- ---------------------------------------------------------------------
create table if not exists method_templates (
  id             uuid primary key default uuid_generate_v4(),
  key            text not null unique,
  name           text not null,
  category       text not null default 'General',
  description    text,
  default_stages jsonb not null default '[]'::jsonb,
  suggested_tools text[] not null default '{}',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TOOLS (registry tool in silico)
-- ---------------------------------------------------------------------
create table if not exists tools (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  category    text not null default 'General',
  description text,
  stages      text[] not null default '{}',
  url         text,
  license     text not null default 'free',
  tips        text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PROJECT METHODS (metode yang dipakai proyek)
-- ---------------------------------------------------------------------
create table if not exists project_methods (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  method_key  text not null,
  method_name text not null,
  created_at  timestamptz not null default now(),
  unique (project_id, method_key)
);
create index if not exists idx_project_methods_project on project_methods(project_id);

-- ---------------------------------------------------------------------
-- STAGE REPRODUCIBILITY (catatan reprodusibilitas per stage)
-- ---------------------------------------------------------------------
create table if not exists stage_reproducibility (
  id           uuid primary key default uuid_generate_v4(),
  stage_id     uuid not null references research_stages(id) on delete cascade,
  tool_name    text,
  tool_version text,
  os_hardware  text,
  parameters   text,
  input_link   text,
  output_link  text,
  notes        text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_repro_stage on stage_reproducibility(stage_id);

-- ---------------------------------------------------------------------
-- REFERENCES (manajer referensi per proyek)  (nama tabel di-quote)
-- ---------------------------------------------------------------------
create table if not exists "references" (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  authors     text,
  year        int,
  journal     text,
  doi         text,
  url         text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_references_project on "references"(project_id);

-- ---------------------------------------------------------------------
-- ATTACHMENTS (lampiran per stage — file storage / tautan eksternal)
-- ---------------------------------------------------------------------
create table if not exists attachments (
  id          uuid primary key default uuid_generate_v4(),
  stage_id    uuid not null references research_stages(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  label       text not null,
  url         text not null,
  kind        text not null default 'link',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_attachments_stage on attachments(stage_id);

-- ---------------------------------------------------------------------
-- COMMENTS (diskusi ber-thread level stage)
-- ---------------------------------------------------------------------
create table if not exists comments (
  id          uuid primary key default uuid_generate_v4(),
  stage_id    uuid not null references research_stages(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_comments_stage on comments(stage_id, created_at);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (in-app)
-- ---------------------------------------------------------------------
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null default 'system',
  title       text not null,
  body        text,
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id, is_read, created_at);

-- ---------------------------------------------------------------------
-- MANUSCRIPT (pipeline publikasi — 1:1 proyek)
-- ---------------------------------------------------------------------
create table if not exists manuscript (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid not null references projects(id) on delete cascade unique,
  target_journal text,
  status         manuscript_status not null default 'draft',
  authors        jsonb not null default '[]'::jsonb,
  checklist      jsonb not null default '[]'::jsonb,
  methods_draft  text,
  results_draft  text,
  abstract_draft text,
  updated_at     timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ACTIVITY LOG (audit ringan per proyek)
-- ---------------------------------------------------------------------
create table if not exists activity_log (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_activity_project on activity_log(project_id, created_at);

-- Realtime untuk komentar & notifikasi
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table notifications;
