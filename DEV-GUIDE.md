# KanbanDo Developer Guide 🛠️

A comprehensive guide for developers contributing to the KanbanDo project. This document covers architecture, coding standards, development workflow, and best practices.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Architecture Overview](#-architecture-overview)
- [Development Environment](#-development-environment)
- [Code Structure](#-code-structure)
- [Coding Standards](#-coding-standards)
- [Component Development](#-component-development)
- [API Development](#-api-development)
- [Database Schema](#-database-schema)
- [Testing Guidelines](#-testing-guidelines)
- [Debugging](#-debugging)
- [Performance Considerations](#-performance-considerations)
- [Security Guidelines](#-security-guidelines)
- [Contribution Workflow](#-contribution-workflow)
- [Common Patterns](#-common-patterns)
- [Troubleshooting](#-troubleshooting)

## 🚀 Getting Started

### Prerequisites

- **PHP 7.4+** with extensions: `sqlite3`, `pdo_sqlite`, `gd`, `fileinfo`
- **Node.js 16+** (for development tools, optional)
- **Git** for version control

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone <repository-url> kanbando
   cd kanbando
   cp .env.example .env  # If available
   ```

2. **Set permissions**:
   ```bash
   chmod 755 uploads/
   chmod 644 *.php *.html *.css *.js
   find components/ -type f -exec chmod 644 {} \;
   ```

3. **Start development server**:
   ```bash
   php -S localhost:8000
   ```

4. **Optional: Install development tools**:
   ```bash
   npm install -g browser-sync  # For live reload
   browser-sync start --proxy localhost:8000 --files "*.php,*.js,*.css,*.html"
   ```



## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vue.js 3)    │◄──►│   (PHP)         │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Components    │    │ • REST API      │    │ • Tasks         │
│ • Services      │    │ • Authentication│    │ • Users         │
│ • Utils         │    │ • File Upload   │    │ • Images        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend**:
- **Vue.js 3**: Composition API for reactive components
- **Tailwind CSS**: Utility-first CSS framework
- **SortableJS**: Drag and drop functionality
- **Native Web APIs**: File handling, clipboard, local storage

**Backend**:
- **PHP 7.4+**: Server-side logic and API
- **SQLite**: Lightweight database
- **Session-based Auth**: Secure authentication system
- **RESTful Design**: Standard HTTP methods and status codes

**Development**:
- **ES6+ Modules**: Modern JavaScript module system
- **Component Architecture**: Reusable UI components
- **Service Layer**: API abstraction
- **Utility Functions**: Shared helper functions

### Data Flow

1. **User Interaction** → Vue.js Component
2. **Component** → Service Layer (api.js)
3. **Service** → PHP API Endpoint
4. **API** → Database Operations
5. **Database** → Response Back Through Chain
6. **Component** → UI Update (Reactivity)

## 💻 Development Environment

### File Watching and Live Reload

**Browser-sync setup**:
```bash
# Terminal 1: PHP Server
php -S localhost:8000

# Terminal 2: Browser-sync
browser-sync start --proxy localhost:8000 --files "**/*.php,**/*.js,**/*.css,*.html"
```

**Manual refresh workflow**:
- PHP changes: Refresh browser
- JavaScript/CSS: Hard refresh (`Cmd/Ctrl + Shift + R`)
- Database changes: Restart PHP server

### Debugging Setup

**PHP Debugging**:
```php
// Enable in development
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'debug.log');
error_reporting(E_ALL);
```

**JavaScript Debugging**:
```javascript
// Use console methods
console.log('Debug info:', data);
console.warn('Warning:', warning);
console.error('Error:', error);

// Vue devtools
const app = createApp({
  // ... component options
});
app.config.devtools = true; // Enable in development
```

## 📁 Code Structure

### Directory Organization

```
kanbando/
├── components/              # Vue.js UI components
│   ├── KanbanBoard.js      # Main board interface
│   ├── TaskModal.js        # Task CRUD modal
│   ├── ViewModal.js        # Read-only task view
│   ├── DeleteModal.js      # Confirmation dialogs
│   ├── ImageModal.js       # Image viewer
│   ├── SettingsModal.js    # App configuration
│   ├── Login.js            # Authentication UI
│   ├── Sidebar.js          # Navigation panel
│   ├── DropdownMenu.js     # User menu
│   └── Confetti.js         # Celebration animation
├── services/               # API and business logic
│   └── api.js              # HTTP client and endpoints
├── utils/                  # Shared utilities
│   └── utils.js            # Helper functions
├── uploads/                # User-uploaded files
├── api.php                 # Main REST API
├── auth.php                # Authentication endpoints
├── upload.php              # File upload handler
├── upload_logo.php         # Logo upload handler
├── database.php            # DB connection and setup
├── index.html              # Application entry point
├── vue.js                  # Vue app initialization
├── style.css               # Custom styles
└── .htaccess               # Apache configuration
```

### Component Structure

Each Vue component follows this pattern:

```javascript
// components/ExampleComponent.js
export default {
  name: 'ExampleComponent',
  props: {
    // Define props with types and validation
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['update', 'delete'], // Declare emitted events
  data() {
    return {
      // Local component state
      loading: false,
      error: null
    };
  },
  computed: {
    // Reactive computed properties
    processedItems() {
      return this.items.filter(item => item.active);
    }
  },
  methods: {
    // Component methods
    async handleAction() {
      this.loading = true;
      try {
        // Async operation
        const result = await this.apiCall();
        this.$emit('update', result);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
    <div class="component-container">
      <!-- Template content -->
    </div>
  `
};
```

### Service Layer Pattern

```javascript
// services/api.js
class ApiService {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Specific API methods
  async getTasks() {
    return this.request('/api.php/tasks');
  }
}

export const api = new ApiService();
```

## 🎯 Coding Standards

### JavaScript Standards

**ES6+ Features**:
```javascript
// Use const/let, not var
const config = { api: '/api.php' };
let currentUser = null;

// Arrow functions for callbacks
items.map(item => ({ ...item, processed: true }));

// Destructuring
const { title, description } = task;
const [first, ...rest] = array;

// Template literals
const message = `Task "${title}" was updated`;

// Async/await over promises
async function fetchData() {
  try {
    const data = await api.getTasks();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}
```

**Naming Conventions**:
```javascript
// Variables and functions: camelCase
const userName = 'admin';
const getCurrentUser = () => user;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = '/api.php';
const DEFAULT_STATUS = 'todo';

// Components: PascalCase
const TaskModal = { /* ... */ };

// Events: kebab-case
this.$emit('task-updated', task);
```

**Error Handling**:
```javascript
// Always handle async errors
async function updateTask(task) {
  try {
    const result = await api.updateTask(task);
    showSuccess('Task updated successfully');
    return result;
  } catch (error) {
    showError(`Failed to update task: ${error.message}`);
    throw error; // Re-throw if caller needs to handle
  }
}

// Validate inputs
function createTask(taskData) {
  if (!taskData.title) {
    throw new Error('Task title is required');
  }
  
  if (taskData.title.length > 255) {
    throw new Error('Task title too long');
  }
  
  // Process valid data
}
```

### PHP Standards

**PSR-12 Compliance**:
```php
<?php

declare(strict_types=1);

namespace KanbanDo\Api;

class TaskController
{
    private DatabaseConnection $db;
    
    public function __construct(DatabaseConnection $db)
    {
        $this->db = $db;
    }
    
    public function getTasks(): array
    {
        $stmt = $this->db->prepare('
            SELECT id, title, description, status, created_at 
            FROM tasks 
            ORDER BY position, created_at
        ');
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

**Security Practices**:
```php
// Always use prepared statements
$stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
$stmt->execute([$taskId]);

// Validate and sanitize input
function validateTaskData(array $data): array
{
    $title = trim($data['title'] ?? '');
    if (empty($title)) {
        throw new InvalidArgumentException('Title is required');
    }
    
    if (strlen($title) > 255) {
        throw new InvalidArgumentException('Title too long');
    }
    
    return [
        'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
        'description' => htmlspecialchars($data['description'] ?? '', ENT_QUOTES, 'UTF-8'),
        'status' => in_array($data['status'] ?? '', ['todo', 'doing', 'done']) 
            ? $data['status'] 
            : 'todo'
    ];
}

// Proper error responses
function sendError(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}
```

### CSS/Tailwind Standards

**Component Styling**:
```html
<!-- Use semantic class combinations -->
<div class="bg-white rounded-lg shadow-md p-6 mb-4 transition-all duration-200 hover:shadow-lg">
  <h3 class="text-lg font-semibold text-gray-800 mb-2">Task Title</h3>
  <p class="text-gray-600 text-sm mb-4">Task description...</p>
</div>

<!-- Responsive design -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="col-span-1 md:col-span-2">Main content</div>
  <div class="col-span-1">Sidebar</div>
</div>
```

**Custom CSS** (only when necessary):
```css
/* Use CSS custom properties for theming */
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

/* Component-specific styles */
.task-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
  transition: all 0.2s ease-in-out;
}

.task-card:hover {
  @apply shadow-md border-gray-300;
}

/* Animation keyframes */
@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## 🧩 Component Development

### Component Lifecycle

```javascript
export default {
  name: 'TaskComponent',
  
  // 1. Props and emits definition
  props: ['task', 'editable'],
  emits: ['update', 'delete'],
  
  // 2. Data initialization
  data() {
    return {
      isEditing: false,
      localTask: { ...this.task }
    };
  },
  
  // 3. Computed properties
  computed: {
    canEdit() {
      return this.editable && !this.localTask.completed;
    }
  },
  
  // 4. Watchers
  watch: {
    task: {
      handler(newTask) {
        this.localTask = { ...newTask };
      },
      deep: true,
      immediate: true
    }
  },
  
  // 5. Lifecycle hooks
  created() {
    // Component created, no DOM yet
  },
  
  mounted() {
    // DOM is available
    this.initializeComponent();
  },
  
  updated() {
    // Component re-rendered
  },
  
  unmounted() {
    // Cleanup
    this.cleanup();
  },
  
  // 6. Methods
  methods: {
    initializeComponent() {
      // Setup logic
    },
    
    cleanup() {
      // Cleanup logic
    }
  }
};
```

### Event Handling Patterns

```javascript
// Parent-child communication
// Parent component
export default {
  template: `
    <TaskModal 
      :task="editingTask"
      @task-saved="handleTaskSaved"
      @modal-closed="handleModalClosed"
    />
  `,
  methods: {
    handleTaskSaved(task) {
      // Update local state
      this.updateTask(task);
      // Show feedback
      this.showSuccess('Task saved successfully');
    }
  }
};

// Child component
export default {
  methods: {
    async saveTask() {
      try {
        const savedTask = await api.updateTask(this.localTask);
        this.$emit('task-saved', savedTask);
        this.$emit('modal-closed');
      } catch (error) {
        this.showError(error.message);
      }
    }
  }
};
```

### State Management Patterns

```javascript
// Simple state management with provide/inject
// App.js
export default {
  provide() {
    return {
      appState: this.appState,
      updateTasks: this.updateTasks,
      showMessage: this.showMessage
    };
  },
  
  data() {
    return {
      appState: {
        tasks: [],
        user: null,
        loading: false
      }
    };
  },
  
  methods: {
    updateTasks(tasks) {
      this.appState.tasks = tasks;
    }
  }
};

// Child component
export default {
  inject: ['appState', 'updateTasks'],
  
  computed: {
    tasks() {
      return this.appState.tasks;
    }
  }
};
```

## 🔗 API Development

### RESTful Endpoint Structure

```php
// api.php - Main API router
<?php
require_once 'database.php';

// Parse request
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$pathInfo = parse_url($requestUri, PHP_URL_PATH);
$pathSegments = explode('/', trim($pathInfo, '/'));

// Route to appropriate handler
switch ($pathSegments[1] ?? '') {
    case 'tasks':
        handleTasksEndpoint($requestMethod, $pathSegments);
        break;
    case 'upload':
        handleUploadEndpoint($requestMethod);
        break;
    default:
        sendError('Endpoint not found', 404);
}

function handleTasksEndpoint(string $method, array $segments): void
{
    $taskId = $segments[2] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($taskId) {
                getTask($taskId);
            } else {
                getTasks();
            }
            break;
            
        case 'POST':
            createTask();
            break;
            
        case 'PUT':
            if (!$taskId) {
                sendError('Task ID required for update', 400);
            }
            updateTask($taskId);
            break;
            
        case 'DELETE':
            if (!$taskId) {
                sendError('Task ID required for deletion', 400);
            }
            deleteTask($taskId);
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}
```

### Database Operations

```php
// database.php - Database abstraction
<?php

class Database
{
    private PDO $pdo;
    
    public function __construct(string $dbPath = 'kanban.db')
    {
        $this->pdo = new PDO("sqlite:$dbPath");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->initializeDatabase();
    }
    
    private function initializeDatabase(): void
    {
        // Create tables if they don't exist
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT "todo",
                position INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ');
    }
    
    public function getTasks(): array
    {
        $stmt = $this->pdo->query('
            SELECT * FROM tasks 
            ORDER BY position ASC, created_at ASC
        ');
        
        return $stmt->fetchAll();
    }
    
    public function createTask(array $data): array
    {
        $stmt = $this->pdo->prepare('
            INSERT INTO tasks (title, description, status, position) 
            VALUES (?, ?, ?, ?)
        ');
        
        $stmt->execute([
            $data['title'],
            $data['description'] ?? '',
            $data['status'] ?? 'todo',
            $this->getNextPosition($data['status'] ?? 'todo')
        ]);
        
        return $this->getTask($this->pdo->lastInsertId());
    }
    
    private function getNextPosition(string $status): int
    {
        $stmt = $this->pdo->prepare('
            SELECT MAX(position) as max_pos 
            FROM tasks 
            WHERE status = ?
        ');
        $stmt->execute([$status]);
        
        $result = $stmt->fetch();
        return ($result['max_pos'] ?? 0) + 1;
    }
}
```

### Request Validation

```php
// Validation helper functions
function validateTaskData(array $data): array
{
    $errors = [];
    
    // Required fields
    if (empty($data['title'])) {
        $errors[] = 'Title is required';
    }
    
    // Length validation
    if (strlen($data['title'] ?? '') > 255) {
        $errors[] = 'Title must be less than 255 characters';
    }
    
    // Enum validation
    $validStatuses = ['todo', 'doing', 'done'];
    if (!empty($data['status']) && !in_array($data['status'], $validStatuses)) {
        $errors[] = 'Invalid status value';
    }
    
    if (!empty($errors)) {
        sendError('Validation failed: ' . implode(', ', $errors), 422);
    }
    
    return [
        'title' => trim($data['title']),
        'description' => trim($data['description'] ?? ''),
        'status' => $data['status'] ?? 'todo'
    ];
}

function validateImageUpload(array $file): void
{
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendError('Upload failed: ' . getUploadError($file['error']), 400);
    }
    
    // Validate file size (5MB max)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendError('File too large. Maximum size is 5MB', 413);
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    
    if (!in_array($mimeType, $allowedTypes)) {
        sendError('Invalid file type. Only images are allowed', 415);
    }
}
```

## 🗄️ Database Schema

### Current Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- bcrypt hash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',  -- todo, doing, done
    position INTEGER DEFAULT 0,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Task images table
CREATE TABLE task_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Application settings table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_position ON tasks(status, position);
CREATE INDEX idx_task_images_task_id ON task_images(task_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### Migration Strategy

```php
// database.php - Version management
class DatabaseMigrations
{
    private PDO $pdo;
    private int $currentVersion;
    
    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->initializeVersionTable();
        $this->currentVersion = $this->getCurrentVersion();
    }
    
    public function runMigrations(): void
    {
        $migrations = [
            1 => 'createInitialTables',
            2 => 'addUserIdToTasks',
            3 => 'createTaskImagesTable',
            4 => 'addIndexes'
        ];
        
        foreach ($migrations as $version => $method) {
            if ($version > $this->currentVersion) {
                $this->$method();
                $this->updateVersion($version);
            }
        }
    }
    
    private function createInitialTables(): void
    {
        $this->pdo->exec('CREATE TABLE tasks (...)');
        $this->pdo->exec('CREATE TABLE users (...)');
    }
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Authentication**:
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Session persistence across page refreshes
- [ ] Logout functionality
- [ ] Session timeout handling

**Task Management**:
- [ ] Create task with title only
- [ ] Create task with title and description
- [ ] Edit existing task
- [ ] Delete task with confirmation
- [ ] Cancel task operations

**Drag and Drop**:
- [ ] Drag task between columns
- [ ] Reorder tasks within same column
- [ ] Visual feedback during drag
- [ ] Position persistence after page refresh

**Image Handling**:
- [ ] Upload single image via file picker
- [ ] Upload multiple images via drag and drop
- [ ] Paste image from clipboard
- [ ] View full-size images
- [ ] Delete images from task

**Browser Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

### Automated Testing Setup

```javascript
// tests/unit/utils.test.js
// Simple test runner for utility functions

const { formatDate, validateFileSize } = require('../utils/utils.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testFormatDate() {
  const date = new Date('2023-01-01T12:00:00Z');
  const formatted = formatDate(date);
  assert(formatted === 'Jan 1, 2023', 'Date formatting failed');
  console.log('✓ formatDate test passed');
}

function testValidateFileSize() {
  assert(validateFileSize(1024 * 1024) === true, 'Valid file size should pass');
  assert(validateFileSize(6 * 1024 * 1024) === false, 'Large file should fail');
  console.log('✓ validateFileSize test passed');
}

// Run tests
try {
  testFormatDate();
  testValidateFileSize();
  console.log('All tests passed! ✅');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
```

### Performance Testing

```javascript
// Performance monitoring
function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name}: ${end - start}ms`);
  return result;
}

// Example usage
const tasks = measurePerformance('Load tasks', () => {
  return api.getTasks();
});

// Memory usage tracking
function trackMemoryUsage() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log('Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    });
  }
}
```

## 🐛 Debugging

### Debug Tools Setup

```javascript
// Debug utility functions
const debug = {
  enabled: window.location.hostname === 'localhost',
  
  log(...args) {
    if (this.enabled) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  error(...args) {
    if (this.enabled) {
      console.error('[ERROR]', ...args);
    }
  },
  
  trace(label) {
    if (this.enabled) {
      console.trace(label);
    }
  },
  
  table(data) {
    if (this.enabled && data) {
      console.table(data);
    }
  }
};

// API debugging
const apiDebug = {
  logRequest(url, options) {
    debug.log('API Request:', url, options);
  },
  
  logResponse(url, response) {
    debug.log('API Response:', url, response);
  },
  
  logError(url, error) {
    debug.error('API Error:', url, error);
  }
};
```

### Common Debug Scenarios

```javascript
// Task creation debugging
async function createTask(taskData) {
  debug.log('Creating task with data:', taskData);
  
  try {
    // Validate data
    if (!taskData.title) {
      throw new Error('Title is required');
    }
    
    debug.log('Validation passed, calling API');
    const result = await api.createTask(taskData);
    
    debug.log('Task created successfully:', result);
    return result;
    
  } catch (error) {
    debug.error('Task creation failed:', {
      error: error.message,
      stack: error.stack,
      taskData
    });
    throw error;
  }
}

// Drag and drop debugging
function onDragEnd(event) {
  debug.log('Drag ended:', {
    from: event.from.id,
    to: event.to.id,
    oldIndex: event.oldIndex,
    newIndex: event.newIndex,
    item: event.item.dataset
  });
}
```

### PHP Debugging

```php
// Debug logging function
function debugLog($message, $data = null): void
{
    if (defined('DEBUG') && DEBUG) {
        $logMessage = '[' . date('Y-m-d H:i:s') . '] ' . $message;
        if ($data !== null) {
            $logMessage .= ': ' . json_encode($data);
        }
        error_log($logMessage);
    }
}

// Usage in API endpoints
function createTask(): void
{
    debugLog('Creating task', $_POST);
    
    try {
        $data = validateTaskData($_POST);
        debugLog('Validation passed', $data);
        
        $task = $db->createTask($data);
        debugLog('Task created', $task);
        
        sendSuccess($task);
    } catch (Exception $e) {
        debugLog('Task creation failed', ['error' => $e->getMessage()]);
        sendError($e->getMessage());
    }
}
```

## ⚡ Performance Considerations

### Frontend Optimization

**Component Optimization**:
```javascript
// Use computed properties for expensive operations
computed: {
  filteredTasks() {
    // Cached until dependencies change
    return this.tasks.filter(task => task.status === this.currentStatus);
  }
},

// Avoid unnecessary re-renders
shouldComponentUpdate(nextProps, nextState) {
  return nextProps.task.id !== this.props.task.id ||
         nextState.isEditing !== this.state.isEditing;
},

// Use v-memo for expensive list items (Vue 3.2+)
template: `
  <div v-for="task in tasks" :key="task.id" v-memo="[task.id, task.title, task.status]">
    <!-- Task content -->
  </div>
`
```

**Image Optimization**:
```javascript
// Lazy loading for images
const ImageViewer = {
  template: `
    <img 
      :src="imageSrc"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="onImageLoad"
      @error="onImageError"
    />
  `,
  
  props: ['src', 'lazy'],
  
  data() {
    return {
      imageSrc: this.lazy ? '/placeholder.png' : this.src
    };
  },
  
  mounted() {
    if (this.lazy) {
      this.setupIntersectionObserver();
    }
  },
  
  methods: {
    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.imageSrc = this.src;
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(this.$el);
    }
  }
};
```

### Backend Optimization

**Database Optimization**:
```php
// Use prepared statements with caching
class OptimizedDatabase
{
    private array $statementCache = [];
    
    public function prepare(string $sql): PDOStatement
    {
        if (!isset($this->statementCache[$sql])) {
            $this->statementCache[$sql] = $this->pdo->prepare($sql);
        }
        return $this->statementCache[$sql];
    }
    
    // Batch operations
    public function updateTaskPositions(array $tasks): void
    {
        $this->pdo->beginTransaction();
        
        try {
            $stmt = $this->prepare('UPDATE tasks SET position = ? WHERE id = ?');
            
            foreach ($tasks as $task) {
                $stmt->execute([$task['position'], $task['id']]);
            }
            
            $this->pdo->commit();
        } catch (Exception $e) {
            $this->pdo->rollback();
            throw $e;
        }
    }
}

// Optimize queries with proper indexes
$pdo->exec('CREATE INDEX IF NOT EXISTS idx_tasks_status_position ON tasks(status, position)');
$pdo->exec('CREATE INDEX IF NOT EXISTS idx_task_images_task_id ON task_images(task_id)');
```

**Caching Strategy**:
```php
// Simple file-based caching
class SimpleCache
{
    private string $cacheDir;
    private int $defaultTtl;
    
    public function __construct(string $cacheDir = './cache', int $defaultTtl = 3600)
    {
        $this->cacheDir = $cacheDir;
        $this->defaultTtl = $defaultTtl;
        
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }
    }
    
    public function get(string $key)
    {
        $file = $this->getCacheFile($key);
        
        if (!file_exists($file)) {
            return null;
        }
        
        $data = json_decode(file_get_contents($file), true);
        
        if ($data['expires'] < time()) {
            unlink($file);
            return null;
        }
        
        return $data['value'];
    }
    
    public function set(string $key, $value, int $ttl = null): void
    {
        $file = $this->getCacheFile($key);
        $data = [
            'value' => $value,
            'expires' => time() + ($ttl ?? $this->defaultTtl)
        ];
        
        file_put_contents($file, json_encode($data));
    }
}
```

## 🔐 Security Guidelines

### Input Validation

**Frontend Validation**:
```javascript
// Client-side validation (for UX, not security)
const validators = {
  required(value) {
    return value && value.toString().trim().length > 0;
  },
  
  maxLength(value, max) {
    return value.toString().length <= max;
  },
  
  email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  imageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
  }
};

// Form validation helper
function validateForm(data, rules) {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      if (!validators[rule.type](data[field], rule.param)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  
  return errors;
}
```

**Backend Validation**:
```php
// Server-side validation (security-critical)
class Validator
{
    public static function validateTask(array $data): array
    {
        $errors = [];
        
        // Required fields
        if (empty($data['title'])) {
            $errors['title'] = 'Title is required';
        }
        
        // Length validation
        if (strlen($data['title'] ?? '') > 255) {
            $errors['title'] = 'Title too long (max 255 characters)';
        }
        
        // XSS prevention
        $data['title'] = htmlspecialchars($data['title'] ?? '', ENT_QUOTES, 'UTF-8');
        $data['description'] = htmlspecialchars($data['description'] ?? '', ENT_QUOTES, 'UTF-8');
        
        // Status validation
        $validStatuses = ['todo', 'doing', 'done'];
        if (!in_array($data['status'] ?? 'todo', $validStatuses)) {
            $errors['status'] = 'Invalid status';
        }
        
        if (!empty($errors)) {
            throw new ValidationException($errors);
        }
        
        return $data;
    }
}
```

### File Upload Security

```php
// Secure file upload handling
function handleFileUpload(array $file): string
{
    // Validate upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Upload failed');
    }
    
    // Check file size
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('File too large');
    }
    
    // Validate file type using multiple methods
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Check MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type');
    }
    
    // Check file extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($extension, $allowedExtensions)) {
        throw new Exception('Invalid file extension');
    }
    
    // Generate secure filename
    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    $uploadPath = 'uploads/' . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to save file');
    }
    
    return $filename;
}
```

### Authentication Security

```php
// Secure password handling
function hashPassword(string $password): string
{
    // Use strong hashing algorithm
    return password_hash($password, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,  // 64 MB
        'time_cost' => 4,        // 4 iterations
        'threads' => 3,          // 3 threads
    ]);
}

function verifyPassword(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}

// Session security
function startSecureSession(): void
{
    // Configure session security
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.use_strict_mode', '1');
    
    session_start();
    
    // Regenerate session ID to prevent fixation
    if (!isset($_SESSION['initiated'])) {
        session_regenerate_id(true);
        $_SESSION['initiated'] = true;
    }
}
```

## 🤝 Contribution Workflow

### Git Workflow

**Branch Naming**:
```bash
# Feature branches
git checkout -b feature/task-templates
git checkout -b feature/user-management

# Bug fixes
git checkout -b fix/image-upload-validation
git checkout -b fix/drag-drop-position

# Documentation
git checkout -b docs/api-documentation
git checkout -b docs/deployment-guide

# Refactoring
git checkout -b refactor/component-structure
git checkout -b refactor/database-layer
```

**Commit Messages**:
```bash
# Use conventional commit format
git commit -m "feat: add task template functionality"
git commit -m "fix: resolve image upload validation bug"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify component structure"
git commit -m "test: add unit tests for utils"

# Include detailed description for complex changes
git commit -m "feat: implement multi-user support

- Add user management endpoints
- Update database schema with user relations
- Implement role-based permissions
- Add user switching in UI

Closes #123, #124"
```

**Pull Request Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified

## Screenshots
Include screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated if needed
```

### Code Review Process

**Review Checklist**:
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Performance**: Will this impact performance negatively?
- [ ] **Code Quality**: Is the code clean and maintainable?
- [ ] **Standards**: Does it follow project coding standards?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is documentation updated?

**Review Comments**:
```markdown
# Constructive feedback examples

## Suggestion
Consider using a Map instead of an array for faster lookups:
```javascript
const taskMap = new Map(tasks.map(task => [task.id, task]));
```

## Issue
This function is missing error handling:
```javascript
async function updateTask(task) {
  // Add try-catch block here
  const result = await api.updateTask(task);
  return result;
}
```

## Nitpick
Minor style issue - consider consistent naming:
```javascript
// Current
const userID = getUserID();
// Preferred
const userId = getUserId();
```

## Praise
Great implementation of the drag and drop functionality! The visual feedback is excellent.
```

### Release Process

**Version Numbering** (Semantic Versioning):
- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes (backward compatible)

**Release Checklist**:
```markdown
## Pre-release
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in relevant files
- [ ] Database migrations tested
- [ ] Security audit completed

## Release
- [ ] Create release branch
- [ ] Final testing on staging
- [ ] Create GitHub release
- [ ] Deploy to production
- [ ] Monitor for issues

## Post-release
- [ ] Merge back to main branch
- [ ] Update project boards
- [ ] Communicate release to team
- [ ] Monitor performance metrics
```

## 🔄 Common Patterns

### Error Handling Patterns

**Frontend Error Handling**:
```javascript
// Error boundary pattern for Vue
const ErrorHandler = {
  errorCaptured(error, instance, info) {
    console.error('Component error:', error);
    console.error('Error info:', info);
    
    // Report to error tracking service
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        extra: { componentInfo: info }
      });
    }
    
    // Prevent error from propagating
    return false;
  }
};

// API error handling
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error || 'Request failed',
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing error
    throw new ApiError('Network error', 0, { originalError: error });
  }
}
```

**Backend Error Handling**:
```php
// Custom exception classes
class ValidationException extends Exception
{
    private array $errors;
    
    public function __construct(array $errors, string $message = 'Validation failed')
    {
        $this->errors = $errors;
        parent::__construct($message);
    }
    
    public function getErrors(): array
    {
        return $this->errors;
    }
}

// Global error handler
function handleApiError(Throwable $error): void
{
    // Log error details
    error_log(sprintf(
        'API Error: %s in %s:%d',
        $error->getMessage(),
        $error->getFile(),
        $error->getLine()
    ));
    
    // Send appropriate response
    if ($error instanceof ValidationException) {
        http_response_code(422);
        echo json_encode([
            'error' => 'Validation failed',
            'details' => $error->getErrors()
        ]);
    } elseif ($error instanceof PDOException) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
    }
}
```

### Loading States Pattern

```javascript
// Composable loading state management
const useLoading = () => {
  const loading = ref(false);
  const error = ref(null);
  
  const withLoading = async (asyncFn) => {
    loading.value = true;
    error.value = null;
    
    try {
      return await asyncFn();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return { loading, error, withLoading };
};

// Usage in component
export default {
  setup() {
    const { loading, error, withLoading } = useLoading();
    const tasks = ref([]);
    
    const loadTasks = () => {
      return withLoading(async () => {
        tasks.value = await api.getTasks();
      });
    };
    
    onMounted(loadTasks);
    
    return { loading, error, tasks, loadTasks };
  },
  
  template: `
    <div>
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <!-- Task list -->
      </div>
    </div>
  `
};
```

### Data Synchronization Pattern

```javascript
// Optimistic updates with rollback
class OptimisticUpdater {
  constructor(api, store) {
    this.api = api;
    this.store = store;
  }
  
  async updateTask(taskId, updates) {
    // Store original state for rollback
    const originalTask = this.store.getTask(taskId);
    
    // Apply optimistic update
    this.store.updateTask(taskId, updates);
    
    try {
      // Send to server
      const updatedTask = await this.api.updateTask(taskId, updates);
      
      // Confirm update with server data
      this.store.updateTask(taskId, updatedTask);
      
      return updatedTask;
    } catch (error) {
      // Rollback on failure
      this.store.updateTask(taskId, originalTask);
      throw error;
    }
  }
}
```

## 🔧 Troubleshooting

### Common Development Issues

**Issue: PHP SQLite Permission Denied**
```bash
# Solution
chmod 666 kanban.db
chmod 755 . # Directory must be writable for SQLite
```

**Issue: JavaScript Module Import Errors**
```javascript
// Problem: Relative imports not working
import { api } from '../services/api.js';

// Solution: Use absolute paths from project root
import { api } from './services/api.js';
```

**Issue: CORS Errors in Development**
```php
// Add to PHP files
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
```

**Issue: File Upload Not Working**
```php
// Check PHP configuration
echo "Max file size: " . ini_get('upload_max_filesize') . "\n";
echo "Max post size: " . ini_get('post_max_size') . "\n";
echo "Max files: " . ini_get('max_file_uploads') . "\n";

// Check directory permissions
if (!is_writable('uploads/')) {
    chmod('uploads/', 0755);
}
```

**Issue: Session Not Persisting**
```php
// Check session configuration
ini_set('session.cookie_lifetime', 86400); // 24 hours
ini_set('session.gc_maxlifetime', 86400);
session_start();

// Verify session directory is writable
$sessionPath = session_save_path();
if (!is_writable($sessionPath)) {
    echo "Session directory not writable: $sessionPath";
}
```

### Performance Debugging

**Frontend Performance**:
```javascript
// Measure component render times
const measureRender = (componentName, renderFn) => {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  
  if (end - start > 16) { // Slower than 60fps
    console.warn(`${componentName} render took ${end - start}ms`);
  }
  
  return result;
};

// Memory leak detection
let componentInstances = 0;

export default {
  created() {
    componentInstances++;
    console.log(`Component instances: ${componentInstances}`);
  },
  
  unmounted() {
    componentInstances--;
    console.log(`Component instances: ${componentInstances}`);
  }
};
```

**Backend Performance**:
```php
// Query performance monitoring
class QueryLogger
{
    private float $startTime;
    
    public function startQuery(string $sql): void
    {
        $this->startTime = microtime(true);
        error_log("Starting query: $sql");
    }
    
    public function endQuery(): void
    {
        $duration = microtime(true) - $this->startTime;
        if ($duration > 0.1) { // Log slow queries
            error_log("Slow query took {$duration}s");
        }
    }
}

// Memory usage tracking
function logMemoryUsage(string $label): void
{
    $memory = memory_get_usage(true);
    $peak = memory_get_peak_usage(true);
    error_log("$label - Memory: " . ($memory / 1024 / 1024) . "MB, Peak: " . ($peak / 1024 / 1024) . "MB");
}
```

### Browser-Specific Issues

**Safari Quirks**:
```javascript
// Safari doesn't support some modern features
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // Use polyfills or alternative implementations
  if (!window.structuredClone) {
    window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
  }
}
```

**Mobile Browser Issues**:
```css
/* Fix viewport issues on mobile */
@supports (-webkit-touch-callout: none) {
  /* iOS Safari specific styles */
  .modal {
    position: fixed;
    top: 0;
    bottom: 0;
    -webkit-overflow-scrolling: touch;
  }
}

/* Android Chrome specific styles */
@media screen and (max-width: 768px) {
  .drag-handle {
    /* Larger touch targets on mobile */
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## 📚 Additional Resources

### Documentation
- [Vue.js 3 Documentation](https://vuejs.org/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PHP Manual](https://www.php.net/manual/en/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SortableJS Documentation](https://sortablejs.github.io/Sortable/)

### Tools
- [Vue DevTools](https://devtools.vuejs.org/)
- [PHP Debug Bar](http://phpdebugbar.com/)
- [SQLite Browser](https://sqlitebrowser.org/)
- [Postman](https://www.postman.com/) for API testing

### Best Practices
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [PHP Standards](https://www.php-fig.org/psr/)
- [REST API Design](https://restfulapi.net/)

---

**Remember**: This is a living document. Update it as the project evolves and new patterns emerge. Good code is not just working code—it's code that other developers can understand, maintain, and extend.

**Happy coding!** 🎉