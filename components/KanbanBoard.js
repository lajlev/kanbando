const KanbanBoard = {
  template: `
    <div class="max-w-[80%] mx-auto px-5">
      <div class="flex gap-5 h-[90vh] w-full">
        <div
          class="w-[30%] bg-white rounded-lg p-5 shadow-lg transition-all duration-300 flex flex-col"
          v-for="status in statuses"
          :key="status.key"
        >
          <h3 class="text-sm font-semibold mb-4 uppercase text-gray-600">
            {{ status.name }}
          </h3>
          <div
            :id="status.key"
            class="flex-1 min-h-0 transition-all duration-200"
          >
            <div
              v-for="task in getTasksByStatus(status.key)"
              :key="task.id"
              class="bg-gray-50 border border-gray-300 rounded p-3 mb-2.5 cursor-move transition-all duration-200 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-md"
              :class="{ 'opacity-50': status.key === 'done' }"
              :data-id="task.id"
              @click="viewTask(task)"
            >
              <div class="font-medium mb-1">
                {{ task.title }}
              </div>
              <div
                class="text-xs text-gray-600"
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
            class="w-full py-2.5 px-2.5 border-2 border-dashed border-gray-300 bg-transparent rounded cursor-pointer text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors mt-4"
            @click="openModal(status.key)"
          >
            New Task
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
