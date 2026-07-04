-- =====================================================================
-- SiliCollab, fitur koneksi antar peneliti (mirip "add connection")
-- Jalankan di SQL Editor Supabase SETELAH migrasi sebelumnya.
-- =====================================================================

create table if not exists connections (
  id            uuid primary key default uuid_generate_v4(),
  requester_id  uuid not null references profiles(id) on delete cascade,
  addressee_id  uuid not null references profiles(id) on delete cascade,
  status        text not null default 'pending', -- 'pending' | 'accepted'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index if not exists idx_connections_requester on connections(requester_id);
create index if not exists idx_connections_addressee on connections(addressee_id);

-- ---------------------------------------------------------------------
-- RLS: kedua pihak boleh melihat & mengelola koneksinya sendiri
-- ---------------------------------------------------------------------
alter table connections enable row level security;

create policy "parties read own connections"
  on connections for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "requester creates connection"
  on connections for insert
  with check (auth.uid() = requester_id);

-- Penerima menerima permintaan; kedua pihak bisa memutuskan/mengubah.
create policy "parties update own connections"
  on connections for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "parties delete own connections"
  on connections for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
