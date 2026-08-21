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

        $stmt = $this->db->prepare("SELECT id, flag_hash FROM flags LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();

        if ($row && $row['flag_hash'] === $hashed_flag) {
            $log_stmt = $this->db->prepare(
                "INSERT INTO submissions (challenge_id, submitted_flag, status, ip_address) VALUES (?, ?, 'correct', ?)"
            );
            $log_stmt->execute([$row['id'], $submitted_flag, $ip]);

            Response::success([
                'credentials' => [
                    'username' => CTF_PARTICIPANT_USERNAME,
                    'passwords' => ctf_shuffled_password_list(),
                ],
            ], "Flag is correct!");
        } else {
            $flag_id = $row ? $row['id'] : 1;
            $log_stmt = $this->db->prepare(
                "INSERT INTO submissions (challenge_id, submitted_flag, status, ip_address) VALUES (?, ?, 'incorrect', ?)"
            );
            $log_stmt->execute([$flag_id, $submitted_flag, $ip]);

            Response::error("Incorrect flag", 422);
        }
    }
}
