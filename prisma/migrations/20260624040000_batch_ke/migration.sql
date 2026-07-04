-- batch_modelling: tambah nomor batch (batch ke) eksplisit & urut.
ALTER TABLE `batch_modelling` ADD COLUMN `batch_ke` INTEGER NOT NULL DEFAULT 0;
