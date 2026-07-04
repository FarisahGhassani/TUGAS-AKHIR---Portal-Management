-- Announcement: hapus kategori & alt poster (tidak dipakai lagi).
ALTER TABLE `announcement`
    DROP COLUMN `kategori`,
    DROP COLUMN `foto_poster_alt`;
