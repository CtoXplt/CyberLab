<?php

require_once dirname(__DIR__, 2) . '/config/ctf.php';
require_once dirname(__DIR__) . '/helpers/MetadataInjector.php';

class BountyController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    private function getBountyStorageDir(): string
    {
        $dir = dirname(__DIR__, 2) . '/storage/bounty';
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        return $dir;
    }

    public function getConfig()
    {
        checkAdmin();

        $stmt = $this->db->query("SELECT * FROM bounty_config ORDER BY id DESC LIMIT 1");
        $config = $stmt ? $stmt->fetch() : null;

        if (!$config) {
            $defaultComment = "CIPHER: " . ctf_xor_encrypt(CTF_BOUNTY_DEFAULT_FLAG, CTF_BOUNTY_DEFAULT_KEY) . " | Key: " . CTF_BOUNTY_DEFAULT_KEY . " | Type: XOR-HEX";
            $stmt = $this->db->prepare("INSERT INTO bounty_config (flag, command_comment, cipher_type, cipher_key, is_active) VALUES (?, ?, 'xor_hex', ?, 1)");
            $stmt->execute([CTF_BOUNTY_DEFAULT_FLAG, $defaultComment, CTF_BOUNTY_DEFAULT_KEY]);
            $stmt = $this->db->query("SELECT * FROM bounty_config ORDER BY id DESC LIMIT 1");
            $config = $stmt->fetch();
        }

        $qrExists = false;
        $qrUrl = null;
        if (!empty($config['qr_filename'])) {
            $qrPath = $this->getBountyStorageDir() . '/' . $config['qr_filename'];
            if (file_exists($qrPath)) {
                $qrExists = true;
                $qrUrl = '/api/bounty/qr-image?t=' . filemtime($qrPath);
            }
        }

        Response::success([
            'id'              => (int)$config['id'],
            'flag'            => $config['flag'],
            'command_comment' => $config['command_comment'],
            'cipher_type'     => $config['cipher_type'] ?? 'xor_hex',
            'cipher_key'      => $config['cipher_key'] ?? 'SPADE2026',
            'is_active'       => (bool)$config['is_active'],
            'qr_exists'       => $qrExists,
            'qr_url'          => $qrUrl,
            'updated_at'      => $config['updated_at'] ?? null,
            'card_url'        => '/api/challenges/cards/card_s.png'
        ]);
    }

    public function updateConfig()
    {
        checkAdmin();

        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!$data || !isset($data['flag']) || !isset($data['command_comment'])) {
            Response::error("Data flag dan command_comment wajib diisi", 400);
        }

        $flag = trim($data['flag']);
        $commandComment = trim($data['command_comment']);
        $cipherType = $data['cipher_type'] ?? 'xor_hex';
        $cipherKey = trim($data['cipher_key'] ?? 'SPADE2026');
        $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
        $userId = $_SESSION['user_id'] ?? null;

        // 1. Update or Insert into bounty_config
        $stmtCheck = $this->db->query("SELECT id FROM bounty_config ORDER BY id DESC LIMIT 1");
        $existing = $stmtCheck ? $stmtCheck->fetch() : null;

        if ($existing) {
            $stmt = $this->db->prepare("
                UPDATE bounty_config 
                SET flag = ?, command_comment = ?, cipher_type = ?, cipher_key = ?, is_active = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$flag, $commandComment, $cipherType, $cipherKey, $isActive, $userId, $existing['id']]);
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO bounty_config (flag, command_comment, cipher_type, cipher_key, is_active, updated_by) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$flag, $commandComment, $cipherType, $cipherKey, $isActive, $userId]);
        }

        // 2. Synchronize Flag hash in flags table for challenge verification
        $bountyHash = hash('sha256', $flag);
        $stmtFlagCheck = $this->db->prepare("SELECT id FROM flags WHERE challenge_name = ?");
        $stmtFlagCheck->execute([CTF_BOUNTY_CHALLENGE_NAME]);
        $flagRow = $stmtFlagCheck->fetch();

        if ($flagRow) {
            $stmtUpdateFlag = $this->db->prepare("UPDATE flags SET flag_hash = ? WHERE id = ?");
            $stmtUpdateFlag->execute([$bountyHash, $flagRow['id']]);
        } else {
            $stmtInsertFlag = $this->db->prepare("INSERT INTO flags (challenge_name, flag_hash) VALUES (?, ?)");
            $stmtInsertFlag->execute([CTF_BOUNTY_CHALLENGE_NAME, $bountyHash]);
        }

        // 3. Re-inject metadata into card_s.png
        $injected = MetadataInjector::injectCardS($commandComment, [
            'Comment'   => $commandComment,
            'Encoding'  => $cipherType,
            'Algorithm' => 'Multi-Layer Stream Cipher (Key: ' . $cipherKey . ')',
        ]);

        Response::success([
            'flag'            => $flag,
            'command_comment' => $commandComment,
            'cipher_type'     => $cipherType,
            'cipher_key'      => $cipherKey,
            'metadata_injected' => $injected
        ], "Pengaturan Bounty Kartu S dan Metadata Foto berhasil diperbarui!");
    }

    public function uploadQr()
    {
        checkAdmin();

        if (!isset($_FILES['qr_file'])) {
            Response::error("File gambar QR DANA tidak ditemukan", 400);
        }

        $file = $_FILES['qr_file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

        if (!in_array($ext, $allowedExts)) {
            Response::error("Format file harus berupa gambar (PNG, JPG, JPEG, WEBP)", 400);
        }

        $storageDir = $this->getBountyStorageDir();
        $storedName = 'dana_qr_' . time() . '.' . $ext;
        $destination = $storageDir . '/' . $storedName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            Response::error("Gagal menyimpan file QR di server", 500);
        }

        // Update database record
        $stmt = $this->db->query("SELECT id, qr_filename FROM bounty_config ORDER BY id DESC LIMIT 1");
        $existing = $stmt ? $stmt->fetch() : null;

        if ($existing && !empty($existing['qr_filename'])) {
            $oldFile = $storageDir . '/' . $existing['qr_filename'];
            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
        }

        if ($existing) {
            $stmtUpdate = $this->db->prepare("UPDATE bounty_config SET qr_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmtUpdate->execute([$storedName, $existing['id']]);
        } else {
            $defaultComment = "CIPHER: " . ctf_xor_encrypt(CTF_BOUNTY_DEFAULT_FLAG, CTF_BOUNTY_DEFAULT_KEY) . " | Key: " . CTF_BOUNTY_DEFAULT_KEY . " | Type: XOR-HEX";
            $stmtInsert = $this->db->prepare("INSERT INTO bounty_config (flag, command_comment, qr_filename, is_active) VALUES (?, ?, ?, 1)");
            $stmtInsert->execute([CTF_BOUNTY_DEFAULT_FLAG, $defaultComment, $storedName]);
        }

        Response::success([
            'qr_filename' => $storedName,
            'qr_url'      => '/api/bounty/qr-image?t=' . time()
        ], "Foto QR Barcode DANA berhasil diunggah!");
    }

    public function deleteQr()
    {
        checkAdmin();

        $storageDir = $this->getBountyStorageDir();
        $stmt = $this->db->query("SELECT id, qr_filename FROM bounty_config ORDER BY id DESC LIMIT 1");
        $existing = $stmt ? $stmt->fetch() : null;

        if ($existing && !empty($existing['qr_filename'])) {
            $oldFile = $storageDir . '/' . $existing['qr_filename'];
            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
            $stmtUpdate = $this->db->prepare("UPDATE bounty_config SET qr_filename = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmtUpdate->execute([$existing['id']]);
        }

        Response::success(null, "Foto QR Barcode DANA berhasil dihapus.");
    }

    public function getQrImage()
    {
        $stmt = $this->db->query("SELECT qr_filename FROM bounty_config WHERE is_active = 1 ORDER BY id DESC LIMIT 1");
        $config = $stmt ? $stmt->fetch() : null;

        if (!$config || empty($config['qr_filename'])) {
            Response::error("QR Code DANA belum diatur oleh admin", 404);
        }

        $filepath = $this->getBountyStorageDir() . '/' . $config['qr_filename'];
        if (!file_exists($filepath)) {
            Response::error("File QR Code DANA tidak ditemukan", 404);
        }

        $ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
        $mimeMap = [
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'gif'  => 'image/gif'
        ];
        $mime = $mimeMap[$ext] ?? 'image/png';

        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($filepath));
        header('Cache-Control: no-cache, must-revalidate');
        readfile($filepath);
        exit;
    }
}
