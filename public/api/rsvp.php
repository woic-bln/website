<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(503);
    echo json_encode(['error' => 'Service not configured']);
    exit;
}

require_once $configFile;

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS woic_event_rsvp (
            event_id VARCHAR(100) NOT NULL PRIMARY KEY,
            count INT NOT NULL DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $eventId = isset($_GET['event']) ? trim($_GET['event']) : '';
    if ($eventId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing event parameter']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT count FROM woic_event_rsvp WHERE event_id = ?');
    $stmt->execute([$eventId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['count' => $row ? (int)$row['count'] : 0]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $eventId = isset($body['event']) ? trim($body['event']) : '';
    if ($eventId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing event field']);
        exit;
    }

    $decrement = !empty($body['decrement']);
    if ($decrement) {
        $stmt = $pdo->prepare('
            UPDATE woic_event_rsvp SET count = GREATEST(count - 1, 0) WHERE event_id = ?
        ');
        $stmt->execute([$eventId]);
    } else {
        $stmt = $pdo->prepare('
            INSERT INTO woic_event_rsvp (event_id, count) VALUES (?, 1)
            ON DUPLICATE KEY UPDATE count = count + 1
        ');
        $stmt->execute([$eventId]);
    }

    $stmt = $pdo->prepare('SELECT count FROM woic_event_rsvp WHERE event_id = ?');
    $stmt->execute([$eventId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['count' => (int)$row['count']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
