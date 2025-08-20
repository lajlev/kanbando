const ViewModal = {
  template: `
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeViewModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg w-[50%] max-w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl"
        @click.stop
      >
        <!-- Header with title and edit button -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-start mb-3">
            <h1
              class="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight"
              v-if="viewingTask"
            >
              <span class="relative">
                <span
                  class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                  @click.stop="copyTaskUrl(viewingTask.id)"
                  title="Click to copy link"
                >
                  #{{ viewingTask.id }}
                </span>
                
                <!-- Copy feedback animation -->
                <div
                  v-if="copyFeedback.visible"
                  class="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-md animate-fade-in-out flex items-center"
                  style="animation: fadeInOut 2s ease-in-out; white-space: nowrap; z-index: 9999;"
                >
                  <span class="mr-1">📋</span> Link copied
                </div>
              </span>
              {{ viewingTask.title }}
            </h1>
            <button
              class="ml-4 px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded transition-colors flex-shrink-0"
              @click="editFromView"
            >
              ✏️
            </button>
          </div>

          <div
            class="flex items-center gap-3"
            v-if="viewingTask"
          >
            <span
              class="inline-block px-3 py-1 rounded-full text-sm font-medium"
              :class="{
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': viewingTask.status === 'todo',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': viewingTask.status === 'progress',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': viewingTask.status === 'done'
                  }"
            >
              {{ getStatusName(viewingTask.status) }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              ✨ {{ formatDate(viewingTask.created_at) }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div
          class="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-b-lg"
          @click="editFromView"
        >
          <div
            v-if="viewingTask && viewingTask.description"
            class="mb-6"
          >
            <div class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {{ viewingTask.description }}
            </div>
          </div>

          <div
            v-if="viewingTask && getTaskImages(viewingTask).length > 0"
            class="mb-6"
          >
            <div class="flex gap-2">
              <div 
                v-for="(image, index) in getTaskImages(viewingTask)"
                :key="index"
                class="bg-gray-50 dark:bg-gray-700 rounded shadow-md cursor-pointer hover:opacity-75 transition-opacity"
                @click.stop="viewFullImage('uploads/' + image)"
              >
                <img
                  :src="'uploads/' + image"
                  class="w-auto h-14 rounded"
                />
              </div>
            </div>
          </div>

          <div
            v-if="!viewingTask || (!viewingTask.description && getTaskImages(viewingTask).length === 0)"
            class="text-gray-500 dark:text-gray-400 italic text-center py-8"
          >
            No additional details
            <div class="text-xs mt-2 text-gray-400 dark:text-gray-500">Click to add content</div>
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    showViewModal: Boolean,
    viewingTask: Object,
  },
  data() {
    return {
      copyFeedback: {
        visible: false,
        timer: null,
      },
    };
  },
  emits: ["close-view-modal", "edit-from-view", "view-full-image"],
  methods: {
    closeViewModal() {
      this.$emit("close-view-modal");
    },
    editFromView() {
      this.$emit("edit-from-view");
    },
    viewFullImage(imageSrc) {
      this.$emit("view-full-image", imageSrc);
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
    copyTaskUrl(taskId) {
      // Prevent the click from triggering other events
      event.stopPropagation();

      // Create the URL with the task ID
      const url = `${window.location.origin}/${taskId}`;

      // Copy to clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Show a brief visual feedback
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy URL: ", err);
        });
    },
    copyTaskUrl(taskId) {
      // Prevent the click from triggering other events
      event.stopPropagation();

      // Create the URL with the task ID
      const url = `${window.location.origin}/${taskId}`;

      // Copy to clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Show a cute animation feedback
          this.showCopyFeedback();
        })
        .catch((err) => {
          console.error("Failed to copy URL: ", err);
        });
    },
    showCopyFeedback() {
      // Clear any existing timer
      if (this.copyFeedback.timer) {
        clearTimeout(this.copyFeedback.timer);
      }

      // Show the feedback
      this.copyFeedback.visible = true;

      // Hide after 2 seconds
      this.copyFeedback.timer = setTimeout(() => {
        this.copyFeedback.visible = false;
      }, 2000);
    },
  },
};
