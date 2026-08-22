<?php

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $db = getenv('DB_NAME') ?: 'cyberseclab';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
        $charset = 'utf8mb4';

        // Try MySQL first if DB_DRIVER is not explicitly sqlite
        $backendDir = dirname(__DIR__, 2);
        if (getenv('DB_DRIVER') !== 'sqlite') {
            try {
                $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ];
                $this->connection = new PDO($dsn, $user, $pass, $options);
                $this->initializeMysql($backendDir);
                return;
            } catch (\PDOException $e) {
                // Fallback to SQLite if MySQL fails
            }
        }

        // SQLite Fallback
        $sqliteDir = $backendDir . '/storage';
        if (!is_dir($sqliteDir)) {
            mkdir($sqliteDir, 0777, true);
        }
        $sqlitePath = $sqliteDir . '/cyberseclab.sqlite';

        $this->connection = new PDO("sqlite:$sqlitePath", null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $this->initializeSqlite($backendDir);
    }

    private function initializeMysql($backendDir) {
        $this->connection->exec("
            CREATE TABLE IF NOT EXISTS bounty_config (
                id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                flag            VARCHAR(255) NOT NULL,
                command_comment TEXT NOT NULL,
                cipher_type     VARCHAR(50) NOT NULL DEFAULT 'xor_hex',
                cipher_key      VARCHAR(100) NOT NULL DEFAULT 'SPADE2026',
                qr_filename     VARCHAR(255) DEFAULT NULL,
                is_active       TINYINT(1) NOT NULL DEFAULT 1,
                updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                updated_by      INT UNSIGNED DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        require_once $backendDir . '/config/ctf.php';
        $bountyFlagHash = hash('sha256', CTF_BOUNTY_DEFAULT_FLAG);

        // Seed flag if missing
        $stmtFlag = $this->connection->prepare("SELECT COUNT(*) as cnt FROM flags WHERE challenge_name = ?");
        $stmtFlag->execute([CTF_BOUNTY_CHALLENGE_NAME]);
        if ($stmtFlag->fetch()['cnt'] == 0) {
            $stmt = $this->connection->prepare("INSERT INTO flags (challenge_name, flag_hash) VALUES (?, ?)");
            $stmt->execute([CTF_BOUNTY_CHALLENGE_NAME, $bountyFlagHash]);
        }

        // Seed bounty config if missing
        $stmtBounty = $this->connection->query("SELECT COUNT(*) as cnt FROM bounty_config");
        if ($stmtBounty && $stmtBounty->fetch()['cnt'] == 0) {
            $defaultComment = "CIPHER: " . ctf_xor_encrypt(CTF_BOUNTY_DEFAULT_FLAG, CTF_BOUNTY_DEFAULT_KEY) . " | Key: " . CTF_BOUNTY_DEFAULT_KEY . " | Type: XOR-HEX";
            $stmt = $this->connection->prepare("INSERT INTO bounty_config (flag, command_comment, cipher_type, cipher_key, is_active) VALUES (?, ?, 'xor_hex', ?, 1)");
            $stmt->execute([CTF_BOUNTY_DEFAULT_FLAG, $defaultComment, CTF_BOUNTY_DEFAULT_KEY]);
        }
    }

    private function initializeSqlite($backendDir) {
        $this->connection->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'participant',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS flags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                challenge_name TEXT NOT NULL UNIQUE,
                flag_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                challenge_id INTEGER NOT NULL,
                submitted_flag TEXT NOT NULL,
                status TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                stored_filename TEXT NOT NULL,
                file_size INTEGER NOT NULL DEFAULT 0,
                mime_type TEXT DEFAULT NULL,
                uploaded_by INTEGER DEFAULT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS site_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL DEFAULT 'Cyber Security Lab',
                content TEXT DEFAULT NULL,
                is_default INTEGER NOT NULL DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by INTEGER DEFAULT NULL
            );
            CREATE TABLE IF NOT EXISTS bounty_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flag TEXT NOT NULL,
                command_comment TEXT NOT NULL,
                cipher_type TEXT NOT NULL DEFAULT 'xor_hex',
                cipher_key TEXT NOT NULL DEFAULT 'SPADE2026',
                qr_filename TEXT DEFAULT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by INTEGER DEFAULT NULL
            );
        ");

        require_once $backendDir . '/config/ctf.php';
        // Admin password: baca dari env CTF_ADMIN_PASSWORD, fallback ke default (ubah via env di production!)
        $adminRawPass = getenv('CTF_ADMIN_PASSWORD') ?: 'admin_cs_lab_2026';
        $adminPass = password_hash($adminRawPass, PASSWORD_BCRYPT, ['cost' => 12]);
        $partPass = password_hash(CTF_PARTICIPANT_PASSWORD, PASSWORD_BCRYPT, ['cost' => 12]);
        $flagHash = hash('sha256', CTF_FLAG);
        $bountyFlagHash = hash('sha256', CTF_BOUNTY_DEFAULT_FLAG);

        // Seed users if missing
        $stmtUser = $this->connection->query("SELECT COUNT(*) as cnt FROM users");
        $userCount = $stmtUser ? $stmtUser->fetch()['cnt'] : 0;
        if ($userCount == 0) {
            $stmt = $this->connection->prepare("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)");
            $stmt->execute(['admin', $adminPass, 'admin']);
            $stmt->execute(['participant', $partPass, 'participant']);
        }

        // Seed flags if missing
        $stmt = $this->connection->prepare("INSERT OR IGNORE INTO flags (challenge_name, flag_hash) VALUES (?, ?)");
        $stmt->execute(['Metadata Analysis - Card Challenge', $flagHash]);
        $stmt->execute([CTF_BOUNTY_CHALLENGE_NAME, $bountyFlagHash]);

        // Seed site content if missing
        $stmtContent = $this->connection->query("SELECT COUNT(*) as cnt FROM site_content");
        $contentCount = $stmtContent ? $stmtContent->fetch()['cnt'] : 0;
        if ($contentCount == 0) {
            $defaultContent = @file_get_contents($backendDir . '/storage/default_homepage.html') ?: '<h1>Cyber Security Lab</h1>';
            $stmt = $this->connection->prepare("INSERT OR IGNORE INTO site_content (title, content, is_default) VALUES (?, ?, 1)");
            $stmt->execute(['Cyber Security Lab', $defaultContent]);
        }

        // Seed bounty config if missing
        $stmtBounty = $this->connection->query("SELECT COUNT(*) as cnt FROM bounty_config");
        $bountyCount = $stmtBounty ? $stmtBounty->fetch()['cnt'] : 0;
        if ($bountyCount == 0) {
            $defaultComment = "CIPHER: " . ctf_xor_encrypt(CTF_BOUNTY_DEFAULT_FLAG, CTF_BOUNTY_DEFAULT_KEY) . " | Key: " . CTF_BOUNTY_DEFAULT_KEY . " | Type: XOR-HEX";
            $stmt = $this->connection->prepare("INSERT INTO bounty_config (flag, command_comment, cipher_type, cipher_key, is_active) VALUES (?, ?, 'xor_hex', ?, 1)");
            $stmt->execute([CTF_BOUNTY_DEFAULT_FLAG, $defaultComment, CTF_BOUNTY_DEFAULT_KEY]);
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}

