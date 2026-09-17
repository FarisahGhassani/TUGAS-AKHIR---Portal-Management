-- user: penanda kapan notifikasi terakhir dilihat. Notifikasi diturunkan dari
-- status pendaftaran/inquiry (tanpa tabel Notification); item "unread" jika
-- updatedAt-nya lebih baru dari kolom ini. NULL = belum pernah melihat apa pun.
ALTER TABLE `user` ADD COLUMN `notif_seen_at` DATETIME(3) NULL AFTER `role`;
