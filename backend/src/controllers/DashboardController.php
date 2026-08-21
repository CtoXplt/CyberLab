<?php

class DashboardController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        $user = [
            'id'       => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role'     => $_SESSION['role']
        ];

        $stmt = $this->db->query("SELECT COUNT(*) as total FROM uploads");
        $total_uploads = $stmt->fetch()['total'];

        $stmt = $this->db->query("SELECT uploaded_at FROM uploads ORDER BY uploaded_at DESC LIMIT 1");
        $last_upload = $stmt->fetch();
        $last_upload_time = $last_upload ? $last_upload['uploaded_at'] : null;

        // is_defaced = true if there's any non-default content
        $stmt = $this->db->query("SELECT COUNT(*) as cnt FROM site_content WHERE is_default = 0");
        $non_default_count = $stmt->fetch()['cnt'];
        $is_defaced = $non_default_count > 0;

        Response::success([
            'user' => $user,
            'stats' => [
                'total_uploads'    => (int)$total_uploads,
                'last_upload_time' => $last_upload_time,
                'is_defaced'       => $is_defaced
            ]
        ]);
    }
}
