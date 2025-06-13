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
        { key: "todo", name: "Ideas" },
        { key: "progress", name: "In Progress" },
        { key: "done", name: "Done" },
      ],
    };
  },
  async mounted() {
    await this.checkAuth();
    if (this.isAuthenticated) {
      await this.loadTasks();
      this.initSortable();
      this.setupKeyboardShortcuts();
      this.setupPasteListener();
    }
  },
  methods: {
    async checkAuth() {
      try {
        const response = await fetch('auth.php/check', {
          credentials: 'include'
        });
        const result = await response.json();
        
        this.isAuthenticated = result.authenticated;
        this.currentUser = result.user || null;
      } catch (error) {
        console.error('Auth check error:', error);
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
        await fetch('auth.php/logout', {
          method: 'POST',
          credentials: 'include'
        });
        this.isAuthenticated = false;
        this.currentUser = null;
        this.tasks = [];
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    
    async loadTasks() {
      try {
        const response = await fetch("api.php/tasks", {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          this.isAuthenticated = false;
          return;
        }
        
        this.tasks = await response.json();
      } catch (error) {
        console.error("Error loading tasks:", error);
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
      this.imagePreviews = images.map(img => ({
        filename: img,
        url: 'uploads/' + img
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
      if (!this.taskForm.title.trim()) return;

      try {
        const wasEditing = !!this.editingTask;
        const taskId = this.editingTask?.id;

        if (this.editingTask) {
          await fetch(`api.php/tasks/${this.editingTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify(this.taskForm),
          });
        } else {
          await fetch("api.php/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify(this.taskForm),
          });
        }

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
        console.error("Error saving task:", error);
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
          credentials: 'include'
        });
        await this.loadTasks();
        this.closeModal();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    async updateTaskStatus(taskId, newStatus) {
      const task = this.tasks.find((t) => t.id == taskId);
      if (task) {
        const oldStatus = task.status;
        task.status = newStatus;
        
        // Trigger confetti if task moved to done
        if (oldStatus !== 'done' && newStatus === 'done') {
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
            images: images
          };
          
          await fetch(`api.php/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify(updateData),
          });
        } catch (error) {
          console.error("Error updating task:", error);
        }
      }
    },
    initSortable() {
      this.statuses.forEach((status) => {
        const element = document.getElementById(status.key);
        Sortable.create(element, {
          group: "shared",
          animation: 200,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          ghostClass: "sortable-ghost",
          chosenClass: "sortable-chosen",
          dragClass: "sortable-drag",
          forceFallback: true,
          fallbackTolerance: 3,
          onStart: (evt) => {
            document.body.style.cursor = "grabbing";
          },
          onEnd: (evt) => {
            document.body.style.cursor = "";
            const taskId = evt.item.dataset.id;
            const newStatus = evt.to.id;
            this.updateTaskStatus(taskId, newStatus);
          },
        });
      });
    },
    deleteDoneTasks() {
      const doneTasks = this.tasks.filter(
        (task) => task.status === "done"
      );
      if (doneTasks.length === 0) return;
      this.showDeleteModal = true;
    },
    async confirmDeleteDoneTasks() {
      try {
        const doneTasks = this.tasks.filter(
          (task) => task.status === "done"
        );
        for (const task of doneTasks) {
          await fetch(`api.php/tasks/${task.id}`, { method: "DELETE" });
        }
        await this.loadTasks();
        this.closeDeleteModal();
      } catch (error) {
        console.error("Error deleting done tasks:", error);
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
      const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith("image/"));
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
      files.forEach(file => {
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
          result.files.forEach(fileInfo => {
            this.taskForm.images.push(fileInfo.filename);
            this.imagePreviews.push({
              filename: fileInfo.filename,
              url: fileInfo.path
            });
          });
        } else {
          alert("Upload failed: " + result.error);
        }
      } catch (error) {
        console.error("Upload error:", error);
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
    },
    closeViewModal() {
      this.showViewModal = false;
      this.viewingTask = null;
    },
    editFromView() {
      this.taskForm = { ...this.viewingTask };
      this.editingTask = this.viewingTask;
      
      // Convert images to the new format
      const images = this.getTaskImages(this.viewingTask);
      this.taskForm.images = images;
      this.imagePreviews = images.map(img => ({
        filename: img,
        url: 'uploads/' + img
      }));
      
      this.closeViewModal();
      this.showModal = true;
    },
    getStatusName(status) {
      const statusMap = {
        todo: "Ideas",
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
      if (!confirm("Delete all unused images? This action cannot be undone.")) return;
      
      try {
        const response = await fetch("api.php/cleanup-images", {
          method: "POST",
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
          alert(`Deleted ${result.deleted_count} unused images`);
        } else {
          alert("Error deleting unused images: " + result.error);
        }
      } catch (error) {
        console.error("Error deleting unused images:", error);
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
        if (
          e.key === "Enter" &&
          (e.metaKey || e.ctrlKey) &&
          this.showModal
        ) {
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
  },
});

app.component('login-form', Login);
app.component('app-header', Header);
app.component('dropdown-menu', DropdownMenu);
app.component('kanban-board', KanbanBoard);
app.component('task-modal', TaskModal);
app.component('delete-modal', DeleteModal);
app.component('view-modal', ViewModal);
app.component('image-modal', ImageModal);
app.component('confetti', Confetti);

app.mount("#app");