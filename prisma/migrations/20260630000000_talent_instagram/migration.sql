-- pendaftaran: tambah akun Instagram talent (opsional). Ditampilkan di halaman
-- detail talent supaya client bisa langsung menuju profil IG si talent.
ALTER TABLE `pendaftaran` ADD COLUMN `instagram` VARCHAR(191) NULL AFTER `no_telepon`;
