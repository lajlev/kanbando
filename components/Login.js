import { authApi } from '../services/api.js';

export default {
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-auto flex justify-center">
            <svg width="46" height="25" viewBox="0 0 46 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.375516 20.1079C0.080791 23.1741 2.21303 24.9327 5.01026 24.064C6.26364 23.6749 7.32763 22.8307 8.03837 21.7282C9.54924 19.3817 11.4144 13.6266 12.9604 14.0891C14.6479 14.5952 13.3275 21.3167 15.1926 22.9158C19.2092 26.3584 23.4364 19.6284 25.8347 15.6881C28.6404 11.1355 29.0001 15.9603 30.2651 19.1499C31.4089 22.0344 34.5498 25.0124 38.4291 24.0353C44.5556 22.4916 38.6441 17.5105 44.9376 13.5798C48.2157 11.5321 43.2054 5.42291 39.4218 8.94318C38.7537 9.56409 38.3983 10.7506 38.2429 11.7139C37.9982 13.2332 38.2568 14.9949 38.277 16.1974C38.3515 20.5565 32.4665 17.7593 32.5272 10.3551C32.574 4.68505 28.3457 4.78712 25.4548 9.37058C24.2791 11.2344 22.6725 17.2702 20.2604 18.3706C19.5093 18.7129 18.6251 18.4333 18.1516 17.7561C15.4182 13.852 20.6073 7.04004 18.3899 2.00365C17.8739 0.832003 16.7397 0.0250319 15.4586 0.000578237C10.5983 -0.0908572 11.5006 10.689 7.29039 12.877C6.08808 13.8137 4.36229 14.643 2.95995 15.6658C1.51398 16.7205 0.545754 18.327 0.374451 20.1079H0.375516Z" fill="#3C3C3C"></path>
              <path d="M24.4168 21.0223C22.8836 22.1727 23.3358 23.8749 25.0807 24.5235C26.5575 25.0721 28.3684 24.7967 29.5175 23.6963C30.7167 22.5459 29.9591 20.8544 28.5078 20.3897C27.064 19.9272 25.6127 20.1463 24.4264 21.0362C24.4232 21.0319 24.42 21.0277 24.4168 21.0234V21.0223Z" fill="#3C3C3C"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-center text-2xl font-light text-gray-900">
            Sign in to Fruity Ideas 🍇 💡
          </h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-md shadow-sm -space-y-px">
            <!-- Username field removed as per request -->
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                v-model="credentials.password"
                class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
          
          <div class="text-center text-xs text-gray-500">
            Get password from Michael (Gatekeeper)
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      credentials: {
        password: "",
      },
      error: "",
      isLoading: false,
    };
  },
  emits: ["login-success"],
  methods: {
    async handleLogin() {
      this.error = "";
      this.isLoading = true;

      try {
        const result = await authApi.login({
          password: this.credentials.password
        });

        if (result.success) {
          this.$emit("login-success", result.user);
        } else {
          this.error = result.error || "Login failed";
        }
      } catch (error) {
        this.error = "Network error. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
