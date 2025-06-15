const Sidebar = {
  template: `
    <aside class="fixed left-0 top-0 h-full w-24 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-40 hidden md:flex flex-col transition-all duration-300">
      <div class="p-2 pt-6">
        <div class="flex justify-center">
          <img v-if="settings.appLogo" :src="settings.appLogo" :alt="settings.appName" class="w-full h-6 object-contain">

          <svg v-else xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" id="Layer_1"  viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="none" class="w-full h-6 text-gray-700 dark:text-gray-300">
          <g>
            <path fill="currentcolor" d="M32,0C18.745,0,8,10.746,8,24c0,9.843,5.928,18.297,14.406,22h19.188C50.072,42.297,56,33.843,56,24   C56,10.746,45.255,0,32,0z M41,26c-0.553,0-1-0.447-1-1c0-1.104-0.896-2-2-2s-2,0.896-2,2v19h-2V25c0-1.104-0.896-2-2-2   s-2,0.896-2,2v19h-2V25c0-1.104-0.896-2-2-2s-2,0.896-2,2c0,0.553-0.447,1-1,1s-1-0.447-1-1c0-2.209,1.791-4,4-4   c1.201,0,2.267,0.541,3,1.38c0.733-0.839,1.799-1.38,3-1.38s2.267,0.541,3,1.38c0.733-0.839,1.799-1.38,3-1.38c2.209,0,4,1.791,4,4   C42,25.553,41.553,26,41,26z M45,13c-0.742,0.742-1.687-0.313-1.687-0.313C40.418,9.791,36.418,8,32,8c-0.553,0-1-0.447-1-1   s0.447-1,1-1c4.971,0,9.471,2.015,12.729,5.271C44.729,11.271,45.742,12.258,45,13z"/>
            <path fill="currentcolor" d="M26,64h12c2.211,0,4-1.789,4-4H22C22,62.211,23.789,64,26,64z"/>
            <polygon fill="currentcolor" points="22,48.004 22,52 42,52 42,48.004 42,48 22,48  "/>
            <rect x="22" y="54" fill="currentcolor" width="20" height="4"/>
          </g>
          </svg>
          
        </div>
      </div>
      <div class="flex-1"></div>
      <div class="p-3">
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="w-full p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center rounded-md"
            title="Settings"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <dropdown-menu
            :show="showDropdown"
            :current-user="currentUser"
            @close="closeDropdown"
            @delete-unused-images="deleteUnusedImages"
            @delete-all-done-tasks="deleteAllDoneTasks"
            @open-settings="openSettings"
            @logout="logout"
          ></dropdown-menu>
        </div>
      </div>
    </aside>
  `,
  data() {
    return {
      showDropdown: false,
    };
  },
  props: {
    currentUser: Object,
    settings: Object,
  },
  emits: [
    "delete-unused-images",
    "delete-all-done-tasks",
    "open-settings",
    "logout",
  ],
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    closeDropdown() {
      this.showDropdown = false;
    },
    deleteUnusedImages() {
      this.$emit("delete-unused-images");
      this.closeDropdown();
    },
    deleteAllDoneTasks() {
      this.$emit("delete-all-done-tasks");
      this.closeDropdown();
    },
    openSettings() {
      this.$emit("open-settings");
      this.closeDropdown();
    },
    logout() {
      this.$emit("logout");
      this.closeDropdown();
    },
  },
  mounted() {
    this.handleClickOutside = (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
