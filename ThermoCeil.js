/* ================================================================
   THERMOCEIL — SCRIPT
   Modular, dependency-free JS: mobile navigation, active-link
   highlighting, smooth scroll offset for the sticky header,
   scroll-reveal animation, and a back-to-top control.
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initFooterYear();
  initMobileNav();
  initSmoothScroll();
  initActiveNavHighlight();
  initScrollReveal();
  initBackToTop();
});


/* ----------------------------------------------------------------
   Footer year
   Keeps the copyright year correct without manual edits.
   ---------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


/* ----------------------------------------------------------------
   Mobile navigation
   Toggles the slide-in menu and keeps aria-expanded in sync.
   Closes automatically when a link is chosen or on outside click.
   ---------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  // Close the menu after choosing a section (mobile UX expectation)
  menu.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on outside click
  document.addEventListener("click", (event) => {
    const clickedInsideNav = menu.contains(event.target) || toggle.contains(event.target);
    if (!clickedInsideNav && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Close on Escape for keyboard users
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });
}


/* ----------------------------------------------------------------
   Smooth scroll with sticky-header offset
   CSS `scroll-behavior: smooth` handles the easing; this adds the
   header-height offset so section tops aren't hidden underneath it.
   ---------------------------------------------------------------- */
function initSmoothScroll() {
  const header = document.getElementById("site-header");
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (targetId.length <= 1) return; // ignore bare "#"

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Keep the URL hash in sync without an extra jump
      history.pushState(null, "", targetId);
    });
  });
}


/* ----------------------------------------------------------------
   Active navigation highlighting
   Uses IntersectionObserver to mark the nav link for whichever
   section currently occupies the middle of the viewport.
   ---------------------------------------------------------------- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  if (!sections.length || !navLinks.length) return;

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isMatch);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      // Treat the vertical middle third of the viewport as "current"
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}


/* ----------------------------------------------------------------
   Scroll-reveal animation
   Adds .is-visible to .reveal elements as they enter the viewport.
   Pairs with the .reveal / .reveal.is-visible rules in the CSS.
   Skips entirely if the user prefers reduced motion.
   ---------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // reveal once, then stop watching
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealEls.forEach((el, index) => {
    // Slight stagger for elements that share a row (cards, person grid)
    el.style.transitionDelay = `${(index % 3) * 80}ms`;
    observer.observe(el);
  });
}


/* ----------------------------------------------------------------
   Back-to-top button
   Appears after the hero has been scrolled past.
   ---------------------------------------------------------------- */
function initBackToTop() {
  const button = document.getElementById("backToTop");
  const hero = document.querySelector(".hero");
  if (!button || !hero) return;

  const toggleVisibility = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    button.classList.toggle("is-visible", heroBottom < 0);
  };

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
