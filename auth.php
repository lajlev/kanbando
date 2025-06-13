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

require_once 'database.php';

$db = new Database();
$pdo = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';

switch ($method) {
    case 'POST':
        if ($path === '/login') {
            $data = json_decode(file_get_contents('php://input'), true);
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Username and password required']);
                break;
            }
            
            $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'username' => $user['username']]]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
            }
        } elseif ($path === '/logout') {
            session_destroy();
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'GET':
        if ($path === '/check') {
            if (isset($_SESSION['user_id'])) {
                echo json_encode(['authenticated' => true, 'user' => ['id' => $_SESSION['user_id'], 'username' => $_SESSION['username']]]);
            } else {
                echo json_encode(['authenticated' => false]);
            }
        }
        break;
}
?>