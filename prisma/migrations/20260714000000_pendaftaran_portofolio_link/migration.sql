-- pendaftaran: portofolio berpindah dari BERKAS (data URL di LongText) ke LINK.
-- Alasan: baris DB jauh lebih ringan, dan agency melihat portofolio versi
-- terbaru langsung dari sumbernya (Drive / IG / dokumentasi) tanpa talent perlu
-- unggah ulang. Kolom lama dibuang karena data URL lama tidak bisa dipakai
-- sebagai tautan. Tetap NULL-able (opsional).
ALTER TABLE `pendaftaran` DROP COLUMN `foto_portofolio`;
ALTER TABLE `pendaftaran` ADD COLUMN `portofolio_url` VARCHAR(500) NULL AFTER `foto_profil`;
