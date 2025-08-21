# KanbanDo 🍇💡

**Marmelade Ideas** - A beautiful, feature-rich Kanban board application for managing your creative projects and ideas.

![KanbanDo Screenshot](https://via.placeholder.com/800x400/f3f4f6/374151?text=KanbanDo+Screenshot)

## ✨ Features

### 🎯 **Core Kanban Functionality**
- **Three-column workflow**: Ideas → In Progress → Done
- **Drag & drop**: Smooth task movement between columns using SortableJS with persistent card ordering
- **Task management**: Create, edit, view, and delete tasks with full CRUD operations
- **Rich task details**: Title, description, and multiple image attachments
- **Real-time updates**: Instant UI updates with optimistic rendering

### 🖼️ **Image Support**
- **Multiple image uploads**: Drag & drop, click to browse, or paste from clipboard
- **Image previews**: Thumbnail previews in tasks and full-size modal viewing
- **File validation**: Supports JPEG, PNG, GIF, WebP with 5MB size limit
- **Smart cleanup**: Automatically remove unused images from storage
- **Logo upload**: Custom application logo support

### 🎉 **Celebration Effects**
- **Confetti animation**: Explosive fruit emoji celebration when tasks are completed
- **Physics-based particles**: Realistic gravity, rotation, and fade effects
- **Screen-filling burst**: Multiple launch points for maximum visual impact

### 🎨 **Modern UI/UX**
- **Responsive design**: Works beautifully on desktop and mobile devices
- **Tailwind CSS**: Clean, professional styling with smooth animations
- **Modular components**: Vue.js 3 Composition API architecture
- **Accessibility**: ARIA labels and keyboard navigation support
- **Dark/Light themes**: Automatic theme detection and manual toggle

### ⚙️ **Settings & Configuration**
- **Settings modal**: Centralized configuration interface
- **Logo customization**: Upload and manage custom application logos
- **Bulk operations**: Delete all completed tasks, cleanup unused images

### 🛠️ **Developer Features**
- **Modular architecture**: Clean separation of concerns with services/utils/components
- **Component-based**: Reusable Vue.js components with clear APIs
- **RESTful API**: Well-structured PHP backend with proper HTTP status codes
- **Error handling**: Comprehensive error handling with user-friendly messages
- **Development tools**: Built-in debugging and logging capabilities

## 🚀 Quick Start

### Prerequisites
- **PHP 7.4+** with SQLite support
- **Web server** (Apache, Nginx, or PHP built-in server)
- **Modern browser** with ES6+ support

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url> kanbando
   cd kanbando
   ```

2. **Set permissions**:
   ```bash
   chmod 755 uploads/
   chmod 644 *.php *.html *.css *.js
   ```

3. **Start development server**:
   ```bash
   php -S localhost:8000
   ```

4. **Open in browser**:
   ```
   http://localhost:8000
   ```

## 📁 Project Structure

```
kanbando/
├── components/              # Vue.js components
│   ├── KanbanBoard.js      # Main kanban interface
│   ├── TaskModal.js        # Task creation/editing modal
│   ├── ViewModal.js        # Task viewing modal
│   ├── DeleteModal.js      # Deletion confirmation modal
│   ├── ImageModal.js       # Full-size image viewer
│   ├── SettingsModal.js    # Application settings
│   ├── Login.js            # Authentication form
│   ├── Sidebar.js          # Navigation sidebar
│   ├── DropdownMenu.js     # Header dropdown menu
│   └── Confetti.js         # Celebration animation
├── services/               # API and service layers
│   └── api.js              # HTTP client and API endpoints
├── utils/                  # Utility functions
│   └── utils.js            # Helper functions and validators
├── uploads/                # Image file storage
├── api.php                 # Main REST API endpoints
├── auth.php                # Authentication endpoints
├── upload.php              # Image upload handler
├── upload_logo.php         # Logo upload handler
├── database.php            # Database connection and setup
├── index.html              # Main application entry point
├── vue.js                  # Vue.js app initialization
├── style.css               # Custom styles and overrides
├── .htaccess               # Apache configuration
├── .gitignore              # Git ignore rules
└── kanban.db               # SQLite database (auto-created)
```

## 📖 Usage Guide

### Task Management

**Creating Tasks**
- Click "New Task" button in any column
- Add title (required) and description
- Upload multiple images via drag & drop, file browser, or clipboard paste
- Tasks are created in the selected column

**Editing Tasks**
- Click any task to view/edit details
- Modify content and images
- Use `Cmd/Ctrl + Enter` to save quickly
- Changes are saved automatically

**Moving Tasks**
- Drag tasks between columns to change status
- Reorder within columns to prioritize
- Positions are automatically saved
- Visual feedback during drag operations

**Deleting Tasks**
- Use the delete button in edit mode
- Confirmation modal prevents accidental deletion
- Associated images are automatically cleaned up

### Image Management

**Uploading Images**
- **Drag & drop**: Drop files directly onto the task form
- **File browser**: Click the upload area to browse files
- **Clipboard**: Paste images directly with `Ctrl/Cmd + V`
- Supported formats: JPEG, PNG, GIF, WebP (max 5MB each)

**Viewing Images**
- Click any image thumbnail for full-size view
- Navigate between images with arrow keys
- Close with `Escape` key or click outside

### Settings & Administration

Access the settings via the dropdown menu (top right):

**Logo Management**
- Upload custom application logos
- Supported formats: PNG, JPEG, GIF, WebP
- Automatically resized for optimal display

**Maintenance Operations**
- **Cleanup Images**: Remove orphaned image files
- **Delete Completed**: Bulk remove all "Done" tasks
- **Export Data**: Download all tasks as JSON

### Keyboard Shortcuts

- `Escape`: Close any open modal
- `Cmd/Ctrl + Enter`: Save task when editing
- `Ctrl + Shift + N`: Create new task
- `Arrow keys`: Navigate images in viewer
- `Tab`: Navigate between form fields

## 🔧 Configuration

### Database Management

The SQLite database is automatically created on first run with:
- Default admin user (`admin/admin`)
- Required tables and indexes
- Sample data for testing

**Generate password hash**:
```php
<?php echo password_hash('your_password', PASSWORD_DEFAULT); ?>
```

### File Upload Configuration

**PHP Settings** (php.ini):
```ini
upload_max_filesize = 5M
post_max_size = 50M
max_file_uploads = 20
```

**Directory Permissions**:
- `uploads/` must be writable by web server
- Consider moving uploads outside document root for security

### Web Server Configuration

**Apache (.htaccess included)**:
- URL rewriting for clean API endpoints
- Security headers and file protection
- MIME type configuration

**Nginx** (add to server block):
```nginx
location /api.php {
    try_files $uri $uri/ /api.php?$query_string;
}

location /uploads {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🛡️ Security

### Authentication & Sessions
- **bcrypt hashing**: Industry-standard password security
- **Session management**: Secure server-side sessions
- **CSRF protection**: Token-based request validation
- **Input sanitization**: All user inputs are validated and sanitized

### File Security
- **Type validation**: Strict MIME type checking
- **Size limits**: Configurable upload size restrictions
- **Path traversal protection**: Secure file naming and storage
- **Access control**: Direct file access restrictions

### Database Security
- **Prepared statements**: Complete SQL injection prevention
- **Connection security**: Secure SQLite file permissions
- **Data validation**: Server-side input validation
- **Error handling**: Secure error messages without information leakage

## 🐛 Troubleshooting

### Common Issues

**Database Errors**
```bash
# Check permissions
ls -la kanban.db
chmod 666 kanban.db  # If needed

# Check SQLite extension
php -m | grep sqlite
```

**Upload Issues**
```bash
# Check directory permissions
ls -la uploads/
chmod 755 uploads/

# Check PHP limits
php -i | grep -E "(upload_max_filesize|post_max_size)"
```

**Authentication Problems**
- Clear browser storage: `localStorage.clear()`
- Check session directory permissions
- Verify PHP session configuration

**Performance Issues**
- Enable PHP OPcache
- Optimize database with `VACUUM` command
- Compress and optimize images

### Debug Mode

Enable detailed logging in `api.php`:
```php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'debug.log');
```

### Browser Developer Tools
- Check Network tab for API call failures
- Monitor Console for JavaScript errors
- Use Vue DevTools for component inspection

## 🤝 Contributing

Please read [DEV-GUIDE.md](DEV-GUIDE.md) before contributing to understand:
- Development setup and workflow
- Code architecture and patterns
- Testing procedures
- Contribution guidelines

### Quick Contribution Setup
1. Fork and clone the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow coding standards in DEV-GUIDE.md
4. Test thoroughly across browsers and devices
5. Submit pull request with detailed description

## 📝 License

This project is open source and available under the [MIT License](LICENSE).Á

## 💡 About

KanbanDo was created to provide a simple, beautiful, and fun way to manage creative projects and ideas. The name "Marmelade Ideas" reflects the sweet, colorful nature of creativity and the joy of bringing ideas to life.

**Technical Stack**:
- **Frontend**: Vue.js 3, Tailwind CSS, SortableJS
- **Backend**: PHP 7.4+, SQLite
- **Architecture**: Component-based SPA with RESTful API

**Performance**:
- Optimistic UI updates for responsive feel
- Efficient image handling and caching
- Minimal dependencies for fast loading

---

**Built with** 🍇 **and** 💡 **by the KanbanDo team**

*For support, bug reports, or feature requests, please create an issue in the project repository.*
