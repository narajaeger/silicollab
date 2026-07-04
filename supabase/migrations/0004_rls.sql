-- =====================================================================
-- InSilico Collab — RLS untuk tabel ekspansi
-- Jalankan SETELAH 0003_expand.sql
-- =====================================================================

-- Helper: apakah user anggota proyek pemilik stage tertentu?
create or replace function is_stage_member(p_stage_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select is_project_member(
    (select project_id from research_stages where id = p_stage_id)
  );
$$;

-- ---------------------------------------------------------------------
-- METHOD TEMPLATES & TOOLS — referensi publik (baca semua)
-- ---------------------------------------------------------------------
alter table method_templates enable row level security;
create policy "method templates readable by all"
  on method_templates for select using (true);

alter table tools enable row level security;
create policy "tools readable by all"
  on tools for select using (true);

-- ---------------------------------------------------------------------
-- PROJECT METHODS — anggota proyek
-- ---------------------------------------------------------------------
alter table project_methods enable row level security;
create policy "members read project methods"
  on project_methods for select using (is_project_member(project_id));
create policy "members manage project methods"
  on project_methods for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

-- ---------------------------------------------------------------------
-- STAGE REPRODUCIBILITY — anggota proyek pemilik stage
-- ---------------------------------------------------------------------
alter table stage_reproducibility enable row level security;
create policy "members read repro"
  on stage_reproducibility for select using (is_stage_member(stage_id));
create policy "members manage repro"
  on stage_reproducibility for all
  using (is_stage_member(stage_id))
  with check (is_stage_member(stage_id));

-- ---------------------------------------------------------------------
-- REFERENCES — anggota proyek
-- ---------------------------------------------------------------------
alter table "references" enable row level security;
create policy "members read references"
  on "references" for select using (is_project_member(project_id));
create policy "members manage references"
  on "references" for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

-- ---------------------------------------------------------------------
-- ATTACHMENTS — anggota proyek
-- ---------------------------------------------------------------------
alter table attachments enable row level security;
create policy "members read attachments"
  on attachments for select using (is_project_member(project_id));
create policy "members manage attachments"
  on attachments for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

-- ---------------------------------------------------------------------
-- COMMENTS — anggota proyek; hanya penulis yang menghapus/ubah
-- ---------------------------------------------------------------------
alter table comments enable row level security;
create policy "members read comments"
  on comments for select using (is_project_member(project_id));
create policy "members write comments"
  on comments for insert
  with check (is_project_member(project_id) and auth.uid() = author_id);
create policy "author updates comment"
  on comments for update using (auth.uid() = author_id);
create policy "author deletes comment"
  on comments for delete using (auth.uid() = author_id);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS — user membaca/ubah miliknya; anggota lain boleh membuat
-- (mis. owner menotifikasi anggota, atau sistem)
-- ---------------------------------------------------------------------
alter table notifications enable row level security;
create policy "user reads own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "authenticated creates notification"
  on notifications for insert with check (auth.uid() is not null);
create policy "user updates own notifications"
  on notifications for update using (auth.uid() = user_id);
create policy "user deletes own notifications"
  on notifications for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- MANUSCRIPT — anggota proyek
-- ---------------------------------------------------------------------
alter table manuscript enable row level security;
create policy "members read manuscript"
  on manuscript for select using (is_project_member(project_id));
create policy "members manage manuscript"
  on manuscript for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

-- ---------------------------------------------------------------------
-- ACTIVITY LOG — anggota proyek baca; anggota membuat
-- ---------------------------------------------------------------------
alter table activity_log enable row level security;
create policy "members read activity"
  on activity_log for select using (is_project_member(project_id));
create policy "members write activity"
  on activity_log for insert with check (is_project_member(project_id));
