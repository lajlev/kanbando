const SettingsModal = {
  template: `
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            <button 
              @click="close"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="space-y-6">

            <!-- Theme Mode -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appearance
              </label>
              <div class="space-y-2">
                <div class="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="theme-auto"
                    value="auto"
                    v-model="localSettings.themeMode"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <label for="theme-auto" class="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Auto (Follow system)
                  </label>
                </div>
                <div class="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="theme-light"
                    value="light"
                    v-model="localSettings.themeMode"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <label for="theme-light" class="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    Light Mode
                  </label>
                </div>
                <div class="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="theme-dark"
                    value="dark"
                    v-model="localSettings.themeMode"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <label for="theme-dark" class="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                    Dark Mode
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button 
              @click="close"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button 
              @click="saveSettings"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    show: Boolean,
    settings: Object,
  },
  data() {
    return {
      localSettings: {},
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.localSettings = { ...this.settings };
      }
    },
  },
  emits: ["close", "save", "upload-logo", "remove-logo"],
  methods: {
    close() {
      this.$emit("close");
    },

    saveSettings() {
      this.$emit("save", this.localSettings);
      this.close();
    },

    handleLogoUpload(event) {
      this.$emit("upload-logo", event);
    },

    removeLogo() {
      this.localSettings.appLogo = null;
      this.$emit("remove-logo");
    },
  },
};
