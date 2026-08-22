<?php

require_once __DIR__ . '/../../config/ctf.php';

class FlagController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function submit() {
        $ip = $_SERVER['REMOTE_ADDR'];
        checkRateLimit($ip, 5, 60);

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['challenge_id']) || !isset($data['flag'])) {
            Response::error("Missing challenge_id or flag", 400);
        }

        $submitted_flag = trim($data['flag']);
        $hashed_flag = hash('sha256', $submitted_flag);
        $challenge_id = $data['challenge_id'] ?? 'metadata_1';

        $isBounty = ($challenge_id === 'bounty_s' || $challenge_id === 'card_s' || $challenge_id === 2 || $challenge_id === '2');

        if ($isBounty) {
            $stmt = $this->db->prepare("SELECT id, flag_hash FROM flags WHERE challenge_name = ? LIMIT 1");
            $stmt->execute([CTF_BOUNTY_CHALLENGE_NAME]);
        } else {
            $stmt = $this->db->prepare("SELECT id, flag_hash FROM flags WHERE challenge_name = 'Metadata Analysis - Card Challenge' LIMIT 1");
            $stmt->execute();
        }
        $row = $stmt->fetch();

        // Fallback if flags table row was not found by exact challenge_name
        if (!$row && $isBounty) {
            $stmtBounty = $this->db->query("SELECT flag FROM bounty_config ORDER BY id DESC LIMIT 1");
            $bountyConfig = $stmtBounty ? $stmtBounty->fetch() : null;
            if ($bountyConfig && $bountyConfig['flag'] === $submitted_flag) {
                $row = ['id' => 2, 'flag_hash' => $hashed_flag];
            }
        }

        if ($row && $row['flag_hash'] === $hashed_flag) {
            $log_stmt = $this->db->prepare(
                "INSERT INTO submissions (challenge_id, submitted_flag, status, ip_address) VALUES (?, ?, 'correct', ?)"
            );
            $log_stmt->execute([$row['id'], $submitted_flag, $ip]);

            if ($isBounty) {
                $stmtBounty = $this->db->query("SELECT qr_filename FROM bounty_config ORDER BY id DESC LIMIT 1");
                $bountyConfig = $stmtBounty ? $stmtBounty->fetch() : null;
                $hasQr = !empty($bountyConfig['qr_filename']);

                Response::success([
                    'is_bounty'   => true,
                    'has_qr'      => $hasQr,
                    'qr_url'      => $hasQr ? '/api/bounty/qr-image' : null,
                    'title'       => '🎉 Selamat! Flag Kartu S Benar!',
                    'message'     => 'Anda berhasil menyelesaikan seluruh tantangan CTF dan menemukan rahasia Kartu S.',
                    'instructions'=> 'Silakan scan Barcode QR DANA di bawah ini untuk klaim hadiah uang / bounty Anda.'
                ], "Flag Kartu S valid! Selamat atas keberhasilan Anda!");
            } else {
                Response::success([
                    'credentials' => [
                        'username' => CTF_PARTICIPANT_USERNAME,
                        'passwords' => ctf_shuffled_password_list(),
                    ],
                ], "Flag is correct!");
            }
        } else {
            $flag_id = $row ? $row['id'] : ($isBounty ? 2 : 1);
            $log_stmt = $this->db->prepare(
                "INSERT INTO submissions (challenge_id, submitted_flag, status, ip_address) VALUES (?, ?, 'incorrect', ?)"
            );
            $log_stmt->execute([$flag_id, $submitted_flag, $ip]);

            Response::error("Incorrect flag! Periksa kembali cipher/metadata kartu.", 422);
        }
    }
}
