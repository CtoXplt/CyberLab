<?php

class HomeController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function index() {
        $stmt = $this->db->query("SELECT title, content, updated_at, is_default FROM site_content ORDER BY id DESC LIMIT 1");
        $content = $stmt->fetch();

        if ($content) {
            Response::success([
                'title' => $content['title'],
                'content' => $content['content'],
                'updated_at' => $content['updated_at'],
                'is_default' => (bool)$content['is_default']
            ]);
        } else {
            Response::success(null);
        }
    }
}
