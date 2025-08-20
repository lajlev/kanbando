<?php
require_once 'database.php';

// Connect to the database
$db = new Database();
$pdo = $db->getConnection();

try {
    // Check if the order column already exists
    $stmt = $pdo->query("PRAGMA table_info(tasks)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $orderColumnExists = false;
    foreach ($columns as $column) {
        if ($column['name'] === 'order') {
            $orderColumnExists = true;
            break;
        }
    }
    
    // Add the order column if it doesn't exist
    if (!$orderColumnExists) {
        echo "Adding 'order' column to tasks table...\n";
        $pdo->exec("ALTER TABLE tasks ADD COLUMN \"order\" INTEGER DEFAULT 0");
        echo "Column added successfully.\n";
    } else {
        echo "'order' column already exists in tasks table.\n";
    }
    
    echo "Database schema updated successfully.\n";
} catch (PDOException $e) {
    echo "Error updating database schema: " . $e->getMessage() . "\n";
}
?>