const Sidebar = {
  template: `
    <aside class="fixed left-0 top-0 h-full w-24 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-40 hidden md:flex flex-col transition-all duration-300">
      <div class="p-2 pt-6">
        <div class="flex justify-center">
          <img v-if="settings.appLogo" :src="settings.appLogo" :alt="settings.appName" class="w-full h-6 object-contain">

          <svg class="w-full h-6 text-gray-700 dark:text-gray-300" viewBox="0 0 46 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.375516 20.1079C0.080791 23.1741 2.21303 24.9327 5.01026 24.064C6.26364 23.6749 7.32763 22.8307 8.03837 21.7282C9.54924 19.3817 11.4144 13.6266 12.9604 14.0891C14.6479 14.5952 13.3275 21.3167 15.1926 22.9158C19.2092 26.3584 23.4364 19.6284 25.8347 15.6881C28.6404 11.1355 29.0001 15.9603 30.2651 19.1499C31.4089 22.0344 34.5498 25.0124 38.4291 24.0353C44.5556 22.4916 38.6441 17.5105 44.9376 13.5798C48.2157 11.5321 43.2054 5.42291 39.4218 8.94318C38.7537 9.56409 38.3983 10.7506 38.2429 11.7139C37.9982 13.2332 38.2568 14.9949 38.277 16.1974C38.3515 20.5565 32.4665 17.7593 32.5272 10.3551C32.574 4.68505 28.3457 4.78712 25.4548 9.37058C24.2791 11.2344 22.6725 17.2702 20.2604 18.3706C19.5093 18.7129 18.6251 18.4333 18.1516 17.7561C15.4182 13.852 20.6073 7.04004 18.3899 2.00365C17.8739 0.832003 16.7397 0.0250319 15.4586 0.000578237C10.5983 -0.0908572 11.5006 10.689 7.29039 12.877C6.08808 13.8137 4.36229 14.643 2.95995 15.6658C1.51398 16.7205 0.545754 18.327 0.374451 20.1079H0.375516Z" fill="currentcolor"></path>
<path d="M24.4168 21.0223C22.8836 22.1727 23.3358 23.8749 25.0807 24.5235C26.5575 25.0721 28.3684 24.7967 29.5175 23.6963C30.7167 22.5459 29.9591 20.8544 28.5078 20.3897C27.064 19.9272 25.6127 20.1463 24.4264 21.0362C24.4232 21.0319 24.42 21.0277 24.4168 21.0234V21.0223Z" fill="currentcolor"></path>
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
