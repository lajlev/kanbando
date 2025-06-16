<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';

switch ($method) {
    case 'POST':
        if ($path === '/login') {
            $data = json_decode(file_get_contents('php://input'), true);
            $password = $data['password'] ?? '';
            
            if (empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Password required']);
                exit;
            }
            
            // Load password from .env file
            $env = parse_ini_file(__DIR__ . '/.env');
            $admin_password = $env['ADMIN_PASSWORD'] ?? '';
            
            // Trim passwords to avoid whitespace issues
            $password = trim($password);
            $admin_password = trim($admin_password);
            
            // Debug output
            error_log("Received password: " . $password);
            error_log("Admin password: " . $admin_password);
            
            if ($password === $admin_password) {
                $_SESSION['user_id'] = 1;
                $_SESSION['username'] = 'fruityai';
                echo json_encode(['success' => true, 'user' => ['id' => 1, 'username' => 'fruityai']]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
            }
            exit;
        } elseif ($path === '/logout') {
            session_destroy();
            echo json_encode(['success' => true]);
            exit;
        }
        break;
        
    case 'GET':
        if ($path === '/check') {
            if (isset($_SESSION['user_id'])) {
                echo json_encode(['authenticated' => true, 'user' => ['id' => $_SESSION['user_id'], 'username' => $_SESSION['username']]]);
            } else {
                echo json_encode(['authenticated' => false]);
            }
            exit;
        }
        break;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Not Found']);
exit;