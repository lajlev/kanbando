const KanbanBoard = {
  template: `
    <div class="max-w-[95%] md:max-w-[90%] mx-auto px-3 md:px-5 py-4 md:py-6">
      <div class="flex flex-col md:flex-row gap-4 md:gap-5 min-h-[80vh] md:h-[90vh] w-full">
        <div
          class="w-full md:w-[30%]transition-all duration-300 flex flex-col"
          v-for="status in statuses"
          :key="status.key"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">
              {{ status.name }}
            </h3>
            <button
              v-if="status.key === 'todo'"
              @click="openModal(status.key)"
              class="md:hidden w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
              title="Create Task"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
          <div
            v-if="status.key === 'todo'"
            class="hidden md:block w-full py-3 px-3 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent rounded cursor-pointer text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors mb-4 active:bg-blue-50 dark:active:bg-gray-700"
            @click="openModal(status.key)"
          >
            Create Task
          </div>
          <div
            :id="status.key"
            class="relative flex-1 min-h-0 transition-all duration-200"
          >
            <div
              v-show="showTopFade[status.key]"
              class="fade-top pointer-events-none absolute top-0 left-0 right-0 h-8 z-10"
            ></div>
            <div
              ref="scrollContainers"
              :data-status="status.key"
              class="overflow-y-auto h-full"
              @scroll="handleScroll($event, status.key)"
            >
              <div
                v-for="task in getTasksByStatus(status.key)"
                :key="task.id"
                class=" border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-2.5 cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-600"
                :class="{ 'opacity-50': status.key === 'done' }"
                :data-id="task.id"
                @click="viewTask(task)"
              >
                <div class="font-medium text-gray-900 dark:text-gray-100 relative">
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                    @click.stop="copyTaskUrl(task.id)"
                    title="Click to copy link"
                  >
                    #{{ task.id }}
                  </span>
                  {{ task.title }}
                  
                  <!-- Copy feedback animation -->
                  <div
                    v-if="copyFeedback.visible && copyFeedback.taskId === task.id"
                    class="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-md animate-fade-in-out flex items-center"
                    style="animation: fadeInOut 2s ease-in-out; z-index: 9999;"
                  >
                    <span class="mr-1">📋</span> Link copied
                  </div>
                </div>
              </div>
            </div>
            <div
              v-show="showBottomFade[status.key]"
              class="fade-bottom pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    tasks: Array,
    statuses: Array,
  },
  emits: ["view-task", "view-full-image", "delete-done-tasks", "open-modal"],
  methods: {
    getTasksByStatus(status) {
      return this.tasks.filter((task) => task.status === status);
    },
    viewTask(task) {
      this.$emit("view-task", task);
    },
    viewFullImage(imageSrc) {
      this.$emit("view-full-image", imageSrc);
    },
    deleteDoneTasks() {
      this.$emit("delete-done-tasks");
    },
    openModal(status) {
      this.$emit("open-modal", status);
    },
    getTaskImages(task) {
      if (!task.image) return [];
      try {
        return JSON.parse(task.image);
      } catch (e) {
        return [];
      }
    },
  },
  data() {
    return {
      showTopFade: {},
      showBottomFade: {},
      copyFeedback: {
        visible: false,
        taskId: null,
        timer: null,
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      // Delay to ensure scroll containers are fully rendered and sized
      setTimeout(() => {
        this.statuses.forEach((status) => {
          this.updateFadeVisibility(status.key);
        });
      }, 100);
    });
  },
  methods: {
    getTasksByStatus(status) {
      return this.tasks.filter((task) => task.status === status);
    },
    viewTask(task) {
      this.$emit("view-task", task);
    },
    viewFullImage(imageSrc) {
      this.$emit("view-full-image", imageSrc);
    },
    deleteDoneTasks() {
      this.$emit("delete-done-tasks");
    },
    openModal(status) {
      this.$emit("open-modal", status);
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
      // Prevent the click from triggering the viewTask method
      event.stopPropagation();

      // Create the URL with the task ID
      const url = `${window.location.origin}/${taskId}`;

      // Copy to clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Show a cute animation feedback
          this.showCopyFeedback(taskId);
        })
        .catch((err) => {
          console.error("Failed to copy URL: ", err);
        });
    },

    showCopyFeedback(taskId) {
      // Clear any existing timer
      if (this.copyFeedback.timer) {
        clearTimeout(this.copyFeedback.timer);
      }

      // Show the feedback
      this.copyFeedback.visible = true;
      this.copyFeedback.taskId = taskId;

      // Hide after 2 seconds
      this.copyFeedback.timer = setTimeout(() => {
        this.copyFeedback.visible = false;
        this.copyFeedback.taskId = null;
      }, 2000);
    },
    handleScroll(event, statusKey) {
      const el = event.target;
      this.showTopFade = {
        ...this.showTopFade,
        [statusKey]: el.scrollTop > 0,
      };
      this.showBottomFade = {
        ...this.showBottomFade,
        [statusKey]: el.scrollTop + el.clientHeight < el.scrollHeight,
      };
    },
    updateFadeVisibility(statusKey) {
      this.$nextTick(() => {
        const el = this.$refs.scrollContainers.find(
          (el) => el.dataset.status === statusKey
        );
        if (!el) return;
        this.showTopFade = {
          ...this.showTopFade,
          [statusKey]: el.scrollTop > 0,
        };
        this.showBottomFade = {
          ...this.showBottomFade,
          [statusKey]: el.scrollTop + el.clientHeight < el.scrollHeight,
        };
      });
    },
  },
};
