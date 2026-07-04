-- inquiry_client.status: baru/diproses/selesai → submitted/in_progress/completed
ALTER TABLE `inquiry_client` MODIFY `status` ENUM('baru','diproses','selesai','submitted','in_progress','completed') NOT NULL DEFAULT 'baru';
UPDATE `inquiry_client` SET `status`='submitted' WHERE `status`='baru';
UPDATE `inquiry_client` SET `status`='in_progress' WHERE `status`='diproses';
UPDATE `inquiry_client` SET `status`='completed' WHERE `status`='selesai';
ALTER TABLE `inquiry_client` MODIFY `status` ENUM('submitted','in_progress','completed') NOT NULL DEFAULT 'submitted';

-- pendaftaran.status: pending/diterima/ditolak → submitted/in_progress/accepted/rejected
ALTER TABLE `pendaftaran` MODIFY `status` ENUM('pending','diterima','ditolak','submitted','in_progress','accepted','rejected') NOT NULL DEFAULT 'pending';
UPDATE `pendaftaran` SET `status`='submitted' WHERE `status`='pending';
UPDATE `pendaftaran` SET `status`='accepted' WHERE `status`='diterima';
UPDATE `pendaftaran` SET `status`='rejected' WHERE `status`='ditolak';
ALTER TABLE `pendaftaran` MODIFY `status` ENUM('submitted','in_progress','accepted','rejected') NOT NULL DEFAULT 'submitted';

-- projects: tanggal satu hari → timeline (mulai + selesai). Pindahkan nilai lama
-- ke tgl_mulai lalu hapus kolom lama.
ALTER TABLE `projects`
    ADD COLUMN `tgl_mulai` DATE NULL,
    ADD COLUMN `tgl_selesai` DATE NULL;
UPDATE `projects` SET `tgl_mulai` = `tgl_projects`;
ALTER TABLE `projects` DROP COLUMN `tgl_projects`;
