<?php
/**
 * Database Setup Script
 * 
 * Run this script from CLI to initialize the database:
 *   php backend/database/setup.php
 * 
 * Prerequisites:
 *   - MySQL server running on localhost:3306
 *   - User 'root' with no password (or modify $config below)
 */

$config = [
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'user'     => 'root',
    'password' => '',
    'dbname'   => 'cyberseclab',
    'charset'  => 'utf8mb4',
];

echo "=== Cyber Security Lab - Database Setup ===\n\n";

// --- Step 1: Connect to MySQL (without database) ---
echo "[1/4] Connecting to MySQL...\n";
try {
    $dsn = "mysql:host={$config['host']};port={$config['port']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "    [OK] Connected to MySQL\n";
} catch (PDOException $e) {
    echo "    [FAIL] Could not connect to MySQL: " . $e->getMessage() . "\n";
    echo "\n    Make sure MySQL is running and credentials are correct.\n";
    echo "    Edit the \$config array at the top of this file if needed.\n";
    exit(1);
}

// --- Step 2: Run schema.sql ---
echo "[2/4] Creating database and tables...\n";
$schemaFile = __DIR__ . '/schema.sql';
if (!file_exists($schemaFile)) {
    echo "    [FAIL] schema.sql not found at: $schemaFile\n";
    exit(1);
}

$schemaSql = file_get_contents($schemaFile);
try {
    $pdo->exec($schemaSql);
    echo "    [OK] Database 'cyberseclab' created with all tables\n";
} catch (PDOException $e) {
    echo "    [FAIL] Schema error: " . $e->getMessage() . "\n";
    exit(1);
}

// --- Step 3: Switch to cyberseclab database ---
$pdo->exec("USE cyberseclab");

// --- Step 4: Seed data ---
echo "[3/4] Seeding data...\n";

// Generate bcrypt hashes
$adminPasswordHash = password_hash('admin_cs_lab_2026', PASSWORD_BCRYPT, ['cost' => 12]);
$participantPasswordHash = password_hash('upl04d_ch4ll3ng3_2026', PASSWORD_BCRYPT, ['cost' => 12]);

require_once __DIR__ . '/../config/ctf.php';

// Generate SHA-256 hash for the flag
$flagHash = hash('sha256', CTF_FLAG);

// Insert admin user
$stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)");
$stmt->execute(['admin', $adminPasswordHash, 'admin']);
echo "    [OK] Admin user created (admin / admin_cs_lab_2026)\n";

// Insert participant user
$stmt->execute(['participant', $participantPasswordHash, 'participant']);
echo "    [OK] Participant user created (participant / upl04d_ch4ll3ng3_2026)\n";

// Insert flag
$stmt = $pdo->prepare("INSERT INTO flags (challenge_name, flag_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE flag_hash = VALUES(flag_hash)");
$stmt->execute(['Metadata Analysis - Card Challenge', $flagHash]);
echo "    [OK] Flag seeded (SHA-256 hash stored)\n";

// Insert default homepage content
$defaultContent = file_get_contents(__DIR__ . '/../storage/default_homepage.html');
if ($defaultContent === false) {
    $defaultContent = '<h1>Cyber Security Lab</h1><p>Welcome to the Cyber Security Lab. This is the default homepage content.</p>';
}

$stmt = $pdo->prepare("INSERT INTO site_content (title, content, is_default) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE content = VALUES(content)");
$stmt->execute(['Cyber Security Lab', $defaultContent]);
echo "    [OK] Default homepage content seeded\n";

// --- Step 5: Verify ---
echo "[4/4] Verifying setup...\n";

$tables = ['users', 'flags', 'submissions', 'uploads', 'site_content'];
foreach ($tables as $table) {
    $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
    echo "    [OK] Table '$table' - $count rows\n";
}

echo "\n=== Setup Complete! ===\n";
echo "\nCredentials:\n";
echo "  Admin:       admin / admin_cs_lab_2026\n";
echo "  Participant: participant / upl04d_ch4ll3ng3_2026\n";
echo "  Flag:        " . CTF_FLAG . "\n";
echo "  Flag Hash:   $flagHash\n";
echo "\nNext steps:\n";
echo "  1. Start PHP backend:  php -S localhost:8080 -t backend/public backend/router.php\n";
echo "  2. Start Vite frontend: cd frontend && npm run dev\n";
