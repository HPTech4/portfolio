// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Improved Typewriter effect
const typewriterEffect = {
  text: "Alimi AbdulAzeez",
  element: document.getElementById("Typewriter"),
  delay: 250,
  
  init() {
    this.index = 0;
    this.element.innerHTML = '';
    this.type();
  },

  type() {
    if (this.index < this.text.length) {
      this.element.innerHTML += this.text.charAt(this.index);
      this.index++;
      setTimeout(() => this.type(), this.delay);
    }
  }
};

// Start typewriter when page loads
window.onload = () => typewriterEffect.init();

document.addEventListener("DOMContentLoaded", () => {
  // GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Services section animation
gsap.from(".service", {
  scrollTrigger: {
    trigger: ".service",
    start: "top 80%",
    toggleActions: "play none none reset"
  },
  y: 50,
  opacity: 1,
  duration: 1.2,
  ease: "power2.out"
});

// Projects section animation
gsap.from(".project .grid > div", {
  scrollTrigger: {
    trigger: ".project",
    start: "top 80%",
    toggleActions: "play none none reset"
  },
  y: 30,
  opacity: 1,
  duration: 0.8,
  stagger: 0.2,
  ease: "power2.out"
});

// Skills section animation
gsap.from(".skillTag", {
  scrollTrigger: {
    trigger: ".skills",
    start: "top 80%",
    toggleActions: "play none none reset"
  },
  scale: 0.8,
  opacity: 1,
  duration: 0.5,
  stagger: 0.1,
  ease: "back.out(1.9)"
});
});

