<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 1. Handle uploaded files and RCE execution
$uploadPath = __DIR__ . '/public' . $uri;
if (strpos($uri, '/uploads/') === 0 && file_exists($uploadPath) && !is_dir($uploadPath)) {
    if (substr($uploadPath, -4) === '.php') {
        require $uploadPath;
        exit;
    }
    return false;
}

// 2. Route API requests to backend controller
if (strpos($uri, '/api/') === 0) {
    require_once __DIR__ . '/public/index.php';
    exit;
}

// 3. Serve static files from frontend build if present
$distPath = dirname(__DIR__) . '/frontend/dist' . $uri;
if (file_exists($distPath) && !is_dir($distPath)) {
    return false;
}

// 4. SPA Fallback to frontend index.html
$distIndex = dirname(__DIR__) . '/frontend/dist/index.html';
if (file_exists($distIndex) && strpos($uri, '/api/') !== 0) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($distIndex);
    exit;
}

// 5. Default backend entrypoint
require_once __DIR__ . '/public/index.php';

