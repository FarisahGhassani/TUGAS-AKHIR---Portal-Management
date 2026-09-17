-- Menyesuaikan tipe/panjang kolom agar lebih logis (tanpa mengubah data):
--  * Int -> SMALLINT UNSIGNED : tinggi_badan, berat_badan, kuota (nilai kecil).
--  * VARCHAR(191) -> panjang wajar : nama, nama_talent, size_baju, size_sepatu,
--    no_identitas, no_telepon, nama_client, judul_project.
-- Data existing sudah diverifikasi muat, jadi tidak ada pemotongan.

-- AlterTable
ALTER TABLE `batch_modelling` MODIFY `kuota` SMALLINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `inquiry_client` MODIFY `nama_client` VARCHAR(100) NOT NULL,
    MODIFY `no_telepon` VARCHAR(20) NOT NULL,
    MODIFY `judul_project` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `pendaftaran` MODIFY `nama_talent` VARCHAR(100) NOT NULL,
    MODIFY `tinggi_badan` SMALLINT UNSIGNED NOT NULL,
    MODIFY `berat_badan` SMALLINT UNSIGNED NOT NULL,
    MODIFY `size_baju` VARCHAR(20) NOT NULL,
    MODIFY `size_sepatu` VARCHAR(10) NOT NULL,
    MODIFY `no_identitas` VARCHAR(20) NOT NULL,
    MODIFY `no_telepon` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `nama` VARCHAR(100) NOT NULL;

