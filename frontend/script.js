// ============================================
// HPTECH PORTFOLIO - MAIN JAVASCRIPT
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Local backend endpoint for development.
  // Replace this later with your deployed backend URL when needed.
  API_ENDPOINT: "http://localhost:5000/send",

  // Resume file path
  RESUME_PATH: "/Assets/Alimi Azeez.pdf",

  // Toast duration in milliseconds
  TOAST_DURATION: 5000,

  // Form cooldown in milliseconds (prevents spam)
  FORM_COOLDOWN: 10000,
};

// ============================================
// ONLINE/OFFLINE DETECTION
// ============================================
class NetworkManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.init();
  }

  init() {
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    // Check initial state
    if (!this.isOnline) {
      this.showOfflineBanner();
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.hideOfflineBanner();
    this.showToast("Back online!", "success");
    this.processQueue();
  }

  handleOffline() {
    this.isOnline = false;
    this.showOfflineBanner();
    this.showToast("You are offline. Some features may be limited.", "info");
  }

  showOfflineBanner() {
    const banner = document.getElementById("offline-notification");
    if (banner) {
      banner.style.display = "flex";
    }
  }

  hideOfflineBanner() {
    const banner = document.getElementById("offline-notification");
    if (banner) {
      banner.style.display = "none";
    }
  }

  addToQueue(data) {
    this.offlineQueue.push(data);
    this.saveQueue();
  }

  async processQueue() {
    while (this.offlineQueue.length > 0 && this.isOnline) {
      const data = this.offlineQueue[0];
      try {
        await this.sendMessage(data);
        this.offlineQueue.shift();
        this.saveQueue();
      } catch (error) {
        console.error("Failed to process queued message:", error);
        break;
      }
    }
  }

  saveQueue() {
    try {
      localStorage.setItem("offlineQueue", JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.warn("Failed to save offline queue:", e);
    }
  }

  loadQueue() {
    try {
      const saved = localStorage.getItem("offlineQueue");
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load offline queue:", e);
    }
  }

  async sendMessage(data) {
    if (!CONFIG.API_ENDPOINT) {
      throw new Error("No API endpoint configured yet.");
    }

    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  }
}

// Initialize network manager
const networkManager = new NetworkManager();

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
class ToastManager {
  constructor() {
    this.container = document.getElementById("toast-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "info", duration = CONFIG.TOAST_DURATION) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: '<i class="fa-solid fa-circle-check"></i>',
      error: '<i class="fa-solid fa-circle-exclamation"></i>',
      info: '<i class="fa-solid fa-circle-info"></i>',
    };

    toast.innerHTML = `${icons[type] || icons.info} ${message}`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

const toastManager = new ToastManager();

// Make showToast globally available
function showToast(message, type, duration) {
  toastManager.show(message, type, duration);
}

// ============================================
// CUSTOM CURSOR
// ============================================
const cursor = document.getElementById("cursor");
const trail = document.getElementById("cursor-trail");

if (cursor && trail) {
  let mx = 0,
    my = 0,
    tx = 0,
    ty = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";
  });

  (function animTrail() {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    trail.style.left = tx + "px";
    trail.style.top = ty + "px";
    requestAnimationFrame(animTrail);
  })();

  // Add cursor hover effects to interactive elements
  const hoverElements = document.querySelectorAll(
    "a, button, .pill, .skill-cat, .project-card, .stat-card",
  );
  hoverElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
      trail.classList.add("trail-hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
      trail.classList.remove("trail-hover");
    });
  });
}

// ============================================
// TYPED TEXT EFFECT
// ============================================
const phrases = [
  "beautiful UIs.",
  "fast APIs.",
  "full web apps.",
  "things that matter.",
];
let pi = 0,
  ci = 0,
  del = false;

const typedEl = document.getElementById("typed-text");

function typeLoop() {
  if (!typedEl) return;

  const phrase = phrases[pi];
  if (!del) {
    typedEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) {
      del = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    typedEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) {
      del = false;
      pi = (pi + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, del ? 58 : 88);
}

typeLoop();

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    // Prevent multiple animations
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";

    const target = +el.dataset.count;
    let cur = 0;
    const increment = target / 40;

    const timer = setInterval(() => {
      cur += increment;
      if (cur >= target) {
        cur = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(cur) + (target >= 10 ? "+" : "");
    }, 38);
  });
}

// ============================================
// REVEAL ANIMATIONS (Intersection Observer)
// ============================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // Animate counters if present
        if (entry.target.querySelector("[data-count]")) {
          animateCounters();
        }

        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
);

document
  .querySelectorAll(".reveal, .reveal-left, .reveal-right")
  .forEach((el) => {
    revealObserver.observe(el);
  });

// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  if (window.scrollY > 50) {
    nav.style.background = "rgba(248,247,242,0.97)";
    nav.style.boxShadow = "0 2px 20px rgba(29,158,117,0.1)";
  } else {
    nav.style.background = "rgba(248,247,242,0.82)";
    nav.style.boxShadow = "none";
  }

  // Active navigation highlighting
  updateActiveNavLink();
});

// Active navigation link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.style.color = "";
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.style.color = "var(--teal-deep)";
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const burger = document.getElementById("burger");

  if (!navLinks || !burger) return;

  navLinks.classList.toggle("open");

  // Update ARIA attributes
  const isOpen = navLinks.classList.contains("open");
  burger.setAttribute("aria-expanded", isOpen);

  // Animate burger icon
  const spans = burger.querySelectorAll("span");
  if (isOpen) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
  } else {
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  }
}

// Close mobile menu when clicking a link
document
  .getElementById("navLinks")
  ?.querySelectorAll("a")
  .forEach((a) => {
    a.addEventListener("click", () => {
      document.getElementById("navLinks")?.classList.remove("open");
      const burger = document.getElementById("burger");
      if (burger) {
        burger.setAttribute("aria-expanded", "false");
        const spans = burger.querySelectorAll("span");
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });
  });

// ============================================
// RESUME DOWNLOAD TRACKING
// ============================================
function trackResumeDownload() {
  // Google Analytics event tracking
  if (typeof gtag !== "undefined") {
    gtag("event", "download", {
      event_category: "resume",
      event_label: "Resume Download",
    });
  }

  // Show success message
  showToast("Resume download started! 📄", "success", 3000);
}

// Add download tracking to resume buttons
document.querySelectorAll("[download]").forEach((btn) => {
  btn.addEventListener("click", trackResumeDownload);
});

// Handle resume download errors
document
  .getElementById("resume-download-btn")
  ?.addEventListener("click", async function (e) {
    try {
      const response = await fetch(CONFIG.RESUME_PATH, { method: "HEAD" });
      if (!response.ok) {
        e.preventDefault();
        showToast(
          "Resume file not found. Please contact me directly.",
          "error",
        );
      }
    } catch (error) {
      // If offline, allow the download attempt anyway
      if (navigator.onLine) {
        e.preventDefault();
        showToast(
          "Unable to download resume. Please try again later.",
          "error",
        );
      }
    }
  });

// ============================================
// CONTACT FORM HANDLING
// ============================================
let formCooldown = false;

async function sendMessage(event) {
  event.preventDefault();

  // Check cooldown
  if (formCooldown) {
    showToast("Please wait before sending another message.", "info");
    return;
  }

  // Get form elements
  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("f-name");
  const emailInput = document.getElementById("f-email");
  const subjectInput = document.getElementById("f-subject");
  const messageInput = document.getElementById("f-message");
  const honeypotInput = document.getElementById("honeypot");
  const submitBtn = document.getElementById("submit-btn");
  const submitText = document.getElementById("submit-text");
  const submitLoading = document.getElementById("submit-loading");
  const formMsg = document.getElementById("form-msg");

  // Clear previous messages
  formMsg.textContent = "";
  formMsg.className = "";

  // Honeypot check (bot prevention)
  if (honeypotInput && honeypotInput.value) {
    // Silently reject - don't tell the bot
    console.log("Honeypot triggered - possible bot submission");
    formMsg.textContent =
      "Message sent successfully! I'll get back to you soon.";
    formMsg.className = "success";
    form.reset();
    return;
  }

  // Get values
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();

  // Validation
  if (!name || !email || !message) {
    formMsg.textContent =
      "Please fill in all required fields (name, email, and message).";
    formMsg.className = "error";
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    formMsg.textContent = "Please enter a valid email address.";
    formMsg.className = "error";
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitText.style.display = "none";
  submitLoading.style.display = "inline";

  const formData = {
    name,
    email,
    subject: subject || "No subject",
    message,
    timestamp: new Date().toISOString(),
  };

  if (!CONFIG.API_ENDPOINT) {
    formMsg.textContent =
      "The contact form is currently being wired up. Please email me directly at alimiazeez4@gmail.com.";
    formMsg.className = "info";
    showToast(
      "Contact form is disabled for now. Please email me directly.",
      "info",
    );
    return;
  }

  // Check if online
  if (!navigator.onLine) {
    // Queue the message for later
    networkManager.addToQueue(formData);
    formMsg.textContent =
      "You're offline. Your message will be sent when you're back online.";
    formMsg.className = "info";
    form.reset();
    resetSubmitButton();
    return;
  }

  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      // Success
      formMsg.textContent =
        "Message sent successfully! I'll get back to you within 24 hours. 🚀";
      formMsg.className = "success";
      form.reset();
      showToast("Message sent! Check your inbox for confirmation.", "success");

      // Google Analytics tracking
      if (typeof gtag !== "undefined") {
        gtag("event", "form_submission", {
          event_category: "contact",
          event_label: "Contact Form",
        });
      }

      // Set cooldown
      formCooldown = true;
      setTimeout(() => {
        formCooldown = false;
      }, CONFIG.FORM_COOLDOWN);
    } else {
      throw new Error(data.message || "Failed to send message");
    }
  } catch (error) {
    console.error("Form submission error:", error);

    // Show error message
    formMsg.textContent =
      "Failed to send message. Please try again or email me directly at alimiazeez4@gmail.com";
    formMsg.className = "error";
    showToast("Failed to send message. Please try again.", "error");

    // Save failed submission to localStorage for retry
    saveFailedSubmission(formData);
  } finally {
    resetSubmitButton();
  }
}

function resetSubmitButton() {
  const submitBtn = document.getElementById("submit-btn");
  const submitText = document.getElementById("submit-text");
  const submitLoading = document.getElementById("submit-loading");

  if (submitBtn) submitBtn.disabled = false;
  if (submitText) submitText.style.display = "inline";
  if (submitLoading) submitLoading.style.display = "none";
}

function saveFailedSubmission(data) {
  try {
    const failedSubmissions = JSON.parse(
      localStorage.getItem("failedSubmissions") || "[]",
    );
    failedSubmissions.push(data);
    localStorage.setItem(
      "failedSubmissions",
      JSON.stringify(failedSubmissions),
    );
  } catch (e) {
    console.warn("Failed to save submission:", e);
  }
}

// Retry failed submissions when coming online
window.addEventListener("online", () => {
  const failedSubmissions = JSON.parse(
    localStorage.getItem("failedSubmissions") || "[]",
  );
  if (failedSubmissions.length > 0) {
    showToast("Retrying failed message submissions...", "info");

    failedSubmissions.forEach(async (data) => {
      try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Remove from failed list
          const updated = JSON.parse(
            localStorage.getItem("failedSubmissions") || "[]",
          );
          const filtered = updated.filter(
            (item) => item.timestamp !== data.timestamp,
          );
          localStorage.setItem("failedSubmissions", JSON.stringify(filtered));
        }
      } catch (error) {
        console.error("Failed to retry submission:", error);
      }
    });
  }
});

// ============================================
// SMOOTH SCROLL WITH OFFSET
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const target = document.querySelector(targetId);
    if (target) {
      const offset = 80; // Navbar height offset
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// ============================================
// EMAIL COPY TO CLIPBOARD
// ============================================
document
  .querySelector('.contact-item-text a[href^="mailto:"]')
  ?.addEventListener("click", function (e) {
    const email = this.getAttribute("href").replace("mailto:", "");

    // Copy to clipboard
    navigator.clipboard
      .writeText(email)
      .then(() => {
        showToast("Email copied to clipboard! 📋", "success", 2000);
      })
      .catch(() => {
        // Fallback - just open email client
      });
  });

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Lazy load images that aren't visible yet
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if ("loading" in HTMLImageElement.prototype) {
  // Browser supports native lazy loading
  lazyImages.forEach((img) => {
    img.src = img.dataset.src || img.src;
  });
} else {
  // Fallback for browsers that don't support lazy loading
  const lazyImageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        lazyImageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => lazyImageObserver.observe(img));
}

// ============================================
// ERROR HANDLING & LOGGING
// ============================================
window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);

  // You can send errors to your analytics or error tracking service
  if (typeof gtag !== "undefined") {
    gtag("event", "exception", {
      description: event.error ? event.error.message : "Unknown error",
      fatal: false,
    });
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);
});

// ============================================
// INITIALIZATION
// ============================================
console.log(
  "%c🚀 HPTech Portfolio Loaded! %cBuilt by Alimi Azeez Opeyemi",
  "color: #1D9E75; font-size: 1.2rem; font-weight: bold;",
  "color: #D85A30;",
);
console.log(
  "%c💡 Tip: Check the network tab to see the service worker in action!",
  "color: #888780;",
);

// Log performance metrics
window.addEventListener("load", () => {
  if (window.performance) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    console.log(`%c⏱️ Page loaded in ${loadTime}ms`, "color: #1D9E75;");
  }
});
