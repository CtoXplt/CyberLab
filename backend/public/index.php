<?php
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/helpers/Response.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/middleware/RateLimiter.php';
require_once __DIR__ . '/../src/controllers/HomeController.php';
require_once __DIR__ . '/../src/controllers/ChallengeController.php';
require_once __DIR__ . '/../src/controllers/FlagController.php';
require_once __DIR__ . '/../src/controllers/AuthController.php';
require_once __DIR__ . '/../src/controllers/DashboardController.php';
require_once __DIR__ . '/../src/controllers/UploadController.php';
require_once __DIR__ . '/../src/controllers/BountyController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$db = Database::getInstance()->getConnection();

if ($method === 'GET' && $uri === '/api/health') {
    Response::success(['status' => 'healthy']);
} elseif ($method === 'GET' && $uri === '/api/home') {
    (new HomeController($db))->index();
} elseif ($method === 'GET' && $uri === '/api/challenges') {
    (new ChallengeController())->index();
} elseif ($method === 'GET' && preg_match('#^/api/challenges/cards/([^/]+)$#', $uri, $matches)) {
    (new ChallengeController())->downloadCard($matches[1]);
} elseif ($method === 'GET' && $uri === '/api/bounty/qr-image') {
    (new BountyController($db))->getQrImage();
} elseif ($method === 'GET' && $uri === '/api/admin/bounty') {
    checkAdmin();
    (new BountyController($db))->getConfig();
} elseif ($method === 'POST' && $uri === '/api/admin/bounty/update') {
    checkAdmin();
    (new BountyController($db))->updateConfig();
} elseif ($method === 'POST' && $uri === '/api/admin/bounty/upload-qr') {
    checkAdmin();
    (new BountyController($db))->uploadQr();
} elseif ($method === 'POST' && $uri === '/api/admin/bounty/delete-qr') {
    checkAdmin();
    (new BountyController($db))->deleteQr();
} elseif ($method === 'POST' && $uri === '/api/flags/submit') {
    (new FlagController($db))->submit();
} elseif ($method === 'POST' && $uri === '/api/auth/login') {
    (new AuthController($db))->login();
} elseif ($method === 'POST' && $uri === '/api/auth/logout') {
    checkAuth();
    (new AuthController($db))->logout();
} elseif ($method === 'GET' && $uri === '/api/admin/dashboard') {
    checkAuth();
    (new DashboardController($db))->index();
} elseif ($method === 'POST' && $uri === '/api/admin/upload') {
    checkAuth();
    (new UploadController($db))->upload();
} elseif ($method === 'GET' && $uri === '/api/admin/uploads') {
    checkAuth();
    (new UploadController($db))->history();
} elseif ($method === 'POST' && $uri === '/api/admin/restore') {
    checkAdmin();
    (new UploadController($db))->restore();
} elseif ($method === 'POST' && $uri === '/api/admin/clean-uploads') {
    checkAdmin();
    (new UploadController($db))->cleanAll();
} elseif ($method === 'POST' && $uri === '/api/admin/uploads/delete') {
    checkAdmin();
    (new UploadController($db))->deleteSingle();
} else {
    Response::error("Not Found", 404);
}
