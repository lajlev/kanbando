const Confetti = {
  template: `
    <div
      v-if="showConfetti"
      class="confetti-container fixed inset-0 pointer-events-none z-50"
    >
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="confetti-particle absolute"
        :style="particle.style"
      >
        {{ particle.emoji }}
      </div>
    </div>
  `,
  data() {
    return {
      showConfetti: false,
      particles: [],
      animationFrame: null,
      fruitEmojis: ['🍇', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍑', '🍒', '🍓', '🫐', '🥝', '🍈', '🍉', '🥥', '🍯', '🍭']
    };
  },
  methods: {
    triggerConfetti() {
      this.showConfetti = true;
      this.createParticles();
      this.animateParticles();
      
      // Stop animation after 3 seconds
      setTimeout(() => {
        this.stopConfetti();
      }, 3000);
    },
    
    createParticles() {
      this.particles = [];
      const particleCount = 150; // Much more particles for screen-filling effect
      
      // Create multiple burst points for better coverage
      const burstPoints = [
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 }, // Center
        { x: window.innerWidth * 0.3, y: window.innerHeight * 0.5 }, // Left
        { x: window.innerWidth * 0.7, y: window.innerHeight * 0.5 }, // Right
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 }, // Lower center
      ];
      
      for (let i = 0; i < particleCount; i++) {
        // Choose random burst point
        const burstPoint = burstPoints[Math.floor(Math.random() * burstPoints.length)];
        
        // Random angle for explosive burst
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 30 + 15; // Much higher initial speeds (15-45)
        const initialVx = Math.cos(angle) * speed;
        const initialVy = Math.sin(angle) * speed;
        
        const particle = {
          emoji: this.fruitEmojis[Math.floor(Math.random() * this.fruitEmojis.length)],
          x: burstPoint.x + (Math.random() - 0.5) * 200, // Wider spread from burst points
          y: burstPoint.y + (Math.random() - 0.5) * 200,
          vx: initialVx + (Math.random() - 0.5) * 15, // Much more randomness
          vy: initialVy + (Math.random() - 0.5) * 15,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 40, // Much faster rotation
          scale: Math.random() * 1.2 + 0.3, // Bigger size range
          life: 1.0,
          decay: Math.random() * 0.015 + 0.005, // Slower decay for longer visibility
          style: {}
        };
        
        this.updateParticleStyle(particle);
        this.particles.push(particle);
      }
    },
    
    updateParticleStyle(particle) {
      particle.style = {
        left: particle.x + 'px',
        top: particle.y + 'px',
        transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
        fontSize: Math.random() * 20 + 20 + 'px', // Bigger random sizes between 20-40px
        opacity: particle.life,
        userSelect: 'none',
        pointerEvents: 'none'
      };
    },
    
    animateParticles() {
      const animate = () => {
        if (!this.showConfetti) return;
        
        this.particles.forEach(particle => {
          // Update position with faster movement
          particle.x += particle.vx * 1.5; // 50% faster horizontal movement
          particle.y += particle.vy * 1.2; // 20% faster vertical movement
          
          // Apply physics
          particle.vy += 0.4; // Stronger gravity for faster settling
          particle.vx *= 0.99; // Less air resistance for longer travel
          particle.rotation += particle.rotationSpeed * 1.5; // Faster spinning
          
          // Fade out over time
          particle.life -= particle.decay;
          if (particle.life < 0) particle.life = 0;
          
          // Add more aggressive wobble for chaotic movement
          particle.vx += (Math.random() - 0.5) * 1.5;
          particle.vy += (Math.random() - 0.5) * 0.8;
          
          this.updateParticleStyle(particle);
        });
        
        // Remove particles that are off screen or faded out - extend boundaries for full coverage
        this.particles = this.particles.filter(particle => 
          particle.life > 0 && 
          particle.x > -200 && particle.x < window.innerWidth + 200 &&
          particle.y < window.innerHeight + 300
        );
        
        // Continue animation if particles remain
        if (this.particles.length > 0) {
          this.animationFrame = requestAnimationFrame(animate);
        }
      };
      
      this.animationFrame = requestAnimationFrame(animate);
    },
    
    stopConfetti() {
      this.showConfetti = false;
      this.particles = [];
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
  },
  
  beforeUnmount() {
    this.stopConfetti();
  }
};