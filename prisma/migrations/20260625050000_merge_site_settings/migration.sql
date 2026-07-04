-- Satukan site_asset + site_content jadi satu tabel key-value `site_setting`.
CREATE TABLE `site_setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` LONGTEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Pindahkan aset (key,value sudah cocok).
INSERT INTO `site_setting` (`key`, `value`, `updated_at`)
    SELECT `key`, `value`, `updated_at` FROM `site_asset`;

-- Pindahkan konten (id="landing", data JSON) → key + JSON string.
INSERT INTO `site_setting` (`key`, `value`, `updated_at`)
    SELECT `id`, CAST(`data` AS CHAR), `updated_at` FROM `site_content`;

DROP TABLE `site_asset`;
DROP TABLE `site_content`;
