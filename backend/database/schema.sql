CREATE DATABASE IF NOT EXISTS cyberseclab
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cyberseclab;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role        ENUM('admin', 'participant') NOT NULL DEFAULT 'participant',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: flags
-- ============================================
CREATE TABLE IF NOT EXISTS flags (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    challenge_name  VARCHAR(100) NOT NULL UNIQUE,
    flag_hash       VARCHAR(64) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: submissions
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    challenge_id    INT UNSIGNED NOT NULL,
    submitted_flag  VARCHAR(255) NOT NULL,
    status          ENUM('correct', 'incorrect') NOT NULL,
    ip_address      VARCHAR(45) NOT NULL,
    submitted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES flags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: uploads
-- ============================================
CREATE TABLE IF NOT EXISTS uploads (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename        VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_size       INT UNSIGNED NOT NULL DEFAULT 0,
    mime_type       VARCHAR(100) DEFAULT NULL,
    uploaded_by     INT UNSIGNED DEFAULT NULL,
    uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: site_content
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL DEFAULT 'Cyber Security Lab',
    content     LONGTEXT DEFAULT NULL,
    is_default  TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by  INT UNSIGNED DEFAULT NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
