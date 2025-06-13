const Header = {
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div class="max-w-[80%] mx-auto px-5 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-light text-gray-700">
            <svg width="46" height="25" viewBox="0 0 46 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.375516 20.1079C0.080791 23.1741 2.21303 24.9327 5.01026 24.064C6.26364 23.6749 7.32763 22.8307 8.03837 21.7282C9.54924 19.3817 11.4144 13.6266 12.9604 14.0891C14.6479 14.5952 13.3275 21.3167 15.1926 22.9158C19.2092 26.3584 23.4364 19.6284 25.8347 15.6881C28.6404 11.1355 29.0001 15.9603 30.2651 19.1499C31.4089 22.0344 34.5498 25.0124 38.4291 24.0353C44.5556 22.4916 38.6441 17.5105 44.9376 13.5798C48.2157 11.5321 43.2054 5.42291 39.4218 8.94318C38.7537 9.56409 38.3983 10.7506 38.2429 11.7139C37.9982 13.2332 38.2568 14.9949 38.277 16.1974C38.3515 20.5565 32.4665 17.7593 32.5272 10.3551C32.574 4.68505 28.3457 4.78712 25.4548 9.37058C24.2791 11.2344 22.6725 17.2702 20.2604 18.3706C19.5093 18.7129 18.6251 18.4333 18.1516 17.7561C15.4182 13.852 20.6073 7.04004 18.3899 2.00365C17.8739 0.832003 16.7397 0.0250319 15.4586 0.000578237C10.5983 -0.0908572 11.5006 10.689 7.29039 12.877C6.08808 13.8137 4.36229 14.643 2.95995 15.6658C1.51398 16.7205 0.545754 18.327 0.374451 20.1079H0.375516Z" fill="#3C3C3C"></path>
              <path d="M24.4168 21.0223C22.8836 22.1727 23.3358 23.8749 25.0807 24.5235C26.5575 25.0721 28.3684 24.7967 29.5175 23.6963C30.7167 22.5459 29.9591 20.8544 28.5078 20.3897C27.064 19.9272 25.6127 20.1463 24.4264 21.0362C24.4232 21.0319 24.42 21.0277 24.4168 21.0234V21.0223Z" fill="#3C3C3C"></path>
              </svg>
          </h1>
          <div class="relative">
            <button
              @click="toggleDropdown"
              class="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span class="mr-1">Menu</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <dropdown-menu
              :show="showDropdown"
              :current-user="currentUser"
              @close="closeDropdown"
              @delete-unused-images="deleteUnusedImages"
              @delete-all-done-tasks="deleteAllDoneTasks"
              @logout="logout"
            ></dropdown-menu>
          </div>
        </div>
      </div>
    </header>
  `,
  data() {
    return {
      showDropdown: false,
    };
  },
  props: {
    currentUser: Object
  },
  emits: ["delete-unused-images", "delete-all-done-tasks", "logout"],
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
