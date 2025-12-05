// Main JS entry point
// All JS files imported here will be bundled into a single file

import { initTreeLandscape } from "./modules/tree-landscape.js";
import { initThemeToggle } from "./modules/theme-toggle.js";
import { initMetaball } from "./modules/metaball.js";
import { initShuffleSkills } from "./modules/shuffle-skills.js";
import { initPaperSizeToggle } from "./modules/paper-size-toggle.js";
import { initServiceWorker } from "./modules/sw-register.js";
import { initAbbrTouch } from "./modules/abbr-touch.js";

// Initialize theme IMMEDIATELY (before DOMContentLoaded to prevent flash)
initThemeToggle();
initShuffleSkills();

// Initialize service worker for offline support and caching
initServiceWorker();

// Initialize site features
const initSite = () => {
  // Initialize metaball SVG (only on pages that have .metaball-container)
  if (document.querySelector(".metaball-container")) {
    initMetaball();
  }

  // Initialize paper size toggle (resume pages only)
  initPaperSizeToggle();

  // Initialize ABBR tooltip touch handling
  initAbbrTouch();

  // Mark page as loaded
  requestAnimationFrame(() => {
    document.documentElement.classList.add("loaded");
  });

  // Defer tree landscape initialization (footer is below fold, not critical)
  // Use requestIdleCallback for better performance
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initTreeLandscape(), { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    requestAnimationFrame(initTreeLandscape);
  }
};

document.addEventListener("DOMContentLoaded", initSite);
