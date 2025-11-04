// Main JS entry point
// All JS files imported here will be bundled into a single file

import { initTreeLandscape } from './modules/tree-landscape.js';
import { initThemeToggle } from './modules/theme-toggle.js';
import { initMetaball } from './modules/metaball.js';
import { initShuffleSkills } from './modules/shuffle-skills.js';

// Initialize theme IMMEDIATELY (before DOMContentLoaded to prevent flash)
initThemeToggle();
initShuffleSkills();

// Initialize site features
const initSite = () => {
  // Initialize the tree landscape canvas
  initTreeLandscape();

  // Initialize metaball SVG
  initMetaball();
};

document.addEventListener('DOMContentLoaded', initSite);
