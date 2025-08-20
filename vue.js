const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      isAuthenticated: false,
      currentUser: null,
      isCheckingAuth: true,
      tasks: [],
      showModal: false,
      showDeleteModal: false,
      showViewModal: false,
      showImageModal: false,
      showSettingsModal: false,
      editingTask: null,
      viewingTask: null,
      taskForm: {
        title: "",
        description: "",
        status: "todo",
        images: [],
      },
      imagePreviews: [],
      isDragOver: false,
      fullSizeImage: null,
      statuses: [
        { key: "todo", name: "Backlog" },
        { key: "progress", name: "In Progress" },
        { key: "done", name: "Done" },
      ],
      settings: {
        themeMode: "auto", // auto, light, dark
      },
      showMobileMenu: false,
    };
  },
  async mounted() {
    this.loadSettings();
    this.applyTheme();
    this.showMobileMenu = false; // Ensure mobile menu is closed on init
    await this.checkAuth();
    if (this.isAuthenticated) {
      await this.loadTasks();
      this.initSortable();
      this.setupKeyboardShortcuts();
      this.setupPasteListener();
      
      // Check if URL contains a task ID and open that task
      this.checkUrlForTaskId();
    }

    // Listen for system theme changes
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.handleSystemThemeChange = () => {
      if (this.settings.themeMode === "auto") {
        this.applyTheme();
      }
    };
    this.mediaQuery.addEventListener("change", this.handleSystemThemeChange);
  },

  beforeUnmount() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener(
        "change",
        this.handleSystemThemeChange
      );
    }
  },

  watch: {
    showMobileMenu(newVal, oldVal) {
      // Watch for mobile menu state changes
    },
  },
  methods: {
    async checkAuth() {
      try {
        const response = await fetch("auth.php/check", {
          credentials: "include",
        });
        const result = await response.json();

        this.isAuthenticated = result.authenticated;
        this.currentUser = result.user || null;
      } catch (error) {
        // Handle auth check error
        this.isAuthenticated = false;
      } finally {
        this.isCheckingAuth = false;
      }
    },

    handleLogin(user) {
      this.isAuthenticated = true;
      this.currentUser = user;
      this.loadTasks();
      this.initSortable();
      this.setupKeyboardShortcuts();
      this.setupPasteListener();
    },

    async logout() {
      try {
        await fetch("auth.php/logout", {
          method: "POST",
          credentials: "include",
        });
        this.isAuthenticated = false;
        this.currentUser = null;
        this.tasks = [];
      } catch (error) {
        // Handle logout error
      }
    },

    async loadTasks() {
      console.log("Loading tasks...");
      try {
        const response = await fetch("api.php/tasks", {
          credentials: "include",
        });

        console.log("Load tasks response status:", response.status);
        
        if (response.status === 401) {
          console.error("Authentication error: User not authenticated");
          this.isAuthenticated = false;
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error loading tasks:", response.status, errorText);
          return;
        }

        const data = await response.json();
        console.log("Tasks loaded:", data.length);
        this.tasks = data;

        // Sort tasks by status and order (negative orders appear at the top)
        this.tasks.sort((a, b) => {
          if (a.status === b.status) {
            const aOrder = a.order !== undefined ? parseInt(a.order) : 0;
            const bOrder = b.order !== undefined ? parseInt(b.order) : 0;
            return aOrder - bOrder;
          }
          return this.statuses.findIndex(s => s.key === a.status) - this.statuses.findIndex(s => s.key === b.status);
        });
        
        console.log("Tasks sorted:", this.tasks.map(t => ({ id: t.id, title: t.title, status: t.status, order: t.order })));
      } catch (error) {
        console.error("Task loading error:", error);
      }
    },
    openModal(status = "todo") {
      this.taskForm = { title: "", description: "", status, images: [] };
      this.editingTask = null;
      this.imagePreviews = [];
      this.showModal = true;
    },
    editTask(task) {
      this.taskForm = { ...task };
      this.editingTask = task;

      // Convert images to the new format
      const images = this.getTaskImages(task);
      this.taskForm.images = images;
      this.imagePreviews = images.map((img) => ({
        filename: img,
        url: "uploads/" + img,
      }));

      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.editingTask = null;
      this.imagePreviews = [];
      this.isDragOver = false;
    },
    async saveTask() {
      if (!this.taskForm.title.trim()) {
        console.error("Task creation failed: Empty title");
        alert("Task title cannot be empty");
        return;
      }

      try {
        const wasEditing = !!this.editingTask;
        const taskId = this.editingTask?.id;
        
        // Create a copy of the task form data to modify
        const taskData = { ...this.taskForm };
        
        // For new tasks, set order to -1 so they appear at the top
        if (!wasEditing) {
          taskData.order = -1;
        }
        
        console.log("Task form data:", JSON.stringify(taskData));

        let response;
        if (this.editingTask) {
          console.log(`Updating task ${this.editingTask.id}`);
          response = await fetch(`api.php/tasks/${this.editingTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(taskData),
          });
        } else {
          console.log("Creating new task with order -1");
          response = await fetch("api.php/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(taskData),
          });
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error:", response.status, errorText);
          alert(`Failed to save task: ${response.status} ${response.statusText}`);
          return;
        }
        
        const result = await response.json();
        console.log("API response:", result);

        await this.loadTasks();
        this.closeModal();

        // If we were editing an existing task, return to view mode
        if (wasEditing && taskId) {
          const updatedTask = this.tasks.find((t) => t.id == taskId);
          if (updatedTask) {
            this.viewTask(updatedTask);
          }
        }
      } catch (error) {
        console.error("Task saving error:", error);
        alert("Error saving task: " + (error.message || "Unknown error"));
      }
    },
    confirmDeleteTask() {
      if (!confirm("Delete this task?")) return;
      this.deleteTask(this.editingTask.id);
    },
    async deleteTask(id) {
      try {
        await fetch(`api.php/tasks/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        await this.loadTasks();
        this.closeModal();
      } catch (error) {
        // Handle task deletion error
      }
    },
    async updateTaskStatus(taskId, newStatus) {
      const task = this.tasks.find((t) => t.id == taskId);
      if (task) {
        const oldStatus = task.status;
        task.status = newStatus;

        // Trigger confetti if task moved to done
        if (oldStatus !== "done" && newStatus === "done") {
          this.$refs.confetti.triggerConfetti();
        }

        try {
          // Convert image JSON string back to array for API
          let images = [];
          if (task.image) {
            try {
              images = JSON.parse(task.image);
              if (!Array.isArray(images)) images = [];
            } catch (e) {
              images = [];
            }
          }

          const updateData = {
            title: task.title,
            description: task.description,
            status: task.status,
            images: images,
          };

          await fetch(`api.php/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updateData),
          });
        } catch (error) {
          // Handle task update error
        }
      }
    },
    initSortable() {
      this.statuses.forEach((status) => {
        const columnElement = document.getElementById(status.key);
        if (!columnElement) return;
        // Find the scroll container div inside the column
        const scrollContainer = columnElement.querySelector(".overflow-y-auto");
        if (!scrollContainer) return;
        Sortable.create(scrollContainer, {
          group: "shared",
          animation: 200,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          ghostClass: "sortable-ghost",
          chosenClass: "sortable-chosen",
          dragClass: "sortable-drag",
          forceFallback: true,
          fallbackTolerance: 3,
          preventOnFilter: false,
          draggable: "> div", // Make only direct child divs (task cards) draggable
          onStart: (evt) => {
            document.body.style.cursor = "grabbing";
            // Prevent text selection during drag
            document.body.style.userSelect = "none";
          },
          onEnd: (evt) => {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            const taskId = evt.item.dataset.id;
            const newStatus = evt.to.dataset.status;
            const oldStatus = evt.from.dataset.status;
            const isSameColumn = newStatus === oldStatus;
            
            // Process drag end event
            
            const updatePromise = isSameColumn
              ? Promise.resolve() // If same column, no need to update status
              : this.updateTaskStatus(taskId, newStatus);
              
            updatePromise.then(() => {
              const updatedOrders = [];
              
              // If columns are different, update both source and destination columns
              if (!isSameColumn) {
                // Update source column order
                const sourceColumnElement = evt.from;
                const sourceTaskElements = Array.from(sourceColumnElement.children).filter(el => el.tagName === 'DIV');
                
                sourceTaskElements.forEach((el, index) => {
                  const id = el.dataset.id;
                  const task = this.tasks.find(t => t.id == id);
                  if (task) {
                    task.order = index;
                    updatedOrders.push({
                      id: task.id,
                      order: index,
                      status: oldStatus,
                      title: task.title,
                      description: task.description,
                      images: this.getTaskImages(task)
                    });
                  }
                });
              }
              
              // Always update destination column order
              const destColumnElement = evt.to;
              const destTaskElements = Array.from(destColumnElement.children).filter(el => el.tagName === 'DIV');
              
              destTaskElements.forEach((el, index) => {
                const id = el.dataset.id;
                const task = this.tasks.find(t => t.id == id);
                if (task) {
                  task.order = index;
                  if (isSameColumn) {
                    // For same column moves, we only need to update the order
                    updatedOrders.push({
                      id: task.id,
                      order: index,
                      status: newStatus,
                      title: task.title,
                      description: task.description,
                      images: this.getTaskImages(task)
                    });
                  } else {
                    // For cross-column moves, update both order and status
                    task.status = newStatus;
                    updatedOrders.push({
                      id: task.id,
                      order: index,
                      status: newStatus,
                      title: task.title,
                      description: task.description,
                      images: this.getTaskImages(task)
                    });
                  }
                }
              });
              
              // Send batch update for order and status
              console.log("Updating task orders:", updatedOrders);
              
              // Use Promise.all to wait for all updates to complete
              Promise.all(updatedOrders.map(taskUpdate => {
                console.log(`Updating task ${taskUpdate.id} order to ${taskUpdate.order}`);
                return fetch(`api.php/tasks/${taskUpdate.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    title: taskUpdate.title,
                    description: taskUpdate.description,
                    status: taskUpdate.status,
                    images: taskUpdate.images,
                    order: taskUpdate.order
                  }),
                })
                .then(response => {
                  if (!response.ok) {
                    return response.text().then(text => {
                      throw new Error(`Failed to update task order: ${response.status} ${text}`);
                    });
                  }
                  return response.json();
                });
              }))
              .then(results => {
                console.log("All task orders updated successfully");
              })
              .catch(error => {
                console.error("Error updating task orders:", error);
                alert("Error updating task order. Please refresh the page.");
              });
            });
          },
        });
      });
    },
    deleteDoneTasks() {
      const doneTasks = this.tasks.filter((task) => task.status === "done");
      if (doneTasks.length === 0) return;
      this.showDeleteModal = true;
    },
    async confirmDeleteDoneTasks() {
      try {
        const doneTasks = this.tasks.filter((task) => task.status === "done");
        for (const task of doneTasks) {
          await fetch(`api.php/tasks/${task.id}`, { method: "DELETE" });
        }
        await this.loadTasks();
        this.closeDeleteModal();
      } catch (error) {
        // Handle error deleting done tasks
      }
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
    },
    getDoneTasksCount() {
      return this.tasks.filter((task) => task.status === "done").length;
    },
    async handleFileSelect(event) {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        await this.uploadImages(files);
      }
    },
    async handleDrop(event) {
      this.isDragOver = false;
      const files = Array.from(event.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        await this.uploadImages(files);
      }
    },
    async uploadImages(files) {
      // Validate file sizes
      for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" too large. Maximum size is 5MB`);
          return;
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images[]", file);
      });

      try {
        const response = await fetch("upload.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // Add new images to existing ones
          result.files.forEach((fileInfo) => {
            this.taskForm.images.push(fileInfo.filename);
            this.imagePreviews.push({
              filename: fileInfo.filename,
              url: fileInfo.path,
            });
          });
        } else {
          alert("Upload failed: " + result.error);
        }
      } catch (error) {
        // Handle upload error
        alert("Upload failed. Please try again.");
      }
    },
    removeImage(index) {
      this.taskForm.images.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },
    viewTask(task) {
      this.viewingTask = task;
      this.showViewModal = true;
      
      // Update URL to include task ID
      const taskId = task.id;
      history.pushState({taskId}, '', `/${taskId}`);
    },
    closeViewModal() {
      this.showViewModal = false;
      this.viewingTask = null;
      
      // Restore the URL to base URL when modal is closed
      history.pushState({}, '', '/');
    },
    editFromView() {
      this.taskForm = { ...this.viewingTask };
      this.editingTask = this.viewingTask;

      // Convert images to the new format
      const images = this.getTaskImages(this.viewingTask);
      this.taskForm.images = images;
      this.imagePreviews = images.map((img) => ({
        filename: img,
        url: "uploads/" + img,
      }));

      this.closeViewModal();
      this.showModal = true;
    },
    getStatusName(status) {
      const statusMap = {
        todo: "Backlog",
        progress: "In Progress",
        done: "Done",
      };
      return statusMap[status] || status;
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return "just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
      } else {
        // For very old dates, fall back to absolute format
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${month}-${day}-${year}`;
      }
    },
    getTaskImages(task) {
      if (!task.image) return [];
      try {
        return JSON.parse(task.image);
      } catch (e) {
        return [];
      }
    },
    viewFullImage(imageSrc) {
      this.fullSizeImage = imageSrc;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.fullSizeImage = null;
    },
    async deleteUnusedImages() {
      if (!confirm("Delete all unused images? This action cannot be undone."))
        return;

      try {
        const response = await fetch("api.php/cleanup-images", {
          method: "POST",
          credentials: "include",
        });
        const result = await response.json();

        if (result.success) {
          alert(`Deleted ${result.deleted_count} unused images`);
        } else {
          alert("Error deleting unused images: " + result.error);
        }
      } catch (error) {
        // Handle error deleting unused images
        alert("Error deleting unused images. Please try again.");
      }
    },
    setupPasteListener() {
      document.addEventListener("paste", (e) => {
        // Only handle paste when modal is open
        if (!this.showModal) return;

        const items = e.clipboardData.items;
        const imageFiles = [];

        for (let item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              imageFiles.push(file);
            }
          }
        }

        if (imageFiles.length > 0) {
          e.preventDefault();
          this.uploadImages(imageFiles);
        }
      });
    },
    setupKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Escape key to dismiss modal
        if (e.key === "Escape" && this.showModal) {
          this.closeModal();
          return;
        }

        // Escape key to dismiss delete modal
        if (e.key === "Escape" && this.showDeleteModal) {
          this.closeDeleteModal();
          return;
        }

        // Escape key to dismiss view modal
        if (e.key === "Escape" && this.showViewModal) {
          this.closeViewModal();
          return;
        }

        // Escape key to dismiss image modal
        if (e.key === "Escape" && this.showImageModal) {
          this.closeImageModal();
          return;
        }

        // Cmd+Enter to save task when modal is open
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && this.showModal) {
          e.preventDefault();
          this.saveTask();
          return;
        }

        // Ctrl+Shift+N to open new task modal
        if (
          e.key === "N" &&
          e.ctrlKey &&
          e.shiftKey &&
          !this.showModal &&
          !this.showDeleteModal
        ) {
          e.preventDefault();
          this.openModal();
          return;
        }
      });
    },

    // Settings methods
    loadSettings() {
      const savedSettings = localStorage.getItem("kanbanSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        // Migration: convert old darkMode setting to new themeMode
        if (
          parsed.hasOwnProperty("darkMode") &&
          !parsed.hasOwnProperty("themeMode")
        ) {
          parsed.themeMode = parsed.darkMode ? "dark" : "light";
          delete parsed.darkMode;
        }

        this.settings = { ...this.settings, ...parsed };
      }
    },

    saveSettings() {
      localStorage.setItem("kanbanSettings", JSON.stringify(this.settings));
      this.applyTheme();
    },

    applyTheme() {
      const isDark = this.getEffectiveDarkMode();
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    getEffectiveDarkMode() {
      switch (this.settings.themeMode) {
        case "dark":
          return true;
        case "light":
          return false;
        case "auto":
        default:
          return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    },

    toggleThemeMode() {
      const modes = ["auto", "light", "dark"];
      const currentIndex = modes.indexOf(this.settings.themeMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      this.settings.themeMode = modes[nextIndex];
      this.saveSettings();
    },

    setThemeMode(mode) {
      this.settings.themeMode = mode;
      this.saveSettings();
    },

    openSettings() {
      this.showSettingsModal = true;
    },

    closeSettings() {
      this.showSettingsModal = false;
    },

    saveSettingsFromModal(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.saveSettings();
    },

    async handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file too large. Maximum size is 2MB");
        return;
      }

      const formData = new FormData();
      formData.append("logo", file);

      try {
        const response = await fetch("upload_logo.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          this.settings.appLogo = result.path;
          this.saveSettings();
        } else {
          alert("Logo upload failed: " + result.error);
        }
      } catch (error) {
        // Handle logo upload error
      }
    },

    removeLogo() {
      this.settings.appLogo = null;
      this.saveSettings();
    },

    closeMobileMenu() {
      this.showMobileMenu = false;
    },
    
    // Handle direct access to task URLs
    checkUrlForTaskId() {
      const path = window.location.pathname;
      const match = path.match(/^\/(\d+)$/);
      
      if (match && match[1]) {
        const taskId = match[1];
        console.log(`Direct access to task ID: ${taskId}`);
        
        // Find the task with this ID
        const task = this.tasks.find(t => t.id == taskId);
        
        if (task) {
          // Open the task view
          this.viewTask(task);
        } else {
          console.error(`Task with ID ${taskId} not found`);
          // Redirect to home page if task not found
          history.pushState({}, '', '/');
        }
      }
    },
  },
});

app.component("login-form", Login);
app.component("app-sidebar", Sidebar);
app.component("dropdown-menu", DropdownMenu);
app.component("settings-modal", SettingsModal);
app.component("kanban-board", KanbanBoard);
app.component("task-modal", TaskModal);
app.component("delete-modal", DeleteModal);
app.component("view-modal", ViewModal);
app.component("image-modal", ImageModal);
app.component("confetti", Confetti);

app.mount("#app");
