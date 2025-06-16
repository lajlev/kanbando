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
            :id="status.key"
            class="flex-1 min-h-0 transition-all duration-200"
          >
            <div
              v-for="task in getTasksByStatus(status.key)"
              :key="task.id"
              class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-2.5 cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-600"
              :class="{ 'opacity-50': status.key === 'done' }"
              :data-id="task.id"
              @click="viewTask(task)"
            >
              <div class="font-medium mb-1 text-gray-900 dark:text-gray-100">
                {{ task.title }}
              </div>
              <div
                class="text-xs text-gray-600 dark:text-gray-400"
                v-if="task.description"
              >
                {{ task.description }}
              </div>
              <div
                v-if="getTaskImages(task).length > 0"
                class="mt-2"
              >
                <div class="flex gap-1 flex-wrap">
                  <img
                    v-for="(image, index) in getTaskImages(task).slice(0, 3)"
                    :key="index"
                    :src="'uploads/' + image"
                    class="h-12 w-auto rounded cursor-pointer hover:opacity-75 transition-opacity"
                    @click.stop="viewFullImage('uploads/' + image)"
                  />
                  <div 
                    v-if="getTaskImages(task).length > 3"
                    class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 cursor-pointer hover:bg-gray-300"
                    @click.stop="viewTask(task)"
                  >
                    +{{ getTaskImages(task).length - 3 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            v-if="status.key === 'todo'"
            class="hidden md:block w-full py-3 px-3 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent rounded cursor-pointer text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors mt-4 active:bg-blue-50 dark:active:bg-gray-700"
            @click="openModal(status.key)"
          >
            Create Task
          </button>
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
};
