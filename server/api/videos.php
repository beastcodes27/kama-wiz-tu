<?php

require_once __DIR__ . '/auth_helper.php';

$db = Database::getInstance()->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['series_id'])) {
        $stmt = $db->prepare("SELECT id, title, episode_number, duration, created_at FROM videos WHERE series_id = ? ORDER BY episode_number ASC");
        $stmt->execute([$_GET['series_id']]);
        echo json_encode($stmt->fetchAll());
    } elseif (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM videos WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch() ?: ['error' => 'Not found']);
    } else {
        $stmt = $db->query("SELECT v.*, s.title as series_title FROM videos v JOIN series s ON v.series_id = s.id ORDER BY v.created_at DESC");
        echo json_encode($stmt->fetchAll());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireRole('admin', 'uploader');
    $series_id = $_POST['series_id'] ?? '';
    $title = $_POST['title'] ?? '';
    $episode_number = $_POST['episode_number'] ?? 0;

    if (!$series_id || !$title || !isset($_FILES['video'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    if ($_FILES['video']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Upload failed']);
        exit;
    }

    $ext = pathinfo($_FILES['video']['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $ext;
    $filepath = 'uploads/videos/' . $filename;
    move_uploaded_file($_FILES['video']['tmp_name'], __DIR__ . '/../' . $filepath);

    $stmt = $db->prepare("INSERT INTO videos (series_id, title, filename, filepath, episode_number) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$series_id, $title, $filename, $filepath, $episode_number]);

    echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Video uploaded']);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    requireRole('admin', 'uploader');
    $stmt = $db->prepare("SELECT filepath FROM videos WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $video = $stmt->fetch();
    if ($video && file_exists(__DIR__ . '/../' . $video['filepath'])) {
        unlink(__DIR__ . '/../' . $video['filepath']);
    }
    $stmt = $db->prepare("DELETE FROM videos WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(['message' => 'Deleted']);
}
