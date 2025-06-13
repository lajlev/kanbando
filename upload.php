<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$uploadDir = 'uploads/';
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function processFile($files, $index, $uploadDir, $maxFileSize, $allowedTypes) {
    // Get file properties based on whether it's array or single
    if ($index !== null) {
        $tmpName = $files['tmp_name'][$index];
        $name = $files['name'][$index];
        $size = $files['size'][$index];
    } else {
        $tmpName = $files['tmp_name'];
        $name = $files['name'];
        $size = $files['size'];
    }
    
    // Validate file size
    if ($size > $maxFileSize) {
        throw new Exception("File '$name' too large. Maximum size is 5MB");
    }
    
    // Validate file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $tmpName);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception("Invalid file type for '$name'. Only JPEG, PNG, GIF, and WebP are allowed");
    }
    
    // Generate unique filename
    $extension = pathinfo($name, PATHINFO_EXTENSION);
    $filename = uniqid('img_', true) . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($tmpName, $filepath)) {
        throw new Exception("Failed to save file '$name'");
    }
    
    return [
        'filename' => $filename,
        'path' => $filepath,
        'originalName' => $name
    ];
}

try {
    if (!isset($_FILES['images'])) {
        throw new Exception('No files uploaded');
    }
    
    $files = $_FILES['images'];
    $uploadedFiles = [];
    
    // Handle both single and multiple file uploads
    if (is_array($files['name'])) {
        // Multiple files
        $fileCount = count($files['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $uploadedFiles[] = processFile($files, $i, $uploadDir, $maxFileSize, $allowedTypes);
            }
        }
    } else {
        // Single file
        if ($files['error'] === UPLOAD_ERR_OK) {
            $uploadedFiles[] = processFile($files, null, $uploadDir, $maxFileSize, $allowedTypes);
        }
    }
    
    if (empty($uploadedFiles)) {
        throw new Exception('No files were successfully uploaded');
    }
    
    echo json_encode([
        'success' => true,
        'files' => $uploadedFiles
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>