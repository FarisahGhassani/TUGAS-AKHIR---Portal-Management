-- Announcement: tambah ringkasan, kategori, dan alt poster (1:1 dengan UI).
ALTER TABLE `announcement`
    ADD COLUMN `ringkasan` TEXT NOT NULL,
    ADD COLUMN `kategori` ENUM('casting', 'kelas', 'umum') NOT NULL DEFAULT 'umum',
    ADD COLUMN `foto_poster_alt` VARCHAR(191) NULL;

-- InquiryClient: id_user jadi nullable (form kolaborasi publik tanpa sesi).
ALTER TABLE `inquiry_client` DROP FOREIGN KEY `inquiry_client_id_user_fkey`;
ALTER TABLE `inquiry_client` MODIFY `id_user` INTEGER NULL;
ALTER TABLE `inquiry_client` ADD CONSTRAINT `inquiry_client_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Projects: bentuk ulang dari skema lama (judul/dokum_projects) ke shape app.
ALTER TABLE `projects`
    DROP COLUMN `dokum_projects`,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `event` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipe` ENUM('event', 'photoshoot', 'other') NOT NULL DEFAULT 'photoshoot',
    ADD COLUMN `cover` LONGTEXT NULL,
    ADD COLUMN `cover_alt` VARCHAR(191) NULL,
    ADD COLUMN `cover_width` INTEGER NULL,
    ADD COLUMN `cover_height` INTEGER NULL,
    ADD COLUMN `collaborators` JSON NULL;

-- Slug unik untuk routing publik (/projects/[slug]).
CREATE UNIQUE INDEX `projects_slug_key` ON `projects`(`slug`);
