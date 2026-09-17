-- Perbaikan bug gambar announcement: kolom poster disimpan sebagai data URL
-- base64, tetapi sebelumnya bertipe VARCHAR(191) sehingga terpotong diam-diam.
-- Diperlebar menjadi LONGTEXT. Perubahan ini SUDAH diterapkan lebih dulu lewat
-- `prisma db push`; file migrasi ini dibuat agar riwayat migrasi lengkap dan
-- ditandai applied (prisma migrate resolve --applied) tanpa dijalankan ulang.
ALTER TABLE `announcement` MODIFY `foto_poster` LONGTEXT NULL;
