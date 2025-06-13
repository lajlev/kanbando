const DropdownMenu = {
  template: `
    <div
      v-if="show"
      class="absolute right-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50"
    >
      <div class="py-1">
        <button
          @click="deleteUnusedImages"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete Unused Images
        </button>
        <button
          @click="deleteAllDoneTasks"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Delete All Done Tasks
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button
          @click="logout"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign Out
          <span v-if="currentUser" class="ml-auto text-xs text-gray-500">{{ currentUser.username }}</span>
        </button>
      </div>
    </div>
  `,
  props: {
    show: Boolean,
    currentUser: Object
  },
  emits: ['close', 'delete-unused-images', 'delete-all-done-tasks', 'logout'],
  methods: {
    deleteUnusedImages() {
      this.$emit('delete-unused-images');
    },
    deleteAllDoneTasks() {
      this.$emit('delete-all-done-tasks');
    },
    logout() {
      this.$emit('logout');
    }
  }
};