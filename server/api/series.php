<?php

require_once __DIR__ . '/auth_helper.php';

$db = Database::getInstance()->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM series WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $series = $stmt->fetch();
        if ($series) {
            $stmt = $db->prepare("SELECT id, title, episode_number, duration, created_at FROM videos WHERE series_id = ? ORDER BY episode_number ASC");
            $stmt->execute([$_GET['id']]);
            $series['videos'] = $stmt->fetchAll();
        }
        echo json_encode($series ?: ['error' => 'Not found']);
    } else {
        $stmt = $db->query("SELECT * FROM series ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireRole('admin');
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';

    if (!$title) {
        http_response_code(400);
        echo json_encode(['error' => 'Title is required']);
        exit;
    }

    $thumbnail = null;
    if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['thumbnail']['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $ext;
        move_uploaded_file($_FILES['thumbnail']['tmp_name'], __DIR__ . '/../uploads/thumbnails/' . $filename);
        $thumbnail = $filename;
    }

    $stmt = $db->prepare("INSERT INTO series (title, description, thumbnail) VALUES (?, ?, ?)");
    $stmt->execute([$title, $description, $thumbnail]);

    echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Series created']);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    requireRole('admin');
    $stmt = $db->prepare("DELETE FROM series WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(['message' => 'Deleted']);
}
