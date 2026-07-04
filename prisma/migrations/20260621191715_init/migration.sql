-- CreateTable
CREATE TABLE `user` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('client', 'talent', 'admin') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pendaftaran` (
    `id_pendaftaran` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `id_batch` INTEGER NULL,
    `nama_talent` VARCHAR(191) NOT NULL,
    `tanggal_lahir` DATE NOT NULL,
    `tinggi_badan` INTEGER NOT NULL,
    `berat_badan` INTEGER NOT NULL,
    `size_baju` VARCHAR(191) NOT NULL,
    `size_sepatu` VARCHAR(191) NOT NULL,
    `no_identitas` VARCHAR(191) NOT NULL,
    `no_telepon` VARCHAR(191) NOT NULL,
    `foto_profil` VARCHAR(191) NOT NULL,
    `foto_portofolio` TEXT NULL,
    `jenis` ENUM('talent', 'kelas') NOT NULL,
    `status` ENUM('pending', 'diterima', 'ditolak') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_pendaftaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `talent` (
    `id_talent` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pendaftaran` INTEGER NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `foto_comcard` VARCHAR(191) NULL,
    `foto_portofolio` TEXT NULL,
    `tgl_kontrak` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `talent_id_pendaftaran_key`(`id_pendaftaran`),
    PRIMARY KEY (`id_talent`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch_modelling` (
    `id_batch` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_batch` VARCHAR(191) NOT NULL,
    `kuota` INTEGER NOT NULL,
    `tgl_mulai` DATE NOT NULL,
    `tgl_berakhir` DATE NOT NULL,
    `status_pendaftaran` ENUM('buka', 'tutup') NOT NULL DEFAULT 'buka',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_batch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `talent_batch` (
    `id_talent_batch` INTEGER NOT NULL AUTO_INCREMENT,
    `id_talent` INTEGER NOT NULL,
    `id_batch` INTEGER NOT NULL,
    `sertifikat_url` VARCHAR(191) NULL,
    `status_lulus` ENUM('belum', 'lulus', 'tidak_lulus') NOT NULL DEFAULT 'belum',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_talent_batch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiry_client` (
    `id_inquiry` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `nama_client` VARCHAR(191) NOT NULL,
    `no_telepon` VARCHAR(191) NOT NULL,
    `judul_project` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `jenis_job` VARCHAR(191) NOT NULL,
    `tanggal_project` DATE NULL,
    `model_pilihan` TEXT NULL,
    `catatan_client` TEXT NULL,
    `status` ENUM('baru', 'diproses', 'selesai') NOT NULL DEFAULT 'baru',
    `catatan_admin` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_inquiry`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcement` (
    `id_announcement` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `foto_poster` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `tanggal_berakhir` DATE NULL,
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_announcement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id_notification` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `pesan` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_notification`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id_projects` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `dokum_projects` VARCHAR(191) NULL,
    `tgl_projects` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_projects`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_id_batch_fkey` FOREIGN KEY (`id_batch`) REFERENCES `batch_modelling`(`id_batch`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `talent` ADD CONSTRAINT `talent_id_pendaftaran_fkey` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran`(`id_pendaftaran`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `talent_batch` ADD CONSTRAINT `talent_batch_id_talent_fkey` FOREIGN KEY (`id_talent`) REFERENCES `talent`(`id_talent`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `talent_batch` ADD CONSTRAINT `talent_batch_id_batch_fkey` FOREIGN KEY (`id_batch`) REFERENCES `batch_modelling`(`id_batch`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiry_client` ADD CONSTRAINT `inquiry_client_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
