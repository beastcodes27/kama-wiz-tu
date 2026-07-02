<?php

require_once __DIR__ . '/auth_helper.php';

$db = Database::getInstance()->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireRole('admin');
    $stmt = $db->query("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireRole('admin');
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'admin';

    if (!in_array($role, ['admin', 'uploader'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid role']);
        exit;
    }

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    try {
        $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->execute([$username, $hash, $role]);
        echo json_encode(['id' => $db->lastInsertId(), 'message' => 'User created']);
    } catch (Exception $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Username already exists']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    requireRole('admin');
    $stmt = $db->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
    $stmt->execute([$_GET['id']]);
    echo json_encode(['message' => 'Deleted']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
