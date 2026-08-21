<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$filePath = __DIR__ . '/public' . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false;
}
require_once __DIR__ . '/public/index.php';
