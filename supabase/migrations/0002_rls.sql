-- =====================================================================
-- InSilico Collab — Row Level Security (RLS)
-- Jalankan SETELAH 0001_init.sql
-- =====================================================================

-- Helper: apakah user anggota proyek?
create or replace function is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- Helper: apakah user owner proyek?
create or replace function is_project_owner(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from projects
    where id = p_project_id and owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- UNIVERSITIES — publik dibaca
-- ---------------------------------------------------------------------
alter table universities enable row level security;
create policy "universities readable by all"
  on universities for select using (true);

-- ---------------------------------------------------------------------
-- PROFILES — publik dibaca, hanya pemilik yang ubah
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
create policy "profiles readable by all"
  on profiles for select using (true);
create policy "user updates own profile"
  on profiles for update using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- PROJECTS — semua bisa lihat (untuk board), hanya owner yang kelola
-- ---------------------------------------------------------------------
alter table projects enable row level security;
create policy "projects readable by all"
  on projects for select using (true);
create policy "authenticated can create project"
  on projects for insert with check (auth.uid() = owner_id);
create policy "owner updates project"
  on projects for update using (auth.uid() = owner_id);
create policy "owner deletes project"
  on projects for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------
-- PROJECT MEMBERS — anggota proyek bisa lihat; owner kelola
-- ---------------------------------------------------------------------
alter table project_members enable row level security;
create policy "members readable by all"
  on project_members for select using (true);
create policy "owner manages members"
  on project_members for insert with check (is_project_owner(project_id));
create policy "owner removes members"
  on project_members for delete using (is_project_owner(project_id) or auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- APPLICATIONS — pelamar & owner bisa lihat
-- ---------------------------------------------------------------------
alter table applications enable row level security;
create policy "applicant or owner reads"
  on applications for select
  using (auth.uid() = applicant_id or is_project_owner(project_id));
create policy "user applies"
  on applications for insert with check (auth.uid() = applicant_id);
create policy "owner updates application status"
  on applications for update using (is_project_owner(project_id));
create policy "applicant withdraws"
  on applications for delete using (auth.uid() = applicant_id);

-- ---------------------------------------------------------------------
-- RESEARCH STAGES — anggota baca; anggota kelola
-- ---------------------------------------------------------------------
alter table research_stages enable row level security;
create policy "members read stages"
  on research_stages for select using (is_project_member(project_id));
create policy "members manage stages"
  on research_stages for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

-- ---------------------------------------------------------------------
-- DATA TABLES — akses lewat stage → project
-- ---------------------------------------------------------------------
alter table data_tables enable row level security;
create policy "members read data tables"
  on data_tables for select
  using (is_project_member((select project_id from research_stages s where s.id = stage_id)));
create policy "members manage data tables"
  on data_tables for all
  using (is_project_member((select project_id from research_stages s where s.id = stage_id)))
  with check (is_project_member((select project_id from research_stages s where s.id = stage_id)));

-- ---------------------------------------------------------------------
-- DATA ROWS — akses lewat data_table → stage → project
-- ---------------------------------------------------------------------
alter table data_rows enable row level security;
create policy "members read data rows"
  on data_rows for select
  using (is_project_member(
    (select s.project_id from data_tables t join research_stages s on s.id = t.stage_id where t.id = table_id)
  ));
create policy "members manage data rows"
  on data_rows for all
  using (is_project_member(
    (select s.project_id from data_tables t join research_stages s on s.id = t.stage_id where t.id = table_id)
  ))
  with check (is_project_member(
    (select s.project_id from data_tables t join research_stages s on s.id = t.stage_id where t.id = table_id)
  ));

-- ---------------------------------------------------------------------
-- TASKS — anggota proyek
-- ---------------------------------------------------------------------
alter table tasks enable row level security;
create policy "members read tasks"
  on tasks for select using (is_project_member(project_id));
create policy "members manage tasks"
  on tasks for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

-- ---------------------------------------------------------------------
-- CHAT MESSAGES — hanya anggota proyek
-- ---------------------------------------------------------------------
alter table chat_messages enable row level security;
create policy "members read chat"
  on chat_messages for select using (is_project_member(project_id));
create policy "members send chat"
  on chat_messages for insert
  with check (is_project_member(project_id) and auth.uid() = sender_id);
