// ==========================================================================
// Alimi Azeez Opeyemi — portfolio
// ==========================================================================

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var revealPath =
    reduceMotion.matches
      ? "reveal-off"
      : typeof window.gsap !== "undefined" &&
          typeof window.ScrollTrigger !== "undefined"
        ? "reveal-gsap"
        : "reveal-css";

  function setRevealPath(path) {
    revealPath = path;
    root.classList.remove("reveal-gsap", "reveal-css", "reveal-off");
    root.classList.add(path);
  }

  setRevealPath(revealPath);

  // ========================================================================
  // Offline banner
  // ========================================================================

  var offlineBanner = document.getElementById("offline-banner");

  function syncOfflineBanner() {
    if (!offlineBanner) return;
    offlineBanner.hidden = navigator.onLine;
  }

  window.addEventListener("online", syncOfflineBanner);
  window.addEventListener("offline", syncOfflineBanner);
  syncOfflineBanner();

  // ========================================================================
  // Theme
  // ========================================================================

  var THEME_KEY = "theme";
  var THEME_COLORS = { light: "#FAF8F4", dark: "#14130F" };

  var themeToggle = document.getElementById("theme-toggle");
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function storedTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (error) {
      // Private browsing, or storage disabled. Fall back to session-only.
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* nothing we can do; the choice just won't survive a reload */
    }
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", THEME_COLORS[theme]);
    }

    if (themeToggle) {
      var switchesToDark = theme === "light";
      // Label says what the button does; aria-pressed says whether dark is on.
      themeToggle.setAttribute(
        "aria-label",
        switchesToDark ? "Switch to dark theme" : "Switch to light theme",
      );
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }

    if (persist) storeTheme(theme);
  }

  // Re-sync the button, the meta tag, and the document with whatever the
  // inline script in <head> already decided.
  applyTheme(
    root.getAttribute("data-theme") === "dark" ? "dark" : "light",
    false,
  );

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(
        root.getAttribute("data-theme") === "dark" ? "light" : "dark",
        true,
      );
    });

    // Follow the OS only until the visitor has made an explicit choice.
    // After that the saved theme wins, on this visit and every later one.
    var schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    schemeQuery.addEventListener("change", function (event) {
      if (storedTheme() !== null) return;
      applyTheme(event.matches ? "dark" : "light", false);
    });
  }

  // ========================================================================
  // Toasts
  // ========================================================================

  var toastRegion = document.getElementById("toast-region");

  function showToast(message, type) {
    if (!toastRegion) return;

    var toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " is-error" : "");
    toast.textContent = message;
    toastRegion.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 5000);
  }

  // ========================================================================
  // Header state and scroll progress — throttled to one update per frame.
  // ========================================================================

  var header = document.getElementById("site-header");
  var headerTicking = false;
  var maxScroll = 0;

  function measureScroll() {
    maxScroll = Math.max(
      0,
      root.scrollHeight - window.innerHeight,
    );
  }

  function updateHeader() {
    headerTicking = false;

    var scrolled = window.scrollY > 8;
    if (header) {
      header.classList.toggle("is-scrolled", scrolled);

      var progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      header.style.setProperty(
        "--progress",
        String(Math.min(1, Math.max(0, progress))),
      );
    }
  }

  function onScroll() {
    if (headerTicking) return;
    headerTicking = true;
    window.requestAnimationFrame(updateHeader);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener(
    "resize",
    function () {
      measureScroll();
      onScroll();
    },
    { passive: true },
  );

  window.addEventListener("load", function () {
    measureScroll();
    updateHeader();
  });

  measureScroll();
  updateHeader();

  // ========================================================================
  // Mobile navigation
  // ========================================================================

  var navToggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("nav-list");

  function setMenu(open) {
    if (!navToggle || !navList) return;

    navList.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    // Any link inside the drawer dismisses it.
    navList.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (navToggle.getAttribute("aria-expanded") !== "true") return;

      setMenu(false);
      navToggle.focus();
    });

    // Clicking outside the drawer closes it.
    document.addEventListener("click", function (event) {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      if (navList.contains(event.target) || navToggle.contains(event.target)) {
        return;
      }
      setMenu(false);
    });
  }

  // ========================================================================
  // Active section in the nav

  // ========================================================================

  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('.nav-list a[href^="#"]'),
  );

  if (navAnchors.length && "IntersectionObserver" in window) {
    var sectionById = {};

    navAnchors.forEach(function (anchor) {
      var section = document.querySelector(anchor.getAttribute("href"));
      if (section && section.id) sectionById[section.id] = section;
    });

    var markCurrent = function (id) {
      navAnchors.forEach(function (anchor) {
        if (anchor.getAttribute("href") === "#" + id) {
          anchor.setAttribute("aria-current", "true");
        } else {
          anchor.removeAttribute("aria-current");
        }
      });
    };

    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) markCurrent(entry.target.id);
        });
      },
      // A band across the middle of the viewport decides what's "current".
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    Object.keys(sectionById).forEach(function (id) {
      navObserver.observe(sectionById[id]);
    });
  }

  // ========================================================================
  // Motion
  // ========================================================================

  var revealElements = document.querySelectorAll(".reveal");
  var heroChildren = document.querySelectorAll(".hero-copy > *, .hero-portrait");

  // Everything either path can leave transparent. Used by the rescue below
  // and by the reduced-motion change handler.
  var ANIMATED = [
    ".reveal",
    ".reveal > p",
    ".section-title",
    ".section-lede",
    ".section-more",
    ".project-num",
    ".project-title",
    ".project-tagline",
    ".project-desc",
    ".project-stack",
    ".project-links",
    ".project-media",
    ".timeline > li",
    ".skill-group",
    ".skill-learning",
    ".colophon-list > li",
    ".contact-list > li",
    ".contact-cv",
    ".contact-form",
    ".hero-copy > *",
    ".hero-portrait",
  ].join(",");

  function animatedElements() {
    return document.querySelectorAll(ANIMATED);
  }

  // Force everything visible and strip every inline style GSAP left behind.
  function revealAll() {
    Array.prototype.forEach.call(revealElements, function (el) {
      el.classList.add("is-visible");
    });

    if (typeof window.gsap === "undefined") return;

    var targets = animatedElements();
    window.gsap.killTweensOf(targets);
    window.gsap.set(targets, { clearProps: "all" });
  }

  // ------------------------------------------------------------------
  // Fallback: IntersectionObserver toggling a class the stylesheet animates
  // ------------------------------------------------------------------

  function startCssReveal() {
    if (!revealElements.length) return;

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    Array.prototype.forEach.call(revealElements, function (el) {
      revealObserver.observe(el);
    });
  }

  // ------------------------------------------------------------------
  // GSAP + ScrollTrigger
  // ------------------------------------------------------------------

  function initMotion() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    // The mobile URL bar collapsing fires a resize that would otherwise make
    // every trigger re-measure mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });

    var EASE = "power2.out";

    // --- Hero. Plays on load; it is above the fold and never waits on a

    var heroTimeline = gsap.timeline({
      defaults: { ease: EASE, duration: 0.7 },
    });

    if (heroChildren.length) {
      heroTimeline.from(heroChildren, {
        y: 16,
        autoAlpha: 0,
        stagger: { amount: 0.36 },
        clearProps: "all",
      });
    }

    Array.prototype.forEach.call(
      document.querySelectorAll(".hero-stats dd"),
      function (el) {
        var finalText = el.textContent.trim();
        var target = parseInt(finalText, 10);
        if (!target) return;

        var suffix = finalText.replace(/[0-9]/g, "");
        var counter = { value: 0 };

        heroTimeline.to(
          counter,
          {
            value: target,
            duration: 0.9,
            ease: "power1.out",
            onUpdate: function () {
              el.textContent = Math.round(counter.value) + suffix;
            },
            onComplete: function () {
              el.textContent = finalText;
            },
          },
          "-=0.4",
        );
      },
    );

    // --- Section headings and standalone blocks, one trigger per container.
    // `amount` distributes the stagger across a fixed window instead of
    // multiplying a per-item delay, so a section with seven paragraphs and
    // one with two take the same time to settle.
    var SECTION_TARGETS = [
      ".section-title",
      ".section-lede",
      ".section-more",
      ".reveal > p",
      ".timeline > li",
      ".skill-group",
      ".skill-learning",
      ".colophon-list > li",
      ".contact-list > li",
      ".contact-cv",
      ".contact-form",
    ].join(",");

    Array.prototype.forEach.call(revealElements, function (container) {
      var blocks = container.querySelectorAll(SECTION_TARGETS);
      if (!blocks.length) return;

      gsap.from(blocks, {
        y: 18,
        autoAlpha: 0,
        duration: 0.6,
        ease: EASE,
        stagger: { amount: 0.34 },
        clearProps: "all",
        scrollTrigger: {
          trigger: container,
          start: "top 82%",
          once: true,
        },
      });
    });

    // --- Case studies. Each project animates as it arrives rather than on
    // a single long stagger, so the last one is not still moving when it is
    // already on screen. The screenshot settles with a touch of scale while
    // the text slides.
    Array.prototype.forEach.call(
      document.querySelectorAll(".project"),
      function (project) {
        var text = project.querySelectorAll(
          ".project-num,.project-title,.project-tagline,.project-desc," +
            ".project-stack,.project-links",
        );
        var media = project.querySelector(".project-media");

        if (!text.length && !media) return;

        var projectTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: project,
            start: "top 85%",
            once: true,
          },
        });

        if (text.length) {
          projectTimeline.from(text, {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
            ease: EASE,
            stagger: { amount: 0.28 },
            clearProps: "all",
          });
        }

        if (media) {
          projectTimeline.from(
            media,
            {
              autoAlpha: 0,
              scale: 0.985,
              transformOrigin: "50% 0%",
              duration: 0.7,
              ease: EASE,
              clearProps: "all",
            },
            text.length ? "-=0.4" : 0,
          );
        }
      },
    );

    // Fraunces loads asynchronously and changes every measurement on the
    // page when it swaps in. Anything ScrollTrigger measured before that is
    // wrong, so re-measure once the fonts have settled.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }

    // --- Rescue. If a trigger never fires — a measurement taken against a
    // layout that no longer exists, a browser quirk — the content under it
    // would stay invisible. Anything still transparent but already inside
    // the viewport a few seconds in gets shown. In the ordinary case this
    // finds nothing and costs one pass over a short list.
    window.setTimeout(function () {
      var viewportHeight = window.innerHeight;

      Array.prototype.forEach.call(animatedElements(), function (el) {
        var box = el.getBoundingClientRect();
        if (box.top > viewportHeight || box.bottom < 0) return;
        if (window.getComputedStyle(el).opacity !== "0") return;

        console.warn("Reveal safety net caught an unanimated element:", el);
        gsap.set(el, { clearProps: "all" });
      });
    }, 3000);

    // If the visitor turns on reduced motion mid-session, stop dead.
    reduceMotion.addEventListener("change", function (event) {
      if (!event.matches) return;

      ScrollTrigger.getAll().forEach(function (trigger) {
        trigger.kill();
      });
      gsap.globalTimeline.clear();
      revealAll();
    });
  }

  if (revealPath === "reveal-gsap") {
    try {
      initMotion();
    } catch (error) {
      // GSAP parsed but refused to start. Swap to the fallback and let the
      // stylesheet do the work, rather than leaving the page blank.
      console.error("Motion init failed; falling back to CSS.", error);
      setRevealPath("reveal-css");
      startCssReveal();
    }
  } else if (revealPath === "reveal-css") {
    startCssReveal();
  }

  // ========================================================================
  // Project filters
  //
  // Only present on projects.html. The controls are hidden by CSS unless
  // scripting is available, so with JS off the full list simply renders.
  //
  // Filtering has to cooperate with the reveal system. Every .project gets its
  // own ScrollTrigger, and an article hidden at load measures as zero-height —
  // so its tween either fires against a collapsed box or never fires at all,
  // leaving the contents at opacity 0. Anything a filter brings back is
  // therefore settled directly, rather than waiting on a trigger that has
  // already been and gone.
  // ========================================================================

  var filterBar = document.getElementById("project-filters");

  if (filterBar) {
    var filterButtons = Array.prototype.slice.call(
      filterBar.querySelectorAll(".filter-btn"),
    );
    var filterable = Array.prototype.slice.call(
      document.querySelectorAll(".project[data-category]"),
    );
    var filterStatus = document.getElementById("filter-status");

    var PROJECT_PARTS =
      ".project-num,.project-title,.project-tagline,.project-desc," +
      ".project-stack,.project-links,.project-media";

    function settleProject(project) {
      project.classList.add("is-visible");

      if (typeof window.gsap === "undefined") return;

      window.gsap.set(project.querySelectorAll(PROJECT_PARTS), {
        clearProps: "all",
      });
    }

    var applyFilter = function (category) {
      var visible = [];

      filterable.forEach(function (project) {
        var matches =
          category === "all" ||
          project.getAttribute("data-category") === category;

        project.hidden = !matches;
        if (matches) visible.push(project);
      });

      visible.forEach(settleProject);

      // Hiding articles changes the page height, so every trigger below the
      // list is measuring against a layout that no longer exists.
      if (typeof window.ScrollTrigger !== "undefined") {
        window.ScrollTrigger.refresh();
      }

      if (filterStatus) {
        filterStatus.textContent =
          visible.length +
          (visible.length === 1 ? " project shown." : " projects shown.");
      }
    };

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (other) {
          other.setAttribute("aria-pressed", String(other === button));
        });

        applyFilter(button.getAttribute("data-filter"));
      });
    });
  }

  // ========================================================================
  // Resume download feedback
  // ========================================================================

  Array.prototype.forEach.call(
    document.querySelectorAll('a[href$=".pdf"][download]'),
    function (link) {
      link.addEventListener("click", function () {
        showToast("Downloading CV…");
      });
    },
  );

  // ========================================================================
  // Contact form
  //
  // The form carries a real action/method, so with JS unavailable the browser
  // posts it to Formspree directly. With JS we validate first and post via
  // fetch so the visitor stays on the page.
  // ========================================================================

  var form = document.getElementById("contact-form");

  if (!form) return;

  var submitButton = document.getElementById("submit-btn");
  var submitLabel = document.getElementById("submit-label");
  var submitBusy = document.getElementById("submit-busy");
  var statusRegion = document.getElementById("form-status");

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var fieldRules = {
    "f-name": function (value) {
      return value ? "" : "Enter your name so I know who I'm replying to.";
    },
    "f-email": function (value) {
      if (!value) return "Enter your email address so I can reply.";
      if (!EMAIL_PATTERN.test(value)) {
        return "That doesn't look like a valid email address.";
      }
      return "";
    },
    "f-message": function (value) {
      return value ? "" : "Enter a message before sending.";
    },
  };

  function fieldErrorElement(input) {
    return document.getElementById(input.id + "-error");
  }

  function setFieldError(input, message) {
    var errorEl = fieldErrorElement(input);

    if (message) {
      input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(input) {
    var rule = fieldRules[input.id];
    if (!rule) return true;

    var message = rule(input.value.trim());
    setFieldError(input, message);
    return !message;
  }

  // Clear a field's error as soon as the visitor starts fixing it.
  Object.keys(fieldRules).forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") setFieldError(input, "");
    });

    input.addEventListener("blur", function () {
      if (input.value.trim()) validateField(input);
    });
  });

  function setBusy(busy) {
    if (submitButton) submitButton.disabled = busy;
    if (submitLabel) submitLabel.hidden = busy;
    if (submitBusy) submitBusy.hidden = !busy;
  }

  function setStatus(message, kind) {
    if (!statusRegion) return;
    statusRegion.textContent = message;
    statusRegion.className = "form-status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    setStatus("", "");

    var invalid = [];

    Object.keys(fieldRules).forEach(function (id) {
      var input = document.getElementById(id);
      if (input && !validateField(input)) invalid.push(input);
    });

    if (invalid.length) {
      invalid[0].focus();
      setStatus("Please fix the highlighted fields and try again.", "error");
      return;
    }

    setBusy(true);

    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var subject = String(data.get("subject") || "").trim();

    // Formspree special field — controls the notification email's subject line.
    data.set("_subject", "Portfolio enquiry: " + (subject || "no subject") + " — " + name);

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        if (response.ok) return null;

        return response
          .json()
          .catch(function () {
            return null;
          })
          .then(function (body) {
            var detail = body && body.errors && body.errors[0];
            throw new Error(
              (detail && detail.message) || "Formspree returned " + response.status,
            );
          });
      })
      .then(function () {
        form.reset();
        Object.keys(fieldRules).forEach(function (id) {
          var input = document.getElementById(id);
          if (input) setFieldError(input, "");
        });
        setStatus("Message sent. I'll reply within a day.", "success");
        showToast("Message sent.");
      })
      .catch(function (error) {
        var offline = !navigator.onLine;

        setStatus(
          "Your message wasn't sent. " +
            (offline
              ? "You appear to be offline — reconnect and try again"
              : "Please try again") +
            ", or email me directly at alimiazeez4@gmail.com.",
          "error",
        );
        showToast("Message not sent.", "error");
        console.error("Contact form submission failed:", error);
      })
      .then(function () {
        setBusy(false);
      });
  });
})();
