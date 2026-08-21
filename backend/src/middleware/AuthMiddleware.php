<?php

function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        Response::error("Unauthorized", 401);
    }
}

function checkAdmin() {
    checkAuth();
    if (($_SESSION['role'] ?? '') !== 'admin') {
        Response::error("Forbidden: admin only", 403);
    }
}
