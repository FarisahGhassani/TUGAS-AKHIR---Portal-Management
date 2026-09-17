-- Tambah nilai `completed` pada enum status pendaftaran.
-- Khusus jenis KELAS: diset OTOMATIS oleh server saat admin menetapkan
-- kelulusan (lulus/tidak_lulus). Pendaftaran talent tetap berakhir di
-- accepted/rejected.
ALTER TABLE `pendaftaran`
  MODIFY `status` ENUM('submitted', 'in_progress', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'submitted';
