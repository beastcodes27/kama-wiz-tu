<?php

function getSession() {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')");
    $stmt->execute([$token]);
    return $stmt->fetch();
}

function requireRole(...$roles) {
    $session = getSession();
    if (!$session || !in_array($session['role'], $roles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    return $session;
}
