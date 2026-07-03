<template>
  <div class="absolute inset-0 overflow-hidden">
    <canvas ref="canvas" class="w-full h-full" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref(null);
let animationFrame = null;
let particles = [];

const PARTICLE_COUNT = 60;
const MAX_DISTANCE = 140;

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.radius = Math.random() * 1.8 + 0.8;
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(124, 92, 255, 0.6)'; // accent color
    ctx.fill();
  }
}

function initParticles(w, h) {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(w, h));
  }
}

function draw(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);

  // Draw connections
  ctx.strokeStyle = 'rgba(124, 92, 255, 0.12)';
  ctx.lineWidth = 1;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DISTANCE) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw particles
  particles.forEach(p => {
    p.update(w, h);
    p.draw(ctx);
  });

  animationFrame = requestAnimationFrame(() => draw(ctx, w, h));
}

onMounted(() => {
  const c = canvas.value;
  if (!c) return;

  const ctx = c.getContext('2d', { alpha: true });
  let w = c.offsetWidth;
  let h = c.offsetHeight;

  const resize = () => {
    w = c.offsetWidth;
    h = c.offsetHeight;
    c.width = w;
    c.height = h;
    initParticles(w, h);
  };

  window.addEventListener('resize', resize);
  resize();

  draw(ctx, w, h);

  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
});
</script>