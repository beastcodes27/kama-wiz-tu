<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/database.php';

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove /api prefix
$path = preg_replace('#^/api#', '', $path);

// Route matching
if (preg_match('#^/auth/(login|logout|me)$#', $path, $m)) {
    $_GET['action'] = $m[1];
    require __DIR__ . '/api/auth.php';
} elseif (preg_match('#^/users/?$#', $path)) {
    require __DIR__ . '/api/users.php';
} elseif (preg_match('#^/users/(\d+)/?$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require __DIR__ . '/api/users.php';
} elseif (preg_match('#^/series/?$#', $path)) {
    require __DIR__ . '/api/series.php';
} elseif (preg_match('#^/series/(\d+)/?$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require __DIR__ . '/api/series.php';
} elseif (preg_match('#^/videos/?$#', $path)) {
    require __DIR__ . '/api/videos.php';
} elseif (preg_match('#^/videos/(\d+)/?$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require __DIR__ . '/api/videos.php';
} elseif (preg_match('#^/stream/(\d+)/?$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require __DIR__ . '/api/stream.php';
} elseif (preg_match('#^/series/(\d+)/videos/?$#', $path, $m)) {
    $_GET['series_id'] = $m[1];
    require __DIR__ . '/api/videos.php';
} elseif (preg_match('#^/stats/?$#', $path)) {
    require __DIR__ . '/api/stats.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
