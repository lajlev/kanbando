<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Check authentication for all API calls
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
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
            $images = isset($data['images']) ? json_encode($data['images']) : null;
            $stmt = $pdo->prepare("INSERT INTO tasks (title, description, status, image) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['title'], $data['description'] ?? '', $data['status'] ?? 'todo', $images]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
        } elseif ($path === '/cleanup-images') {
            try {
                // Get all images referenced in the database
                $stmt = $pdo->query("SELECT image FROM tasks WHERE image IS NOT NULL AND image != ''");
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $usedImages = [];
                foreach ($tasks as $task) {
                    if (!empty($task['image'])) {
                        $images = json_decode($task['image'], true);
                        if (is_array($images)) {
                            $usedImages = array_merge($usedImages, $images);
                        }
                    }
                }
                
                // Make array unique to avoid duplicates
                $usedImages = array_unique($usedImages);
                
                // Get all files in uploads directory
                $uploadsDir = 'uploads/';
                if (!is_dir($uploadsDir)) {
                    echo json_encode(['success' => false, 'error' => 'Uploads directory not found']);
                    break;
                }
                
                $uploadedFiles = array_diff(scandir($uploadsDir), ['.', '..']);
                
                // Find unused images
                $unusedImages = [];
                foreach ($uploadedFiles as $file) {
                    if (!in_array($file, $usedImages)) {
                        $unusedImages[] = $file;
                    }
                }
                
                // Delete unused images
                $deletedCount = 0;
                foreach ($unusedImages as $image) {
                    $filePath = $uploadsDir . $image;
                    if (is_file($filePath) && unlink($filePath)) {
                        $deletedCount++;
                    }
                }
                
                echo json_encode([
                    'success' => true, 
                    'deleted_count' => $deletedCount,
                    'deleted_files' => $unusedImages
                ]);
                
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/tasks\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            $data = json_decode(file_get_contents('php://input'), true);
            $images = isset($data['images']) ? json_encode($data['images']) : null;
            $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, status = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$data['title'], $data['description'], $data['status'], $images, $id]);
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