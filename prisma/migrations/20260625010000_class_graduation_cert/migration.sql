-- pendaftaran: kelulusan + sertifikat untuk pendaftaran kelas (Classes Tahap 2).
ALTER TABLE `pendaftaran`
    ADD COLUMN `status_lulus` ENUM('belum', 'lulus', 'tidak_lulus') NOT NULL DEFAULT 'belum',
    ADD COLUMN `sertifikat_url` LONGTEXT NULL;
