<?php

class AuthController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function login() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['username']) || !isset($data['password'])) {
            Response::error("Missing username or password", 400);
        }

        $stmt = $this->db->prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            Response::success([
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ],
                'redirect' => '/admin/dashboard'
            ], "Login successful");
        } else {
            Response::error("Invalid credentials", 401);
        }
    }

    public function logout() {
        session_destroy();
        Response::success(null, "Logged out successfully");
    }
}
