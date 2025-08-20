export default {
  template: `
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="closeImageModal"
    >
      <div class="max-w-[90vw] max-h-[90vh] relative">
        <img 
          :src="fullSizeImage" 
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        />
        <button
          class="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
          @click="closeImageModal"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  props: {
    showImageModal: Boolean,
    fullSizeImage: String
  },
  emits: ['close-image-modal'],
  mounted() {
    this.handleKeydown = (e) => {
      if (e.key === 'Escape' && this.showImageModal) {
        this.closeImageModal();
      }
    };
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    closeImageModal() {
      this.$emit('close-image-modal');
    }
  }
};