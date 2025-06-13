<?php
class Database {
    private $pdo;
    
    public function __construct() {
        try {
            $this->pdo = new PDO('sqlite:kanban.db');
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->createTables();
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    private function createTables() {
        // Create tasks table
        $sql = "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'todo',
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->pdo->exec($sql);
        
        // Create users table
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->pdo->exec($sql);
        
        // Insert default admin user if no users exist
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM users");
        $userCount = $stmt->fetchColumn();
        
        if ($userCount == 0) {
            $defaultPassword = password_hash('admin', PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            $stmt->execute(['admin', $defaultPassword]);
        }
    }
    
    public function getConnection() {
        return $this->pdo;
    }
}
?>