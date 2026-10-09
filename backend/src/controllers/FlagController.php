<?php

require_once __DIR__ . '/../../config/ctf.php';

class FlagController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function submit() {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
        if (strpos($ip, ',') !== false) {
            $ip = explode(',', $ip)[0];
        }
        $ip = trim($ip);
        
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
                // Determine participant number based on order of distinct session IDs to avoid Proxy/NAT overlap
                $session_id = session_id();
                if (!$session_id) {
                    session_start();
                    $session_id = session_id();
                }
                
                // We'll update the submission's ip_address to include the session_id so we can group by it
                $stmtUpdate = $this->db->prepare("UPDATE submissions SET ip_address = ? WHERE id = ?");
                $stmtUpdate->execute([$ip . '|' . $session_id, $this->db->lastInsertId()]);

                $stmtRank = $this->db->prepare("SELECT ip_address FROM submissions WHERE challenge_id = ? AND status = 'correct' GROUP BY ip_address ORDER BY MIN(id) ASC");
                $stmtRank->execute([$row['id']]);
                $identifiers = $stmtRank->fetchAll(PDO::FETCH_COLUMN);
                
                $current_identifier = $ip . '|' . $session_id;
                $rank = array_search($current_identifier, $identifiers);
                if ($rank === false) {
                    $rank = count($identifiers);
                }
                $participantNum = ($rank % 7) + 1;
                $assignedUsername = 'participant' . $participantNum;

                Response::success([
                    'credentials' => [
                        'username' => $assignedUsername,
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
