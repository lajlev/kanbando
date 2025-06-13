<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'database.php';

$db = new Database();
$pdo = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';

switch ($method) {
    case 'GET':
        if ($path === '/tasks') {
            $stmt = $pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;
        
    case 'POST':
        if ($path === '/tasks') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)");
            $stmt->execute([$data['title'], $data['description'] ?? '', $data['status'] ?? 'todo']);
            echo json_encode(['id' => $pdo->lastInsertId()]);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/tasks\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$data['title'], $data['description'], $data['status'], $id]);
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/tasks\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        break;
}
?>