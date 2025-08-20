export default {
  template: `
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeDeleteModal"
    >
      <div
        class="bg-white p-8 rounded-lg w-[36%] max-w-[90%]"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-6 text-red-600">
          Delete Completed Tasks
        </h3>
        <p class="mb-6 text-gray-700">
          Are you sure you want to delete {{ getDoneTasksCount() }} completed
          task{{ getDoneTasksCount() > 1 ? 's' : '' }}? This action cannot be
          undone.
        </p>
        <div class="flex justify-between">
          <button
            class="px-5 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button
            class="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            @click="confirmDeleteDoneTasks"
          >
            Delete Tasks
          </button>
        </div>
      </div>
    </div>
  `,
  props: {
    showDeleteModal: Boolean,
    doneTasksCount: Number
  },
  emits: ['close-delete-modal', 'confirm-delete-done-tasks'],
  methods: {
    closeDeleteModal() {
      this.$emit('close-delete-modal');
    },
    confirmDeleteDoneTasks() {
      this.$emit('confirm-delete-done-tasks');
    },
    getDoneTasksCount() {
      return this.doneTasksCount;
    }
  }
};