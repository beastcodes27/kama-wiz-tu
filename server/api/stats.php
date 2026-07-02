<?php

$db = Database::getInstance()->getConnection();

$seriesCount = $db->query("SELECT COUNT(*) as c FROM series")->fetch()['c'];
$videosCount = $db->query("SELECT COUNT(*) as c FROM videos")->fetch()['c'];
$usersCount = $db->query("SELECT COUNT(*) as c FROM users")->fetch()['c'];

echo json_encode([
    'series' => (int)$seriesCount,
    'videos' => (int)$videosCount,
    'users' => (int)$usersCount,
]);
