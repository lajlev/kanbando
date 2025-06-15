const TaskModal = {
  template: `
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeModal"
    >
      <div
        class="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg w-full md:w-[36%] max-w-[95%] md:max-w-[90%] max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
          {{ editingTask ? 'Edit' : 'New Idea' }}
        </h3>
        <div class="mb-5">
          <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            v-model="taskForm.title"
            placeholder="Task title"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
        <div class="mb-5">
          <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            v-model="taskForm.description"
            placeholder="Task description"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded h-20 resize-y focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          ></textarea>
        </div>
        <div class="mb-5">
          <label class="block mb-1 font-medium">Image</label>
          <div
            class="drop-zone w-full p-4 border border-gray-300 rounded text-center cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'drag-over': isDragOver }"
            @click="$refs.fileInput.click()"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
            tabindex="0"
          >
            <div v-if="imagePreviews.length > 0">
              <div class="grid grid-cols-3 gap-2 mb-3">
                <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                  <img
                    :src="preview.url"
                    class="w-full h-20 rounded"
                  />
                  <button
                    type="button"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    @click.stop="removeImage(index)"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div class="text-sm text-gray-600 text-center">
                {{ imagePreviews.length }} image{{ imagePreviews.length === 1 ? '' : 's' }} selected
              </div>
            </div>
            <div
              v-else
              class="text-gray-500"
            >
              <div class="text-lg mb-1">📎</div>
              <div>Drop images here, click to browse, or paste</div>
              <div class="text-xs mt-1">Max 5MB each • JPEG, PNG, GIF, WebP</div>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />
        </div>
        <div class="flex justify-between">
          <button
            class="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="saveTask"
          >
            {{ editingTask ? 'Update' : 'Add' }}
          </button>
          <button
            v-if="editingTask"
            class="px-3 py-1.5 text-red-500 text-sm hover:bg-red-50 rounded transition-colors"
            @click="confirmDeleteTask"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  `,
  props: {
    showModal: Boolean,
    editingTask: Object,
    taskForm: Object,
    imagePreviews: Array,
    isDragOver: Boolean,
  },
  emits: [
    "close-modal",
    "save-task",
    "confirm-delete-task",
    "handle-file-select",
    "handle-drop",
    "remove-image",
  ],
  methods: {
    closeModal() {
      this.$emit("close-modal");
    },
    saveTask() {
      this.$emit("save-task");
    },
    confirmDeleteTask() {
      this.$emit("confirm-delete-task");
    },
    handleFileSelect(event) {
      this.$emit("handle-file-select", event);
    },
    handleDrop(event) {
      this.$emit("handle-drop", event);
    },
    removeImage(index) {
      this.$emit("remove-image", index);
    },
  },
};
