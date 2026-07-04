-- =====================================================================
-- InSilico Collab — Skema inti
-- Jalankan di Supabase SQL Editor (atau supabase db push)
-- =====================================================================

-- Ekstensi
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- ENUM
-- ---------------------------------------------------------------------
create type project_status   as enum ('open', 'in_progress', 'completed', 'archived');
create type member_role      as enum ('owner', 'member');
create type application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type task_status       as enum ('todo', 'in_progress', 'review', 'done');

-- ---------------------------------------------------------------------
-- UNIVERSITIES (referensi)
-- ---------------------------------------------------------------------
create table universities (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  city        text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PROFILES (1:1 dengan auth.users)
-- ---------------------------------------------------------------------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  university_id uuid references universities(id) on delete set null,
  study_program text,                       -- mis. "Pendidikan Dokter"
  semester      int,
  bio           text,
  interests     text[] default '{}',         -- mis. {'Molecular Docking','Network Pharmacology'}
  skills        text[] default '{}',         -- mis. {'AutoDock','Cytoscape','R'}
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Buat profil otomatis saat user baru mendaftar
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------------------
create table projects (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  title         text not null,
  description   text,
  field         text,                         -- bidang in silico
  required_roles text[] default '{}',         -- posisi yang dicari
  max_members   int default 5,
  status        project_status not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_projects_status on projects(status);
create index idx_projects_owner  on projects(owner_id);

-- ---------------------------------------------------------------------
-- PROJECT MEMBERS
-- ---------------------------------------------------------------------
create table project_members (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        member_role not null default 'member',
  position    text,                            -- mis. "Docking Lead"
  joined_at   timestamptz not null default now(),
  unique (project_id, user_id)
);
create index idx_members_project on project_members(project_id);
create index idx_members_user    on project_members(user_id);

-- Owner otomatis jadi anggota saat proyek dibuat
create or replace function handle_new_project()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role, position)
  values (new.id, new.owner_id, 'owner', 'Principal Investigator');
  return new;
end;
$$;

create trigger on_project_created
  after insert on projects
  for each row execute function handle_new_project();

-- ---------------------------------------------------------------------
-- APPLICATIONS (lamaran join)
-- ---------------------------------------------------------------------
create table applications (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  applicant_id uuid not null references profiles(id) on delete cascade,
  message     text,
  status      application_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (project_id, applicant_id)
);
create index idx_applications_project on applications(project_id);

-- ---------------------------------------------------------------------
-- RESEARCH STAGES (tahapan in silico)
-- ---------------------------------------------------------------------
create table research_stages (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  description text,
  position    int not null default 0,         -- urutan tampil
  is_done     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index idx_stages_project on research_stages(project_id);

-- ---------------------------------------------------------------------
-- DATA TABLES (tabel tabulasi per tahap)
-- Kolom dinamis disimpan sebagai JSON: [{ "key": "compound", "label": "Senyawa", "type": "text" }]
-- ---------------------------------------------------------------------
create table data_tables (
  id          uuid primary key default uuid_generate_v4(),
  stage_id    uuid not null references research_stages(id) on delete cascade,
  name        text not null,
  columns     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create index idx_datatables_stage on data_tables(stage_id);

-- ---------------------------------------------------------------------
-- DATA ROWS (baris data + sumber)
-- values: { "compound": "Quercetin", "binding_affinity": "-8.2" }
-- ---------------------------------------------------------------------
create table data_rows (
  id          uuid primary key default uuid_generate_v4(),
  table_id    uuid not null references data_tables(id) on delete cascade,
  values      jsonb not null default '{}'::jsonb,
  source_label text,                           -- nama sumber/referensi
  source_url  text,                            -- DOI / tautan
  position    int not null default 0,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_datarows_table on data_rows(table_id);

-- ---------------------------------------------------------------------
-- TASKS (pembagian tugas — disiapkan untuk roadmap)
-- ---------------------------------------------------------------------
create table tasks (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references projects(id) on delete cascade,
  stage_id     uuid references research_stages(id) on delete set null,
  title        text not null,
  description  text,
  assignee_id  uuid references profiles(id) on delete set null,
  status       task_status not null default 'todo',
  due_date     date,
  created_at   timestamptz not null default now()
);
create index idx_tasks_project on tasks(project_id);

-- ---------------------------------------------------------------------
-- CHAT MESSAGES (group chat per proyek)
-- ---------------------------------------------------------------------
create table chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);
create index idx_chat_project on chat_messages(project_id, created_at);

-- Aktifkan realtime untuk chat & kolaborasi data
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table data_rows;
