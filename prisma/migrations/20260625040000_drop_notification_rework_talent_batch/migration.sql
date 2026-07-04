-- Hapus tabel notification (tidak dipakai; notifikasi diturunkan dari
-- pendaftaran/inquiry).
DROP TABLE `notification`;

-- Kelulusan + sertifikat pindah dari pendaftaran ke talent_batch.
ALTER TABLE `pendaftaran`
    DROP COLUMN `status_lulus`,
    DROP COLUMN `sertifikat_url`;

-- talent_batch dibentuk ulang: enrollment kelas per pendaftaran (bukan talent).
-- Tabel kosong, jadi aman drop & create.
DROP TABLE `talent_batch`;
CREATE TABLE `talent_batch` (
    `id_talent_batch` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pendaftaran` INTEGER NOT NULL,
    `id_batch` INTEGER NOT NULL,
    `sertifikat_url` LONGTEXT NULL,
    `status_lulus` ENUM('belum', 'lulus', 'tidak_lulus') NOT NULL DEFAULT 'belum',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `talent_batch_id_pendaftaran_key`(`id_pendaftaran`),
    PRIMARY KEY (`id_talent_batch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `talent_batch` ADD CONSTRAINT `talent_batch_id_pendaftaran_fkey` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran`(`id_pendaftaran`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `talent_batch` ADD CONSTRAINT `talent_batch_id_batch_fkey` FOREIGN KEY (`id_batch`) REFERENCES `batch_modelling`(`id_batch`) ON DELETE RESTRICT ON UPDATE CASCADE;
