# KanbanDo 🍇💡

**Marmelade Ideas** - A beautiful, feature-rich Kanban board application for managing your creative projects and ideas.

![KanbanDo Screenshot](https://via.placeholder.com/800x400/f3f4f6/374151?text=KanbanDo+Screenshot)

## ✨ Features

### 🎯 **Core Kanban Functionality**
- **Three-column workflow**: Ideas → In Progress → Done
- **Drag & drop**: Smooth task movement between columns using SortableJS with persistent card ordering
- **Task management**: Create, edit, view, and delete tasks
- **Rich task details**: Title, description, and multiple image attachments

### 🖼️ **Image Support**
- **Multiple image uploads**: Drag & drop, click to browse, or paste from clipboard
- **Image previews**: Thumbnail previews in tasks and full-size modal viewing
- **File validation**: Supports JPEG, PNG, GIF, WebP with 5MB size limit
- **Smart cleanup**: Automatically remove unused images from storage

### 🎉 **Celebration Effects**
- **Confetti animation**: Explosive fruit emoji celebration when tasks are completed
- **Physics-based particles**: Realistic gravity, rotation, and fade effects
- **Screen-filling burst**: Multiple launch points for maximum visual impact

### 🔐 **Authentication System**
- **Secure login**: Session-based authentication with password hashing
- **User management**: SQLite database with secure credential storage
- **Default account**: `admin/admin` credentials created automatically (can be changed in the SQLite database)
- **Session persistence**: Maintains login across page refreshes

### 🎨 **Modern UI/UX**
- **Responsive design**: Works beautifully on desktop and mobile devices
- **Tailwind CSS**: Clean, professional styling with smooth animations
- **Modular components**: Vue.js component architecture for maintainability
- **Keyboard shortcuts**: Escape to close modals, Cmd+Enter to save tasks

### 🛠️ **Developer Features**
- **Component-based**: Modular Vue.js components for easy customization
- **RESTful API**: Clean PHP backend with SQLite database
- **File organization**: Separated concerns with dedicated component files
- **Error handling**: Comprehensive error handling and user feedback

## 🚀 Quick Start

### Prerequisites
- PHP 7.4 or higher
- Web server (Apache, Nginx, or PHP built-in server)
- SQLite support (usually included with PHP)

### Installation

1. **Clone or download** the project files to your web directory:
   ```bash
   git clone <repository-url> kanbando
   cd kanbando
   ```

2. **Set up web server** or use PHP's built-in server:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

4. **Login with default credentials**:
   - Username: `admin`
   - Password: `admin`

### Directory Structure
```
kanbando/
├── components/           # Vue.js components
│   ├── Sidebar.js       # App sidebar with menu
│   ├── Login.js         # Authentication form
│   ├── KanbanBoard.js   # Main kanban interface
│   ├── TaskModal.js     # Task creation/editing
│   ├── ViewModal.js     # Task viewing
│   ├── DeleteModal.js   # Deletion confirmation
│   ├── ImageModal.js    # Full-size image viewer
│   ├── Confetti.js      # Celebration animation
│   └── DropdownMenu.js  # Header dropdown menu
├── uploads/             # Image file storage
├── api.php             # Main API endpoints
├── auth.php            # Authentication endpoints
├── upload.php          # Image upload handler
├── database.php        # Database connection
├── index.html          # Main application
├── vue.js              # Vue.js app logic
├── style.css           # Custom styles
├── kanban.db           # SQLite database (auto-created)
└── README.md           # This file
```

## 📖 Usage Guide

### Basic Workflow

1. **Login**: Use the default `admin/admin` credentials
2. **Create tasks**: Click "New Task" in the Ideas column
3. **Add details**: Include title, description, and images
4. **Move tasks**: Drag between columns as work progresses
5. **Celebrate**: Enjoy the confetti when tasks reach "Done"! 🎉

### Task Management

- **Create**: Click "New Task" button in Ideas column
- **Edit**: Click on any task to view/edit details
- **Move**: Drag tasks between columns or reorder within the same column (positions are saved automatically)
- **Delete**: Use delete button in edit mode
- **Images**: Support for multiple images per task

### Admin Features

Access the menu (top right) for administrative functions:
- **Delete unused images**: Clean up orphaned image files
- **Delete all done tasks**: Bulk remove completed tasks
- **Sign out**: End current session

### Keyboard Shortcuts

- `Escape`: Close any open modal
- `Cmd/Ctrl + Enter`: Save task when editing
- `Ctrl + Shift + N`: Create new task

## 🔧 Configuration

### Database Setup
The SQLite database (`kanban.db`) is created automatically on first run. Default admin user is created with credentials `admin/admin`.

To change the default login credentials, update the `users` table in the `kanban.db` SQLite database. The password must be stored as a bcrypt hash.

Example SQL to update the first user:

```sql
UPDATE users
SET username = 'admin',
    password = '<bcrypt-hash-of-admin>'
WHERE id = 1;
```

You can generate a bcrypt hash for the password using PHP:

```php
<?php
echo password_hash('admin', PASSWORD_DEFAULT);
?>
```

### File Uploads
- **Upload directory**: `uploads/` (must be writable)
- **Max file size**: 5MB per image
- **Supported formats**: JPEG, PNG, GIF, WebP

### Customization

#### Adding New Users
Currently, users must be added directly to the database. Future versions will include user management UI.

#### Styling
- Edit `style.css` for custom styles
- Tailwind CSS classes used throughout components
- Component-specific styling in individual component files

#### API Endpoints
- `GET /api.php/tasks` - Fetch all tasks
- `POST /api.php/tasks` - Create new task
- `PUT /api.php/tasks/{id}` - Update task
- `DELETE /api.php/tasks/{id}` - Delete task
- `POST /api.php/cleanup-images` - Remove unused images

## 🛡️ Security

### Authentication
- **Password hashing**: PHP's `password_hash()` with secure defaults
- **Session management**: Server-side session storage
- **CSRF protection**: Session-based authentication prevents CSRF attacks
- **Input validation**: Server-side validation for all inputs

### File Uploads
- **Type validation**: Only image files allowed
- **Size limits**: 5MB maximum file size
- **Storage isolation**: Uploads stored outside web root when possible

### Database
- **Prepared statements**: Protection against SQL injection
- **SQLite**: File-based database for simple deployment

## 🐛 Troubleshooting

### Common Issues

**Database not writable**
- Ensure web server has write permissions to project directory
- Check SQLite extension is enabled in PHP

**File uploads not working**
- Verify `uploads/` directory exists and is writable
- Check PHP `upload_max_filesize` and `post_max_size` settings

**Authentication issues**
- Clear browser cookies/session storage
- Restart web server to reset sessions

**Images not displaying**
- Check file permissions on `uploads/` directory
- Verify image files exist and are accessible

### Debug Mode
Add this to the top of `api.php` for debugging:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with clear messages
5. Submit pull request

### Code Style
- **PHP**: PSR-12 coding standard
- **JavaScript**: ES6+ features, consistent indentation
- **CSS**: BEM methodology where applicable
- **Vue.js**: Composition API preferred for new components

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

### Planned Features
- [ ] User management interface
- [ ] Multiple users support
- [ ] Task labels and categories
- [ ] Due dates and reminders
- [ ] Team collaboration features
- [ ] Export/import functionality
- [ ] Dark mode theme
- [ ] Mobile app version

### Known Issues
- [ ] Large image files may cause upload timeouts
- [ ] Confetti animation performance on older devices
- [ ] Session timeout handling could be improved
- [x] Card positions are now saved when dragged to a new position

---

## 💡 About

KanbanDo was created to provide a simple, beautiful, and fun way to manage creative projects and ideas. The name "Marmelade Ideas" reflects the sweet, colorful nature of creativity and the joy of bringing ideas to life.

**Built with**: Vue.js, PHP, SQLite, Tailwind CSS, SortableJS

**Made with** 🍇 **and** 💡 **by the KanbanDo team**

---

*For support or questions, please create an issue in the project repository.*