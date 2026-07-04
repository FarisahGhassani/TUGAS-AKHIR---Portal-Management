-- Pendaftaran: tambah gender (biodata) + perbesar kolom foto agar muat upload
-- base64 (data URL) dari form admin.
ALTER TABLE `pendaftaran`
    ADD COLUMN `gender` ENUM('female', 'male', 'non_binary') NOT NULL DEFAULT 'female',
    MODIFY `foto_profil` LONGTEXT NOT NULL,
    MODIFY `foto_portofolio` LONGTEXT NULL;

-- Talent: kategori jadi TEXT (menyimpan JSON array pilihan), foto diperbesar.
ALTER TABLE `talent`
    MODIFY `kategori` TEXT NOT NULL,
    MODIFY `foto_comcard` LONGTEXT NULL,
    MODIFY `foto_portofolio` LONGTEXT NULL;
