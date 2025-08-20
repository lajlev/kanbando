<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in output

// Start session and set headers
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Log errors to a file instead of displaying them
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Handle preflight OPTIONS requests
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
            try {
                error_log("Fetching all tasks");
                $stmt = $pdo->query("SELECT * FROM tasks ORDER BY status, \"order\" ASC");
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                error_log("Found " . count($tasks) . " tasks");
                echo json_encode($tasks);
            } catch (Exception $e) {
                error_log("Error fetching tasks: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch tasks']);
            }
        }
        break;
        
    case 'POST':
        if ($path === '/tasks') {
            try {
                // Log the raw input for debugging
                $rawInput = file_get_contents('php://input');
                error_log("Raw input: " . $rawInput);
                
                // Decode JSON input
                $data = json_decode($rawInput, true);
                if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception("JSON decode error: " . json_last_error_msg());
                }
                
                // Validate required fields
                if (empty($data['title'])) {
                    throw new Exception("Title is required");
                }
                
                // Process image data
                $images = isset($data['images']) ? json_encode($data['images']) : null;
                $order = $data['order'] ?? 0;
                
                // Insert task into database
                $stmt = $pdo->prepare("INSERT INTO tasks (title, description, status, image, \"order\") VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['title'],
                    $data['description'] ?? '',
                    $data['status'] ?? 'todo',
                    $images,
                    $order
                ]);
                
                // Return success response
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            } catch (Exception $e) {
                // Log the error
                error_log("Task creation error: " . $e->getMessage());
                
                // Return error response
                http_response_code(400);
                echo json_encode(['error' => $e->getMessage()]);
            }
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
            try {
                $id = $matches[1];
                
                // Log the raw input for debugging
                $rawInput = file_get_contents('php://input');
                error_log("Raw update input for task $id: " . $rawInput);
                
                // Decode JSON input
                $data = json_decode($rawInput, true);
                if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception("JSON decode error: " . json_last_error_msg());
                }
                
                // Validate required fields
                if (empty($data['title'])) {
                    throw new Exception("Title is required");
                }
                
                // Process image data
                $images = isset($data['images']) ? json_encode($data['images']) : null;
                $order = $data['order'] ?? 0;
                
                // Update task in database
                $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, status = ?, image = ?, \"order\" = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                $stmt->execute([
                    $data['title'],
                    $data['description'] ?? '',
                    $data['status'] ?? 'todo',
                    $images,
                    $order,
                    $id
                ]);
                
                // Return success response
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                // Log the error
                error_log("Task update error: " . $e->getMessage());
                
                // Return error response
                http_response_code(400);
                echo json_encode(['error' => $e->getMessage()]);
            }
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/tasks\/(\d+)/', $path, $matches)) {
            try {
                $id = $matches[1];
                error_log("Deleting task $id");
                
                $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
                $stmt->execute([$id]);
                
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                error_log("Task deletion error: " . $e->getMessage());
                http_response_code(400);
                echo json_encode(['error' => $e->getMessage()]);
            }
        }
        break;
}
?>