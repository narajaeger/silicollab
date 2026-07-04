-- =====================================================================
-- InSilico Collab — Data contoh (opsional)
-- =====================================================================

insert into universities (name, city) values
  ('Universitas Indonesia', 'Depok'),
  ('Universitas Gadjah Mada', 'Yogyakarta'),
  ('Universitas Airlangga', 'Surabaya'),
  ('Universitas Padjadjaran', 'Bandung'),
  ('Universitas Diponegoro', 'Semarang'),
  ('Universitas Brawijaya', 'Malang'),
  ('Universitas Hasanuddin', 'Makassar'),
  ('Universitas Sumatera Utara', 'Medan'),
  ('Universitas Sebelas Maret', 'Surakarta'),
  ('Universitas Andalas', 'Padang')
on conflict (name) do nothing;
