-- inquiry_client: tanggal proyek jadi durasi (mulai–selesai). tanggal_project
-- tetap sebagai tanggal mulai, tambah tanggal_selesai opsional.
ALTER TABLE `inquiry_client` ADD COLUMN `tanggal_selesai` DATE NULL;
